# QR Waiter — first session iteration

An anonymous customer opens `/session/{guid}` and lands on the TableBell customer home. Its table number and session summary come from ASP.NET Core and PostgreSQL. Invalid links and lookup failures show an error page. The design mockups remain available at the frontend root; menu, orders, waiter requests and payment interactions still use demonstration data, without preview banners in the UI.

## Repository

- `database/`: numbered SQL migrations, embedded into the backend and applied by DbUp.
- `backend/`: ASP.NET Core 9, Npgsql and Dapper.
- `frontend/`: React + TypeScript with Vite and the TableBell design.
- `docs/`: API contract, local checks and pending backend issues.

## Local prerequisites

- .NET 9 SDK (verified here with 9.0.306).
- Native PostgreSQL (verified here with PostgreSQL 17), running on port 5432.
- Node.js 22.18+ and npm. Dependencies are locked in `frontend/package-lock.json`; this machine used Node 25.9.0.
- No Docker required.

Use `qrwaiter` consistently as the database name. From a PostgreSQL client connected to your local server:

```sql
CREATE DATABASE qrwaiter;
```

On a Homebrew macOS installation, PostgreSQL's CLI may be under `/opt/homebrew/opt/postgresql@17/bin`. Use your own existing local role; Homebrew commonly creates a role matching your macOS username. Do not assume the role or password is identical on teammates' computers.

## Run the backend

From the repository root, set the connection for your own database/role:

```bash
export ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=qrwaiter;Username=postgres;Password=YOUR_LOCAL_PASSWORD'
dotnet run --project backend/backend.csproj --launch-profile http
```

PowerShell equivalent:

```powershell
$env:ConnectionStrings__DefaultConnection = 'Host=localhost;Port=5432;Database=qrwaiter;Username=postgres;Password=YOUR_LOCAL_PASSWORD'
dotnet run --project backend/backend.csproj --launch-profile http
```

Alternatively store the connection outside Git using .NET User Secrets:

```bash
dotnet user-secrets set 'ConnectionStrings:DefaultConnection' 'Host=localhost;Port=5432;Database=qrwaiter;Username=postgres;Password=YOUR_LOCAL_PASSWORD' --project backend/backend.csproj
```

The root `.env.example` documents the variable; ASP.NET Core does **not** load a `.env` file automatically. Export the environment variable or use User Secrets. Never put the database connection in frontend settings.

The backend listens at `http://localhost:5001`. DbUp creates `schemaversions` and applies unapplied embedded SQL scripts. Add new numbered scripts for database changes; do not edit applied scripts. The database itself must already exist. Rebuild/restart the backend when adding scripts.

```bash
curl http://localhost:5001/health
curl http://localhost:5001/api/table-sessions/550e8400-e29b-41d4-a716-446655440001
```

Known records return 200; malformed GUIDs return 400, unknown GUIDs 404, and database-operation failures 500. PostgreSQL determines expiration for active sessions whose expiration time is at or before the current database time, while health checks now execute a `SELECT 1` round trip before reporting healthy.

## Run the frontend

In a second terminal:

```bash
cd frontend
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell use `Copy-Item .env.example .env.local` instead of `cp` if needed.

Open http://localhost:5173/session/550e8400-e29b-41d4-a716-446655440001 . The URL simulates scanning a QR code. The frontend forwards its same-origin API request to the local backend; `frontend/.env.local` can override `BACKEND_URL`. Restart the frontend after changing it. Keep both processes running.

## Checks

```bash
cd frontend
npm test
npm run build
```

- [API contract and manual scenarios](docs/table-session-api.md)
- [Backend fixes to hand off](docs/backend-handoff.md)

The database now resolves session expiry on the server side, and the health endpoint verifies a real PostgreSQL round trip before returning healthy. Cloud deployment, HTTPS setup, accounts, session writes, orders and real QR generation remain outside this iteration.

## Auth0 environment setup

Frontend variables belong in `frontend/.env.local`; ASP.NET Core variables must be exported in the
shell or configured with User Secrets. `.env.example` files are templates and are not loaded by
Vite or ASP.NET Core automatically.

Create `frontend/.env.local` with the Auth0 application domain, SPA client ID, and API audience.
The domain must contain no scheme or trailing path:

```dotenv
VITE_AUTH0_DOMAIN=example.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://qr-waiter-api
```

Restart Vite after changing `.env.local`. Configure the same audience and the Auth0 API domain in
the backend, then grant the `create:sessions` permission to waiter users:

```bash
dotnet user-secrets set "Auth0:Domain" "example.auth0.com" --project backend/backend.csproj
dotnet user-secrets set "Auth0:Audience" "https://qr-waiter-api" --project backend/backend.csproj
```

## Auth0 and table sessions

Waiter session creation is protected by Auth0 bearer tokens. Configure `Auth0:Domain` and
`Auth0:Audience` for ASP.NET Core, and the matching `VITE_AUTH0_*` values for Vite. The Auth0
API must grant the `create:sessions` permission to waiter tokens.

`POST /api/table-sessions` accepts `{ "tableId": 1 }`. A session has one stable GUID. Repeating
the request returns the same authenticated waiter's active session; the QR can be rendered or
printed again without changing the GUID. A request for a table owned by another active waiter
returns `409 Conflict`. Expired sessions become new sessions only after the table's previous
session expires.

The frontend uses `qrcode.react` to render that GUID as `/session/{guid}` at the current origin.
QR images and links are derived presentation data; they are not stored by the backend.
