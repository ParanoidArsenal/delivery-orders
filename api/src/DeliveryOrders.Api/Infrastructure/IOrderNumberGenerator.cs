namespace DeliveryOrders.Api.Infrastructure;

public interface IOrderNumberGenerator
{
    /// <summary>Allocates the next order number for the given day. Safe under concurrency.</summary>
    Task<string> NextAsync(DateOnly day, CancellationToken cancellationToken);
}
