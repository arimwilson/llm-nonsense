"""Profile URL to URN resolver implementation (Phase 4)."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from linkedin_mcp.linkedin_client import LinkedInClient


class ProfileNotFoundError(RuntimeError):
    """Raised when a profile URN cannot be resolved for the given URL."""


_PROFILE_SLUG_RE = re.compile(
    r"linkedin\.com/in/([a-zA-Z0-9_%.-]+?)/?(?:\?|$)",
    re.IGNORECASE,
)

# Matches any urn:li:fsd_profile:IDENTIFIER in text or HTML
_PROFILE_URN_RE = re.compile(r"urn:li:fsd_profile:([A-Za-z0-9_-]+)")


def extract_slug(profile_url: str) -> str | None:
    """Extract the public profile slug from a LinkedIn profile URL."""
    m = _PROFILE_SLUG_RE.search(profile_url)
    return m.group(1) if m else None


def extract_urn_from_html(html: str) -> str | None:
    """Extract the first fsd_profile URN found in LinkedIn profile page HTML."""
    m = _PROFILE_URN_RE.search(html)
    if m:
        return f"urn:li:fsd_profile:{m.group(1)}"
    return None


def _extract_urn_from_voyager_response(payload: Any) -> str | None:
    """Extract a profile URN from a Voyager identity profiles API response.

    Handles both normalized JSON (included array) and inline data formats,
    consistent with lessons learned from the people search endpoint.
    """
    if not isinstance(payload, dict):
        return None

    # Normalized JSON: top-level included array (same pattern as search API)
    included = payload.get("included", [])
    if isinstance(included, list):
        for entry in included:
            if isinstance(entry, dict):
                urn = entry.get("entityUrn", "")
                if isinstance(urn, str) and urn.startswith("urn:li:fsd_profile:"):
                    return urn

    # Inline data fallback
    data = payload.get("data", payload)
    if isinstance(data, dict):
        urn = data.get("entityUrn", "")
        if isinstance(urn, str) and urn.startswith("urn:li:fsd_profile:"):
            return urn

    return None


def resolve_profile_urn(
    profile_url: str,
    client: "LinkedInClient",
) -> str:
    """Resolve a LinkedIn profile URL to a fsd_profile URN.

    Resolution order:
    1. In-memory cache populated by prior linkedin_search_connections calls.
    2. Profile page HTML fetch — extract URN from embedded JSON/script data.
    3. Voyager identity profiles API.

    Raises ProfileNotFoundError if all strategies fail.
    """
    from linkedin_mcp.search import get_cached_profile_urn

    # Normalize trailing slash for cache lookup
    normalized_url = profile_url.strip()
    if not normalized_url.endswith("/"):
        normalized_url += "/"
    if not normalized_url.startswith("http"):
        normalized_url = "https://www.linkedin.com/" + normalized_url.lstrip("/")

    # Step 1: in-memory cache from prior search results
    for url_variant in (normalized_url, profile_url.strip()):
        cached = get_cached_profile_urn(url_variant)
        if cached:
            return cached

    slug = extract_slug(profile_url)
    if not slug:
        raise ProfileNotFoundError(
            f"Could not parse profile slug from URL: {profile_url!r}. "
            "Expected format: https://www.linkedin.com/in/slug/"
        )

    # Step 2: fetch profile page HTML and extract embedded URN
    try:
        html_response = client.get(
            f"/in/{slug}/",
            headers={
                "accept": (
                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                )
            },
        )
        urn = extract_urn_from_html(html_response.text)
        if urn:
            return urn
    except Exception:
        pass

    # Step 3: Voyager identity profiles API
    try:
        api_response = client.get(f"/voyager/api/identity/profiles/{slug}")
        urn = _extract_urn_from_voyager_response(api_response.json())
        if urn:
            return urn
    except Exception:
        pass

    raise ProfileNotFoundError(
        f"Could not find profile for URL: {profile_url}. Verify the URL is correct."
    )
