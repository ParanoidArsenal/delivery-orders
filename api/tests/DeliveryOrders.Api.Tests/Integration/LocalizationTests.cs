using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Shouldly;
using Xunit;

namespace DeliveryOrders.Api.Tests.Integration;

[Collection("postgres")]
public class LocalizationTests(PostgresFixture fixture) : IAsyncLifetime
{
    public Task InitializeAsync() => fixture.ResetAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    private static readonly object InvalidPayload = new
    {
        senderCity = "",
        senderAddress = "",
        receiverCity = "",
        receiverAddress = "",
        weightKg = 0,
        pickupDate = "2000-01-01",
    };

    private async Task<JsonElement> PostInvalidAsync(string? acceptLanguage)
    {
        var client = fixture.CreateClient();
        if (acceptLanguage is not null)
        {
            client.DefaultRequestHeaders.AcceptLanguage.Add(
                new StringWithQualityHeaderValue(acceptLanguage));
        }

        var response = await client.PostAsJsonAsync("/api/orders", InvalidPayload);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        return problem.GetProperty("errors");
    }

    private static string First(JsonElement errors, string field) =>
        errors.GetProperty(field)[0].GetString()!;

    [Theory]
    [InlineData("ru")]
    [InlineData("ru-RU")]
    public async Task Returns_russian_messages_for_ru(string acceptLanguage)
    {
        var errors = await PostInvalidAsync(acceptLanguage);

        First(errors, "senderCity").ShouldContain("обязательно");
        First(errors, "receiverAddress").ShouldContain("обязательно");
        First(errors, "weightKg").ShouldContain("Вес");
        First(errors, "pickupDate").ShouldContain("прошлом");
    }

    [Fact]
    public async Task Returns_russian_messages_for_a_browser_style_header()
    {
        var client = fixture.CreateClient();
        foreach (var (tag, quality) in new[] { ("ru-RU", 1.0), ("ru", 0.9), ("en", 0.8) })
        {
            client.DefaultRequestHeaders.AcceptLanguage.Add(
                new StringWithQualityHeaderValue(tag, quality));
        }

        var response = await client.PostAsJsonAsync("/api/orders", InvalidPayload);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        problem.GetProperty("errors").GetProperty("senderCity")[0].GetString()!
            .ShouldContain("обязательно");
    }

    [Fact]
    public async Task Localizes_the_validation_problem_title()
    {
        var client = fixture.CreateClient();
        client.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue("ru"));

        var response = await client.PostAsJsonAsync("/api/orders", InvalidPayload);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        problem.GetProperty("title").GetString().ShouldBe("Обнаружены ошибки заполнения.");
    }

    [Fact]
    public async Task Returns_english_messages_for_en()
    {
        var errors = await PostInvalidAsync("en");

        First(errors, "senderCity").ShouldBe("Sender city is required.");
        First(errors, "pickupDate").ShouldBe("Pickup date must not be in the past.");
    }

    [Fact]
    public async Task Falls_back_to_english_for_an_unsupported_language()
    {
        var errors = await PostInvalidAsync("fr");
        First(errors, "senderCity").ShouldBe("Sender city is required.");
    }

    [Fact]
    public async Task Falls_back_to_english_when_no_header_is_sent()
    {
        var errors = await PostInvalidAsync(null);
        First(errors, "senderCity").ShouldBe("Sender city is required.");
    }

    [Fact]
    public async Task Localizes_the_not_found_problem()
    {
        var client = fixture.CreateClient();
        client.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue("ru"));

        var response = await client.GetAsync($"/api/orders/{Guid.NewGuid()}");
        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);

        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        problem.GetProperty("title").GetString()!.ShouldContain("не найден");
    }

    [Fact]
    public async Task Honours_quality_values_when_choosing_a_language()
    {
        var client = fixture.CreateClient();
        client.DefaultRequestHeaders.AcceptLanguage.Add(
            new StringWithQualityHeaderValue("fr", 1.0));
        client.DefaultRequestHeaders.AcceptLanguage.Add(
            new StringWithQualityHeaderValue("ru", 0.8));

        var response = await client.PostAsJsonAsync("/api/orders", InvalidPayload);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        var message = problem.GetProperty("errors").GetProperty("senderCity")[0].GetString()!;

        message.ShouldContain("обязательно");
    }
}
