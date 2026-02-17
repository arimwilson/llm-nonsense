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
    entity_urn = entity_result.get("entityUrn", "")
    if not isinstance(entity_urn, str):
        return None
    # Direct profile URN
    if entity_urn.startswith("urn:li:fsd_profile:"):
        return entity_urn
    # Normalized format: urn:li:fsd_entityResultViewModel:(urn:li:fsd_profile:XXX,...)
    if "urn:li:fsd_profile:" in entity_urn:
        start = entity_urn.index("urn:li:fsd_profile:")
        rest = entity_urn[start:]
        # Trim at first comma or closing paren
        for ch in (",", ")"):
            if ch in rest:
                rest = rest[: rest.index(ch)]
        return rest
    return None


def build_search_query_params(
    search_input: SearchConnectionsInput,
    *,
    search_query_id: str,
) -> str:
    offset = (search_input.page - 1) * search_input.page_size
    network_tokens = ",".join(NETWORK_TOKENS[search_input.degree])
    keywords = search_input.keywords.strip()
    keywords_part = f"keywords:{keywords}," if keywords else ""
    variables = (
        f"(start:{offset},origin:GLOBAL_SEARCH_HEADER,"
        f"query:({keywords_part}flagshipSearchIntent:SEARCH_SRP,"
        f"queryParameters:List((key:resultType,value:List(PEOPLE)),"
        f"(key:network,value:List({network_tokens}))),"
        f"includeFiltersInResponse:false),count:{search_input.page_size})"
    )
    return (
        f"variables={variables}"
        f"&queryId={search_query_id}"
        f"&includeWebMetadata=true"
    )


def _build_included_lookup(included: list[Any]) -> dict[str, dict[str, Any]]:
    """Build a lookup from entityUrn to entity dict from the `included` array."""
    lookup: dict[str, dict[str, Any]] = {}
    for entry in included:
        if isinstance(entry, dict):
            urn = entry.get("entityUrn")
            if isinstance(urn, str):
                lookup[urn] = entry
    return lookup


def _resolve_entity_result(
    wrapped_item: dict[str, Any],
    included_lookup: dict[str, dict[str, Any]],
) -> dict[str, Any] | None:
    """Resolve an entity result, trying inline first then *entityResult reference."""
    item = wrapped_item.get("item", {})
    if not isinstance(item, dict):
        return None

    # Try inline entityResult (old format)
    entity_result = item.get("entityResult")
    if isinstance(entity_result, dict) and entity_result.get("navigationUrl"):
        return entity_result

    # Try normalized *entityResult reference (new format)
    ref_urn = item.get("*entityResult")
    if isinstance(ref_urn, str) and ref_urn in included_lookup:
        return included_lookup[ref_urn]

    return None


def parse_search_response(
    payload: dict[str, Any],
    *,
    requested_degree: DegreeFilter,
) -> tuple[list[ConnectionResult], int | None]:
    data = payload.get("data")
    if not isinstance(data, dict):
        raise ParseError("Missing top-level 'data' object in search response.")

    # LinkedIn may nest the query results under data.data (GraphQL envelope)
    inner = data.get("data", data)
    if isinstance(inner, dict) and "searchDashClustersByAll" not in data:
        data = inner

    clusters = data.get("searchDashClustersByAll")
    if not isinstance(clusters, dict):
        raise ParseError(
            f"Missing 'searchDashClustersByAll' in search response. "
            f"Available keys: {list(data.keys())}"
        )

    # Build lookup for normalized JSON references
    included = payload.get("included", [])
    included_lookup = _build_included_lookup(included if isinstance(included, list) else [])

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

            entity_result = _resolve_entity_result(wrapped_item, included_lookup)
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
    query_string = build_search_query_params(
        search_input,
        search_query_id=client.config.search_query_id,
    )
    response = client.get(f"/voyager/api/graphql?{query_string}")
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
