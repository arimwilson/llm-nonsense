from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from linkedin_mcp.pdf_download import (
    ParseError,
    _build_pdf_request,
    _extract_download_url,
    _validate_profile_url,
    download_profile_pdf,
)
from linkedin_mcp.profile_resolver import ProfileNotFoundError
from linkedin_mcp.usage_tracker import QuotaExceededError, UsageTracker


@pytest.fixture()
def fixtures_dir() -> Path:
    return Path(__file__).parent / "fixtures"


@pytest.fixture()
def pdf_action_payload(fixtures_dir: Path) -> dict:
    return json.loads(
        (fixtures_dir / "pdf_action_response.json").read_text(encoding="utf-8")
    )


# --- _validate_profile_url ---


@pytest.mark.parametrize(
    "url, expected_slug",
    [
        ("https://www.linkedin.com/in/jane-smith/", "jane-smith"),
        ("https://www.linkedin.com/in/jane-smith", "jane-smith"),
        ("https://linkedin.com/in/johndoe123", "johndoe123"),
        ("https://www.linkedin.com/in/brian-baum-66a10856/", "brian-baum-66a10856"),
    ],
)
def test_validate_profile_url_valid(url: str, expected_slug: str) -> None:
    assert _validate_profile_url(url) == expected_slug


@pytest.mark.parametrize(
    "bad_url",
    [
        "https://www.linkedin.com/company/google/",
        "not-a-url",
        "https://example.com/",
        "",
    ],
)
def test_validate_profile_url_invalid_raises(bad_url: str) -> None:
    with pytest.raises(ValueError, match="Invalid LinkedIn profile URL"):
        _validate_profile_url(bad_url)


# --- _extract_download_url ---


def test_extract_download_url_from_included(pdf_action_payload: dict) -> None:
    url = _extract_download_url(pdf_action_payload)
    assert url is not None
    assert url.startswith("https://media.licdn.com/")


def test_extract_download_url_from_data_direct() -> None:
    payload = {
        "data": {
            "downloadUrl": "https://cdn.example.com/profile.pdf"
        },
        "included": [],
    }
    assert _extract_download_url(payload) == "https://cdn.example.com/profile.pdf"


def test_extract_download_url_from_data_nested() -> None:
    payload = {
        "data": {
            "data": {
                "downloadUrl": "https://cdn.example.com/profile-nested.pdf"
            }
        },
        "included": [],
    }
    assert (
        _extract_download_url(payload) == "https://cdn.example.com/profile-nested.pdf"
    )


def test_extract_download_url_returns_none_when_missing() -> None:
    assert _extract_download_url({"data": {}, "included": []}) is None
    assert _extract_download_url({}) is None


def test_extract_download_url_ignores_non_http() -> None:
    payload = {"included": [{"downloadUrl": "ftp://bad.example.com/file"}]}
    assert _extract_download_url(payload) is None


# --- _build_pdf_request ---


def test_build_pdf_request_query_string_and_body() -> None:
    qs, body = _build_pdf_request(
        "urn:li:fsd_profile:AbC123",
        "voyagerIdentityDashProfileActionsV2.ca80b",
    )
    assert "action=execute" in qs
    assert "queryId=voyagerIdentityDashProfileActionsV2.ca80b" in qs
    assert body["variables"]["profileUrn"] == "urn:li:fsd_profile:AbC123"
    assert body["queryId"] == "voyagerIdentityDashProfileActionsV2.ca80b"


# --- download_profile_pdf integration ---


def _make_mock_client(
    tmp_path: Path,
    pdf_payload: dict,
    pdf_bytes: bytes = b"%PDF-1.4 sample",
) -> MagicMock:
    """Build a mock LinkedInClient for PDF download tests."""
    config = MagicMock()
    config.pdf_query_id = "voyagerIdentityDashProfileActionsV2.testhash"
    config.pdf_monthly_cap = 90
    config.output_dir = tmp_path / "output"

    post_response = MagicMock()
    post_response.json.return_value = pdf_payload

    client = MagicMock()
    client.config = config
    client.post.return_value = post_response
    client.download_binary.return_value = pdf_bytes
    return client


