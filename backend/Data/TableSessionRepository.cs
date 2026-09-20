using Dapper;

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
                waiter_user_id AS "WaiterUserId"
            FROM table_session_get_by_guid(@SessionGuid);
            """;

        await using var connection = await connectionFactory.OpenConnectionAsync(cancellationToken);
        var command = new CommandDefinition(
            sql,
            new { SessionGuid = sessionGuid },
            cancellationToken: cancellationToken);

        return await connection.QuerySingleOrDefaultAsync<TableSession>(command);
    }
}