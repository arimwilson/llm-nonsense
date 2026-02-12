from __future__ import annotations

from typing import Any

from pathlib import Path

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

from linkedin_mcp.config import LinkedInConfig, load_config

mcp = FastMCP("linkedin-mcp")


def _load_runtime_config() -> LinkedInConfig:
    # Startup still succeeds without auth to allow tool advertisement in Phase 1.
    try:
        return load_config()
    except Exception:
        return LinkedInConfig(
            base_url="https://www.linkedin.com",
            search_query_id="",
            pdf_query_id="",
            request_interval_seconds=5.0,
            pdf_monthly_cap=90,
            output_dir=Path("linkedin/output"),
            user_agent="",
            cookies={},
        )


_RUNTIME_CONFIG = _load_runtime_config()


@mcp.tool()
def linkedin_search_connections(
    degree: str,
    page: int = 1,
    page_size: int = 10,
    keywords: str = "",
) -> dict[str, Any]:
    """Search LinkedIn connections filtered by degree."""
    return {
        "phase": 1,
        "message": "Tool scaffolded. Search implementation lands in Phase 3.",
        "degree_filter": degree,
        "page": page,
        "page_size": page_size,
        "keywords": keywords,
    }


@mcp.tool()
def linkedin_get_profile_pdf(profile_url: str) -> dict[str, Any]:
    """Download a LinkedIn profile PDF given a profile URL."""
    return {
        "phase": 1,
        "message": "Tool scaffolded. PDF implementation lands in Phase 4.",
        "profile_url": profile_url,
        "month_downloads_used": 0,
        "month_downloads_remaining": _RUNTIME_CONFIG.pdf_monthly_cap,
    }


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
