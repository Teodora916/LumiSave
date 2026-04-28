using System.Text.Json;
using AutoMapper;
using LumiSave.Application.DTOs.Calculator;
using LumiSave.Application.DTOs.Products;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public interface ILedCalculatorService
{
    Task<LedCalculatorResultDto> CalculateAsync(LedCalculatorInputDto input, Guid? userId = null, CancellationToken ct = default);
    Task<IEnumerable<CalculatorSessionSummaryDto>> GetUserSessionsAsync(Guid userId, CancellationToken ct = default);
    Task<LedCalculatorResultDto?> GetSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
}

public class LedCalculatorService : ILedCalculatorService
{
    private readonly ILedCalculatorSessionRepository _sessionRepo;
    private readonly IProductRepository _productRepo;
    private readonly IMapper _mapper;
    private readonly ISystemSettingService _settingService;

    // Lookup table: BulbType → [(old wattage, LED equivalent wattage)]
    private static readonly Dictionary<string, (int OldW, int LedW)[]> LedMappings = new()
    {
        ["Incandescent"] = [(25, 3), (40, 5), (60, 8), (75, 11), (100, 14), (150, 20)],
        ["CFL"]          = [(9, 6), (11, 7), (13, 8), (15, 9), (18, 11), (23, 14)],
        ["Halogen"]      = [(20, 3), (35, 5), (50, 7), (75, 10), (100, 14)],
        ["T8Fluorescent"]= [(18, 9), (36, 18), (58, 28)],
        ["MR16"]         = [(20, 3), (35, 5), (50, 7)],
        ["PAR"]          = [(50, 8), (75, 12), (100, 15)],
    };

    // Default LED price per bulb when not provided (RSD)
    private static readonly Dictionary<string, decimal> DefaultLedPrices = new()
    {
        ["Incandescent"] = 690m,
        ["CFL"]          = 790m,
        ["Halogen"]      = 590m,
        ["T8Fluorescent"]= 1290m,
        ["MR16"]         = 590m,
        ["PAR"]          = 890m,
    };

    public LedCalculatorService(
        ILedCalculatorSessionRepository sessionRepo,
        IProductRepository productRepo,
        IMapper mapper,
        ISystemSettingService settingService)
    {
        _sessionRepo = sessionRepo;
        _productRepo = productRepo;
        _mapper = mapper;
        _settingService = settingService;
    }

    public async Task<LedCalculatorResultDto> CalculateAsync(
        LedCalculatorInputDto input, Guid? userId = null, CancellationToken ct = default)
    {
        var groupResults = new List<LightingGroupResultDto>();
        var recommendedProductIds = new HashSet<Guid>();
        var recommendedProducts = new List<ProductListDto>();

        foreach (var group in input.LightingGroups)
        {
            var ledW = FindLedEquivalent(group.BulbType, group.WattageOld);
            var currentKwh = (group.WattageOld * group.BulbCount * (double)group.DailyUsageHours * 365) / 1000.0;
            var ledKwh = (ledW * group.BulbCount * (double)group.DailyUsageHours * 365) / 1000.0;
            var savingsKwh = currentKwh - ledKwh;
            var savingsRsd = (decimal)savingsKwh * input.ElectricityPriceRsd;
            var pricePerBulb = group.LedPricePerBulb ??
                (DefaultLedPrices.TryGetValue(group.BulbType, out var p) ? p : 790m);
            var investmentRsd = pricePerBulb * group.BulbCount;
            var paybackMonths = savingsRsd > 0
                ? (int)Math.Ceiling((double)investmentRsd / ((double)savingsRsd / 12))
                : 999;
            var savingPercent = group.WattageOld > 0
                ? ((group.WattageOld - ledW) * 100.0 / group.WattageOld)
                : 0;

            groupResults.Add(new LightingGroupResultDto
            {
                RoomName = group.RoomName,
                BulbType = group.BulbType,
                WattageOld = group.WattageOld,
                WattageLed = ledW,
                BulbCount = group.BulbCount,
                DailyUsageHours = group.DailyUsageHours,
                CurrentAnnualKwh = (decimal)currentKwh,
                LedAnnualKwh = (decimal)ledKwh,
                AnnualSavingsKwh = (decimal)savingsKwh,
                AnnualSavingsRsd = savingsRsd,
                InvestmentRsd = investmentRsd,
                PaybackMonths = paybackMonths,
                WattageSavingPercent = (decimal)savingPercent
            });

            var ledProducts = await _productRepo.GetLedReplacementsAsync(
                group.BulbType, group.WattageOld, ct);
            foreach (var ledProduct in ledProducts)
            {
                if (recommendedProductIds.Add(ledProduct.Id))
                    recommendedProducts.Add(_mapper.Map<ProductListDto>(ledProduct));
            }
        }

        var totalCurrentKwh = groupResults.Sum(g => g.CurrentAnnualKwh);
        var totalLedKwh = groupResults.Sum(g => g.LedAnnualKwh);
        var totalSavingsKwh = totalCurrentKwh - totalLedKwh;
        var totalSavingsRsd = groupResults.Sum(g => g.AnnualSavingsRsd);
        var totalInvestment = groupResults.Sum(g => g.InvestmentRsd);
        
        var co2Factor = await _settingService.GetDecimalAsync("Co2FactorKgPerKwh", 0.417m, ct);
        var co2 = totalSavingsKwh * co2Factor;
        
        var overallPayback = totalSavingsRsd > 0
            ? (int)Math.Ceiling((double)totalInvestment / ((double)totalSavingsRsd / 12))
            : 999;
        var savingsEfficiency = totalCurrentKwh > 0
            ? (totalSavingsKwh / totalCurrentKwh * 100)
            : 0;

        var projection = GenerateTenYearProjection(totalSavingsRsd, totalInvestment, totalCurrentKwh, input.ElectricityPriceRsd);

        Guid? sessionId = null;
        if (userId.HasValue)
        {
            var session = new LedCalculatorSession
            {
                UserId = userId,
                InputJson = JsonSerializer.Serialize(input),
                ResultJson = "{}",
                TotalAnnualSavingsRsd = totalSavingsRsd,
                TotalAnnualSavingsKwh = totalSavingsKwh,
                TotalInvestmentRsd = totalInvestment,
                PaybackMonths = overallPayback,
                Co2ReductionKg = co2
            };
            var saved = await _sessionRepo.AddAsync(session, ct);
            sessionId = saved.Id;
        }

        var result = new LedCalculatorResultDto
        {
            GroupResults = groupResults,
            TotalCurrentAnnualKwh = totalCurrentKwh,
            TotalLedAnnualKwh = totalLedKwh,
            TotalAnnualSavingsKwh = totalSavingsKwh,
            TotalAnnualSavingsRsd = totalSavingsRsd,
            TotalMonthlySavingsRsd = totalSavingsRsd / 12,
            TotalInvestmentRsd = totalInvestment,
            PaybackMonths = overallPayback,
            Co2ReductionKgPerYear = co2,
            SavingsEfficiencyPercent = savingsEfficiency,
            TenYearProjection = projection,
            RecommendedProducts = recommendedProducts.Take(6).ToList(),
            SessionId = sessionId
        };

        return result;
    }

