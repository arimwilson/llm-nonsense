from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from linkedin_mcp.profile_resolver import (
    ProfileNotFoundError,
    extract_slug,
    extract_urn_from_html,
    resolve_profile_urn,
)
from linkedin_mcp.search import PROFILE_URN_CACHE


@pytest.fixture()
def fixtures_dir() -> Path:
    return Path(__file__).parent / "fixtures"


# --- extract_slug ---


@pytest.mark.parametrize(
    "url, expected",
    [
        ("https://www.linkedin.com/in/jane-smith/", "jane-smith"),
        ("https://www.linkedin.com/in/jane-smith", "jane-smith"),
        ("https://linkedin.com/in/johndoe123/", "johndoe123"),
        ("https://www.linkedin.com/in/alice-bob/", "alice-bob"),
        ("https://www.linkedin.com/in/brian-baum-66a10856/", "brian-baum-66a10856"),
    ],
)
def test_extract_slug_valid(url: str, expected: str) -> None:
    assert extract_slug(url) == expected


def test_extract_slug_invalid_returns_none() -> None:
    assert extract_slug("https://www.linkedin.com/company/google/") is None
    assert extract_slug("not-a-url") is None


# --- extract_urn_from_html ---


def test_extract_urn_from_html_fixture(fixtures_dir: Path) -> None:
    html = (fixtures_dir / "profile_page.html").read_text(encoding="utf-8")
    urn = extract_urn_from_html(html)
    assert urn == "urn:li:fsd_profile:AbC123"


def test_extract_urn_from_html_no_match() -> None:
    assert extract_urn_from_html("<html>no urn here</html>") is None


def test_extract_urn_from_html_picks_first_match() -> None:
    html = (
        'data={"urn:li:fsd_profile:FIRST"} '
        'other={"urn:li:fsd_profile:SECOND"}'
    )
    assert extract_urn_from_html(html) == "urn:li:fsd_profile:FIRST"


# --- resolve_profile_urn ---


def test_resolve_uses_cache_before_http(fixtures_dir: Path) -> None:
    """If the URN is in the search cache, no HTTP call should be made."""
    PROFILE_URN_CACHE.clear()
    PROFILE_URN_CACHE["https://www.linkedin.com/in/jane-smith/"] = (
        "urn:li:fsd_profile:Cached123"
    )
    mock_client = MagicMock()

    urn = resolve_profile_urn(
        "https://www.linkedin.com/in/jane-smith/", mock_client
    )
    assert urn == "urn:li:fsd_profile:Cached123"
    mock_client.get.assert_not_called()
    PROFILE_URN_CACHE.clear()


def test_resolve_falls_back_to_html_fetch(fixtures_dir: Path) -> None:
    """Without a cache hit, resolver fetches profile HTML and extracts URN."""
    PROFILE_URN_CACHE.clear()

    html_content = (fixtures_dir / "profile_page.html").read_text(encoding="utf-8")
    html_response = MagicMock()
    html_response.text = html_content

    mock_client = MagicMock()
    mock_client.get.return_value = html_response

    urn = resolve_profile_urn(
        "https://www.linkedin.com/in/jane-smith/", mock_client
    )
    assert urn == "urn:li:fsd_profile:AbC123"


def test_resolve_falls_back_to_voyager_api() -> None:
    """If HTML fetch yields no URN, try the Voyager identity profiles API."""
    PROFILE_URN_CACHE.clear()

    html_response = MagicMock()
    html_response.text = "<html>no urn</html>"

    voyager_response = MagicMock()
    voyager_response.json.return_value = {
        "included": [
            {
                "entityUrn": "urn:li:fsd_profile:VoyagerUrn99",
                "firstName": "Jane",
            }
        ]
    }

    mock_client = MagicMock()
    mock_client.get.side_effect = [html_response, voyager_response]

    urn = resolve_profile_urn(
        "https://www.linkedin.com/in/jane-smith/", mock_client
    )
    assert urn == "urn:li:fsd_profile:VoyagerUrn99"


def test_resolve_raises_profile_not_found_when_all_fail() -> None:
    PROFILE_URN_CACHE.clear()

    html_response = MagicMock()
    html_response.text = "<html>no urn</html>"

    voyager_response = MagicMock()
    voyager_response.json.return_value = {"data": {}, "included": []}

    mock_client = MagicMock()
    mock_client.get.side_effect = [html_response, voyager_response]

    with pytest.raises(ProfileNotFoundError, match="Could not find profile"):
        resolve_profile_urn(
            "https://www.linkedin.com/in/no-such-person/", mock_client
        )


def test_resolve_raises_for_unparseable_url() -> None:
    PROFILE_URN_CACHE.clear()
    mock_client = MagicMock()
    with pytest.raises(ProfileNotFoundError, match="Could not parse profile slug"):
        resolve_profile_urn("https://www.linkedin.com/company/google/", mock_client)
