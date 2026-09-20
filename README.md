# QR Waiter

## Backend

The backend uses PostgreSQL through Npgsql and Dapper. Configure the connection
string without committing credentials:

```bash
export ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=qr_waiter;Username=postgres;Password=change-me'
dotnet run --project backend/backend.csproj
```

The database must expose `table_session_get_by_guid(uuid)` and return the
`table_sessions` fields used by the backend. The available endpoints are:

- `GET /api/table-sessions/{guid}`
- `GET /health`

The session endpoint returns `400` for an invalid GUID, `404` for an unknown
session, and `500` when the database operation fails. `/health` returns `503`
when PostgreSQL is unavailable.