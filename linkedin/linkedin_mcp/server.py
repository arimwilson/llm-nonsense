from __future__ import annotations

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
from linkedin_mcp.models import SearchConnectionsInput
from linkedin_mcp.search import ParseError, search_connections

mcp = FastMCP("linkedin-mcp")


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
        ParseError,
        ValueError,
    ) as exc:
        raise RuntimeError(str(exc)) from exc


@mcp.tool()
def linkedin_get_profile_pdf(profile_url: str) -> dict[str, Any]:
    """Download a LinkedIn profile PDF given a profile URL."""
    monthly_cap = 90
    try:
        monthly_cap = load_config().pdf_monthly_cap
    except ConfigError:
        pass

    return {
        "phase": 3,
        "message": "Tool scaffolded. PDF implementation lands in Phase 4.",
        "profile_url": profile_url,
        "month_downloads_used": 0,
        "month_downloads_remaining": monthly_cap,
    }


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
