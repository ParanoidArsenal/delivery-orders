namespace DeliveryOrders.Api.Infrastructure;

public interface IOrderNumberGenerator
{
    Task<string> NextAsync(DateOnly day, CancellationToken cancellationToken);
}
