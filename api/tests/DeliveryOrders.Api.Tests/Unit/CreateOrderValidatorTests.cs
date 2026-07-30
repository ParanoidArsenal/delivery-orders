using System.Globalization;
using DeliveryOrders.Api.Features.Orders;
using DeliveryOrders.Api.Resources;
using FluentValidation;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Time.Testing;
using Shouldly;
using Xunit;

namespace DeliveryOrders.Api.Tests.Unit;

/// <summary>
/// Returns the resource key's English text without touching resource loading, so the
/// validator's rules can be unit-tested independently of culture and .resx lookup.
/// </summary>
internal sealed class StubLocalizer : IStringLocalizer<ValidationMessages>
{
    private static readonly Dictionary<string, string> Messages = new()
    {
        ["SenderCityRequired"] = "Sender city is required.",
        ["SenderCityTooLong"] = "Sender city must be at most {0} characters.",
        ["SenderAddressRequired"] = "Sender address is required.",
        ["SenderAddressTooLong"] = "Sender address must be at most {0} characters.",
        ["ReceiverCityRequired"] = "Receiver city is required.",
        ["ReceiverCityTooLong"] = "Receiver city must be at most {0} characters.",
        ["ReceiverAddressRequired"] = "Receiver address is required.",
        ["ReceiverAddressTooLong"] = "Receiver address must be at most {0} characters.",
        ["WeightPositive"] = "Weight must be greater than 0 kg.",
        ["WeightMax"] = "Weight must not exceed {0} kg.",
        ["WeightDecimals"] = "Weight must have at most 2 decimal places.",
        ["PickupDatePast"] = "Pickup date must not be in the past.",
    };

    public LocalizedString this[string name] =>
        new(name, Messages.TryGetValue(name, out var value) ? value : name, false);

    public LocalizedString this[string name, params object[] arguments] =>
        new(name, string.Format(CultureInfo.InvariantCulture, this[name].Value, arguments), false);

    public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) =>
        Messages.Select(kv => new LocalizedString(kv.Key, kv.Value, false));
}

public class CreateOrderValidatorTests
{
    private static readonly DateTimeOffset Now = new(2026, 7, 29, 12, 0, 0, TimeSpan.Zero);

    private static IValidator<CreateOrderRequest> Validator()
    {
        var time = new FakeTimeProvider(Now);
        return new CreateOrderValidator(time, new StubLocalizer());
    }

    private static CreateOrderRequest Valid(
        string senderCity = "Moscow",
        string senderAddress = "Tverskaya 1",
        string receiverCity = "Kazan",
        string receiverAddress = "Bauman 5",
        decimal weightKg = 12.5m,
        DateOnly? pickupDate = null) =>
        new(senderCity, senderAddress, receiverCity, receiverAddress, weightKg,
            pickupDate ?? new DateOnly(2026, 7, 29));

    [Fact]
    public void Accepts_a_valid_request()
    {
        Validator().Validate(Valid()).IsValid.ShouldBeTrue();
    }

    [Fact]
    public void Accepts_equal_sender_and_receiver_city()
    {
        Validator().Validate(Valid(senderCity: "Moscow", receiverCity: "Moscow"))
            .IsValid.ShouldBeTrue();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Rejects_blank_sender_city(string value)
    {
        var result = Validator().Validate(Valid(senderCity: value));
        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderRequest.SenderCity));
    }

    [Fact]
    public void Rejects_blank_receiver_address()
    {
        var result = Validator().Validate(Valid(receiverAddress: " "));
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderRequest.ReceiverAddress));
    }

    [Fact]
    public void Rejects_city_longer_than_100_characters()
    {
        var result = Validator().Validate(Valid(senderCity: new string('x', 101)));
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderRequest.SenderCity));
    }

    [Fact]
    public void Rejects_address_longer_than_250_characters()
    {
        var result = Validator().Validate(Valid(senderAddress: new string('x', 251)));
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderRequest.SenderAddress));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(20000.01)]
    public void Rejects_weight_outside_range(decimal weight)
    {
        var result = Validator().Validate(Valid(weightKg: weight));
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderRequest.WeightKg));
    }

    [Fact]
    public void Rejects_weight_with_more_than_two_decimal_places()
    {
        var result = Validator().Validate(Valid(weightKg: 1.234m));
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderRequest.WeightKg));
    }

    [Fact]
    public void Rejects_pickup_date_in_the_past()
    {
        var result = Validator().Validate(Valid(pickupDate: new DateOnly(2026, 7, 28)));
        result.Errors.ShouldContain(e => e.PropertyName == nameof(CreateOrderRequest.PickupDate));
    }

    [Fact]
    public void Accepts_pickup_date_today_and_later()
    {
        Validator().Validate(Valid(pickupDate: new DateOnly(2026, 7, 29))).IsValid.ShouldBeTrue();
        Validator().Validate(Valid(pickupDate: new DateOnly(2027, 1, 1))).IsValid.ShouldBeTrue();
    }
}
