using backend.Data;
using backend.Health;
using backend.Database;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();
builder.Services.AddScoped<ITableSessionRepository, TableSessionRepository>();
builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("database");

var app = builder.Build();

var connectionString = app.Configuration
    .GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured.");
}

DatabaseMigrator.Run(connectionString);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

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

app.MapHealthChecks("/health");

app.Run();
