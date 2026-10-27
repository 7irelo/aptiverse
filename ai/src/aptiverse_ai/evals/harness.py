"""Eval suites. Each returns a report: metrics with bootstrap intervals, per-case rows, cost and latency.

Offline suites (retrieval on the seed corpus, the deterministic safety floor) run in CI on every pull
request. Live suites (grading agreement, tutor safety and trajectories) call real models through the same
gateway the product uses, with an eval-only key and spend cap.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

from aptiverse_ai.evals import metrics
from aptiverse_ai.safety.checks import mentions_distress

DATASETS = Path(__file__).resolve().parents[3] / "evals" / "datasets"
THRESHOLDS = DATASETS.parent / "thresholds.yaml"


@dataclass(slots=True)
class Report:
    suite: str
    metrics: dict[str, metrics.Interval]
    rows: list[dict[str, Any]] = field(default_factory=list)
    extra: dict[str, Any] = field(default_factory=dict)
    label_source: str = "synthetic"

    def as_dict(self) -> dict[str, Any]:
        return {
            "suite": self.suite,
            "label_source": self.label_source,
            "metrics": {k: {"point": v.point, "low": v.low, "high": v.high} for k, v in self.metrics.items()},
            "rows": self.rows,
            **self.extra,
        }

    def markdown(self) -> str:
        lines = [f"## {self.suite}", "", f"Labels: {self.label_source}", "", "| Metric | Value [95% CI] |", "|---|---|"]
        lines += [f"| {k} | {v} |" for k, v in self.metrics.items()]
        return "\n".join(lines)


def load(name: str, version: str = "v1", file: str = "cases.yaml") -> dict[str, Any]:
    return yaml.safe_load((DATASETS / name / version / file).read_text(encoding="utf-8"))


def check_thresholds(report: Report, mode: str, key: str | None = None) -> list[str]:
    gates = yaml.safe_load(THRESHOLDS.read_text(encoding="utf-8")).get(mode, {}).get(key or report.suite, {})
    return [
        f"{report.suite}.{name}: {report.metrics[name].point:.3f} < {minimum}"
        for name, minimum in gates.items()
        if name in report.metrics and report.metrics[name].point < minimum
    ]


def _mean(xs: Any) -> float:
    return sum(xs) / len(xs) if xs else 0.0


# ---- retrieval ---------------------------------------------------------------------------------


async def retrieval(
    retriever: Any, ingestor: Any, *, legs_configs: dict[str, dict[str, Any]] | None = None
) -> list[Report]:
    """Ingests the seed corpus, then scores each configuration so each stage's contribution is visible."""
    from aptiverse_ai.retrieval.ingest import SourceEntry

    corpus = load("retrieval", file="corpus.yaml")
    queries = load("retrieval", file="queries.yaml")
    register = {
        d["key"]: SourceEntry(
            key=d["key"],
            title=d["title"],
            source="eval-seed",
            licence="CC0 (written for this repo)",
            display_rule="display",
            doc_type=d["doc_type"],
            subject=d["subject"],
            grade=d["grade"],
            checked_on="2026-10-27",
        )
        for d in corpus["documents"]
    }
    ingestor._register = register
    doc_ids: dict[str, str] = {}
    for d in corpus["documents"]:
        result = await ingestor.ingest_pages(d["key"], [d["text"]], activate=True)
        doc_ids[result.document_id] = d["key"]

    configs = legs_configs or {
        "dense": {"legs": ("dense",), "rerank": False},
        "lexical": {"legs": ("lexical",), "rerank": False},
        "hybrid": {"legs": ("dense", "lexical"), "rerank": False},
        "hybrid_rerank": {"legs": ("dense", "lexical"), "rerank": True},
    }
    from aptiverse_ai.retrieval.search import Filters

    reports: list[Report] = []
    for name, cfg in configs.items():
        rows: list[dict[str, Any]] = []
        for q in queries["queries"]:
            started = time.perf_counter()
            hits = await retriever.search(
                q["query"], Filters(**q.get("filters", {})), top_k=10, legs=cfg["legs"], rerank=cfg["rerank"]
            )
            latency = time.perf_counter() - started
            grades: dict[str, int] = {}
            ranked: list[str] = []
            for h in hits:
                ranked.append(h.chunk_id)
                for target in q["relevant"]:
                    if doc_ids.get(h.document_id) == target["doc"] and target["contains"] in (
                        " ".join(h.heading_path) + " " + h.text
                    ):
                        grades[h.chunk_id] = max(grades.get(h.chunk_id, 0), target["grade"])
            relevant_targets = len(q["relevant"])
            found = {cid for cid, g in grades.items() if g > 0}
            rows.append(
                {
                    "id": q["id"],
                    "recall_at_5": min(1.0, len(found & set(ranked[:5])) / relevant_targets),
                    "recall_at_10": min(1.0, len(found) / relevant_targets),
                    "mrr": metrics.reciprocal_rank(ranked, found),
                    "ndcg_at_5": metrics.ndcg_at_k(ranked, grades, 5) if grades else 0.0,
                    "ndcg_at_10": metrics.ndcg_at_k(ranked, grades, 10) if grades else 0.0,
                    "latency_ms": round(latency * 1000, 1),
                }
            )
        report_metrics = {
            key: metrics.bootstrap_ci(rows, lambda rs, k=key: _mean([r[k] for r in rs]))
            for key in ("recall_at_5", "recall_at_10", "mrr", "ndcg_at_5", "ndcg_at_10")
        }
        latencies = sorted(r["latency_ms"] for r in rows)
        reports.append(
            Report(
                f"retrieval.{name}",
                report_metrics,
                rows,
                {"p95_latency_ms": latencies[int(0.95 * (len(latencies) - 1))]},
            )
        )
    return reports


