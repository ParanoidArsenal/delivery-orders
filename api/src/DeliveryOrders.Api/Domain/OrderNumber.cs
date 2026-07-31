namespace DeliveryOrders.Api.Domain;

public static class OrderNumber
{
    public const string Prefix = "ORD";

    public static string Format(DateOnly day, int sequence)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(sequence, 1);
        return $"{Prefix}-{day:yyyyMMdd}-{sequence:0000}";
    }
}
