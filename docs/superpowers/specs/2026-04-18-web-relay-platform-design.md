# Web Relay Platform Design

## Goal

Reposition the project from a Clash subscription relay tool into a professional web relay platform for forwarding requests through edge-hosted deployments such as Cloudflare and Vercel. The product should support two clear usage modes:

- Manual testing through a polished browser console
- Stable programmatic access through a documented proxy API

The redesign should remove subscription-specific branding, examples, and assumptions while keeping the product lightweight and deployable as a single Next.js application.

## Product Direction

The platform will present itself as a web relay console rather than a niche utility. The homepage should communicate that the application can forward requests to target URLs, inspect responses, and serve as a reusable endpoint for other tools or programs.

The experience will explicitly support two invocation styles:

- `POST /api/proxy` as the recommended, structured interface for integrations
- `GET /api/proxy?url=...` as a low-friction shortcut for direct access and simple scripts

The UI should reflect this hierarchy. The interactive console is the main workspace, while the API guide explains the dual-mode access model and emphasizes POST as the standard approach.

## Homepage Information Architecture

The homepage will be rebuilt as a platform-style layout with two major columns on desktop and a stacked flow on mobile.

### Main Console Area

This is the primary workspace for manual testing. It should include:

- Product identity and positioning copy centered on web relay / proxy access
- A request form with fields for target URL, HTTP method, optional headers JSON, and optional request body
- A clear primary action to execute the request
- A response panel showing status, response headers summary, payload preview, and lightweight size metadata

The request form should feel like an API console instead of a single-purpose URL passthrough input. This gives the page a more professional and flexible tone.

### Developer Access Area

This section documents the two API modes and helps third-party callers choose the right one.

- Quick Access: `GET /api/proxy?url=...`
- Standard API: `POST /api/proxy`

The POST section should show a structured JSON example with fields such as `url`, `method`, `headers`, and optional `body`. The copy should clearly recommend POST for stable integrations because it is easier to validate, evolve, and extend.

### Local History Area

The console will include a recent requests module backed by browser local storage. Each item stores:

- `url`
- `method`
- `headers`
- `body`
- `timestamp`

Users can click a history item to repopulate the form. A clear-history action removes all local entries. History is not synced to the server.

## Interaction Design

### Request History Behavior

History should optimize for practical reuse without becoming cluttered.

- Persist entries in `localStorage`
- Keep the most recent 12 entries
- De-duplicate by normalized `url + method + headers + body`
- On repeat use, move the entry to the top and refresh its timestamp
- Show human-readable relative or formatted time in the history list

### Form Behavior

- Validate that URL is present and uses `http` or `https`
- Validate that headers are valid JSON when provided
- Only require body input for methods where a body is meaningful, but do not hard-block advanced usage
- Keep keyboard submission support for fast testing
- Allow one-click refill from history

### Response Behavior

The response panel should behave like a relay inspection view rather than a raw text dump.

- Show HTTP status
- Show relevant upstream response headers in a compact summary
- Show text payload preview
- Preserve copy actions for response content and generated shortcut link when applicable
- Provide clear error messaging for validation failures, upstream failures, and proxy execution failures

## API Design

## `GET /api/proxy`

Purpose: shortcut mode for direct browser access and very simple scripts.

Input:

- Query parameter `url` is required

Behavior:

- Forward a GET request to the target URL
- Return upstream body with upstream status code
- Forward a safe subset of useful response headers where practical

Limitations should be implied in docs rather than overemphasized in the UI. GET remains available, but it is not the recommended primary integration path.

## `POST /api/proxy`

Purpose: standard integration mode.

Request body:

```json
{
  "url": "https://example.com/data",
  "method": "GET",
  "headers": {
    "Authorization": "Bearer token"
  },
  "body": "",
  "responseType": "text"
}
```

Required fields:

- `url`

Supported fields for this iteration:

- `url`
- `method`
- `headers`
- `body`

Reserved extension fields:

- `responseType`
- `timeout`

Behavior:

- Forward the specified method to the target URL
- Pass through caller-provided headers except forbidden or host-specific headers that should remain platform-controlled
- Include a request body when provided and method semantics allow it
- Return upstream body with upstream status code
- Return a normalized JSON error envelope on failures that occur before a usable upstream response is obtained

## Error Handling

Validation and execution errors should be structured consistently for programmatic callers.

Suggested error shape:

```json
{
  "error": "proxy_request_failed",
  "message": "Upstream request could not be completed",
  "status": 502
}
```

Error categories:

- Invalid client input: `400`
- Unsupported request configuration: `400`
- Upstream/network failure before response: `502`
- Unexpected server failure: `500`

If an upstream response is successfully received, the proxy should generally return that upstream status and body instead of wrapping it.

## Technical Changes

### Frontend

- Replace Clash branding, labels, presets, and examples
- Remove client presets tied to Clash ecosystem user agents
- Introduce method selection and optional body input
- Add history persistence via `localStorage`
- Update metadata and explanatory copy to match platform positioning

### Backend

- Remove subscription-specific default headers and assumptions
- Expand POST handler to support configurable methods and optional body
- Keep GET handler as shortcut mode with cleaner generic behavior
- Normalize validation and failure responses
- Forward a safe subset of upstream headers instead of subscription-specific ones

## Testing Strategy

Testing should focus on the proxy contract and the new local UX behavior.

- Manual verification of GET and POST proxy flows against known public endpoints
- Validation checks for malformed URL and malformed headers JSON
- Verification that history persists, deduplicates, refills, and clears correctly
- Verification that UI remains usable on desktop and mobile layouts
- Regression check that response preview and copy actions still work

## Out of Scope

The following are intentionally excluded from this iteration:

- Authentication or API keys
- Rate limiting or per-user quotas
- Cloud sync of request history
- Binary/file upload oriented proxy flows
- Full response-type negotiation UI beyond lightweight reserved API fields

## Success Criteria

The redesign is successful when:

- The product no longer reads as a Clash subscription utility
- The homepage clearly supports both manual testing and third-party integration
- The POST API is positioned as the standard interface
- Local request history is fast and reliable
- The proxy behavior is more generic, professional, and extensible than the current implementation
