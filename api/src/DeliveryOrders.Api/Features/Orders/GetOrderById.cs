using DeliveryOrders.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace DeliveryOrders.Api.Features.Orders;

public static class GetOrderById
{
    public static async Task<IResult> HandleAsync(
        Guid id,
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        return order is null
            ? TypedResults.Problem(
                title: "Order not found.",
                detail: $"No order exists with id '{id}'.",
                statusCode: StatusCodes.Status404NotFound)
            : TypedResults.Ok(OrderResponse.FromDomain(order));
    }
}
