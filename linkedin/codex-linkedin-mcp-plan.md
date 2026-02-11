# LinkedIn MCP Server Implementation Plan

## 1. Goal
Build a Python MCP server in `linkedin/` (stdio transport) that provides:

1. `linkedin_list_connections`: list LinkedIn connections filtered by explicit degree (`1st`, `2nd`, `3rd`) with:
   - name
   - title/headline
   - location
   - profile link
   - degree
2. `linkedin_get_profile_pdf`: download an individual profile PDF from a LinkedIn profile URL.
3. `linkedin_pdf_to_markdown`: convert a saved PDF to Markdown.

Required guardrails:

1. Rate limit: `1 request every 5 seconds` for outbound LinkedIn HTTP calls.
2. PDF cap: hard stop at `90` profile PDF downloads per calendar month.

Branch target: `codex/linkedin-mcp` (already created).

## 2. Constraints And Inputs

## 2.1 Constraints (confirmed)
1. Runtime: Python.
2. MCP transport: stdio only.
3. No browser automation fallback path.
4. Auth: env vars and/or cookie jar.
5. Start with current HAR only (`linkedin/firstdegreesearch.har`); more HAR files will be added later.

## 2.2 Inputs available now
1. First-degree HAR: `linkedin/firstdegreesearch.har`.
2. Known search URLs:
   - first degree: `network=["F"]`
   - first+second: `network=["F","S"]`
   - page 2 example includes `page=2&spellCorrectionEnabled=true`
3. Known PDF GraphQL action example and response containing `downloadUrl`.

## 2.3 Important assumptions to encode
1. Network token mapping:
   - `1st -> F`
   - `2nd -> S`
   - `3rd -> O` (tentative; confirm when 3rd-degree HAR is added)
2. The React/SDUI flight response format in `flagship-web` endpoints may change and must be parser-driven, not hardcoded to one opaque blob.

## 3. Deliverable Structure
Create a standalone Python package under `linkedin/`:

```text
linkedin/
  codex-linkedin-mcp-plan.md
  README.md
  pyproject.toml
  .env.example
  linkedin_mcp/
    __init__.py
    server.py
    config.py
    auth.py
    rate_limit.py
    usage_guardrail.py
    models.py
    linkedin_http.py
    tools/
      list_connections.py
      get_profile_pdf.py
      pdf_to_markdown.py
    parsers/
      har_inspector.py
      rsc_flight_parser.py
      profile_page_parser.py
  tests/
    test_rate_limit.py
    test_usage_guardrail.py
    test_profile_page_parser.py
    test_rsc_flight_parser.py
    fixtures/
      firstdegreesearch.har
```

## 4. MCP Tool Contracts

## 4.1 `linkedin_list_connections`
Purpose: return connections for one explicit degree.

Input schema:

```json
{
  "degree": "1st | 2nd | 3rd",
  "page": 1,
  "limit": 10,
  "query": ""
}
```

Behavior:
1. Degree is required and explicit.
2. `page >= 1`.
3. `limit` default 10, max 50.
4. `query` optional keyword string (empty string means no keyword filter).

Output schema:

```json
{
  "degree": "1st",
  "page": 1,
  "count": 10,
  "connections": [
    {
      "name": "Full Name",
      "title": "Headline",
      "location": "Location",
      "profile_url": "https://www.linkedin.com/in/<slug>/",
      "degree": "1st",
      "profile_urn": "urn:li:fsd_profile:..."
    }
  ],
  "warnings": []
}
```

Note: include `profile_urn` when available to make PDF download reliable.

## 4.2 `linkedin_get_profile_pdf`
Purpose: download a profile PDF locally from profile URL.

Input schema:

```json
{
  "profile_url": "https://www.linkedin.com/in/<slug>/",
  "output_dir": "linkedin/output/pdfs"
}
```

Behavior:
1. Validate URL shape and domain.
2. Check monthly cap before requesting download.
3. Resolve `profileUrn` from cached data or profile page.
4. Call GraphQL save-to-pdf action.
5. Download PDF from returned `downloadUrl`.
6. Save file locally with deterministic filename.
7. Increment monthly counter only on successful save.

Output schema:

```json
{
  "profile_url": "https://www.linkedin.com/in/<slug>/",
  "pdf_path": "linkedin/output/pdfs/<slug>-2026-02-11.pdf",
  "bytes_written": 123456,
  "month_download_count": 12,
  "month_download_cap": 90
}
```

