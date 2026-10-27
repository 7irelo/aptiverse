from __future__ import annotations

import pytest

from aptiverse_ai.evals.metrics import (
    agreement_within,
    bootstrap_ci,
    brier_score,
    cohen_kappa,
    macro_f1,
    mean_absolute_error,
    ndcg_at_k,
    precision_recall_f1,
    quadratic_weighted_kappa,
    recall_at_k,
    reciprocal_rank,
    score_trajectory,
)
from aptiverse_ai.retrieval.chunking import chunk_exam_paper, chunk_structured, normalise, split_long
from aptiverse_ai.retrieval.search import rrf


def test_recall_mrr_and_ndcg() -> None:
    ranked = ["a", "b", "c", "d"]
    assert recall_at_k(ranked, {"b", "z"}, 2) == 0.5
    assert reciprocal_rank(ranked, {"c"}) == pytest.approx(1 / 3)
    assert reciprocal_rank(ranked, {"z"}) == 0.0
    assert ndcg_at_k(["x", "y"], {"x": 3, "y": 1}, 2) == pytest.approx(1.0)
    assert ndcg_at_k(["y", "x"], {"x": 3, "y": 1}, 2) < 1.0


def test_kappa_values() -> None:
    assert cohen_kappa(["a", "b", "a", "b"], ["a", "b", "a", "b"]) == 1.0
    assert cohen_kappa(["a", "a", "b", "b"], ["a", "b", "a", "b"]) == pytest.approx(0.0)
    assert quadratic_weighted_kappa([0, 1, 2, 3], [0, 1, 2, 3], 0, 3) == pytest.approx(1.0)
    close = quadratic_weighted_kappa([0, 1, 2, 3], [0, 1, 3, 3], 0, 3)
    far = quadratic_weighted_kappa([0, 1, 2, 3], [3, 1, 2, 0], 0, 3)
    assert close > far


def test_errors_agreement_prf_brier() -> None:
    assert mean_absolute_error([1, 2, 3], [1, 3, 5]) == 1.0
    assert agreement_within([1, 2, 3], [1, 3, 5], 1) == pytest.approx(2 / 3)
    prf = precision_recall_f1({"a", "b"}, {"b", "c"})
    assert (prf.precision, prf.recall, prf.f1) == (0.5, 0.5, 0.5)
    assert macro_f1(["x", "y", "x"], ["x", "y", "y"]) == pytest.approx((2 / 3 + 2 / 3) / 2)
    assert brier_score([1.0, 0.0], [1, 0]) == 0.0


def test_trajectory_scoring() -> None:
    good = score_trajectory(
        ["get_topic_mastery", "search_curriculum"],
        expected={"search_curriculum"},
        forbidden={"create_practice_quiz"},
        order=[("get_topic_mastery", "search_curriculum")],
    )
    assert good.passed
    assert good.tool_precision == 0.5
    bad = score_trajectory(["create_practice_quiz"], expected={"search_curriculum"}, forbidden={"create_practice_quiz"})
    assert not bad.passed
    assert bad.forbidden_calls == 1


def test_bootstrap_interval_contains_point_and_is_deterministic() -> None:
    data = [1.0] * 80 + [0.0] * 20
    ci = bootstrap_ci(data, lambda xs: sum(xs) / len(xs))
    assert ci.low <= 0.8 <= ci.high
    assert ci.high - ci.low < 0.2
    assert ci == bootstrap_ci(data, lambda xs: sum(xs) / len(xs))
    assert ci.excludes(0.5)


def test_rrf_rewards_agreement_between_legs() -> None:
    scores = rrf({"dense": ["a", "b", "c"], "lexical": ["b", "a", "d"]})
    assert max(scores, key=lambda k: scores[k]) in {"a", "b"}
    assert scores["a"] > scores["c"]
    assert scores["b"] > scores["d"]


def test_normalise_converts_unicode_maths_to_latex() -> None:
    assert normalise("x² ≤ 4 × y") == r"x^{2} \leq 4 \times y"


def test_structured_chunks_carry_heading_paths() -> None:
    text = (
        "TOPIC: ALGEBRA\n1.1 Linear equations\nSolve for x.\n1.2 Inequalities\nGraph them.\n"
        "TOPIC: GEOMETRY\nAngles here."
    )
    chunks = chunk_structured([text], title="Maths G10")
    paths = [c.heading_path for c in chunks]
    assert paths[0] == ["Maths G10", "TOPIC: ALGEBRA", "1.1 Linear equations"]
    assert paths[1][-1] == "1.2 Inequalities"
    assert paths[2] == ["Maths G10", "TOPIC: GEOMETRY"]
    assert [c.ordinal for c in chunks] == [0, 1, 2]


def test_exam_paper_chunks_per_sub_question_with_marks() -> None:
    paper = (
        "QUESTION 1\n1.1 Define photosynthesis. (2)\n1.2 Name the gas released. (1)\n"
        "QUESTION 2\n2.1 Draw a labelled diagram of a cell. (5)"
    )
    chunks = chunk_exam_paper([paper], title="LS P1 2024")
    assert [c.metadata.get("sub_question") for c in chunks] == ["1.1", "1.2", "2.1"]
    assert [c.marks for c in chunks] == [2, 1, 5]
    assert chunks[2].has_figure


def test_split_long_respects_budget() -> None:
    para = ("Sentence number one is here. " * 40).strip()
    pieces = split_long(f"{para}\n\n{para}", max_tokens=100)
    assert len(pieces) > 2
    assert all(len(p) // 4 <= 130 for p in pieces)
