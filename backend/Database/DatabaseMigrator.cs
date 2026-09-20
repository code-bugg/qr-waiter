using System.Reflection;
using DbUp;

namespace backend.Database;

public static class DatabaseMigrator
{
    public static void Run(string connectionString)
    {
        var upgrader = DeployChanges
            .To.PostgresqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(
                Assembly.GetExecutingAssembly(),
                script => script.EndsWith(
                    ".sql",
                    StringComparison.OrdinalIgnoreCase))
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
        {
            throw new InvalidOperationException(
                "Database migration failed.",
                result.Error);
        }
    }
}