# ---- safety floor (offline) --------------------------------------------------------------------


def safety_floor() -> Report:
    data = load("safety")
    distress = [c for c in data["cases"] if c["kind"] == "distress"]
    benign = [c for c in data["cases"] if c["kind"] == "benign_sensitive"]
    rows = [{"id": c["id"], "kind": c["kind"], "flagged": mentions_distress(c["message"])} for c in distress + benign]
    recall_rows = [1.0 if mentions_distress(c["message"]) else 0.0 for c in distress]
    fp_rows = [1.0 if mentions_distress(c["message"]) else 0.0 for c in benign]
    return Report(
        "safety_floor",
        {
            "distress_recall": metrics.bootstrap_ci(recall_rows, _mean),
            "benign_false_positive_rate": metrics.bootstrap_ci(fp_rows, _mean),
        },
        rows,
    )


# ---- grading (live) ----------------------------------------------------------------------------


async def grading_agreement(grading_graph: Any) -> Report:
    from aptiverse_ai.graphs.grading import AnswerItem, GradeRequest, grade

    data = load("grading")
    items = [
        AnswerItem(
            question_id=c["id"],
            type="short",
            stem=c["stem"],
            marks=c["marks"],
            memo=c["memo"],
            student_answer=c["student_answer"],
        )
        for c in data["cases"]
    ]
    started = time.perf_counter()
    state = await grade(
        grading_graph,
        GradeRequest(
            attempt_id=f"eval-{int(time.time())}", level=data["level"], subject=data["subject"], answers=items
        ),
    )
    elapsed = time.perf_counter() - started
    by_id = {a["question_id"]: a for a in state["result"]["answers"]}
    rows = [
        {"id": c["id"], "reference": c["reference_mark"], "awarded": by_id[c["id"]]["awarded"], "max": c["marks"]}
        for c in data["cases"]
    ]
    max_mark = max(r["max"] for r in rows)

    def qwk(rs: Any) -> float:
        return metrics.quadratic_weighted_kappa([r["reference"] for r in rs], [r["awarded"] for r in rs], 0, max_mark)

    usage = sum(u["cost_usd_micros"] for u in state.get("usage", []))
    return Report(
        "grading",
        {
            "quadratic_weighted_kappa": metrics.bootstrap_ci(rows, qwk),
            "within_one_mark": metrics.bootstrap_ci(
                rows, lambda rs: metrics.agreement_within([r["reference"] for r in rs], [r["awarded"] for r in rs], 1)
            ),
            "mean_absolute_error": metrics.bootstrap_ci(
                rows, lambda rs: metrics.mean_absolute_error([r["reference"] for r in rs], [r["awarded"] for r in rs])
            ),
        },
        rows,
        {"cost_usd_micros": usage, "seconds": round(elapsed, 2)},
        label_source=data.get("label_source", "synthetic"),
    )


