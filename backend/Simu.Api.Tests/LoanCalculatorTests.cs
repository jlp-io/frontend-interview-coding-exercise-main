using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Simu.Api;
using System.Globalization;
using Xunit;

namespace Simu.Api.Tests;

public sealed class LoanCalculatorTests
{
    private static readonly RateOptions Rates = new()
    {
        RateBrackets = [
            new() { MinimumIncome = 0, MaximumIncome = 16400, AnnualRate = 1.7m, MonthlyRatePercent = .141656m },
            new() { MinimumIncome = 16400, MaximumIncome = 19700, AnnualRate = 1.9m, MonthlyRatePercent = .158320m },
            new() { MinimumIncome = 19700, MaximumIncome = 23000, AnnualRate = 2.1m, MonthlyRatePercent = .174983m },
            new() { MinimumIncome = 23000, MaximumIncome = 27800, AnnualRate = 2.3m, MonthlyRatePercent = .191646m },
            new() { MinimumIncome = 27800, MaximumIncome = 32700, AnnualRate = 2.5m, MonthlyRatePercent = .208309m },
            new() { MinimumIncome = 32700, MaximumIncome = 43200, AnnualRate = 2.7m, MonthlyRatePercent = .224972m },
            new() { MinimumIncome = 43200, MaximumIncome = 53900, AnnualRate = 2.9m, MonthlyRatePercent = .241635m }
        ]
    };
    private static readonly InputRules Rules = new()
    {
        Principal = new() { Minimum = 20000, Maximum = 310000, MaximumDecimalPlaces = 2 },
        DurationMonths = new() { Minimum = 180, Maximum = 360, MaximumDecimalPlaces = 0 },
        AnnualIncome = new() { Minimum = 0, Maximum = 53900, MaximumDecimalPlaces = 2 }
    };
    private static LoanCalculator Create() => new(new FakeOptionsMonitor<RateOptions>(Rates), new FakeOptionsMonitor<InputRules>(Rules), new MemoryCache(new MemoryCacheOptions { SizeLimit = 10000 }));

    [Fact]
    public void Reference_case_matches_first_payment_and_full_term()
    {
        var result = Create().Calculate(new(100000m, 360, 28000m, "2021-01"));
        Assert.Equal(2.50m, result.AnnualRate);
        Assert.Equal(.208309m, result.MonthlyRate);
        Assert.Equal(395.11m, result.MonthlyPayment);
        Assert.Equal(42238.06m, result.TotalInterest);
        Assert.Equal(142238.06m, result.TotalRepayment);
        Assert.Equal(360, result.Schedule.Count);
        Assert.Equal(new PaymentRow(1, "2021-01", 395.11m, 208.31m, 186.80m, 99813.20m), result.Schedule[0]);
        Assert.Equal(0m, result.Schedule[^1].Balance);
    }

    [Fact]
    public void Complete_reference_schedule_matches_every_csv_amount()
    {
        var result = Create().Calculate(new(100000m, 360, 28000m, "2021-01"));
        var lines = File.ReadLines(Path.Combine(AppContext.BaseDirectory, "reference_K100000_D360_R28000.csv")).Skip(1).ToArray();
        Assert.Equal(360, lines.Length);
        for (var i = 0; i < result.Schedule.Count; i++)
        {
            var expected = lines[i].Split(';');
            var actual = result.Schedule[i];
            Assert.Equal(decimal.Parse(expected[2], CultureInfo.InvariantCulture), actual.Payment);
            Assert.Equal(decimal.Parse(expected[3], CultureInfo.InvariantCulture), actual.Interest);
            Assert.Equal(decimal.Parse(expected[4], CultureInfo.InvariantCulture), actual.Principal);
            Assert.Equal(decimal.Parse(expected[5], CultureInfo.InvariantCulture), actual.Balance);
        }
    }

    [Theory]
    [InlineData(0, "PRINCIPAL_OUT_OF_RANGE")]
    [InlineData(310001, "PRINCIPAL_OUT_OF_RANGE")]
    [InlineData(100000.001, "PRINCIPAL_PRECISION")]
    public void Principal_errors_are_reported(decimal principal, string expectedCode)
    {
        var errors = Create().Validate(new(principal, 360, 28000m, "2021-01"));
        Assert.Contains(errors["principal"], issue => issue.Code == expectedCode);
    }

