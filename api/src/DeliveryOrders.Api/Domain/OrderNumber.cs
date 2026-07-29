namespace DeliveryOrders.Api.Domain;

/// <summary>Human-readable order number: ORD-{yyyyMMdd}-{sequence}.</summary>
public static class OrderNumber
{
    public const string Prefix = "ORD";

    public static string Format(DateOnly day, int sequence)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(sequence, 1);
        return $"{Prefix}-{day:yyyyMMdd}-{sequence:0000}";
    }
}
