from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

import pytest

from linkedin_mcp.usage_tracker import QuotaExceededError, UsageTracker


@pytest.fixture()
def state_file(tmp_path: Path) -> Path:
    return tmp_path / "pdf_usage.json"


@pytest.fixture()
def tracker(state_file: Path) -> UsageTracker:
    return UsageTracker(state_file=state_file, monthly_cap=90)


def test_get_usage_returns_zero_when_file_missing(tracker: UsageTracker) -> None:
    assert tracker.get_usage() == 0


def test_increment_creates_file_and_returns_one(
    tracker: UsageTracker, state_file: Path
) -> None:
    count = tracker.increment()
    assert count == 1
    assert state_file.exists()


def test_increment_accumulates_within_month(tracker: UsageTracker) -> None:
    tracker.increment()
    tracker.increment()
    count = tracker.increment()
    assert count == 3
    assert tracker.get_usage() == 3


def test_check_cap_allows_at_89(state_file: Path) -> None:
    tracker = UsageTracker(state_file=state_file, monthly_cap=90)
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps({"2026-02": 89}), encoding="utf-8")
    # Should not raise
    tracker.check_cap()


def test_check_cap_blocks_at_90(state_file: Path) -> None:
    tracker = UsageTracker(state_file=state_file, monthly_cap=90)
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps({"2026-02": 90}), encoding="utf-8")
    with pytest.raises(QuotaExceededError, match="Monthly PDF download limit reached"):
        tracker.check_cap()


def test_check_cap_includes_reset_date_in_message(state_file: Path) -> None:
    tracker = UsageTracker(state_file=state_file, monthly_cap=90)
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps({"2026-02": 90}), encoding="utf-8")
    with patch.object(
        UsageTracker, "_current_month", return_value="2026-02"
    ):
        with pytest.raises(QuotaExceededError, match="2026-03-01"):
            tracker.check_cap()


def test_december_rollover(state_file: Path) -> None:
    tracker = UsageTracker(state_file=state_file, monthly_cap=90)
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps({"2026-12": 90}), encoding="utf-8")
    with patch.object(
        UsageTracker, "_current_month", return_value="2026-12"
    ):
        with pytest.raises(QuotaExceededError, match="2027-01-01"):
            tracker.check_cap()


def test_previous_month_count_ignored(state_file: Path) -> None:
    """Prior month's downloads must not count against the current month cap."""
    tracker = UsageTracker(state_file=state_file, monthly_cap=90)
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps({"2026-01": 90}), encoding="utf-8")
    # Current month (patched to February) has no downloads — check_cap should pass
    with patch.object(
        UsageTracker, "_current_month", return_value="2026-02"
    ):
        tracker.check_cap()  # Should not raise


def test_increment_overwrites_previous_month(state_file: Path) -> None:
    """After increment, the state file contains only the current month."""
    tracker = UsageTracker(state_file=state_file, monthly_cap=90)
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps({"2026-01": 45}), encoding="utf-8")
    with patch.object(
        UsageTracker, "_current_month", return_value="2026-02"
    ):
        count = tracker.increment()
    state = json.loads(state_file.read_text(encoding="utf-8"))
    assert state == {"2026-02": 1}
    assert count == 1


def test_get_usage_handles_corrupt_file(
    tracker: UsageTracker, state_file: Path
) -> None:
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text("not valid json{{{", encoding="utf-8")
    assert tracker.get_usage() == 0


def test_get_usage_handles_empty_file(
    tracker: UsageTracker, state_file: Path
) -> None:
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text("", encoding="utf-8")
    assert tracker.get_usage() == 0
