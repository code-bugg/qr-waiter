# TableBell frontend

React + TypeScript, served by Vite. A valid `/session/{guid}` opens the customer home with its menu/service actions and the fetched table number, status, times and optional order ID. Invalid links or failed lookups show an error page without mounting the customer home. `/` retains the customer, waiter and admin mockups. Preview banners and explanatory footers are not displayed.

From this folder:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:5173/session/550e8400-e29b-41d4-a716-446655440001 after starting the backend. Use Node.js 22.18+ (22 LTS line) and npm; `package-lock.json` locks dependencies. Node 25.9.0 was used for this local check.

`BACKEND_URL` defaults to `http://localhost:5001`. Set it in `.env.local` to use a different backend, then restart Vite. The proxy forwards `/api/table-sessions/` requests from the frontend origin; no backend CORS change is needed for this local setup. This is a local development/preview arrangement, not a cloud deployment configuration.

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

The build creates `dist/`; preview also uses the local API proxy. Stop the dev server first because both use port 5173. A future static host must separately provide an API proxy and SPA route fallback for `/session/*`. Deployment is outside this iteration.

See `../docs/table-session-api.md` for the contract and scenarios and `../docs/backend-handoff.md` for the two pending backend fixes. Tests cover the API adapter; actual database-to-browser checks are documented separately.
