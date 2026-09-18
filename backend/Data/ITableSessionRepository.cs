namespace backend.Data;

public interface ITableSessionRepository
{
    Task<TableSession?> GetByGuidAsync(Guid sessionGuid, CancellationToken cancellationToken);
}