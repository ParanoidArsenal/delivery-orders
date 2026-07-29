using DeliveryOrders.Api.Domain;
using Shouldly;
using Xunit;

namespace DeliveryOrders.Api.Tests.Unit;

public class OrderTests
{
    private static Order Build(string senderCity = " Moscow ") => Order.Create(
        orderNumber: "ORD-20260729-0001",
        senderCity: senderCity,
        senderAddress: "  Tverskaya 1  ",
        receiverCity: "Kazan",
        receiverAddress: "Bauman 5",
        weightKg: 12.5m,
        pickupDate: new DateOnly(2026, 7, 30),
        createdAt: new DateTimeOffset(2026, 7, 29, 10, 0, 0, TimeSpan.Zero));

    [Fact]
    public void Create_trims_text_fields()
    {
        var order = Build();
        order.SenderCity.ShouldBe("Moscow");
        order.SenderAddress.ShouldBe("Tverskaya 1");
    }

    [Fact]
    public void Create_assigns_a_non_empty_id()
    {
        Build().Id.ShouldNotBe(Guid.Empty);
    }

    [Fact]
    public void Create_rejects_blank_required_text()
    {
        Should.Throw<ArgumentException>(() => Build(senderCity: "   "));
    }
}