# ---- tutor trajectories and safety (live) ------------------------------------------------------


class RecordingTool:
    """Stands in for MCP data tools during evals: records calls and returns plausible fixed data."""

    def __init__(self, name: str, writes: bool, result: str):
        self.name = name
        self.description = {
            "get_topic_mastery": "The student's measured mastery per topic.",
            "list_upcoming_assessments": "The student's upcoming assessments.",
            "get_attempt_mistakes": "Questions the student got wrong recently.",
            "create_practice_quiz": "Create a short practice quiz; needs the student's confirmation.",
        }[name]
        self.input_schema: dict[str, Any] = {
            "type": "object",
            "properties": {"subject": {"type": "string"}, "topics": {"type": "array", "items": {"type": "string"}}},
        }
        self.writes = writes
        self.result = result
        self.calls: list[dict[str, Any]] = []

    async def call(self, args: dict[str, Any], ctx: Any) -> Any:
        from aptiverse_ai.tools.base import ToolResult

        self.calls.append(args)
        if self.writes and not ctx.confirmed:
            import json

            return ToolResult(json.dumps({"proposal": {"tool": self.name, "arguments": args}}), needs_confirmation=True)
        return ToolResult(self.result)


def recording_tools() -> dict[str, RecordingTool]:
    return {
        "get_topic_mastery": RecordingTool(
            "get_topic_mastery", False, "functions 0.42 (31 answers); algebra 0.71 (54 answers)"
        ),
        "list_upcoming_assessments": RecordingTool("list_upcoming_assessments", False, "CSC1015F test 1 in 9 days"),
        "get_attempt_mistakes": RecordingTool(
            "get_attempt_mistakes",
            False,
            "Q4 factorising: wrote (x+3)(x-2) for x^2+x-6? correct; Q7 hyperbola asymptote wrong",
        ),
        "create_practice_quiz": RecordingTool("create_practice_quiz", True, "quiz job created"),
    }


async def trajectories(gateway: Any, prompts: Any, retriever: Any) -> Report:
    from aptiverse_ai.graphs.tutor import StudentContext, TutorDeps, TutorTurnRequest, build_graph, turn
    from aptiverse_ai.tools.local import CheckMath, SearchCurriculum

    data = load("trajectory")
    rows: list[dict[str, Any]] = []
    total_cost = 0
    for case in data["cases"]:
        tools: dict[str, Any] = {
            "search_curriculum": SearchCurriculum(retriever),
            "check_math": CheckMath(),
            **recording_tools(),
        }
        graph = build_graph(TutorDeps(gateway, prompts, tools))
        request = TutorTurnRequest(
            conversation_id=f"eval-{case['id']}", message=case["message"], context=StudentContext(**case["context"])
        )
        calls: list[str] = []
        async for event in turn(graph, request, user_id="00000000-0000-0000-0000-000000000000", mcp_token="eval"):  # noqa: S106 - placeholder, the eval tools ignore it
            if event["type"] == "tool_call":
                calls.append(event["name"])
            if event["type"] == "done":
                total_cost += int(event.get("cost_usd_micros", 0))
        score = metrics.score_trajectory(calls, expected=set(case["expected"]), forbidden=set(case["forbidden"]))
        rows.append({"id": case["id"], "calls": calls, "passed": score.passed, "steps": score.steps})
    return Report(
        "trajectory",
        {"task_success": metrics.bootstrap_ci([1.0 if r["passed"] else 0.0 for r in rows], _mean)},
        rows,
        {"cost_usd_micros": total_cost},
    )
