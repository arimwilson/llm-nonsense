from __future__ import annotations

import json
from typing import Any

from linkedin_mcp.linkedin_client import LinkedInClient
from linkedin_mcp.models import (
    ConnectionResult,
    DegreeFilter,
    SearchConnectionsInput,
    SearchConnectionsOutput,
)

NETWORK_TOKENS: dict[DegreeFilter, list[str]] = {
    "1st": ["F"],
    "2nd": ["S"],
    "3rd": ["O"],
    "all": ["F", "S", "O"],
}

DISTANCE_TO_DEGREE = {
    "DISTANCE_1": "1st",
    "DISTANCE_2": "2nd",
    "DISTANCE_3": "3rd",
}

PROFILE_URN_CACHE: dict[str, str] = {}


class ParseError(RuntimeError):
    """Raised when the search response cannot be parsed safely."""


def _encode_restli_string(value: str) -> str:
    return json.dumps(value)


def _normalize_profile_url(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        return ""
    if cleaned.startswith("http://") or cleaned.startswith("https://"):
        return cleaned
    if cleaned.startswith("/"):
        return f"https://www.linkedin.com{cleaned}"
    return f"https://www.linkedin.com/{cleaned.lstrip('/')}"


def _extract_text(field: Any) -> str:
    if isinstance(field, str):
        return field.strip()
    if isinstance(field, dict):
        text = field.get("text")
        if isinstance(text, str):
            return text.strip()
    return ""


def _fallback_degree(requested_degree: DegreeFilter) -> str:
    if requested_degree == "all":
        return "3rd"
    return requested_degree


def _extract_profile_urn(entity_result: dict[str, Any]) -> str | None:
    entity_urn = entity_result.get("entityUrn")
    if isinstance(entity_urn, str) and entity_urn.startswith("urn:li:fsd_profile:"):
        return entity_urn
    return None


def build_search_query_params(
    search_input: SearchConnectionsInput,
    *,
    search_query_id: str,
) -> dict[str, str]:
    offset = (search_input.page - 1) * search_input.page_size
    network_tokens = ",".join(NETWORK_TOKENS[search_input.degree])
    encoded_keywords = _encode_restli_string(search_input.keywords.strip())
    variables = (
        f"(start:{offset},origin:GLOBAL_SEARCH_HEADER,"
        f"query:(keywords:{encoded_keywords},flagshipSearchIntent:SEARCH_SRP,"
        f"queryParameters:List((key:resultType,value:List(PEOPLE)),"
        f"(key:network,value:List({network_tokens}))),"
        "includeFiltersInResponse:false))"
    )
    return {"variables": variables, "queryId": search_query_id}


def parse_search_response(
    payload: dict[str, Any],
    *,
    requested_degree: DegreeFilter,
) -> tuple[list[ConnectionResult], int | None]:
    data = payload.get("data")
    if not isinstance(data, dict):
        raise ParseError("Missing top-level 'data' object in search response.")

    clusters = data.get("searchDashClustersByAll")
    if not isinstance(clusters, dict):
        raise ParseError("Missing 'searchDashClustersByAll' in search response.")

    total_available: int | None = None
    paging = clusters.get("paging")
    if isinstance(paging, dict) and isinstance(paging.get("total"), int):
        total_available = int(paging["total"])

    results: list[ConnectionResult] = []
    elements = clusters.get("elements", [])
    if not isinstance(elements, list):
        raise ParseError("Unexpected 'elements' format in search response.")

    default_degree = _fallback_degree(requested_degree)

    for element in elements:
        if not isinstance(element, dict):
            continue
        items = element.get("items", [])
        if not isinstance(items, list):
            continue

        for wrapped_item in items:
            if not isinstance(wrapped_item, dict):
                continue

            entity_result = (
                wrapped_item.get("item", {})
                .get("entityResult", {})
            )
            if not isinstance(entity_result, dict):
                continue

            profile_url = _normalize_profile_url(
                str(entity_result.get("navigationUrl", ""))
            )
            if not profile_url:
                continue

            member_distance = (
                entity_result.get("entityCustomTrackingInfo", {})
                .get("memberDistance")
            )
            degree = DISTANCE_TO_DEGREE.get(str(member_distance), default_degree)

            profile_urn = _extract_profile_urn(entity_result)
            if profile_urn:
                PROFILE_URN_CACHE[profile_url] = profile_urn

            results.append(
                ConnectionResult(
                    name=_extract_text(entity_result.get("title")),
                    title=_extract_text(entity_result.get("primarySubtitle")),
                    location=_extract_text(entity_result.get("secondarySubtitle")),
                    profile_url=profile_url,
                    degree=degree,
                    profile_urn=profile_urn,
                )
            )

    return results, total_available


def search_connections(
    client: LinkedInClient,
    search_input: SearchConnectionsInput,
) -> SearchConnectionsOutput:
    params = build_search_query_params(
        search_input,
        search_query_id=client.config.search_query_id,
    )
    response = client.get("/voyager/api/graphql", params=params)
    payload = response.json()

    connections, total_available = parse_search_response(
        payload,
        requested_degree=search_input.degree,
    )

    return SearchConnectionsOutput(
        degree_filter=search_input.degree,
        page=search_input.page,
        page_size=search_input.page_size,
        total_available=total_available,
        connections=connections,
    )


def get_cached_profile_urn(profile_url: str) -> str | None:
    return PROFILE_URN_CACHE.get(_normalize_profile_url(profile_url))
