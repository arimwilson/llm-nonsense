from __future__ import annotations

from linkedin_mcp.models import SearchConnectionsInput
from linkedin_mcp.search import (
    PROFILE_URN_CACHE,
    build_search_query_params,
    parse_search_response,
)


def test_build_search_query_params_uses_offset_and_network_tokens() -> None:
    tool_input = SearchConnectionsInput(
        degree="all",
        page=2,
        page_size=10,
        keywords="machine learning",
    )

    qs = build_search_query_params(
        tool_input,
        search_query_id="voyagerSearchDashClusters.example",
    )

    assert "queryId=voyagerSearchDashClusters.example" in qs
    assert "includeWebMetadata=true" in qs
    assert "start:10" in qs
    assert "(key:network,value:List(F,S,O))" in qs
    assert "keywords:machine learning," in qs
    assert "count:10" in qs


def test_build_search_query_params_omits_empty_keywords() -> None:
    tool_input = SearchConnectionsInput(degree="1st", page=1, page_size=5, keywords="")

    qs = build_search_query_params(
        tool_input,
        search_query_id="voyagerSearchDashClusters.example",
    )

    assert "keywords:" not in qs
    assert "query:(flagshipSearchIntent:" in qs


def test_parse_search_response_extracts_expected_fields(
    search_response_payload: dict,
) -> None:
    PROFILE_URN_CACHE.clear()

    rows, total = parse_search_response(
        search_response_payload,
        requested_degree="1st",
    )

    assert total == 1234
    assert len(rows) == 2

    first = rows[0]
    assert first.name == "Jane Smith"
    assert first.title == "Senior Engineer at Google"
    assert first.location == "San Francisco Bay Area"
    assert first.profile_url == "https://www.linkedin.com/in/jane-smith/"
    assert first.degree == "1st"
    assert first.profile_urn == "urn:li:fsd_profile:AbC123"

    second = rows[1]
    assert second.name == "John Doe"
    assert second.profile_url == "https://www.linkedin.com/in/john-doe/"
    assert second.degree == "2nd"
    assert PROFILE_URN_CACHE[second.profile_url] == "urn:li:fsd_profile:Def456"
