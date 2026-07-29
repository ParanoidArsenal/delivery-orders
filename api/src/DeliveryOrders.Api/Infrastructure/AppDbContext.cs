using DeliveryOrders.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace DeliveryOrders.Api.Infrastructure;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderNumberCounter> OrderNumberCounters => Set<OrderNumberCounter>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
