using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using DeliveryOrders.Api.Features.Orders;
using Shouldly;
using Xunit;

namespace DeliveryOrders.Api.Tests.Integration;

[Collection("postgres")]
public class OrdersEndpointsTests(PostgresFixture fixture) : IAsyncLifetime
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public Task InitializeAsync() => fixture.ResetAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    private static object ValidPayload(decimal weight = 12.5m) => new
    {
        senderCity = "Moscow",
        senderAddress = "Tverskaya 1",
        receiverCity = "Kazan",
        receiverAddress = "Bauman 5",
        weightKg = weight,
        pickupDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1).ToString("yyyy-MM-dd"),
    };

    [Fact]
    public async Task Create_then_list_then_get_round_trip()
    {
        var client = fixture.CreateClient();

        var create = await client.PostAsJsonAsync("/api/orders", ValidPayload());
        create.StatusCode.ShouldBe(HttpStatusCode.Created);

        var created = await create.Content.ReadFromJsonAsync<OrderResponse>(Json);
        created.ShouldNotBeNull();
        created!.OrderNumber.ShouldStartWith("ORD-");
        created.OrderNumber.ShouldEndWith("-0001");
        create.Headers.Location!.ToString().ShouldContain(created.Id.ToString());

        var list = await client.GetFromJsonAsync<List<OrderResponse>>("/api/orders", Json);
        list.ShouldNotBeNull();
        list!.Count.ShouldBe(1);
        list[0].Id.ShouldBe(created.Id);

        var single = await client.GetFromJsonAsync<OrderResponse>(
            $"/api/orders/{created.Id}", Json);
        single!.SenderCity.ShouldBe("Moscow");
        single.WeightKg.ShouldBe(12.5m);
    }

    [Fact]
    public async Task List_returns_newest_first()
    {
        var client = fixture.CreateClient();
        await client.PostAsJsonAsync("/api/orders", ValidPayload(weight: 1m));
        await client.PostAsJsonAsync("/api/orders", ValidPayload(weight: 2m));

        var list = await client.GetFromJsonAsync<List<OrderResponse>>("/api/orders", Json);
        list!.Count.ShouldBe(2);
        list[0].WeightKg.ShouldBe(2m);
    }

    [Fact]
    public async Task Rejects_empty_payload_with_field_errors()
    {
        var client = fixture.CreateClient();

        var response = await client.PostAsJsonAsync("/api/orders", new
        {
            senderCity = "",
            senderAddress = "",
            receiverCity = "",
            receiverAddress = "",
            weightKg = 0,
            pickupDate = "2000-01-01",
        });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        var errors = problem.GetProperty("errors");

        foreach (var field in new[]
                 {
                     "senderCity", "senderAddress", "receiverCity",
                     "receiverAddress", "weightKg", "pickupDate",
                 })
        {
            errors.TryGetProperty(field, out _).ShouldBeTrue($"expected an error for {field}");
        }
    }

    [Fact]
    public async Task Rejects_whitespace_only_city()
    {
        var client = fixture.CreateClient();
        var response = await client.PostAsJsonAsync("/api/orders", new
        {
            senderCity = "   ",
            senderAddress = "Tverskaya 1",
            receiverCity = "Kazan",
            receiverAddress = "Bauman 5",
            weightKg = 5m,
            pickupDate = DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd"),
        });

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Returns_404_problem_for_unknown_id()
    {
        var client = fixture.CreateClient();
        var response = await client.GetAsync($"/api/orders/{Guid.NewGuid()}");

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        response.Content.Headers.ContentType!.MediaType.ShouldBe("application/problem+json");
    }

    [Fact]
    public async Task Concurrent_creates_produce_distinct_sequential_numbers()
    {
        var client = fixture.CreateClient();

        var responses = await Task.WhenAll(Enumerable.Range(0, 20)
            .Select(_ => client.PostAsJsonAsync("/api/orders", ValidPayload())));

        responses.ShouldAllBe(r => r.StatusCode == HttpStatusCode.Created);

        var numbers = new List<string>();
        foreach (var response in responses)
        {
            var order = await response.Content.ReadFromJsonAsync<OrderResponse>(Json);
            numbers.Add(order!.OrderNumber);
        }

        numbers.Distinct().Count().ShouldBe(20);
        var sequences = numbers.Select(n => int.Parse(n.Split('-')[2])).OrderBy(n => n).ToList();
        sequences.ShouldBe(Enumerable.Range(1, 20).ToList());
    }
}
