using System.Reflection;
using DeliveryOrders.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace DeliveryOrders.Api.Common;

public static class DatabaseStartup
{
    /// <summary>
    /// Whether startup migration should run in the current process.
    /// </summary>
    /// <remarks>
    /// The OpenAPI document exporter (Microsoft.Extensions.ApiDescription.Server) generates
    /// the document during <c>dotnet build</c> by loading this application and executing
    /// Program.cs up to <c>app.Run()</c> — in a process with no database reachable. Migrating
    /// there exhausts the retry budget and then fails the build, so it is skipped. The
    /// configuration flag additionally lets a host opt out entirely.
    /// </remarks>
    public static bool ShouldMigrateOnStartup(IConfiguration configuration)
    {
        if (!configuration.GetValue("Database:MigrateOnStartup", true))
        {
            return false;
        }

        var entryAssembly = Assembly.GetEntryAssembly()?.GetName().Name;
        return entryAssembly is null
            || !entryAssembly.Contains("GetDocument", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Applies pending migrations, retrying because Compose may start the API
    /// before PostgreSQL finishes accepting connections.
    /// </summary>
    public static async Task MigrateWithRetryAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        const int maxAttempts = 10;
        var delay = TimeSpan.FromSeconds(2);

        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(typeof(DatabaseStartup));

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await db.Database.MigrateAsync(cancellationToken);
                logger.LogInformation("Database migrated on attempt {Attempt}.", attempt);
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                logger.LogWarning(ex,
                    "Migration attempt {Attempt}/{Max} failed; retrying in {Delay}s.",
                    attempt, maxAttempts, delay.TotalSeconds);
                await Task.Delay(delay, cancellationToken);
            }
        }
    }
}
