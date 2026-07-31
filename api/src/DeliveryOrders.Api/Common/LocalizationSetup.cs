using System.Globalization;
using Microsoft.AspNetCore.Localization;

namespace DeliveryOrders.Api.Common;

public static class LocalizationSetup
{
    private static readonly string[] SupportedCultures = ["en", "ru"];

    public static IServiceCollection AddAppLocalization(this IServiceCollection services)
    {
        services.AddLocalization();

        services.Configure<RequestLocalizationOptions>(options =>
        {
            var cultures = SupportedCultures.Select(c => new CultureInfo(c)).ToList();

            options.DefaultRequestCulture = new RequestCulture("en");
            options.SupportedCultures = cultures;
            options.SupportedUICultures = cultures;
            options.ApplyCurrentCultureToResponseHeaders = true;

            options.RequestCultureProviders =
                [new AcceptLanguageHeaderRequestCultureProvider()];
        });

        return services;
    }

    public static IApplicationBuilder UseAppLocalization(this IApplicationBuilder app) =>
        app.UseRequestLocalization();
}
