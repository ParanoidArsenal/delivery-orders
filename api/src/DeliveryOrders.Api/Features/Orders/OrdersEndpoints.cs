using DeliveryOrders.Api.Common;

namespace DeliveryOrders.Api.Features.Orders;

public static class OrdersEndpoints
{
    public static IEndpointRouteBuilder MapOrdersEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/orders").WithTags("Orders");

        group.MapPost("/", CreateOrder.HandleAsync)
            .WithName("CreateOrder")
            .WithSummary("Creates a delivery order and assigns it an order number.")
            .WithValidation<CreateOrderRequest>()
            .Produces<OrderResponse>(StatusCodes.Status201Created);

        group.MapGet("/", GetOrders.HandleAsync)
            .WithName("GetOrders")
            .WithSummary("Returns all orders, newest first.")
            .Produces<List<OrderResponse>>();

        group.MapGet("/{id:guid}", GetOrderById.HandleAsync)
            .WithName("GetOrderById")
            .WithSummary("Returns a single order.")
            .Produces<OrderResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        return routes;
    }
}
