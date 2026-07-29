using DeliveryOrders.Api.Domain;
using Shouldly;
using Xunit;

namespace DeliveryOrders.Api.Tests.Unit;

public class OrderNumberTests
{
    [Fact]
    public void Format_pads_sequence_to_four_digits()
    {
        OrderNumber.Format(new DateOnly(2026, 7, 29), 1).ShouldBe("ORD-20260729-0001");
    }

    [Fact]
    public void Format_uses_the_given_day()
    {
        OrderNumber.Format(new DateOnly(2027, 1, 5), 42).ShouldBe("ORD-20270105-0042");
    }

    [Fact]
    public void Format_widens_beyond_four_digits()
    {
        OrderNumber.Format(new DateOnly(2026, 7, 29), 12345).ShouldBe("ORD-20260729-12345");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Format_rejects_non_positive_sequence(int sequence)
    {
        Should.Throw<ArgumentOutOfRangeException>(
            () => OrderNumber.Format(new DateOnly(2026, 7, 29), sequence));
    }
}
