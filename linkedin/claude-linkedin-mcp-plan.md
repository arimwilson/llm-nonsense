# LinkedIn MCP Server — Implementation Plan

## 1. Goal

Build a Python MCP server (stdio transport) in `linkedin/` that exposes two tools:

1. **`linkedin_search_connections`** — Search for LinkedIn connections by degree (1st, 2nd, 3rd) with pagination. Returns name, title, location, profile URL, and connection degree for each result.
2. **`linkedin_get_profile_pdf`** — Download a member's profile as a PDF given their profile URL. Enforces a hard monthly cap of 90 downloads.

---

## 2. Architecture Decision: Voyager REST API

**Decision:** Use LinkedIn's internal Voyager REST/GraphQL API directly rather than parsing RSC binary streams.

**Rationale:**
- The Voyager API returns clean, structured JSON with discrete fields for name, title, location, degree, and profile URL.
- The PDF download endpoint (`voyagerIdentityDashProfileActionsV2`) already uses Voyager — this keeps both tools on the same API surface.
- RSC flight streams are opaque binary blobs that are fragile to parse and change with every LinkedIn frontend deploy.
- The Voyager API is what all existing open-source LinkedIn API clients use (linkedin-api, linkedin-private-api, linkedin-voyager-sdk, etc.).

**Tradeoff:** The `queryId` hash in Voyager GraphQL endpoints changes when LinkedIn deploys updates. This is mitigated by making it a configurable value (env var) with clear error messages when it expires.

---

## 3. API Details (from reverse engineering)

### 3.1 People Search Endpoint

```
GET https://www.linkedin.com/voyager/api/graphql
    ?variables=(start:{offset},origin:GLOBAL_SEARCH_HEADER,query:(keywords:{query},flagshipSearchIntent:SEARCH_SRP,queryParameters:List((key:resultType,value:List(PEOPLE)),(key:network,value:List({degree_tokens}))),includeFiltersInResponse:false))
    &queryId=voyagerSearchDashClusters.{hash}
```

**Key parameters:**
- `start` — 0-based offset for pagination
- `network` filter values: `F` (1st), `S` (2nd), `O` (3rd+)
- Multiple degrees combined with `|` separator (e.g., `F|S`)
- Max results per request: 50

**Response structure (JSON):**
```
data.searchDashClustersByAll.elements[].items[].item.entityResult
  .title.text           → Full name
  .primarySubtitle.text → Title/headline
  .secondarySubtitle.text → Location
  .navigationUrl        → Profile URL
  .entityCustomTrackingInfo.memberDistance → "DISTANCE_1" | "DISTANCE_2" | "DISTANCE_3"
```

**Pagination:** Offset-based. Increment `start` by the number of results returned. Stop when results are empty or limit reached.

### 3.2 Profile PDF Download Endpoint

```
POST https://www.linkedin.com/voyager/api/graphql
    ?action=execute
    &queryId=voyagerIdentityDashProfileActionsV2.{hash}
```

**Request body:**
```json
{
  "variables": {
    "profileUrn": "urn:li:fsd_profile:{profile_id}"
  },
  "queryId": "voyagerIdentityDashProfileActionsV2.{hash}"
}
```

**Response:** JSON containing `downloadUrl` (an ambry URL that serves the PDF binary).

**Profile URN resolution:** When the caller provides a URL like `/in/brian-baum-66a10856/`, we need to resolve it to a `profileUrn`. Two approaches:
1. **From prior search results** — cache `profile_url → profile_urn` mappings from search results (the `entityUrn` field).
2. **From profile page** — Fetch the profile page HTML and extract the `urn:li:fsd_profile:...` from embedded metadata/scripts.

### 3.3 Required Headers & Auth

| Header | Value |
|---|---|
| `csrf-token` | `JSESSIONID` cookie value with quotes stripped (e.g., `ajax:8285255314296902764`) |
| `x-restli-protocol-version` | `2.0.0` |
| `x-li-lang` | `en_US` |
| `accept` | `application/vnd.linkedin.normalized+json+2.1` |
| `content-type` | `application/json; charset=UTF-8` (for POST requests) |
| `user-agent` | Chrome user-agent string |
| `x-li-track` | JSON metadata blob (clientVersion, osName, deviceFormFactor, etc.) |

**Required cookies:** `li_at` (session token), `JSESSIONID` (CSRF source), plus supporting cookies (`bcookie`, `bscookie`, `liap`, etc.)

---

## 4. Tool Contracts

### 4.1 `linkedin_search_connections`

**Input schema:**
```json
{
  "degree": "1st | 2nd | 3rd | all",
  "page": 1,
  "page_size": 10,
  "keywords": ""
}
```

