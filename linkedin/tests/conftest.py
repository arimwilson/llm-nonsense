from __future__ import annotations

import json
from pathlib import Path

import pytest


@pytest.fixture()
def fixtures_dir() -> Path:
    return Path(__file__).parent / "fixtures"


@pytest.fixture()
def search_response_payload(fixtures_dir: Path) -> dict:
    return json.loads((fixtures_dir / "search_response.json").read_text(encoding="utf-8"))
