# Backend issues for the session iteration

Recorded 20 September 2026 after testing the actual ASP.NET Core backend with local PostgreSQL 17. These are pending backend/database fixes; the UI does not work around them.

## 1. PostgreSQL does not determine expiration yet

Owner: database developer, coordinated with backend data access.

Reproduction: request `/api/table-sessions/550e8400-e29b-41d4-a716-446655440001`. The seeded record expires at `2026-09-14T09:00:00Z`, but both `table_session_get_by_guid(uuid)` and the endpoint still return `sessionStatus: "Active"` after this timestamp. The function currently selects `ts.session_status` unchanged.

Expected: PostgreSQL determines expiration, as agreed. Proposed rule to confirm with the team: a stored `Active` session whose expiration is at or before database current time is returned as `Expired`; `Closed` and `Cancelled` remain unchanged. The UI displays the returned status and does not calculate it using the device clock.

Fix: add a NEW numbered migration replacing the function; do not edit migrations 001–003 that have already been applied. Keep its return columns/types and the API contract stable. Add fresh test fixtures for a future-expiring Active session, an overdue Active session, explicit Expired, Closed and Cancelled sessions. Avoid relying only on fixed dates for an active test case.

Acceptance: future Active → Active; past/boundary Active → Expired; Closed/Cancelled remain those values; unknown GUID → no row. Verify the endpoint returns the database result unchanged. Existing records remain queryable; expired/closed sessions return HTTP 200 with their status.

## 2. Health check can report healthy when PostgreSQL is down

Owner: backend database integration developer.

Reproduced on an isolated PostgreSQL instance:

1. Start backend and request `/health` → 200.
2. Stop that PostgreSQL instance.
3. Request `/health` twice → 200 / `Healthy` despite the outage.
4. Request a known session → 500.
5. Request `/health` again → 503 / `Unhealthy`.

Cause: `backend/Health/DatabaseHealthCheck.cs` only calls `OpenConnectionAsync`. A pooled Npgsql connection can be returned without executing a database round trip.

Fix: execute and await `SELECT 1` on the opened connection, with cancellation and a bounded command timeout, before returning Healthy. Dispose the command/connection normally. Also consider disposing a newly constructed connection if `OpenAsync` fails in the connection factory.

Acceptance: with a warmed connection pool, stop the isolated database; the next health check must return 503 without needing a session request first. Restart the database and verify recovery to 200. Do not stop a teammate's shared database to reproduce this.

Startup note: DbUp runs before the HTTP server starts. If PostgreSQL is unavailable during startup, the process fails before `/health` is available. A 503 response is only possible from an already-running backend.
