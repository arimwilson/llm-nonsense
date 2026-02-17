"""LinkedIn PDF download tool implementation (Phase 4)."""

from __future__ import annotations

import re
from datetime import date
from typing import Any

from linkedin_mcp.linkedin_client import LinkedInClient
from linkedin_mcp.models import GetProfilePdfInput, GetProfilePdfOutput
from linkedin_mcp.profile_resolver import ProfileNotFoundError, resolve_profile_urn  # noqa: F401
from linkedin_mcp.usage_tracker import QuotaExceededError, UsageTracker  # noqa: F401


class ParseError(RuntimeError):
    """Raised when the PDF action response cannot be parsed."""


_PROFILE_SLUG_RE = re.compile(
    r"linkedin\.com/in/([a-zA-Z0-9_%.-]+?)/?(?:\?|$)",
    re.IGNORECASE,
)

# Only allow filesystem-safe characters in the output filename
_SAFE_SLUG_RE = re.compile(r"[^a-zA-Z0-9_-]")


def _validate_profile_url(profile_url: str) -> str:
    """Validate URL format and return the profile slug.

    Raises ValueError for URLs that don't match linkedin.com/in/slug.
    """
    m = _PROFILE_SLUG_RE.search(profile_url)
    if not m:
        raise ValueError(
            f"Invalid LinkedIn profile URL: {profile_url!r}. "
            "Expected format: https://www.linkedin.com/in/slug/"
        )
    return m.group(1)


def _extract_download_url(payload: dict[str, Any]) -> str | None:
    """Extract downloadUrl from a PDF action response.

    Handles both normalized JSON (included array with pointer references)
    and inline data formats — consistent with the patterns learned from
    the people search endpoint.
    """
    # Check included array first (normalized JSON format)
    included = payload.get("included", [])
    if isinstance(included, list):
        for entry in included:
            if isinstance(entry, dict):
                url = entry.get("downloadUrl")
                if isinstance(url, str) and url.startswith("http"):
                    return url

    # Check data object directly (inline format)
    data = payload.get("data", {})
    if isinstance(data, dict):
        url = data.get("downloadUrl")
        if isinstance(url, str) and url.startswith("http"):
            return url
        # GraphQL double-envelope: data.data
        inner = data.get("data", {})
        if isinstance(inner, dict):
            url = inner.get("downloadUrl")
            if isinstance(url, str) and url.startswith("http"):
                return url

    return None


def _build_pdf_request(
    profile_urn: str,
    pdf_query_id: str,
) -> tuple[str, dict[str, Any]]:
    """Return (query_string, json_body) for the save-to-pdf POST.

    The queryId must appear in the query string unencoded, matching the
    pattern used for the search endpoint (raw string, not httpx params dict).
    """
    query_string = f"action=execute&queryId={pdf_query_id}"
    body: dict[str, Any] = {
        "variables": {"profileUrn": profile_urn},
        "queryId": pdf_query_id,
    }
    return query_string, body


def download_profile_pdf(
    client: LinkedInClient,
    pdf_input: GetProfilePdfInput,
    usage_tracker: UsageTracker,
) -> GetProfilePdfOutput:
    """Download a LinkedIn profile PDF and return metadata about the saved file.

    Steps:
    1. Validate the profile URL and enforce the monthly cap.
    2. Resolve the profile URL to a fsd_profile URN.
    3. POST to the Voyager save-to-pdf GraphQL endpoint.
    4. Extract the downloadUrl from the response.
    5. Fetch the PDF binary from the download URL.
    6. Save to output_dir/pdfs/{slug}-{date}.pdf.
    7. Increment the monthly counter only after a successful write.
    """
    profile_url = pdf_input.profile_url.strip()
    slug = _validate_profile_url(profile_url)

    # Enforce monthly cap before any network requests
    usage_tracker.check_cap()

    # Resolve URL → URN
    profile_urn = resolve_profile_urn(profile_url, client)

    # POST to save-to-pdf GraphQL endpoint
    query_string, body = _build_pdf_request(profile_urn, client.config.pdf_query_id)
    response = client.post(f"/voyager/api/graphql?{query_string}", json_body=body)
    payload = response.json()

    download_url = _extract_download_url(payload)
    if not download_url:
        raise ParseError(
            "Could not extract downloadUrl from PDF action response. "
            "The API format may have changed. Update LINKEDIN_PDF_QUERY_ID if needed."
        )

    # Fetch the PDF binary via a separate client (external CDN URL, not Voyager)
    pdf_bytes = client.download_binary(download_url)

    # Sanitize slug and build a safe output path
    safe_slug = _SAFE_SLUG_RE.sub("-", slug)
    output_dir = (client.config.output_dir / "pdfs").resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    today = date.today().isoformat()
    pdf_path = output_dir / f"{safe_slug}-{today}.pdf"

    pdf_path.write_bytes(pdf_bytes)

    # Increment counter only after a successful write
    used = usage_tracker.increment()
    cap = client.config.pdf_monthly_cap

    return GetProfilePdfOutput(
        profile_url=profile_url,
        pdf_path=str(pdf_path),
        bytes_written=len(pdf_bytes),
        month_downloads_used=used,
        month_downloads_remaining=max(0, cap - used),
    )