- `degree` — Required. Which connection degree(s) to search. `"all"` searches across all degrees.
- `page` — Optional, default 1. 1-based page number.
- `page_size` — Optional, default 10, max 50. Results per page.
- `keywords` — Optional. Search keywords to filter results.

**Output schema:**
```json
{
  "degree_filter": "1st",
  "page": 1,
  "page_size": 10,
  "total_available": 1234,
  "connections": [
    {
      "name": "Jane Smith",
      "title": "Senior Engineer at Google",
      "location": "San Francisco Bay Area",
      "profile_url": "https://www.linkedin.com/in/janesmith",
      "degree": "1st",
      "profile_urn": "urn:li:fsd_profile:AbC123..."
    }
  ]
}
```

**Behavior:**
1. Map degree to network token(s): `1st→F`, `2nd→S`, `3rd→O`, `all→F|S|O`.
2. Calculate `start` offset from `page` and `page_size`.
3. Make Voyager GraphQL GET request with proper parameters.
4. Parse response JSON, extracting fields from `entityResult` objects.
5. Map `memberDistance` values to human-readable degree strings.
6. Return structured results.

### 4.2 `linkedin_get_profile_pdf`

**Input schema:**
```json
{
  "profile_url": "https://www.linkedin.com/in/jane-smith/"
}
```

- `profile_url` — Required. Full LinkedIn profile URL.

**Output schema:**
```json
{
  "profile_url": "https://www.linkedin.com/in/jane-smith/",
  "pdf_path": "/absolute/path/to/linkedin/output/pdfs/jane-smith-2026-02-11.pdf",
  "bytes_written": 123456,
  "month_downloads_used": 12,
  "month_downloads_remaining": 78
}
```

**Behavior:**
1. Validate URL format (must be `linkedin.com/in/{slug}/`).
2. Check monthly download cap — reject if >= 90 this month.
3. Resolve profile URN:
   a. Check in-memory cache from recent search results.
   b. If not cached, fetch the profile page and extract the URN from embedded data.
4. POST to the save-to-pdf GraphQL endpoint with the profile URN.
5. Extract `downloadUrl` from response.
6. GET the download URL and save PDF to `linkedin/output/pdfs/{slug}-{date}.pdf`.
7. Increment monthly counter only on successful file write.
8. Return file path and usage stats.

---

## 5. Project Structure

```
linkedin/
  claude-linkedin-mcp-plan.md      # This plan
  pyproject.toml                    # Python package config + dependencies
  .env.example                      # Template for required env vars
  .gitignore                        # Exclude secrets, output, state files
  linkedin_mcp/
    __init__.py
    server.py                       # MCP stdio server entry point
    config.py                       # Env var loading + validation
    linkedin_client.py              # HTTP client: auth, headers, rate limiting
    search.py                       # Connection search tool implementation
    pdf_download.py                 # PDF download tool implementation
    profile_resolver.py             # profile_url → profile_urn resolution
    usage_tracker.py                # Monthly PDF download counter (persistent)
    models.py                       # Pydantic models for tool I/O
  tests/
    conftest.py                     # Shared fixtures
    test_search.py                  # Search response parsing tests
    test_pdf_download.py            # PDF download flow tests
    test_usage_tracker.py           # Monthly cap enforcement tests
    test_profile_resolver.py        # URN resolution tests
    test_config.py                  # Config validation tests
    fixtures/
      search_response.json          # Sample Voyager search response
      pdf_action_response.json      # Sample PDF action response
      profile_page.html             # Sample profile page for URN extraction
```

---

## 6. Dependencies

```toml
[project]
requires-python = ">=3.11"
dependencies = [
    "mcp>=1.0",           # MCP SDK (stdio transport)
    "httpx>=0.27",         # HTTP client
    "pydantic>=2.0",       # Input/output validation
    "python-dotenv>=1.0",  # .env file loading
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.23",
    "respx>=0.21",          # httpx mocking
]
```

---

## 7. Authentication Strategy

Support two cookie input modes (both read at server startup):

### Mode 1: Raw cookie string (env var)
```bash
LINKEDIN_COOKIES='li_at=AQEFAQ8B...; JSESSIONID="ajax:8285255314296902764"; bcookie="v=2&..."'
```

### Mode 2: HAR file extraction
```bash
LINKEDIN_HAR_PATH=linkedin/firstdegreesearch.har
```

Parse the HAR file, extract cookies from request headers. This is convenient since the user already captures HAR files and they contain all needed cookies.

### CSRF token derivation
The `csrf-token` header is derived from the `JSESSIONID` cookie value with surrounding quotes stripped. This is computed automatically — no separate env var needed.