    public async Task<IEnumerable<CalculatorSessionSummaryDto>> GetUserSessionsAsync(
        Guid userId, CancellationToken ct = default)
    {
        var sessions = await _sessionRepo.GetByUserIdAsync(userId, ct);
        return sessions.Select(s => new CalculatorSessionSummaryDto
        {
            Id = s.Id,
            CreatedAt = s.CreatedAt,
            TotalAnnualSavingsRsd = s.TotalAnnualSavingsRsd,
            TotalInvestmentRsd = s.TotalInvestmentRsd,
            PaybackMonths = s.PaybackMonths
        });
    }

    public async Task<LedCalculatorResultDto?> GetSessionAsync(
        Guid sessionId, Guid userId, CancellationToken ct = default)
    {
        var session = await _sessionRepo.GetWithRecommendationsAsync(sessionId, ct);
        if (session == null || session.UserId != userId) return null;

        try
        {
            var input = JsonSerializer.Deserialize<LedCalculatorInputDto>(session.InputJson);
            if (input == null) return null;
            return await CalculateAsync(input, null, ct);
        }
        catch
        {
            return null;
        }
    }

    private static int FindLedEquivalent(string bulbType, int wattageOld)
    {
        if (!LedMappings.TryGetValue(bulbType, out var mapping) || mapping.Length == 0)
            return (int)Math.Round(wattageOld * 0.15);

        // Find closest wattage
        var closest = mapping.OrderBy(m => Math.Abs(m.OldW - wattageOld)).First();
        return closest.LedW;
    }

    private static List<YearlyProjectionDto> GenerateTenYearProjection(
        decimal annualSavingsRsd, decimal investmentRsd,
        decimal currentAnnualKwh, decimal electricityPriceRsd)
    {
        var projection = new List<YearlyProjectionDto>();
        decimal cumulativeSavings = -investmentRsd;
        decimal cumulativeWithoutLed = 0;
        decimal annualCostWithoutLed = currentAnnualKwh * electricityPriceRsd;
        decimal annualCostWithLed = investmentRsd;

        for (int year = 1; year <= 10; year++)
        {
            cumulativeSavings += annualSavingsRsd;
            cumulativeWithoutLed += annualCostWithoutLed;
            annualCostWithLed += annualCostWithoutLed - annualSavingsRsd;

            projection.Add(new YearlyProjectionDto
            {
                Year = year,
                CumulativeSavingsRsd = cumulativeSavings,
                CumulativeCostWithoutLed = cumulativeWithoutLed,
                CumulativeCostWithLed = annualCostWithLed
            });
        }

        return projection;
    }
}
