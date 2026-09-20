# DB documentation

## Requirements

To work with the QRWaiter database locally, install:

PostgreSQL 18 — database server

psql — PostgreSQL command-line client (included with PostgreSQL)

Database:
PostgreSQL

Database:
qrwaiter

## Initial DB setup
Install PostgreSQL 18 on your computer.

During installation, remember the password you choose for the PostgreSQL `postgres` user.

Make sure the PostgreSQL server is running after installation.

The default PostgreSQL installation on Windows places the PostgreSQL command-line tools in:

C:\Program Files\PostgreSQL\18\bin

If `psql` is not recognized as a command, use the full path shown above.

---

### Clone the repository

Clone the QRWaiter repository and navigate to the project directory.

Example:

git clone <repository-url>
cd qr-waiter

The database scripts are located in:

database/

The scripts are numbered so they should be executed in order.

---

### Create the database

Open PowerShell or another terminal and connect to PostgreSQL:

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres

Enter the password for the `postgres` user.

Create the QRWaiter database:

CREATE DATABASE qrwaiter;

Exit `psql`:

\q

---

### Run the database scripts

From PowerShell, execute the scripts in numerical order.

#### Create the `table_sessions` table

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d qrwaiter -f ".\database\001_create_table_sessions.sql"

Expected result:

CREATE TABLE

#### Insert test data

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d qrwaiter -f ".\database\002_seed_table_sessions.sql"

Expected result:

INSERT 0 3

#### Create the session lookup function

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d qrwaiter -f ".\database\003_create_table_session_get_by_guid.sql"

Expected result:

CREATE FUNCTION

---

## Verify the Database

Connect to the QRWaiter database:

& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d qrwaiter

Check that the table exists:

\dt

Inspect the table structure:

\d table_sessions

Check the test data:

SELECT * FROM table_sessions;

There should be three test sessions:

| Test GUID                              | Status  | Table |
| -------------------------------------- | ------- | ----: |
| `550e8400-e29b-41d4-a716-446655440001` | Active  |     1 |
| `550e8400-e29b-41d4-a716-446655440002` | Expired |     2 |
| `550e8400-e29b-41d4-a716-446655440003` | Closed  |     3 |

-----

Function:
table_session_get_by_guid(p_session_guid UUID)

Input:
UUID

Returns:
0 or 1 table-session rows

Existing test GUIDs:
...001 → Active
...002 → Expired
...003 → Closed

## table session

### table: 'table_sessions'
stores information about a customer's active or previous table sessions.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `table_session_id` | BIGINT | No | Unique identifier of the table session |
| `session_guid` | UUID | No | Unique GUID used to identify the session from the customer URL |
| `session_start_time` | TIMESTAMPTZ | No | Time when the session started |
| `session_expiration_time` | TIMESTAMPTZ | No | Time when the session expires |
| `session_status` | VARCHAR(20) | No | Session status: `Active`, `Expired`, `Closed`, or `Cancelled` |
| `table_id` | BIGINT | No | Identifier of the restaurant table |
| `order_id` | BIGINT | Yes | Associated order, if one exists |
| `waiter_user_id` | BIGINT | Yes | Associated waiter, if one exists |

### constraints
- `table_session_id` is the primary key.
- `session_guid` must be unique and cannot be NULL.
- `session_status` can only contain `Active`, `Expired`, `Closed`, or `Cancelled`.
- `session_expiration_time` must be later than `session_start_time`.
- `order_id` and `waiter_user_id` are nullable because a session may not have an order or waiter associated with it yet.

## function `table_session_get_by_guid(UUID)`
retrieves a table session using its unique session GUID. This function is used by backend when an anonymous customer gets access to the session containing a session GUID.

### input
`p_session_guid`

### output
the function returns the table with the following fields:
`table_session_id`, `session_guid`, `session_start_time`, `session_expiration_time`, `session_status`, `table_id`, `order_id`, `waiter_user_id`.

- If the GUID exists, the function returns one row containing the corresponding session.
- If the GUID does not exist, the function returns zero rows.
- The function does not generate HTTP errors. The backend is responsible for converting an empty result into an appropriate HTTP response.