### Cookie refresh flow
When cookies expire (401/403 responses), the server returns a clear error message:
```
Authentication expired. Please export fresh cookies:
  Option A: Set LINKEDIN_COOKIES env var with your cookie header string
  Option B: Capture a new HAR file and set LINKEDIN_HAR_PATH
```

---

## 8. Rate Limiting

**Strategy:** Process-wide rate limiter using a monotonic clock + threading lock.

**Rules:**
- Minimum 5-second interval between any two outbound LinkedIn HTTP requests.
- Applied globally across both tools (search and PDF download).
- If a request would fire too soon, sleep for the remaining interval.

**Implementation:**
```python
class RateLimiter:
    def __init__(self, min_interval_seconds: float = 5.0):
        self._min_interval = min_interval_seconds
        self._last_request_time = 0.0
        self._lock = threading.Lock()

    def wait(self):
        with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self._min_interval:
                time.sleep(self._min_interval - elapsed)
            self._last_request_time = time.monotonic()
```

---

## 9. Monthly PDF Download Cap

**Cap:** 90 downloads per calendar month (LinkedIn limit is 100; 90 gives a safety margin).

**Persistent storage:** `linkedin/.state/pdf_usage.json`
```json
{
  "2026-02": 12
}
```

**Rules:**
1. Check count before initiating PDF download — reject if `>= 90`.
2. Increment only after successful file write (not on request, not on failure).
3. Atomic writes: write to temp file, then rename.
4. File lock (`fcntl.flock`) to prevent concurrent corruption.

---

## 10. Profile URN Resolution

The PDF download endpoint requires a `profileUrn` (e.g., `urn:li:fsd_profile:ACoAAAvDJbIBM7...`), but the user provides a profile URL (e.g., `https://www.linkedin.com/in/brian-baum-66a10856/`).

**Resolution strategy (ordered by preference):**

1. **In-memory cache** — When `linkedin_search_connections` runs, cache the `profile_url → entityUrn` mapping. If `linkedin_get_profile_pdf` is called for a recently searched profile, use the cached URN. No extra HTTP request needed.

2. **Profile page fetch** — GET the profile page HTML. LinkedIn embeds profile data in `<script>` tags or `<code>` elements as JSON. Extract `urn:li:fsd_profile:...` using regex or JSON parsing.

3. **Voyager profile API** — `GET /voyager/api/identity/profiles/{public_identifier}` returns structured profile data including the URN. This is a well-known Voyager endpoint.

---

## 11. Error Handling

### Error categories and user-facing messages:

| Error | Cause | Message |
|---|---|---|
| `AuthenticationError` | Missing/expired cookies | "Authentication failed. Please refresh your LinkedIn cookies." |
| `QueryIdExpiredError` | Voyager queryId hash changed | "LinkedIn API endpoint has changed. Update LINKEDIN_SEARCH_QUERY_ID / LINKEDIN_PDF_QUERY_ID in your config." |
| `RateLimitedError` | LinkedIn returned 429 | "LinkedIn rate limit hit. Waiting {n} seconds before retry." |
| `QuotaExceededError` | Monthly PDF cap reached | "Monthly PDF download limit reached ({n}/90). Resets on {date}." |
| `ProfileNotFoundError` | Invalid profile URL or URN resolution failed | "Could not find profile for URL: {url}. Verify the URL is correct." |
| `ParseError` | Unexpected response format | "Could not parse LinkedIn response. The API format may have changed." |

### Retry policy:
- 429 responses: retry once after the `Retry-After` header value (or 60 seconds default).
- 5xx responses: retry once after 10 seconds.
- All other errors: fail immediately with descriptive message.

---

## 12. Configuration (`.env.example`)

```bash
# === Authentication (provide at least one) ===
LINKEDIN_COOKIES=                    # Raw cookie header string
LINKEDIN_HAR_PATH=                   # Path to HAR file to extract cookies from

# === Voyager API Query IDs (update when LinkedIn changes them) ===
LINKEDIN_SEARCH_QUERY_ID=voyagerSearchDashClusters.b0928897b71bd00a5a7291755dcd64f0
LINKEDIN_PDF_QUERY_ID=voyagerIdentityDashProfileActionsV2.ca80b3b293240baf5a00226d8d6d78a1

# === Rate Limiting ===
LINKEDIN_REQUEST_INTERVAL_SECONDS=5  # Min seconds between requests

# === PDF Download Cap ===
LINKEDIN_PDF_MONTHLY_CAP=90          # Max PDF downloads per month

# === Output ===
LINKEDIN_OUTPUT_DIR=linkedin/output  # Where to save downloaded PDFs
```

---

## 13. Testing Plan

