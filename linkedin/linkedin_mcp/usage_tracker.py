"""Monthly usage tracker implementation (Phase 4)."""

from __future__ import annotations

import fcntl
import json
from datetime import datetime
from pathlib import Path


class QuotaExceededError(RuntimeError):
    """Raised when the monthly PDF download cap has been reached."""


class UsageTracker:
    """Persistent monthly PDF download counter backed by a JSON state file.

    State file format: {"2026-02": 12}

    Uses an exclusive file lock (fcntl.LOCK_EX) to prevent concurrent writes.
    Note: fcntl is Unix-only (Linux, macOS). Not supported on Windows.
    """

    def __init__(self, state_file: Path, monthly_cap: int) -> None:
        self._state_file = state_file
        self._monthly_cap = monthly_cap

    @staticmethod
    def _current_month() -> str:
        return datetime.now().strftime("%Y-%m")

    def _read_state_locked(self, f) -> dict[str, int]:
        """Read JSON state from an already-opened, locked file."""
        f.seek(0)
        content = f.read()
        if not content.strip():
            return {}
        try:
            data = json.loads(content)
            if isinstance(data, dict):
                return {
                    k: int(v)
                    for k, v in data.items()
                    if isinstance(v, (int, float))
                }
        except (json.JSONDecodeError, ValueError, TypeError):
            pass
        return {}

    def get_usage(self) -> int:
        """Return the number of PDF downloads this calendar month."""
        if not self._state_file.exists():
            return 0
        with open(self._state_file, encoding="utf-8") as f:
            fcntl.flock(f.fileno(), fcntl.LOCK_SH)
            try:
                state = self._read_state_locked(f)
            finally:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        return state.get(self._current_month(), 0)

    def check_cap(self) -> None:
        """Raise QuotaExceededError if the monthly cap has been reached."""
        used = self.get_usage()
        if used >= self._monthly_cap:
            month = self._current_month()
            year, m = int(month[:4]), int(month[5:])
            next_year, next_m = (year + 1, 1) if m == 12 else (year, m + 1)
            reset_date = f"{next_year}-{next_m:02d}-01"
            raise QuotaExceededError(
                f"Monthly PDF download limit reached ({used}/{self._monthly_cap}). "
                f"Resets on {reset_date}."
            )

    def increment(self) -> int:
        """Atomically increment the counter and return the new total for this month."""
        self._state_file.parent.mkdir(parents=True, exist_ok=True)
        self._state_file.touch(exist_ok=True)
        with open(self._state_file, "r+", encoding="utf-8") as f:
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
            try:
                state = self._read_state_locked(f)
                month = self._current_month()
                new_count = state.get(month, 0) + 1
                # Only store the current month to prevent unbounded growth
                new_state = {month: new_count}
                f.seek(0)
                f.truncate()
                json.dump(new_state, f, indent=2)
                f.flush()
                return new_count
            finally:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
