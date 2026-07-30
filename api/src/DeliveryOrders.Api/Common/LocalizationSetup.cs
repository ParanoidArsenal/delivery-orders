using System.Globalization;
using Microsoft.AspNetCore.Localization;

namespace DeliveryOrders.Api.Common;

public static class LocalizationSetup
{
    private static readonly string[] SupportedCultures = ["en", "ru"];

    public static IServiceCollection AddAppLocalization(this IServiceCollection services)
    {
        // No ResourcesPath: ValidationMessages already lives in the
        // DeliveryOrders.Api.Resources namespace, so IStringLocalizer<T>'s default
        // prefix (the type's full name) already matches the embedded resource name
        // DeliveryOrders.Api.Resources.ValidationMessages. Setting ResourcesPath as
        // well would make the factory look for ...Resources.Resources.ValidationMessages.
        services.AddLocalization();

        services.Configure<RequestLocalizationOptions>(options =>
        {
            var cultures = SupportedCultures.Select(c => new CultureInfo(c)).ToList();

            options.DefaultRequestCulture = new RequestCulture("en");
            options.SupportedCultures = cultures;
            options.SupportedUICultures = cultures;
            options.ApplyCurrentCultureToResponseHeaders = true;

            // Accept-Language is the only signal; no cookie or query-string providers.
            options.RequestCultureProviders =
                [new AcceptLanguageHeaderRequestCultureProvider()];
        });

        return services;
    }

    public static IApplicationBuilder UseAppLocalization(this IApplicationBuilder app) =>
        app.UseRequestLocalization();
}
