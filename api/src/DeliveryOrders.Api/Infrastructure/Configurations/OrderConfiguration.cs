using DeliveryOrders.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DeliveryOrders.Api.Infrastructure.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders", t => t.HasCheckConstraint(
            "ck_orders_weight_kg_range",
            $"weight_kg > 0 AND weight_kg <= {Order.MaxWeightKg}"));

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).ValueGeneratedNever();

        builder.Property(o => o.OrderNumber).HasMaxLength(Order.MaxOrderNumberLength).IsRequired();
        builder.HasIndex(o => o.OrderNumber).IsUnique();

        builder.Property(o => o.SenderCity).HasMaxLength(Order.MaxCityLength).IsRequired();
        builder.Property(o => o.SenderAddress).HasMaxLength(Order.MaxAddressLength).IsRequired();
        builder.Property(o => o.ReceiverCity).HasMaxLength(Order.MaxCityLength).IsRequired();
        builder.Property(o => o.ReceiverAddress).HasMaxLength(Order.MaxAddressLength).IsRequired();

        builder.Property(o => o.WeightKg).HasPrecision(9, 2);
        builder.Property(o => o.PickupDate).HasColumnType("date");
        builder.Property(o => o.CreatedAt).IsRequired();

        builder.HasIndex(o => o.CreatedAt).IsDescending();
    }
}
