using System.Linq.Expressions;
using DeliveryOrders.Api.Domain;
using DeliveryOrders.Api.Infrastructure;
using DeliveryOrders.Api.Resources;
using FluentValidation;
using Microsoft.Extensions.Localization;

namespace DeliveryOrders.Api.Features.Orders;

public record CreateOrderRequest(
    string SenderCity,
    string SenderAddress,
    string ReceiverCity,
    string ReceiverAddress,
    decimal WeightKg,
    DateOnly PickupDate);

public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator(
        TimeProvider timeProvider,
        IStringLocalizer<ValidationMessages> localizer)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);

        RequiredText(x => x.SenderCity, "SenderCity", Order.MaxCityLength, localizer);
        RequiredText(x => x.SenderAddress, "SenderAddress", Order.MaxAddressLength, localizer);
        RequiredText(x => x.ReceiverCity, "ReceiverCity", Order.MaxCityLength, localizer);
        RequiredText(x => x.ReceiverAddress, "ReceiverAddress", Order.MaxAddressLength, localizer);

        RuleFor(x => x.WeightKg)
            .GreaterThan(0)
                .WithMessage(_ => localizer["WeightPositive"].Value)
            .LessThanOrEqualTo(Order.MaxWeightKg)
                .WithMessage(_ => localizer["WeightMax", Order.MaxWeightKg.ToString("0")].Value)
            .Must(w => decimal.Round(w, 2) == w)
                .WithMessage(_ => localizer["WeightDecimals"].Value);

        RuleFor(x => x.PickupDate)
            .GreaterThanOrEqualTo(today)
                .WithMessage(_ => localizer["PickupDatePast"].Value);
    }

    private void RequiredText(
        Expression<Func<CreateOrderRequest, string>> selector,
        string keyPrefix,
        int maxLength,
        IStringLocalizer<ValidationMessages> localizer)
    {
        RuleFor(selector)
            .Must(v => !string.IsNullOrWhiteSpace(v))
                .WithMessage(_ => localizer[$"{keyPrefix}Required"].Value)
            .MaximumLength(maxLength)
                .WithMessage(_ => localizer[$"{keyPrefix}TooLong", maxLength].Value);
    }
}

public static class CreateOrder
{
    public static async Task<IResult> HandleAsync(
        CreateOrderRequest request,
        AppDbContext db,
        IOrderNumberGenerator numbers,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var orderNumber = await numbers.NextAsync(
            DateOnly.FromDateTime(now.UtcDateTime), cancellationToken);

        var order = Order.Create(
            orderNumber: orderNumber,
            senderCity: request.SenderCity,
            senderAddress: request.SenderAddress,
            receiverCity: request.ReceiverCity,
            receiverAddress: request.ReceiverAddress,
            weightKg: request.WeightKg,
            pickupDate: request.PickupDate,
            createdAt: now);

        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);

        var response = OrderResponse.FromDomain(order);
        return TypedResults.Created($"/api/orders/{response.Id}", response);
    }
}
