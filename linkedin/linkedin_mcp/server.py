from __future__ import annotations

from pathlib import Path
from typing import Any

try:
    from mcp.server.fastmcp import FastMCP
except ModuleNotFoundError:  # pragma: no cover - fallback for local dev without MCP deps
    class FastMCP:  # type: ignore[override]
        def __init__(self, name: str):
            self.name = name
            self._tools: dict[str, Any] = {}

        def tool(self):  # type: ignore[no-untyped-def]
            def decorator(func):
                self._tools[func.__name__] = func
                return func

            return decorator

        def run(self, transport: str = "stdio") -> None:
            raise RuntimeError(
                "Missing dependency: install project deps (including 'mcp') "
                "to run the LinkedIn MCP server."
            )

from pydantic import ValidationError

from linkedin_mcp.config import ConfigError, load_config
from linkedin_mcp.linkedin_client import AuthenticationError, LinkedInClient
from linkedin_mcp.models import GetProfilePdfInput, SearchConnectionsInput
from linkedin_mcp.pdf_download import ParseError as PdfParseError
from linkedin_mcp.pdf_download import download_profile_pdf
from linkedin_mcp.profile_resolver import ProfileNotFoundError
from linkedin_mcp.search import ParseError as SearchParseError
from linkedin_mcp.search import search_connections
from linkedin_mcp.usage_tracker import QuotaExceededError, UsageTracker

mcp = FastMCP("linkedin-mcp")


def _make_usage_tracker() -> UsageTracker:
    config = load_config()
    # State lives alongside the output directory: linkedin/.state/pdf_usage.json
    state_file = config.output_dir.parent / ".state" / "pdf_usage.json"
    return UsageTracker(state_file=state_file, monthly_cap=config.pdf_monthly_cap)


@mcp.tool()
def linkedin_search_connections(
    degree: str,
    page: int = 1,
    page_size: int = 10,
    keywords: str = "",
) -> dict[str, Any]:
    """Search LinkedIn connections filtered by degree."""
    try:
        validated = SearchConnectionsInput(
            degree=degree,
            page=page,
            page_size=page_size,
            keywords=keywords,
        )
        config = load_config()
        with LinkedInClient(config) as client:
            result = search_connections(client, validated)
        return result.model_dump(mode="json")
    except (
        ConfigError,
        ValidationError,
        AuthenticationError,
        SearchParseError,
        ValueError,
    ) as exc:
        raise RuntimeError(str(exc)) from exc


@mcp.tool()
def linkedin_get_profile_pdf(profile_url: str) -> dict[str, Any]:
    """Download a LinkedIn profile PDF given a profile URL."""
    try:
        validated = GetProfilePdfInput(profile_url=profile_url)
        config = load_config()
        usage_tracker = _make_usage_tracker()
        with LinkedInClient(config) as client:
            result = download_profile_pdf(client, validated, usage_tracker)
        return result.model_dump(mode="json")
    except (
        ConfigError,
        ValidationError,
        AuthenticationError,
        PdfParseError,
        ProfileNotFoundError,
        QuotaExceededError,
        ValueError,
    ) as exc:
        raise RuntimeError(str(exc)) from exc


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
