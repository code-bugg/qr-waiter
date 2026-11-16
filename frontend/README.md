# TableBell frontend

React + TypeScript with Vite. Run the ASP.NET Core backend on port 5001 and this frontend on port 5173.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Use Node.js 22.18+; the package lock defines the dependency versions.

## Routes

- `/`: customer QR guidance only. No staff navigation and no Auth0 initialization.
- `/staff`: separate staff entry page linking to waiter/admin sign-in.
- `/session/{guid}`: anonymous customer access. Loads the session from the backend; an inactive or invalid session never mounts the customer actions.
- `/waiter`: Auth0 sign-in followed by `GET /api/users/me`. Waiter tools require the API-confirmed `create:sessions` permission.
- `/admin`: Auth0 sign-in; administrative functionality remains unavailable until the backend defines an administrator policy and permissions.

Customer pages never display staff sign-in, staff links or role selectors. Staff accounts are not required for customers. Staff tools still require API-enforced permissions, even when someone opens a staff URL directly.

## Local testing

Open `http://localhost:5173/dev` while running `npm run dev` for links to two separate testing flows:

- `http://localhost:5173/dev/customer`: customer UI with sample data, no sign-in or database required. The preview states that orders and requests are not sent to the restaurant.
- `http://localhost:5173/staff`: the real staff entry page; use a test account with the required Auth0 permission.

The development pages are disabled in production builds and have no links from customer navigation. No staff authentication bypass is provided. For an actual QR integration test, run the database/backend, create a session as a waiter, then open `/session/{guid}` in another tab or browser profile.

Production can serve the staff frontend on a separate hostname, such as `staff.example.com`, and customer QR links on `example.com`. This is a deployment choice; the current local setup uses separate routes on one origin.

## Auth0 setup

Set `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, and `VITE_AUTH0_AUDIENCE` in `.env.local`.
Do not add a client secret to a browser application. The audience must match the API identifier exactly, including any trailing slash. Restart Vite after changing the file.

The Auth0 SPA application must allow `http://localhost:5173` in **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins**. For compatibility with the current tenant settings, only OAuth callback requests with `state` and `code`/`error` initialize the staff callback handler at the root. Ordinary visits to `/` remain customer-only. Login returns to the root callback and restores `/waiter` or `/admin` without discarding the SDK's in-memory authentication state. Only these local return paths are accepted.

For the API, enable **RBAC** and **Add Permissions in the Access Token**. Assign `create:sessions` to waiter accounts. Configure the same domain and audience in the backend through environment variables or .NET User Secrets. JWT inbound claim mapping is disabled so endpoints can read the original `sub` claim.

## Sessions and QR codes

`POST /api/table-sessions` uses the Auth0 access token and `{ "tableId": 4 }`. The backend creates a GUID or returns the same waiter's active session. A different waiter's active session returns a specific conflict message. QR rendering never creates a session.

The interface uses **Active / Inactive** only. Existing API statuses are preserved: `Active` maps to Active; `Expired`, `Closed`, and `Cancelled` map to Inactive. Expiration is determined by the backend, not the customer's clock. This does not migrate the database to a boolean.

The QR encodes the current frontend origin plus `/session/{guid}`. A phone cannot reach a QR containing `localhost`; phone testing needs a shared HTTPS frontend URL and matching Auth0 allowed URLs.

## Backend work still needed

- An authenticated payment-confirmation operation that closes the visit **after the waiter confirms payment**. Requesting the bill is not confirmation of payment. No payment endpoint currently exists.
- Menu, orders, customer requests, waiter request lists and response operations. Their current UI interactions still use demonstration data; confirmations are not persisted or delivered to another browser.
- Table inventory and waiter assignments. The selector still uses sample tables 2, 4, 6 and 8; the backend currently accepts any positive table ID.
- Administrator permissions/policies and protected administrative APIs.
- A two-state backend contract/migration if the database and API must also store only Active/Inactive.

## Checks

```bash
npm test
npm run typecheck
npm run build
```

The Vite development/preview proxy forwards all `/api` routes, including `/api/users/me`, to `BACKEND_URL` (default `http://localhost:5001`). Production hosting needs an equivalent API proxy and SPA fallback for staff and session routes.

## Table sessions screen

The waiter workspace now opens on **Table sessions**. Select a table and choose **Create or reopen session** to load the backend session and QR. The card shows the table, Active/Inactive status, opening and expiration times, Refresh, Open link and Copy link (with manual-copy fallback). The QR and both actions use the same customer URL. Inactive or unverified sessions do not expose sharing actions.

The loaded session is refreshed every 30 seconds while the sessions tab is visible, when returning to it, and when the window regains focus. Status comes from the backend rather than the device clock. Switching tabs retains the session; switching tables clears it and cancels old requests. A browser reload requires reopening the table session through the existing API.

QR creation has been removed from **New order**. Table choices remain the existing sample list (2, 4, 6, 8): the API does not yet provide table inventory, session listing or payment closure. This screen makes no new claim that these backend features are complete.
