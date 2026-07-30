using DeliveryOrders.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace DeliveryOrders.Api.Features.Orders;

public static class GetOrders
{
    public static async Task<IResult> HandleAsync(
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var orders = await db.Orders
            .AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderResponse(
                o.Id, o.OrderNumber, o.SenderCity, o.SenderAddress,
                o.ReceiverCity, o.ReceiverAddress, o.WeightKg, o.PickupDate, o.CreatedAt))
            .ToListAsync(cancellationToken);

        return TypedResults.Ok(orders);
    }
}
