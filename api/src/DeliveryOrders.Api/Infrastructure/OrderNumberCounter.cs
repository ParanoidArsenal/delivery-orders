namespace DeliveryOrders.Api.Infrastructure;

public class OrderNumberCounter
{
    public DateOnly Day { get; set; }
    public int LastValue { get; set; }
}
