using Dapper;
using System.Data;

namespace backend.Data;

public sealed class TableSessionRepository(IDbConnectionFactory connectionFactory) : ITableSessionRepository
{
    public async Task<TableSession?> GetByGuidAsync(
        Guid sessionGuid,
        CancellationToken cancellationToken)
    {
        const string sql = """
            SELECT
                table_session_id AS "TableSessionId",
                session_guid AS "SessionGuid",
                session_start_time AS "SessionStartTime",
                session_expiration_time AS "SessionExpirationTime",
                session_status AS "SessionStatus",
                table_id AS "TableId",
                order_id AS "OrderId",
                waiter_user_id AS "WaiterUserId",
                waiter_auth0_subject AS "WaiterAuth0Subject"
            FROM table_session_get_by_guid(@SessionGuid);
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var command = new CommandDefinition(
            sql,
            new { SessionGuid = sessionGuid },
            cancellationToken: cancellationToken);

        return await connection.QuerySingleOrDefaultAsync<TableSession>(command);
    }

    public async Task<TableSession> CreateAsync(
        long tableId,
        string waiterAuth0Subject,
        CancellationToken cancellationToken)
    {
        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await connection.ExecuteAsync(new CommandDefinition(
            "SELECT pg_advisory_xact_lock(hashtext('table_session:' || @TableId));",
            new { TableId = tableId },
            transaction: transaction,
            cancellationToken: cancellationToken));

        const string expireSql = """
            UPDATE table_sessions
            SET session_status = 'Expired'
            WHERE table_id = @TableId
              AND session_status = 'Active'
              AND session_expiration_time <= CURRENT_TIMESTAMP;
            """;
        await connection.ExecuteAsync(new CommandDefinition(
            expireSql,
            new { TableId = tableId },
            transaction: transaction,
            cancellationToken: cancellationToken));

        const string activeSql = """
            SELECT
                table_session_id AS "TableSessionId",
                session_guid AS "SessionGuid",
                session_start_time AS "SessionStartTime",
                session_expiration_time AS "SessionExpirationTime",
                session_status AS "SessionStatus",
                table_id AS "TableId",
                order_id AS "OrderId",
                waiter_user_id AS "WaiterUserId",
                waiter_auth0_subject AS "WaiterAuth0Subject"
            FROM table_sessions
            WHERE table_id = @TableId AND session_status = 'Active'
            ORDER BY table_session_id DESC
            LIMIT 1;
            """;
        var activeSession = await connection.QuerySingleOrDefaultAsync<TableSession>(
            new CommandDefinition(activeSql, new { TableId = tableId }, transaction: transaction,
                cancellationToken: cancellationToken));

        if (activeSession is not null)
        {
            if (!string.Equals(activeSession.WaiterAuth0Subject, waiterAuth0Subject, StringComparison.Ordinal))
            {
                throw new ActiveTableSessionOwnedByAnotherWaiterException(tableId);
            }

            await transaction.CommitAsync(cancellationToken);
            return activeSession;
        }

        var now = DateTimeOffset.UtcNow;
        const string insertSql = """
            INSERT INTO table_sessions (
                session_guid,
                session_start_time,
                session_expiration_time,
                session_status,
                table_id,
                waiter_auth0_subject
            )
            VALUES (
                gen_random_uuid(),
                @StartTime,
                @ExpirationTime,
                'Active',
                @TableId,
                @WaiterAuth0Subject
            )
            RETURNING
                table_session_id AS "TableSessionId",
                session_guid AS "SessionGuid",
                session_start_time AS "SessionStartTime",
                session_expiration_time AS "SessionExpirationTime",
                session_status AS "SessionStatus",
                table_id AS "TableId",
                order_id AS "OrderId",
                waiter_user_id AS "WaiterUserId",
                waiter_auth0_subject AS "WaiterAuth0Subject";
            """;
        var session = await connection.QuerySingleAsync<TableSession>(
            new CommandDefinition(insertSql, new
            {
                StartTime = now,
                ExpirationTime = now.AddHours(4),
                TableId = tableId,
                WaiterAuth0Subject = waiterAuth0Subject
            }, transaction: transaction, cancellationToken: cancellationToken));

        await transaction.CommitAsync(cancellationToken);
        return session;
    }
}

public sealed class ActiveTableSessionOwnedByAnotherWaiterException(long tableId)
    : InvalidOperationException($"Table {tableId} already has an active session owned by another waiter.");