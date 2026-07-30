using System.Linq.Expressions;
using DeliveryOrders.Api.Domain;
using DeliveryOrders.Api.Infrastructure;
using FluentValidation;

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
    public CreateOrderValidator(TimeProvider timeProvider)
    {
        var today = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);

        // FluentValidation's NotEmpty() accepts whitespace-only strings, so the
        // required check is expressed as an explicit non-whitespace predicate.
        RequiredText(x => x.SenderCity, "Sender city", Order.MaxCityLength);
        RequiredText(x => x.SenderAddress, "Sender address", Order.MaxAddressLength);
        RequiredText(x => x.ReceiverCity, "Receiver city", Order.MaxCityLength);
        RequiredText(x => x.ReceiverAddress, "Receiver address", Order.MaxAddressLength);

        RuleFor(x => x.WeightKg)
            .GreaterThan(0).WithMessage("Weight must be greater than 0 kg.")
            .LessThanOrEqualTo(Order.MaxWeightKg)
                .WithMessage($"Weight must not exceed {Order.MaxWeightKg:0} kg.")
            .Must(w => decimal.Round(w, 2) == w)
                .WithMessage("Weight must have at most 2 decimal places.");

        RuleFor(x => x.PickupDate)
            .GreaterThanOrEqualTo(today)
            .WithMessage("Pickup date must not be in the past.");
    }

    private void RequiredText(
        Expression<Func<CreateOrderRequest, string>> selector,
        string label,
        int maxLength)
    {
        RuleFor(selector)
            .Must(v => !string.IsNullOrWhiteSpace(v)).WithMessage($"{label} is required.")
            .MaximumLength(maxLength)
                .WithMessage($"{label} must be at most {maxLength} characters.");
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
