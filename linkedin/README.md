# LinkedIn MCP

Python MCP server for LinkedIn search and profile PDF tools.

Exposes two tools over stdio:

- `linkedin_search_connections(degree, page=1, page_size=10, keywords="")` — search your connections filtered by degree (`F` / `S` / `O`).
- `linkedin_get_profile_pdf(profile_url)` — download a profile PDF (subject to a monthly cap).

## Install

```bash
cd linkedin
python -m venv .venv && source .venv/bin/activate
pip install -e .
```

Python 3.11+ is required.

## Authenticate

The server reuses your browser's LinkedIn session via cookies. Pick one:

**Option A — cookie header string.** In a logged-in browser, open DevTools → Network → any `linkedin.com` request → copy the full `Cookie` request header (must include `li_at` and `JSESSIONID`):

```bash
export LINKEDIN_COOKIES='li_at=AQ...; JSESSIONID="ajax:..."; bcookie="v=2&..."; ...'
```

**Option B — HAR file.** In DevTools → Network, right-click → "Save all as HAR with content" while logged in, then point the server at it:

```bash
export LINKEDIN_HAR_PATH=/absolute/path/to/linkedin.har
```

The server auto-extracts the cookie header and derives the `csrf-token` from `JSESSIONID`. When cookies expire you'll see an auth error — capture fresh ones.

### Other env vars (all optional)

| Var | Default |
| --- | --- |
| `LINKEDIN_REQUEST_INTERVAL_SECONDS` | `5.0` |
| `LINKEDIN_PDF_MONTHLY_CAP` | `90` |
| `LINKEDIN_OUTPUT_DIR` | `linkedin/output` |
| `LINKEDIN_BASE_URL` | `https://www.linkedin.com` |
| `LINKEDIN_SEARCH_QUERY_ID` / `LINKEDIN_PDF_QUERY_ID` | baked-in Voyager IDs (override if LinkedIn rotates them) |
| `LINKEDIN_USER_AGENT` | recent Chrome UA |

A `.env` file in the working directory is auto-loaded.

## Run locally with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is the standard way to exercise a stdio server by hand. No install needed — run it via `npx`:

```bash
# from the repo root, with your venv active and LINKEDIN_COOKIES or LINKEDIN_HAR_PATH exported
npx @modelcontextprotocol/inspector linkedin-mcp-server
```

This opens a local web UI. Click **Connect**, then the **Tools** tab. Both tools should be listed; fill in arguments and hit **Run tool**. Errors from the server (bad cookies, quota exceeded, etc.) surface in the tool result pane.

To pass env inline instead of exporting:

```bash
npx @modelcontextprotocol/inspector \
  -e LINKEDIN_HAR_PATH=/abs/path/linkedin.har \
  -e LINKEDIN_PDF_MONTHLY_CAP=5 \
  linkedin-mcp-server
```

## Use with Claude

### Claude Code (CLI)

Register the server once with `claude mcp add`:

```bash
claude mcp add linkedin \
  --scope user \
  --env LINKEDIN_HAR_PATH=/abs/path/linkedin.har \
  -- linkedin-mcp-server
```

Use `--scope project` to write to `.mcp.json` in the current repo instead. If `linkedin-mcp-server` isn't on PATH (e.g. you want to pin a specific venv), replace the command with the absolute interpreter path:

```bash
claude mcp add linkedin \
  --scope user \
  --env LINKEDIN_HAR_PATH=/abs/path/linkedin.har \
  -- /abs/path/linkedin/.venv/bin/linkedin-mcp-server
```

In a Claude Code session, check it's live with `/mcp` — you should see `linkedin` connected and both tools listed. Then ask Claude things like "search my 2nd-degree connections for 'staff engineer'" or "download the PDF for https://www.linkedin.com/in/<handle>/".

### Claude Desktop

Edit the config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add an entry under `mcpServers`:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "/abs/path/linkedin/.venv/bin/linkedin-mcp-server",
      "env": {
        "LINKEDIN_HAR_PATH": "/abs/path/linkedin.har"
      }
    }
  }
}
```

Use the venv's absolute path to `linkedin-mcp-server` — Claude Desktop doesn't inherit your shell's PATH. Restart the app; the tools appear in the 🔌 menu.

## Notes

- Downloaded PDFs go to `LINKEDIN_OUTPUT_DIR` (default `linkedin/output/`).
- Monthly PDF usage is tracked in `linkedin/.state/pdf_usage.json`; hitting the cap raises `QuotaExceededError` until the month rolls over.
- Requests are rate-limited to one every `LINKEDIN_REQUEST_INTERVAL_SECONDS`.
