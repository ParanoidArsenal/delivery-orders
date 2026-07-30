using System.Linq.Expressions;
using DeliveryOrders.Api.Domain;
using DeliveryOrders.Api.Infrastructure;
using DeliveryOrders.Api.Resources;
using FluentValidation;
using Microsoft.Extensions.Localization;

namespace DeliveryOrders.Api.Features.Orders;

/// <summary>Payload for creating a delivery order. Every field is required.</summary>
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

        // FluentValidation's NotEmpty() accepts whitespace-only strings, so the
        // required check is expressed as an explicit non-whitespace predicate.
        // Every message uses the lazy WithMessage overload: the eager one would
        // capture the string at construction time, before the request culture applies.
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
            orderNumber,
            request.SenderCity,
            request.SenderAddress,
            request.ReceiverCity,
            request.ReceiverAddress,
            request.WeightKg,
            request.PickupDate,
            now);

        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);

        var response = OrderResponse.FromDomain(order);
        return TypedResults.Created($"/api/orders/{response.Id}", response);
    }
}
