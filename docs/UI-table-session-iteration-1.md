# UI Table session contract - first iteration

Session lookup and authenticated waiter session creation are integrated. Orders, payments and waiter requests remain outside this iteration.

Browser route: `/session/{guid}`. The GUID in the link represents a scanned QR code. The frontend requests `GET /api/table-sessions/{guid}` on its own origin; the local Vite proxy forwards it to the ASP.NET Core origin configured with `BACKEND_URL`. Waiters with the Auth0 `create:sessions` permission create or reopen sessions with `POST /api/table-sessions`; the frontend renders the resulting customer URL as a QR code. Neither database credentials nor direct database connections are used in the browser.

## Response

HTTP 200, JSON with camelCase keys:

```json
{
  "tableSessionId": 1,
  "sessionGuid": "550e8400-e29b-41d4-a716-446655440001",
  "sessionStartTime": "2026-09-14T07:00:00Z",
  "sessionExpirationTime": "2026-09-14T09:00:00Z",
  "sessionStatus": "Active",
  "tableId": 1,
  "orderId": null,
  "waiterUserId": null
}
```

| Field | PostgreSQL | API / TypeScript |
| --- | --- | --- |
| tableSessionId | bigint | number, required |
| sessionGuid | uuid, unique | string, required |
| sessionStartTime | timestamptz | ISO 8601 UTC string, required |
| sessionExpirationTime | timestamptz | ISO 8601 UTC string, required |
| sessionStatus | varchar(20) | Active / Expired / Closed / Cancelled |
| tableId | bigint | number, required |
| orderId | bigint, nullable | number or null |
| waiterUserId | bigint, nullable | number or null |

The session link opens the existing customer home, keeping the GUID in the URL so refreshing fetches the correct session again. The UI uses `tableId` in the header across all customer screens; a separate restaurant-facing table number is not currently in the API. Status, timestamps and the optional order ID appear below the home actions. Timestamps remain unchanged in transport and display in the browser's local time zone. No GUID details, timezone note, preview banner or helper footer is shown. The current JSON numeric-ID contract must stay within JavaScript's safe integer range; larger bigint values would require a coordinated string-ID contract change.

The database owns session status and expiration. The UI must not silently change Active to Expired, hide expired/closed records, or derive order details from an order ID. Language selection (RO/RU/EN) translates labels only.

## Authenticated creation and QR sharing

`POST /api/table-sessions` requires an Auth0 bearer token with the `create:sessions`
permission and accepts:

```json
{ "tableId": 4 }
```

The backend creates a session or returns the same waiter's active session for that table. An
active session owned by another waiter returns HTTP 409. The session GUID remains stable when
the session is reopened. The frontend encodes the current origin and `/session/{guid}` in a
QR code; QR images and links are presentation data and are not stored by the backend.

## Errors and request lifecycle

- Loading state while fetching; requests time out after 10 seconds.
- Malformed URL GUID: invalid-link error page, no request or customer content.
- Backend 400: invalid-link error page.
- Backend 404: not-found error page, no customer content.
- Backend 500 or proxy 5xx: service-error state, retry available.
- Network failure / timeout: connection-error state, retry available.
- Invalid JSON, missing fields, unknown status or mismatched GUID: response-error state, retry available.
- Session creation requires Auth0; 400, 401, 403, 409 and 5xx responses show the corresponding staff error state.
- Navigation/unmount cancels the in-flight request; obsolete responses cannot replace current content.
- Reload requests fresh data. No automatic polling, local data fallback or health-check preflight.

## Local acceptance checks

Start both layers following the root README. Open these routes on `http://localhost:5173`:

| Route suffix | Expected |
| --- | --- |
| /session/550e8400-e29b-41d4-a716-446655440001 | Known table 1 record |
| /session/550e8400-e29b-41d4-a716-446655440002 | Expired session |
| /session/550e8400-e29b-41d4-a716-446655440003 | Closed session, order 42 |
| /session/00000000-0000-0000-0000-000000000000 | Not found |
| /session/not-a-guid | Invalid link |

Sign in at `/staff` with a waiter account that has the `create:sessions` permission, open `/waiter`, and create or reopen a session for table 2, 4, 6 or 8. Verify that the returned GUID is stable when reopening the same active session, that the QR and Open link use `/session/{guid}`, and that a second waiter receives an ownership conflict for that table. Use controlled fixtures to verify active, expired, closed and cancelled records. Test backend-unavailable behavior by stopping only your own backend or pointing a separate frontend test instance at an unused port, then retry after recovery. The root `/` retains customer QR guidance; orders and requests still use demonstration data. The error page does not automatically redirect to this root or a fallback table.
