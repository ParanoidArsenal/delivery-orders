using DeliveryOrders.Api.Infrastructure;
using DeliveryOrders.Api.Resources;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace DeliveryOrders.Api.Features.Orders;

public static class GetOrderById
{
    public static async Task<IResult> HandleAsync(
        Guid id,
        AppDbContext db,
        IStringLocalizer<ValidationMessages> localizer,
        CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        return order is null
            ? TypedResults.Problem(
                title: localizer["OrderNotFoundTitle"].Value,
                detail: localizer["OrderNotFoundDetail", id].Value,
                statusCode: StatusCodes.Status404NotFound)
            : TypedResults.Ok(OrderResponse.FromDomain(order));
    }
}
