# New I’MON website: inquiry receipts and analytics

Scope: reliable website inquiry receipts and optional privacy-conscious analytics.

## Implemented

- POST /api/contact confirms receipt only after a durable Payload lead write. A UUID v4 plus a unique SQLite index prevents duplicate writes on retries and concurrent requests.
- Replaying the same normalized body and UUID returns the original receipt (200). Reusing the UUID with different content returns 409. Receipt lookup happens before the hourly rate check.
- The form retains its attempt UUID and input after a network failure or 20-second timeout. It clears only after receiving the matching receipt. Changed content receives a new UUID. Double submits and editing in flight are blocked.
- Streaming body size is limited even without Content-Length. Invalid JSON shapes and cross-origin browser requests are rejected. Database error details and inquiry text are never logged by the handler.
- Migration adds nullable submission_id and request_hash fields, preserving old leads. The accompanying schema snapshot and generated Payload types are updated.
- Optional Umami integration loads after hydration only on the explicitly allowed hostnames, in production, with explicit opt-in. No script is loaded on an unapproved host.
- Manual pageview and inquiry_received events use an allowlisted payload without names, emails, message content, query strings, fragments, referrers or titles. Analytics errors cannot block the form. Admin/API routes are excluded.

## Validation

Run from the repository root: `bash scripts/qa-inquiries.sh`. It creates and removes its own temporary SQLite database, applies real migrations, checks TypeScript, runs 24 tests (including real Payload/SQLite and React form interaction), then lints changed code. Existing unrelated image-tag lint warning remains in Interactive.tsx.

Verified 2026-11-07 in an isolated test environment: 24/24 passed; TypeScript passed; lint 0 errors; Next.js production build passed (Turbopack). Concurrent live-database test: five requests, one stored lead, four duplicate receipts. Legacy lead creation and unauthenticated collection access restrictions verified.

## Enabling on the future site

1. Confirm this repository is the final new-site implementation; complete its separate content/legal/media launch review.
2. Apply migrations to the target site's database before switching the application. Take the normal approved database backup first. Rolling this migration down removes receipt fields and retry history; old application code can instead run with the extra columns retained.
3. Configure a real PAYLOAD_SECRET and the correct NEXT_PUBLIC_SERVER_URL. The reverse proxy must overwrite X-Forwarded-For; the per-IP rate limiter assumes a trusted proxy. The current limiter is an abuse throttle, not a strict concurrent quota.
4. Keep IMON_ANALYTICS_ENABLED=false until launch. Then set true plus UMAMI_SCRIPT_URL=https://analytics.example.com/script.js, UMAMI_WEBSITE_ID and exact comma-separated UMAMI_DOMAINS. No credential or CRM key belongs in browser code. Production analytics must not receive staging traffic.
5. Verify HTTPS form delivery, restart/retry behavior, and real Umami collection on the approved deployment.

## Remaining boundary: CRM delivery

This integration confirms durable receipt in the website CMS only. CRM forwarding and notifications are not implemented. A future authenticated server-side outbox/consumer should use the receipt UUID as its stable event ID and prove deduplication and failure reconciliation before activation.

Success means the website durably received the inquiry, not that a CRM card or email was delivered. Umami is best-effort and is not the authoritative submission ledger. A lost first response followed by a duplicate receipt can undercount conversions. Retry protection survives requests/server restarts through the DB; this version keeps the browser attempt ID only while the form is mounted, and does not persist form text in browser storage.

Implementation references: https://docs.umami.is/docs/tracker-configuration and https://docs.umami.is/docs/tracker-functions (manual v2-compatible payloads).
