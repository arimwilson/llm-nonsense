from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:  # pragma: no cover - fallback for local dev without deps
    def load_dotenv() -> bool:
        return False

DEFAULT_BASE_URL = "https://www.linkedin.com"
DEFAULT_SEARCH_QUERY_ID = "voyagerSearchDashClusters.b0928897b71bd00a5a7291755dcd64f0"
DEFAULT_PDF_QUERY_ID = "voyagerIdentityDashProfileActionsV2.ca80b3b293240baf5a00226d8d6d78a1"
DEFAULT_REQUEST_INTERVAL_SECONDS = 5.0
DEFAULT_PDF_MONTHLY_CAP = 90
DEFAULT_OUTPUT_DIR = "linkedin/output"
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/133.0.0.0 Safari/537.36"
)


class ConfigError(RuntimeError):
    """Raised when required LinkedIn MCP configuration is missing or invalid."""


@dataclass(frozen=True)
class LinkedInConfig:
    base_url: str
    search_query_id: str
    pdf_query_id: str
    request_interval_seconds: float
    pdf_monthly_cap: int
    output_dir: Path
    user_agent: str
    cookies: dict[str, str]

    @property
    def cookie_header(self) -> str:
        return "; ".join(f"{name}={value}" for name, value in self.cookies.items())


def _parse_cookie_header(cookie_header: str) -> dict[str, str]:
    cookies: dict[str, str] = {}
    for raw_part in cookie_header.split(";"):
        part = raw_part.strip()
        if not part or "=" not in part:
            continue
        name, value = part.split("=", 1)
        cookies[name.strip()] = value.strip()
    return cookies


def _extract_cookie_header_from_har(har_path: Path) -> str:
    if not har_path.exists():
        raise ConfigError(f"HAR file does not exist: {har_path}")

    try:
        har_data = json.loads(har_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ConfigError(f"HAR file is not valid JSON: {har_path}") from exc

    entries = har_data.get("log", {}).get("entries", [])
    for entry in entries:
        headers = entry.get("request", {}).get("headers", [])
        for header in headers:
            if str(header.get("name", "")).lower() != "cookie":
                continue
            value = str(header.get("value", "")).strip()
            if not value:
                continue
            parsed = _parse_cookie_header(value)
            if "li_at" in parsed and "JSESSIONID" in parsed:
                return value

    raise ConfigError(
        "Could not find a Cookie header with li_at and JSESSIONID in HAR data."
    )


def _load_cookie_map(env: Mapping[str, str]) -> dict[str, str]:
    cookie_header = env.get("LINKEDIN_COOKIES", "").strip()
    har_path = env.get("LINKEDIN_HAR_PATH", "").strip()

    if cookie_header:
        cookies = _parse_cookie_header(cookie_header)
    elif har_path:
        cookies = _parse_cookie_header(_extract_cookie_header_from_har(Path(har_path)))
    else:
        raise ConfigError(
            "Missing auth config. Set LINKEDIN_COOKIES or LINKEDIN_HAR_PATH."
        )

    missing = [name for name in ("li_at", "JSESSIONID") if name not in cookies]
    if missing:
        joined = ", ".join(missing)
        raise ConfigError(f"Required LinkedIn cookies missing: {joined}")

    return cookies


def load_config(env: Mapping[str, str] | None = None) -> LinkedInConfig:
    load_dotenv()
    source = env or os.environ

    request_interval = float(
        source.get("LINKEDIN_REQUEST_INTERVAL_SECONDS", DEFAULT_REQUEST_INTERVAL_SECONDS)
    )
    if request_interval <= 0:
        raise ConfigError("LINKEDIN_REQUEST_INTERVAL_SECONDS must be > 0")

    monthly_cap = int(source.get("LINKEDIN_PDF_MONTHLY_CAP", DEFAULT_PDF_MONTHLY_CAP))
    if monthly_cap <= 0:
        raise ConfigError("LINKEDIN_PDF_MONTHLY_CAP must be > 0")

    output_dir = Path(source.get("LINKEDIN_OUTPUT_DIR", DEFAULT_OUTPUT_DIR)).expanduser()

    return LinkedInConfig(
        base_url=source.get("LINKEDIN_BASE_URL", DEFAULT_BASE_URL).rstrip("/"),
        search_query_id=source.get("LINKEDIN_SEARCH_QUERY_ID", DEFAULT_SEARCH_QUERY_ID),
        pdf_query_id=source.get("LINKEDIN_PDF_QUERY_ID", DEFAULT_PDF_QUERY_ID),
        request_interval_seconds=request_interval,
        pdf_monthly_cap=monthly_cap,
        output_dir=output_dir,
        user_agent=source.get("LINKEDIN_USER_AGENT", DEFAULT_USER_AGENT),
        cookies=_load_cookie_map(source),
    )