## 4.3 `linkedin_pdf_to_markdown`
Purpose: convert local PDF to Markdown.

Input schema:

```json
{
  "pdf_path": "linkedin/output/pdfs/<file>.pdf",
  "output_path": "linkedin/output/markdown/<file>.md"
}
```

Behavior:
1. Validate source file exists and is `.pdf`.
2. Extract text with `pymupdf` (fallback to `pdfplumber` if extraction fails).
3. Normalize whitespace, preserve page breaks, convert to Markdown sections heuristically.
4. Save markdown file locally.

Output schema:

```json
{
  "pdf_path": "linkedin/output/pdfs/<file>.pdf",
  "markdown_path": "linkedin/output/markdown/<file>.md",
  "pages": 3,
  "chars": 8412
}
```

## 5. LinkedIn Request Strategy

## 5.1 Session and auth
Implement a single HTTP client (`httpx.Client`) with:

1. Cookie input modes:
   - `LINKEDIN_COOKIES` raw cookie header string, or
   - `LINKEDIN_COOKIE_JAR_PATH` Netscape cookie file path.
2. Headers:
   - `csrf-token` (from `JSESSIONID`, including `ajax:` prefix)
   - `x-restli-protocol-version: 2.0.0`
   - `accept`, `content-type` where required
   - configurable `user-agent`
3. Strict secret handling:
   - never log full cookies/tokens
   - redact headers in exceptions

## 5.2 Connection listing flow
Given current HAR, the search path is SDUI/React flight based:

1. Request:
   - `GET /flagship-web/search/results/people?...network=<token>&origin=MEMBER_PROFILE_CANNED_SEARCH`
   - include page params when page > 1 (`page`, `spellCorrectionEnabled=true`)
2. Parse flight payload:
   - decode if base64 encoded
   - parse line-oriented React flight chunks
   - extract records containing profile card data
3. Normalize each hit to:
   - `name`, `title`, `location`, `profile_url`, `profile_urn` (if present)
4. Assign `degree` from filter context (and prefer per-card value if found in payload).

Implementation note:
1. Keep parser tolerant to missing fields and return warnings.
2. Include a HAR inspector helper to speed updates when additional HAR files arrive.

## 5.3 Profile PDF download flow
1. Resolve profile URN:
   - from prior connection-cache mapping (`profile_url -> profile_urn`) if available
   - otherwise fetch profile page HTML and parse `urn:li:fsd_profile:...`
2. POST GraphQL action:
   - endpoint: `/voyager/api/graphql?action=execute&queryId=<save_to_pdf_query_id>`
   - body includes `profileUrn`
3. Extract `downloadUrl` from JSON response.
4. GET `downloadUrl` and write PDF file.
5. Update monthly usage ledger.

Config knobs:
1. `LINKEDIN_PDF_QUERY_ID` default to sample provided.
2. If query ID fails, return actionable error instructing HAR refresh.

## 6. Rate Limit And Monthly Cap

## 6.1 Rate limiter
Implement process-wide limiter:

1. Before each outbound LinkedIn request, enforce min interval of 5 seconds.
2. Use monotonic clock and mutex (`threading.Lock`) to avoid parallel bypass.
3. Apply to all LinkedIn network calls from all tools.

## 6.2 Monthly PDF cap
Implement persistent ledger at `linkedin/.state/pdf_usage.json`:

```json
{
  "2026-02": 12
}
```

Rules:
1. Block when month count is `>= 90`.
2. Increment only on successful file save.
3. Use atomic write (`tmp + rename`) and file lock.

## 7. Error Handling And Observability

## 7.1 Error categories
1. `AuthError`: missing/expired session data.
2. `ParseError`: unable to decode/parse response format.
3. `RateLimitWait`: info-only timing output.
4. `QuotaExceededError`: monthly PDF cap reached.
5. `UpstreamChangedError`: query IDs or payload contracts changed.

## 7.2 User-facing MCP errors
Return concise and actionable errors:
1. what failed
2. likely cause
3. what to refresh/update (cookie, HAR, query ID)

## 7.3 Logging
1. Structured logs in `linkedin/logs/linkedin_mcp.log`.
2. Redact sensitive headers/cookies/tokens.
3. Include request correlation IDs and timing.

## 8. Testing Plan

## 8.1 Unit tests
1. Rate limiter spacing is >= 5 seconds between calls.
2. Monthly cap blocks at 90 and allows < 90.
3. Profile page parser extracts `profile_urn` from fixture HTML.
4. Flight parser extracts expected fields from HAR fixture samples.

