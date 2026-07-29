using DeliveryOrders.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;

namespace DeliveryOrders.Api.Infrastructure;

/// <summary>
/// Allocates a per-day sequence with a single atomic upsert, so concurrent
/// creates cannot collide and no read-then-write race exists.
/// </summary>
public class OrderNumberGenerator(AppDbContext db) : IOrderNumberGenerator
{
    private const string AllocateSql = """
        INSERT INTO order_number_counters (day, last_value)
        VALUES (@day, 1)
        ON CONFLICT (day) DO UPDATE SET last_value = order_number_counters.last_value + 1
        RETURNING last_value;
        """;

    public async Task<string> NextAsync(DateOnly day, CancellationToken cancellationToken)
    {
        var connection = (NpgsqlConnection)db.Database.GetDbConnection();
        var opened = connection.State != System.Data.ConnectionState.Open;
        if (opened)
        {
            await connection.OpenAsync(cancellationToken);
        }

        try
        {
            await using var command = connection.CreateCommand();
            command.CommandText = AllocateSql;
            command.Parameters.AddWithValue("day", day);

            if (db.Database.CurrentTransaction is { } transaction)
            {
                command.Transaction = (NpgsqlTransaction)transaction.GetDbTransaction();
            }

            var sequence = (int)(await command.ExecuteScalarAsync(cancellationToken))!;
            return OrderNumber.Format(day, sequence);
        }
        finally
        {
            if (opened)
            {
                await connection.CloseAsync();
            }
        }
    }
}
