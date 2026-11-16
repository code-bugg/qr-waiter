# Session integration checks — 15 November 2026

Branch: `feature/auth0-frontend-alignment`. Tested the running frontend on port 5173 and the ASP.NET Core backend on port 5001 against local PostgreSQL 17.

## Failure reproduced and corrected

Clicking the waiter’s Create/open QR button displayed “Serviciul nu este disponibil momentan.” The backend health endpoint returned HTTP 503. PostgreSQL was stopped, the backend had no default database connection configured, and the database lacked the newer session migrations.

Started the existing PostgreSQL 17 instance. Backed up the database to `/private/tmp/qr-waiter-before-session-test.sql`. Stored the local database connection in .NET User Secrets, then restarted the backend. DbUp applied pending scripts 004_replace, 005 and 006. Health changed to HTTP 200 Healthy. No application source changes were required to correct this runtime configuration failure.

## Passed runtime checks

- A signed-in waiter reaches the session controls after the backend confirms `create:sessions`.
- Clicking the QR button creates an Active session for table 4 and renders a QR/link.
- Repeating the operation returns the same GUID: `886d23a9-1ec8-4bc1-9590-2351726c22fb`.
- The database contains exactly one record for this GUID and one Active session for table 4; waiter identity is recorded.
- The generated link opens the customer interface with table 4 and its Active session summary.
- Anonymous GET of the generated session returns HTTP 200 with table 4 and Active status.
- Malformed session GUID returns HTTP 400.
- Unknown session GUID returns HTTP 404.
- Anonymous staff identity request returns HTTP 401.
- Anonymous session creation returns HTTP 401.

## Pending checks and scope

- Second-account access and ownership conflict: PASSED. The account named admin can access `/waiter` with its shared `create:sessions` permission. Attempting to reopen the first waiter’s active table 4 session displays the ownership conflict. Creating its own table 2 session succeeds, with GUID `d7a03023-e974-492d-b0d6-bc05a60b3b50`. These are two distinct staff owners in the database.
- A physical phone scan is unverified. The current QR points to localhost, which refers to the phone itself; phone testing requires a reachable frontend address.
- The Admin role/account exists in Auth0, according to the user, but currently has only the same `create:sessions` permission. Its shared session permission was verified through `/waiter`. The `/admin` workspace is still explicitly unavailable in the application; no admin-specific API policy, role claim mapping or dashboard permissions are implemented.
- Customer requests, order submission, completion/denial and payment confirmation remain demo-only or missing and were not treated as working integration features.

The PostgreSQL process was started for local testing, not registered as an automatically starting service. Restarting the app requires the database to be running; the backend connection is stored outside Git in User Secrets.
