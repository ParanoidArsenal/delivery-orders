namespace DeliveryOrders.Api.Domain;

/// <summary>A delivery order. Persistence-ignorant: no EF Core or ASP.NET types here.</summary>
public class Order
{
    public const int MaxCityLength = 100;
    public const int MaxAddressLength = 250;
    public const int MaxOrderNumberLength = 32;
    public const decimal MaxWeightKg = 20_000m;

    private Order() { }   // EF Core

    public Guid Id { get; private set; }
    public string OrderNumber { get; private set; } = null!;
    public string SenderCity { get; private set; } = null!;
    public string SenderAddress { get; private set; } = null!;
    public string ReceiverCity { get; private set; } = null!;
    public string ReceiverAddress { get; private set; } = null!;
    public decimal WeightKg { get; private set; }
    public DateOnly PickupDate { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public static Order Create(
        string orderNumber,
        string senderCity,
        string senderAddress,
        string receiverCity,
        string receiverAddress,
        decimal weightKg,
        DateOnly pickupDate,
        DateTimeOffset createdAt)
    {
        if (weightKg <= 0 || weightKg > MaxWeightKg)
        {
            throw new ArgumentOutOfRangeException(nameof(weightKg), weightKg,
                $"Weight must be greater than 0 and at most {MaxWeightKg} kg.");
        }

        return new Order
        {
            Id = Guid.CreateVersion7(),
            OrderNumber = Required(orderNumber, nameof(orderNumber)),
            SenderCity = Required(senderCity, nameof(senderCity)),
            SenderAddress = Required(senderAddress, nameof(senderAddress)),
            ReceiverCity = Required(receiverCity, nameof(receiverCity)),
            ReceiverAddress = Required(receiverAddress, nameof(receiverAddress)),
            WeightKg = weightKg,
            PickupDate = pickupDate,
            CreatedAt = createdAt,
        };
    }

    private static string Required(string value, string name)
    {
        var trimmed = value?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            throw new ArgumentException("Value must not be blank.", name);
        }

        return trimmed;
    }
}
