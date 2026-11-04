namespace backend.Data;

public interface ITableSessionRepository
{
    Task<TableSession?> GetByGuidAsync(Guid sessionGuid, CancellationToken cancellationToken);
    Task<TableSession> CreateAsync(
        long tableId,
        string waiterAuth0Subject,
        CancellationToken cancellationToken);
}