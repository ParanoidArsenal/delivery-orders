using DeliveryOrders.Api.Domain;

namespace DeliveryOrders.Api.Features.Orders;

/// <summary>An order as returned by the API. Entities never cross the HTTP boundary.</summary>
public record OrderResponse(
    Guid Id,
    string OrderNumber,
    string SenderCity,
    string SenderAddress,
    string ReceiverCity,
    string ReceiverAddress,
    decimal WeightKg,
    DateOnly PickupDate,
    DateTimeOffset CreatedAt)
{
    public static OrderResponse FromDomain(Order order) => new(
        order.Id,
        order.OrderNumber,
        order.SenderCity,
        order.SenderAddress,
        order.ReceiverCity,
        order.ReceiverAddress,
        order.WeightKg,
        order.PickupDate,
        order.CreatedAt);
}
