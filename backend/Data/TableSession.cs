namespace backend.Data;

public sealed class TableSession
{
    public long TableSessionId { get; init; }
    public Guid SessionGuid { get; init; }
    public DateTime SessionStartTime { get; init; }
    public DateTime SessionExpirationTime { get; init; }
    public string SessionStatus { get; init; } = string.Empty;
    public long TableId { get; init; }
    public long? OrderId { get; init; }
    public long? WaiterUserId { get; init; }
}