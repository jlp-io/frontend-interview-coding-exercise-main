using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace Simu.Api;

public sealed class RateBracket
{
    public decimal MinimumIncome { get; set; }
    public decimal MaximumIncome { get; set; }
    public decimal AnnualRate { get; set; }
    public decimal MonthlyRatePercent { get; set; }
}
public sealed class RateOptions { public List<RateBracket> RateBrackets { get; set; } = []; }
public sealed class InputConstraint
{
    public decimal Minimum { get; set; }
    public decimal Maximum { get; set; }
    public int MaximumDecimalPlaces { get; set; }
}
public sealed class InputRules
{
    public InputConstraint Principal { get; set; } = new();
    public InputConstraint DurationMonths { get; set; } = new();
    public InputConstraint AnnualIncome { get; set; } = new();
}
public sealed record SimulationRequest(decimal? Principal, decimal? DurationMonths, decimal? AnnualIncome, string? StartMonth);
public sealed record ValidationIssue(string Code, string Message);
public sealed record PaymentRow(int Month, string DueMonth, decimal Payment, decimal Interest, decimal Principal, decimal Balance);
public sealed record SimulationResponse(decimal AnnualRate, decimal MonthlyRate, decimal MonthlyPayment, decimal TotalInterest, decimal TotalRepayment, IReadOnlyList<PaymentRow> Schedule);
public sealed record ApiError(string Code, string Message);
public sealed record ValidationError(string Code, string Message, IReadOnlyDictionary<string, IReadOnlyList<ApiError>> Errors);

public interface ILoanCalculator
{
    IReadOnlyDictionary<string, IReadOnlyList<ValidationIssue>> Validate(SimulationRequest request);
    SimulationResponse Calculate(SimulationRequest request);
}

public sealed class LoanCalculator(IOptionsMonitor<RateOptions> options, IOptionsMonitor<InputRules> inputRules, IMemoryCache cache) : ILoanCalculator
{
    private static readonly CultureInfo Invariant = CultureInfo.InvariantCulture;
    public IReadOnlyDictionary<string, IReadOnlyList<ValidationIssue>> Validate(SimulationRequest request)
    {
        var errors = new Dictionary<string, List<ValidationIssue>>();
        var rules = inputRules.CurrentValue;
        void Add(string field, string code, string message)
        {
            if (!errors.TryGetValue(field, out var list)) errors[field] = list = [];
            list.Add(new(code, message));
        }
        if (request.Principal is null) Add("principal", "PRINCIPAL_REQUIRED", "Enter the amount you want to borrow.");
        else
        {
            if (request.Principal < rules.Principal.Minimum || request.Principal > rules.Principal.Maximum) Add("principal", "PRINCIPAL_OUT_OF_RANGE", $"The amount must be between {rules.Principal.Minimum} and {rules.Principal.Maximum}.");
            if (Scale(request.Principal.Value) > rules.Principal.MaximumDecimalPlaces) Add("principal", "PRINCIPAL_PRECISION", $"Use no more than {rules.Principal.MaximumDecimalPlaces} decimal places.");
        }
        if (request.DurationMonths is null) Add("durationMonths", "DURATION_REQUIRED", "Enter the loan term in months.");
        else
        {
            if (request.DurationMonths < rules.DurationMonths.Minimum || request.DurationMonths > rules.DurationMonths.Maximum) Add("durationMonths", "DURATION_OUT_OF_RANGE", $"The term must be between {rules.DurationMonths.Minimum} and {rules.DurationMonths.Maximum} months.");
            if (Scale(request.DurationMonths.Value) > rules.DurationMonths.MaximumDecimalPlaces) Add("durationMonths", "DURATION_PRECISION", "The term must be a whole number of months.");
        }
        if (request.AnnualIncome is null) Add("annualIncome", "INCOME_REQUIRED", "Enter your annual income.");
        else
        {
            if (request.AnnualIncome < rules.AnnualIncome.Minimum || request.AnnualIncome > rules.AnnualIncome.Maximum) Add("annualIncome", "INCOME_OUT_OF_RANGE", $"Annual income must be between {rules.AnnualIncome.Minimum} and {rules.AnnualIncome.Maximum}.");
            if (Scale(request.AnnualIncome.Value) > rules.AnnualIncome.MaximumDecimalPlaces) Add("annualIncome", "INCOME_PRECISION", $"Use no more than {rules.AnnualIncome.MaximumDecimalPlaces} decimal places.");
        }
        if (!string.IsNullOrWhiteSpace(request.StartMonth) && (!DateOnly.TryParseExact(request.StartMonth + "-01", "yyyy-MM-dd", Invariant, DateTimeStyles.None, out _)))
            Add("startMonth", "START_MONTH_INVALID", "Choose a valid month in YYYY-MM format.");
        return errors.ToDictionary(x => x.Key, x => (IReadOnlyList<ValidationIssue>)x.Value);
    }

    public SimulationResponse Calculate(SimulationRequest request)
    {
        var income = request.AnnualIncome!.Value;
        var months = decimal.ToInt32(request.DurationMonths!.Value);
        var bracket = options.CurrentValue.RateBrackets.FirstOrDefault(x => income >= x.MinimumIncome && income <= x.MaximumIncome)
            ?? throw new InvalidOperationException("No rate bracket matches the configured income.");
        var month = string.IsNullOrWhiteSpace(request.StartMonth) ? DateOnly.FromDateTime(DateTime.Now) : DateOnly.ParseExact(request.StartMonth + "-01", "yyyy-MM-dd", Invariant);
        var config = JsonSerializer.Serialize(options.CurrentValue.RateBrackets);
        var version = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(config)))[..12];
        var key = string.Join(":", version, request.Principal, months, income, month.ToString("yyyy-MM", Invariant));
        return cache.GetOrCreate(key, entry =>
        {
            entry.SetSize(1).SetAbsoluteExpiration(TimeSpan.FromMinutes(15));
            return Compute(request.Principal!.Value, months, bracket, month);
        })!;
    }

    private static SimulationResponse Compute(decimal principal, int months, RateBracket bracket, DateOnly startMonth)
    {
        var rate = bracket.MonthlyRatePercent / 100m;
        var factor = Pow(1m + rate, months);
        var payment = rate == 0 ? principal / months : principal * rate * factor / (factor - 1m);
        var balance = principal;
        var totalInterest = 0m;
        var totalRepayment = 0m;
        var schedule = new List<PaymentRow>(months);
        for (var i = 1; i <= months; i++)
        {
            var interest = balance * rate;
            var paid = payment;
            if (paid - interest > balance) paid = balance + interest;
            var capital = paid - interest;
            totalInterest += interest;
            totalRepayment += paid;
            balance -= capital;
            schedule.Add(new(i, startMonth.AddMonths(i - 1).ToString("yyyy-MM", Invariant), Round(paid), Round(interest), Round(capital), Round(Math.Max(0m, balance))));
        }
        return new(bracket.AnnualRate, bracket.MonthlyRatePercent, Round(payment), Round(totalInterest), Round(totalRepayment), schedule);
    }
    private static decimal Pow(decimal value, int exponent)
    {
        var result = 1m;
        while (exponent > 0) { if ((exponent & 1) == 1) result *= value; value *= value; exponent >>= 1; }
        return result;
    }
    private static decimal Round(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);
    private static int Scale(decimal value) => (decimal.GetBits(value)[3] >> 16) & 0xFF;
}
