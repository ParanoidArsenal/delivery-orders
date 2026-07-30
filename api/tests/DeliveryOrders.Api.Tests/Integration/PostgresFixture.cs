using DeliveryOrders.Api.Infrastructure;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Testcontainers.PostgreSql;
using Xunit;

namespace DeliveryOrders.Api.Tests.Integration;

/// <summary>
/// Boots the real API against a throwaway PostgreSQL container, so EF mappings,
/// migrations and the concurrent order-number allocation are exercised for real.
/// </summary>
public class PostgresFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder("postgres:17-alpine").Build();

    private WebApplicationFactory<Program>? _factory;

    public async Task InitializeAsync()
    {
        await _db.StartAsync();

        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.UseSetting("ConnectionStrings:Default", _db.GetConnectionString());
            });

        // Force host construction so startup migrations run before the first test.
        _ = _factory.CreateClient();
    }

    public HttpClient CreateClient() => _factory!.CreateClient();

    public async Task ResetAsync()
    {
        using var scope = _factory!.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.ExecuteSqlRawAsync(
            "TRUNCATE TABLE orders, order_number_counters;");
    }

    public async Task DisposeAsync()
    {
        if (_factory is not null)
        {
            await _factory.DisposeAsync();
        }

        await _db.DisposeAsync();
    }
}

[CollectionDefinition("postgres")]
public class PostgresCollection : ICollectionFixture<PostgresFixture>;
