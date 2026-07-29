using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeliveryOrders.Api.Infrastructure.Configurations;

public class OrderNumberCounterConfiguration : IEntityTypeConfiguration<OrderNumberCounter>
{
    public void Configure(EntityTypeBuilder<OrderNumberCounter> builder)
    {
        builder.ToTable("order_number_counters");
        builder.HasKey(c => c.Day);
        builder.Property(c => c.Day).HasColumnType("date").ValueGeneratedNever();
        builder.Property(c => c.LastValue).IsRequired();
    }
}