## 8.2 Contract tests
1. MCP tool input validation rejects invalid degree/page/url.
2. MCP tool outputs match declared schema.

## 8.3 Integration tests (mocked HTTP)
1. Happy path: list connections.
2. Happy path: PDF download with returned `downloadUrl`.
3. Happy path: PDF to Markdown conversion.
4. Failure paths: auth failure, parser mismatch, cap exceeded.

## 9. Phased Execution Plan

## Phase 0: Bootstrap
1. Create Python project files and dependency setup.
2. Scaffold MCP stdio server and empty tools.
3. Add `.env.example` and README skeleton.

Acceptance:
1. `python -m linkedin_mcp.server` starts cleanly.
2. MCP server advertises all three tools.

## Phase 1: HAR intelligence and parsers
1. Build `har_inspector.py` to enumerate request URLs, headers, payload keys.
2. Build `rsc_flight_parser.py` to decode and extract people cards.
3. Save small parsed fixtures for regression tests.

Acceptance:
1. Parser returns at least name/title/location/profile URL for first-degree HAR sample.

## Phase 2: Connection tool
1. Implement degree->network token mapping.
2. Implement paged search request builder.
3. Wire parser output to `linkedin_list_connections`.
4. Add warnings for partial extraction and missing fields.

Acceptance:
1. Tool returns normalized records with required fields plus degree.

## Phase 3: PDF tool with quota/rate controls
1. Implement auth/session + global rate limiter.
2. Implement profile URN resolution path.
3. Implement GraphQL save-to-pdf call + binary download.
4. Add persistent monthly counter and cap enforcement.

Acceptance:
1. Tool saves PDF locally.
2. Tool blocks once count reaches 90 in the current month.

## Phase 4: PDF-to-Markdown tool
1. Implement extractor with `pymupdf` and fallback.
2. Implement markdown formatting and file output.
3. Return conversion metadata.

Acceptance:
1. Tool creates markdown output for a sample PDF and returns path.

## Phase 5: Hardening
1. Add retries with bounded backoff for transient 429/5xx.
2. Improve error messages and redaction.
3. Expand tests and docs for operational use.

Acceptance:
1. Test suite passes.
2. README documents setup, env vars, and tool usage.

## Phase 6: Add 2nd/3rd degree HAR updates (when provided)
1. Ingest additional HAR fixtures for:
   - first+second degree search
   - page 2 behavior
   - third-degree confirmation
2. Confirm/fix network token mapping, especially `3rd`.
3. Update parser fixtures and tests to lock behavior.

Acceptance:
1. `1st`, `2nd`, and `3rd` filters validated against real captured traffic.

## 10. Configuration Spec (`.env.example`)

```bash
LINKEDIN_BASE_URL=https://www.linkedin.com
LINKEDIN_USER_AGENT=Mozilla/5.0 ...
LINKEDIN_COOKIES=
LINKEDIN_COOKIE_JAR_PATH=
LINKEDIN_CSRF_TOKEN=
LINKEDIN_PDF_QUERY_ID=voyagerIdentityDashProfileActionsV2.ca80b3b293240baf5a00226d8d6d78a1
LINKEDIN_NETWORK_TOKEN_1ST=F
LINKEDIN_NETWORK_TOKEN_2ND=S
LINKEDIN_NETWORK_TOKEN_3RD=O
LINKEDIN_REQUEST_INTERVAL_SECONDS=5
LINKEDIN_PDF_MONTHLY_CAP=90
LINKEDIN_OUTPUT_DIR=linkedin/output
```

## 11. Security And Operational Notes
1. Do not commit live cookies, auth tokens, or unredacted HARs.
2. Add `linkedin/.state/`, `linkedin/output/`, and logs to `.gitignore`.
3. Treat all LinkedIn internal endpoints and query IDs as unstable and externalized config.
4. Validate all file paths to prevent path traversal.

## 12. Definition Of Done
1. Python stdio MCP server runs and exposes exactly three tools:
   - `linkedin_list_connections`
   - `linkedin_get_profile_pdf`
   - `linkedin_pdf_to_markdown`
2. Connection tool returns normalized records with requested fields for available degree fixtures.
3. PDF tool saves files locally and enforces:
   - `1 request / 5 seconds`
   - `90 PDFs / month` cap
4. PDF-to-Markdown tool creates markdown output from downloaded PDFs.
5. Unit + integration tests pass and README documents setup and troubleshooting.

