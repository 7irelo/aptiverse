from __future__ import annotations

from pathlib import Path

import yaml

from aptiverse_ai.retrieval.ingest import SourceEntry

REGISTER = Path(__file__).resolve().parents[2] / "corpus" / "sources.yaml"


def test_every_register_entry_is_valid_and_unique() -> None:
    entries = [SourceEntry.model_validate(s) for s in yaml.safe_load(REGISTER.read_text(encoding="utf-8"))["sources"]]
    keys = [e.key for e in entries]
    assert len(keys) == len(set(keys))


def test_unconfirmed_dbe_material_is_never_displayed() -> None:
    for raw in yaml.safe_load(REGISTER.read_text(encoding="utf-8"))["sources"]:
        entry = SourceEntry.model_validate(raw)
        if "to confirm" in entry.licence:
            assert entry.display_rule == "index_only", entry.key


def test_no_ieb_papers_are_registered() -> None:
    assert "ieb" not in REGISTER.read_text(encoding="utf-8").lower().replace("ieb papers are not listed", "")