### Unit tests (no network, fast):
1. **Search response parsing** — Feed a saved Voyager JSON response fixture through the parser. Assert correct extraction of name, title, location, profile_url, degree for all results.
2. **PDF action response parsing** — Feed a saved PDF action response fixture. Assert correct extraction of `downloadUrl`.
3. **Profile URN resolution** — Feed a saved profile page HTML fixture. Assert correct URN extraction.
4. **Usage tracker** — Test cap enforcement (allow at 89, block at 90), month rollover, atomic file writes.
5. **Config validation** — Test that missing required env vars produce clear errors. Test HAR cookie extraction.
6. **Rate limiter** — Assert minimum interval is enforced between calls.

### Integration tests (mocked HTTP via `respx`):
1. **Search happy path** — Mock Voyager endpoint, call tool, verify structured output.
2. **Search pagination** — Mock two pages of results, verify offset calculation.
3. **PDF download happy path** — Mock URN resolution + PDF action + binary download. Verify file saved.
4. **PDF cap enforcement** — Set counter to 90, verify tool rejects request.
5. **Auth failure** — Mock 401 response, verify clear error message.
6. **QueryId expiration** — Mock 400/404 response, verify error suggests updating queryId.

---

## 14. Phased Implementation

### Phase 1: Project Scaffold
- Create `pyproject.toml`, directory structure, `.env.example`, `.gitignore`.
- Implement `config.py` with env var loading + HAR cookie extraction.
- Implement `server.py` with MCP stdio server skeleton advertising both tools (returning placeholder responses).
- **Acceptance:** `python -m linkedin_mcp.server` starts and advertises both tools.

### Phase 2: HTTP Client & Auth
- Implement `linkedin_client.py` with:
  - Cookie/header setup from config
  - CSRF token derivation from JSESSIONID
  - Rate limiter integration
  - Standard Voyager headers
- Implement `models.py` with Pydantic models for tool inputs/outputs.
- **Acceptance:** Client can make an authenticated GET to LinkedIn and receive a 200 response.

### Phase 3: Connection Search Tool
- Implement `search.py`:
  - Degree-to-network-token mapping
  - Voyager GraphQL URL construction with proper Rest.li parameter encoding
  - Response JSON parsing (extract entityResult fields)
  - Pagination offset calculation
- Wire into `server.py` as the `linkedin_search_connections` tool.
- Create test fixtures from a real response.
- **Acceptance:** Tool returns structured connection data for 1st-degree search. Unit tests pass.

### Phase 4: PDF Download Tool
- Implement `profile_resolver.py`:
  - In-memory cache from search results
  - Profile page fetch + URN extraction fallback
- Implement `usage_tracker.py` with persistent JSON counter.
- Implement `pdf_download.py`:
  - Profile URN resolution
  - GraphQL save-to-pdf POST
  - Download URL extraction
  - Binary PDF download + file save
  - Usage counter increment
- Wire into `server.py` as the `linkedin_get_profile_pdf` tool.
- **Acceptance:** Tool downloads a PDF and saves it locally. Monthly cap is enforced. Unit tests pass.

### Phase 5: Hardening & Tests
- Add retry logic for 429/5xx responses.
- Improve error messages with actionable guidance.
- Add all unit and integration tests.
- Verify with real LinkedIn session.
- **Acceptance:** Full test suite passes. Both tools work end-to-end with live cookies.

---

## 15. Security & Operational Notes

1. **Never commit cookies, tokens, or unredacted HAR files.** The `.gitignore` must exclude `.env`, `*.har`, `.state/`, `output/`, and `logs/`.
2. **Redact sensitive data in logs.** Cookie values and tokens should be truncated/masked in any log output or error messages.
3. **Treat all Voyager endpoints as unstable.** Query IDs and response schemas can change without notice. Externalize query IDs as config. Parsers should handle missing fields gracefully with warnings rather than crashes.
4. **Validate all file paths** in the PDF download tool to prevent path traversal attacks.
5. **Account risk:** This server uses LinkedIn's internal API, which violates their User Agreement. Use responsibly and accept the risk of account restrictions.

---

## 16. Open Questions / Future Work

1. **3rd-degree search confirmation** — The network token `O` for 3rd-degree is based on community reverse engineering. Needs live verification.
2. **Search queryId freshness** — When the search queryId expires, the user must extract the new one from LinkedIn's frontend JavaScript bundles. Consider adding a helper tool or instructions for this.
3. **Keyword search** — The search endpoint supports `keywords` filtering. The plan includes this parameter but it needs live testing to confirm behavior with network filters.
4. **Total results count** — The Voyager response may include `paging.total` which could be exposed in the tool output. Needs verification.
