using Microsoft.Extensions.Options;
using Simu.Api;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<RateOptions>(builder.Configuration);
builder.Services.Configure<InputRules>(builder.Configuration.GetSection("InputRules"));
builder.Services.AddMemoryCache(options => options.SizeLimit = 10_000);
builder.Services.AddSingleton<ILoanCalculator, LoanCalculator>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000").AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();
app.UseCors();
app.MapGet("/api/v1/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/v1/rules", (IOptionsMonitor<InputRules> rules) => Results.Ok(rules.CurrentValue));
app.MapPost("/api/v1/simulations", (SimulationRequest request, ILoanCalculator calculator) =>
{
    var errors = calculator.Validate(request);
    if (errors.Count > 0)
    {
        var body = new ValidationError("VALIDATION_FAILED", "Correct the highlighted fields and try again.", errors.ToDictionary(x => x.Key, x => (IReadOnlyList<ApiError>)x.Value.Select(e => new ApiError(e.Code, e.Message)).ToArray()));
        return Results.BadRequest(body);
    }
    return Results.Ok(calculator.Calculate(request));
}).WithName("CreateSimulation");
app.Run();

public partial class Program { }
