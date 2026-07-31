using DeliveryOrders.Api.Domain;

namespace DeliveryOrders.Api.Features.Orders;

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