def test_download_profile_pdf_happy_path(
    pdf_action_payload: dict, tmp_path: Path
) -> None:
    client = _make_mock_client(tmp_path, pdf_action_payload)
    state_file = tmp_path / ".state" / "pdf_usage.json"
    usage_tracker = UsageTracker(state_file=state_file, monthly_cap=90)

    with patch(
        "linkedin_mcp.pdf_download.resolve_profile_urn",
        return_value="urn:li:fsd_profile:AbC123",
    ):
        result = download_profile_pdf(
            client,
            MagicMock(profile_url="https://www.linkedin.com/in/jane-smith/"),
            usage_tracker,
        )

    assert result.profile_url == "https://www.linkedin.com/in/jane-smith/"
    assert result.bytes_written == len(b"%PDF-1.4 sample")
    assert result.month_downloads_used == 1
    assert result.month_downloads_remaining == 89
    assert Path(result.pdf_path).exists()
    assert Path(result.pdf_path).read_bytes() == b"%PDF-1.4 sample"


def test_download_profile_pdf_enforces_cap(
    pdf_action_payload: dict, tmp_path: Path
) -> None:
    client = _make_mock_client(tmp_path, pdf_action_payload)
    state_file = tmp_path / ".state" / "pdf_usage.json"
    state_file.parent.mkdir(parents=True, exist_ok=True)
    import json as _json

    from unittest.mock import patch as _patch

    state_file.write_text(_json.dumps({"2026-02": 90}), encoding="utf-8")
    usage_tracker = UsageTracker(state_file=state_file, monthly_cap=90)

    with _patch.object(
        UsageTracker, "_current_month", return_value="2026-02"
    ):
        with pytest.raises(QuotaExceededError, match="Monthly PDF download limit"):
            download_profile_pdf(
                client,
                MagicMock(profile_url="https://www.linkedin.com/in/jane-smith/"),
                usage_tracker,
            )

    # No network calls should have been made
    client.post.assert_not_called()
    client.download_binary.assert_not_called()


def test_download_profile_pdf_raises_on_missing_download_url(
    tmp_path: Path,
) -> None:
    empty_payload = {"data": {}, "included": []}
    client = _make_mock_client(tmp_path, empty_payload)
    state_file = tmp_path / ".state" / "pdf_usage.json"
    usage_tracker = UsageTracker(state_file=state_file, monthly_cap=90)

    with patch(
        "linkedin_mcp.pdf_download.resolve_profile_urn",
        return_value="urn:li:fsd_profile:AbC123",
    ):
        with pytest.raises(ParseError, match="Could not extract downloadUrl"):
            download_profile_pdf(
                client,
                MagicMock(profile_url="https://www.linkedin.com/in/jane-smith/"),
                usage_tracker,
            )


def test_download_profile_pdf_counter_not_incremented_on_write_failure(
    pdf_action_payload: dict, tmp_path: Path
) -> None:
    client = _make_mock_client(tmp_path, pdf_action_payload)
    # Make the binary download succeed but write_bytes fail
    client.download_binary.return_value = b"%PDF-1.4 fail"
    state_file = tmp_path / ".state" / "pdf_usage.json"
    usage_tracker = UsageTracker(state_file=state_file, monthly_cap=90)

    with patch(
        "linkedin_mcp.pdf_download.resolve_profile_urn",
        return_value="urn:li:fsd_profile:AbC123",
    ):
        with patch("pathlib.Path.write_bytes", side_effect=OSError("disk full")):
            with pytest.raises(OSError, match="disk full"):
                download_profile_pdf(
                    client,
                    MagicMock(
                        profile_url="https://www.linkedin.com/in/jane-smith/"
                    ),
                    usage_tracker,
                )

    # Usage counter must still be 0 since write failed
    assert usage_tracker.get_usage() == 0


def test_download_profile_pdf_invalid_url_raises(tmp_path: Path) -> None:
    client = _make_mock_client(tmp_path, {})
    state_file = tmp_path / ".state" / "pdf_usage.json"
    usage_tracker = UsageTracker(state_file=state_file, monthly_cap=90)

    with pytest.raises(ValueError, match="Invalid LinkedIn profile URL"):
        download_profile_pdf(
            client,
            MagicMock(profile_url="https://www.linkedin.com/company/google/"),
            usage_tracker,
        )
