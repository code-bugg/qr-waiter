using System.Security.Claims;
using backend.Data;

namespace Controllers;

public static class TableSessionEndpoints
{
    public const string CommonRoute = "/api/table-sessions";

    public static void MapTableSessionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapTableSessionRetrieveEndpoints();
        app.MapTableCreateEndpoints();
    }

    public static void MapTableSessionRetrieveEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/table-sessions/{guid}", async (
            string guid,
            ITableSessionRepository repository,
            ILogger<Program> logger,
            CancellationToken cancellationToken) =>
        {
            if (!Guid.TryParse(guid, out var sessionGuid))
            {
                return Results.BadRequest(new { error = "The session GUID is invalid." });
            }

            try
            {
                var session = await repository.GetByGuidAsync(sessionGuid, cancellationToken);
                return session is null
                    ? Results.NotFound(new { error = "Table session was not found." })
                    : Results.Ok(session);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Unable to retrieve table session {SessionGuid}", sessionGuid);
                return Results.Problem("The table session could not be retrieved.", statusCode: StatusCodes.Status500InternalServerError);
            }
        })
        .WithName("GetTableSessionByGuid");
    }

    public static void MapTableCreateEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost(CommonRoute, async (
            CreateTableSessionRequest request,
            ClaimsPrincipal user,
            ITableSessionRepository repository,
            ILogger<Program> logger,
            CancellationToken cancellationToken) =>
        {
            var subject = user.FindFirstValue("sub");
            if (string.IsNullOrWhiteSpace(subject))
            {
                return Results.Unauthorized();
            }
            if (request.TableId <= 0)
            {
                return Results.BadRequest(new { error = "TableId must be a positive integer." });
            }

            try
            {
                var session = await repository.CreateAsync(request.TableId, subject, cancellationToken);
                return Results.Ok(session);
            }
            catch (ActiveTableSessionOwnedByAnotherWaiterException exception)
            {
                return Results.Conflict(new { error = exception.Message });
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Unable to create session for table {TableId}", request.TableId);
                return Results.Problem(
                    "The table session could not be created.",
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        })
        .RequireAuthorization("Waiter")
        .WithName("CreateTableSession");
    }
}

public sealed record CreateTableSessionRequest(long TableId);