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

Known records return 200; malformed GUIDs return 400, unknown GUIDs 404, and database-operation failures 500. See the documented health/expiration limitations below.

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

## Checks and known limitations

```bash
cd frontend
npm test
npm run build
```

- [API contract and manual scenarios](docs/table-session-api.md)
- [Backend fixes to hand off](docs/backend-handoff.md)

Two backend issues remain: database-driven expiration is not implemented, and a warmed pooled connection can make `/health` return 200 during a database outage. The UI displays the backend's status unchanged. The full first-iteration definition of done is not met until these fixes and the team's remaining backend tests/clean-clone checks are complete.

Cloud deployment, HTTPS setup, accounts, session writes, orders and real QR generation remain outside this iteration.
