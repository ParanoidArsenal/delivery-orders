using System.Reflection;
using DeliveryOrders.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace DeliveryOrders.Api.Common;

public static class DatabaseStartup
{
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
