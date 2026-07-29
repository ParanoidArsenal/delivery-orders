namespace DeliveryOrders.Api.Infrastructure;

/// <summary>Per-day sequence allocation state for order numbers.</summary>
public class OrderNumberCounter
{
    public DateOnly Day { get; set; }
    public int LastValue { get; set; }
}
