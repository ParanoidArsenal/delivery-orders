var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
   .WithName("HealthCheck")
   .ExcludeFromDescription();

app.Run();
