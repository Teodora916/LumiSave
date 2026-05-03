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
            decimal dailyHigh = input.TariffType == "Dual" ? group.DailyUsageHoursHighTariff : group.DailyUsageHours;
            decimal dailyLow = input.TariffType == "Dual" ? group.DailyUsageHoursLowTariff : 0;

            var currentKwhHigh = (decimal)(group.WattageOld * group.BulbCount * (double)dailyHigh * 365) / 1000m;
            var currentKwhLow = (decimal)(group.WattageOld * group.BulbCount * (double)dailyLow * 365) / 1000m;
            var currentKwh = currentKwhHigh + currentKwhLow;

            var ledKwhHigh = (decimal)(ledW * group.BulbCount * (double)dailyHigh * 365) / 1000m;
            var ledKwhLow = (decimal)(ledW * group.BulbCount * (double)dailyLow * 365) / 1000m;
            var ledKwh = ledKwhHigh + ledKwhLow;

            var savingsKwh = currentKwh - ledKwh;
            
            var pricePerBulb = group.LedPricePerBulb ??
                (DefaultLedPrices.TryGetValue(group.BulbType, out var p) ? p : 790m);
            var investmentRsd = pricePerBulb * group.BulbCount;
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
                CurrentAnnualKwh = currentKwh,
                LedAnnualKwh = ledKwh,
                AnnualSavingsKwh = savingsKwh,
                AnnualSavingsRsd = 0, // will calculate later based on ratio
                InvestmentRsd = investmentRsd,
                PaybackMonths = 999, // will calculate later

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

        decimal totalOldKwhHigh = 0;
        decimal totalOldKwhLow = 0;
        decimal totalLedKwhHigh = 0;
        decimal totalLedKwhLow = 0;
        foreach (var group in input.LightingGroups)
        {
            decimal dailyHigh = input.TariffType == "Dual" ? group.DailyUsageHoursHighTariff : group.DailyUsageHours;
            decimal dailyLow = input.TariffType == "Dual" ? group.DailyUsageHoursLowTariff : 0;
            totalOldKwhHigh += (decimal)(group.WattageOld * group.BulbCount * (double)dailyHigh * 365) / 1000m;
            totalOldKwhLow += (decimal)(group.WattageOld * group.BulbCount * (double)dailyLow * 365) / 1000m;
            
            var ledW = FindLedEquivalent(group.BulbType, group.WattageOld);
            totalLedKwhHigh += (decimal)(ledW * group.BulbCount * (double)dailyHigh * 365) / 1000m;
            totalLedKwhLow += (decimal)(ledW * group.BulbCount * (double)dailyLow * 365) / 1000m;
        }

        var oldMonthlyBill = CalculateMonthlyBill(totalOldKwhHigh / 12, totalOldKwhLow / 12, input.ApprovedPowerKw, input.TariffType, input.CustomPricePerKwh, input.ConsumptionZone);
        var newMonthlyBill = CalculateMonthlyBill(totalLedKwhHigh / 12, totalLedKwhLow / 12, input.ApprovedPowerKw, input.TariffType, input.CustomPricePerKwh, input.ConsumptionZone);
        var totalSavingsRsd = Math.Max(0, (oldMonthlyBill - newMonthlyBill) * 12);

        var totalCurrentKwh = totalOldKwhHigh + totalOldKwhLow;
        var totalLedKwh = totalLedKwhHigh + totalLedKwhLow;
        var totalSavingsKwh = totalCurrentKwh - totalLedKwh;
        var totalInvestment = groupResults.Sum(g => g.InvestmentRsd);
        
        foreach (var gr in groupResults)
        {
            if (totalSavingsKwh > 0)
            {
                gr.AnnualSavingsRsd = totalSavingsRsd * (gr.AnnualSavingsKwh / totalSavingsKwh);
            }
            gr.PaybackMonths = gr.AnnualSavingsRsd > 0 ? (int)Math.Ceiling((double)gr.InvestmentRsd / ((double)gr.AnnualSavingsRsd / 12)) : 999;
        }
        
        var co2Factor = await _settingService.GetDecimalAsync("Co2FactorKgPerKwh", 0.417m, ct);
        var co2 = totalSavingsKwh * co2Factor;
        
        var overallPayback = totalSavingsRsd > 0
            ? (int)Math.Ceiling((double)totalInvestment / ((double)totalSavingsRsd / 12))
            : 999;
        var savingsEfficiency = totalCurrentKwh > 0
            ? (totalSavingsKwh / totalCurrentKwh * 100)
            : 0;

        var projection = GenerateTenYearProjection(totalSavingsRsd, totalInvestment, oldMonthlyBill * 12);

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
        decimal annualSavingsRsd, decimal investmentRsd, decimal annualCostWithoutLed)
    {
        var projection = new List<YearlyProjectionDto>();
        decimal cumulativeSavings = -investmentRsd;
        decimal cumulativeWithoutLed = 0;
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

    private static decimal CalculateMonthlyBill(decimal monthlyKwhHigh, decimal monthlyKwhLow, decimal approvedPowerKw, string tariffType, decimal? customPrice, string? forcedZone)
    {
        decimal fixedCosts = (approvedPowerKw * 60.8947m) + 160.67m;
        if (tariffType == "Custom" && customPrice.HasValue)
        {
            return fixedCosts + ((monthlyKwhHigh + monthlyKwhLow) * customPrice.Value);
        }

        decimal totalKwh = monthlyKwhHigh + monthlyKwhLow;

        // If user forced a zone, use fixed prices for the ENTIRE consumption
        if (!string.IsNullOrEmpty(forcedZone))
        {
            decimal vt = 0, nt = 0, jt = 0;
            switch (forcedZone)
            {
                case "Green": vt = 9.6136m; nt = 2.4034m; jt = 8.4119m; break;
                case "Blue": vt = 14.4203m; nt = 3.6051m; jt = 12.6178m; break;
                case "Red": vt = 28.8407m; nt = 7.2102m; jt = 25.2356m; break;
            }

            if (tariffType == "Dual")
                return fixedCosts + (monthlyKwhHigh * vt) + (monthlyKwhLow * nt);
            else
                return fixedCosts + (totalKwh * jt);
        }

        decimal highRatio = totalKwh > 0 ? (monthlyKwhHigh / totalKwh) : 0;
        decimal lowRatio = totalKwh > 0 ? (monthlyKwhLow / totalKwh) : 0;

        decimal cost = 0;
        decimal remainingKwh = totalKwh;

        decimal greenKwh = Math.Min(remainingKwh, 350m);
        if (greenKwh > 0)
        {
            if (tariffType == "Dual")
                cost += (greenKwh * highRatio * 9.6136m) + (greenKwh * lowRatio * 2.4034m);
            else
                cost += greenKwh * 8.4119m;
            remainingKwh -= greenKwh;
        }

        decimal blueKwh = Math.Min(remainingKwh, 850m);
        if (blueKwh > 0)
        {
            if (tariffType == "Dual")
                cost += (blueKwh * highRatio * 14.4203m) + (blueKwh * lowRatio * 3.6051m);
            else
                cost += blueKwh * 12.6178m;
            remainingKwh -= blueKwh;
        }

        decimal redKwh = remainingKwh;
        if (redKwh > 0)
        {
            if (tariffType == "Dual")
                cost += (redKwh * highRatio * 28.8407m) + (redKwh * lowRatio * 7.2102m);
            else
                cost += redKwh * 25.2356m;
        }

        return fixedCosts + cost;
    }
}