    [Fact]
    public void Validation_reports_all_invalid_fields_in_one_response()
    {
        var invalid = new SimulationRequest(10m, 179, 60000m, "bad-month");
        var errors = Create().Validate(invalid);
        Assert.Contains(errors["principal"], x => x.Code == "PRINCIPAL_OUT_OF_RANGE");
        Assert.Contains(errors["durationMonths"], x => x.Code == "DURATION_OUT_OF_RANGE");
        Assert.Contains(errors["annualIncome"], x => x.Code == "INCOME_OUT_OF_RANGE");
        Assert.Contains(errors["startMonth"], x => x.Code == "START_MONTH_INVALID");
    }

    [Fact]
    public void Validation_reports_missing_required_fields()
    {
        var errors = Create().Validate(new(null, null, null, null));
        Assert.Contains(errors["principal"], x => x.Code == "PRINCIPAL_REQUIRED");
        Assert.Contains(errors["durationMonths"], x => x.Code == "DURATION_REQUIRED");
        Assert.Contains(errors["annualIncome"], x => x.Code == "INCOME_REQUIRED");
    }

    [Fact]
    public void Validation_accepts_all_inclusive_bounds_and_null_start_month()
    {
        var result = Create().Validate(new(20000m, 180, 0m, null));
        Assert.Empty(result);
    }

    [Fact]
    public void Income_precision_is_validated()
    {
        var errors = Create().Validate(new(100000m, 360, 28000.001m, "2021-01"));
        Assert.Contains(errors["annualIncome"], issue => issue.Code == "INCOME_PRECISION");
    }

    [Fact]
    public void Duration_precision_is_validated()
    {
        var errors = Create().Validate(new(100000m, 360.5m, 28000m, "2021-01"));
        Assert.Contains(errors["durationMonths"], issue => issue.Code == "DURATION_PRECISION");
    }

    [Theory]
    [InlineData(0, 1.70)]
    [InlineData(16400, 1.70)]
    [InlineData(16400.01, 1.90)]
    [InlineData(27800, 2.30)]
    [InlineData(27800.01, 2.50)]
    [InlineData(32700.01, 2.70)]
    [InlineData(53900, 2.90)]
    public void Rate_uses_the_bracket_and_authoritative_monthly_rate(decimal income, decimal expectedAnnualRate)
    {
        var result = Create().Calculate(new(100000m, 360, income, "2021-01"));
        Assert.Equal(expectedAnnualRate, result.AnnualRate);
    }

    [Fact]
    public void Zero_rate_calculation_has_equal_principal_installments()
    {
        var zeroRate = new RateOptions { RateBrackets = [new() { MinimumIncome = 0, MaximumIncome = 53900, AnnualRate = 0, MonthlyRatePercent = 0 }] };
        var calculator = new LoanCalculator(new FakeOptionsMonitor<RateOptions>(zeroRate), new FakeOptionsMonitor<InputRules>(Rules), new MemoryCache(new MemoryCacheOptions { SizeLimit = 10000 }));
        var result = calculator.Calculate(new(20000m, 180, 10000m, "2021-01"));
        Assert.Equal(111.11m, result.MonthlyPayment);
        Assert.Equal(111.11m, result.Schedule[0].Principal);
        Assert.Equal(0m, result.Schedule[0].Interest);
        Assert.Equal(0m, result.Schedule[^1].Balance);
    }

    [Fact]
    public void Repeated_simulation_uses_the_same_complete_schedule()
    {
        var calculator = Create();
        var request = new SimulationRequest(100000m, 360, 28000m, "2021-01");
        Assert.Equal(calculator.Calculate(request), calculator.Calculate(request));
    }

    private sealed class FakeOptionsMonitor<T>(T value) : IOptionsMonitor<T> where T : class
    {
        public T CurrentValue => value;
        public T Get(string? name) => value;
        public IDisposable? OnChange(Action<T, string?> listener) => null;
    }
}
