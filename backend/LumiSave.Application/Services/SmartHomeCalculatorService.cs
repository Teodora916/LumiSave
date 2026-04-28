using System.Text.Json;
using AutoMapper;
using LumiSave.Application.DTOs.Calculator;
using LumiSave.Application.DTOs.Products;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public interface ISmartHomeCalculatorService
{
    Task<SmartHomeCalculatorResultDto> CalculateAsync(SmartHomeCalculatorInputDto input, Guid? userId = null, CancellationToken ct = default);
    Task<IEnumerable<CalculatorSessionSummaryDto>> GetUserSessionsAsync(Guid userId, CancellationToken ct = default);
    Task<SmartHomeCalculatorResultDto?> GetSessionAsync(Guid sessionId, Guid userId, CancellationToken ct = default);
}

public class SmartHomeCalculatorService : ISmartHomeCalculatorService
{
    private readonly ISmartHomeCalculatorSessionRepository _sessionRepo;
    private readonly IProductRepository _productRepo;
    private readonly IMapper _mapper;
    private readonly ISystemSettingService _settingService;

    private static readonly Dictionary<string, (decimal Avg, decimal Min, decimal Max)> DeviceStandbyProfiles = new()
    {
        ["Television"]      = (1.5m,  0.5m,  3.0m),
        ["GamingConsole"]   = (0.7m,  0.5m,  1.0m),
        ["DesktopComputer"] = (10.0m, 5.0m,  15.0m),
        ["Monitor"]         = (2.0m,  0.5m,  5.0m),
        ["CableBoxDVR"]     = (22.0m, 15.0m, 30.0m),
        ["Microwave"]       = (3.5m,  2.0m,  5.0m),
        ["CoffeeMaker"]     = (5.0m,  2.0m,  8.0m),
        ["MobileCharger"]   = (0.3m,  0.1m,  0.5m),
        ["WifiRouter"]      = (7.5m,  5.0m,  10.0m),
        ["HomeTheater"]     = (3.0m,  1.0m,  5.0m),
        ["Printer"]         = (5.5m,  3.0m,  8.0m),
        ["AirConditioner"]  = (12.0m, 5.0m,  20.0m),
        ["WasherDryer"]     = (2.0m,  1.0m,  3.0m),
        ["SpaceHeater"]     = (1.0m,  0.5m,  2.0m),
    };

    private static readonly Dictionary<string, (decimal Min, decimal Max)> AutomationSavings = new()
    {
        ["MotionSensor"]       = (0.20m, 0.40m),
        ["Schedule"]           = (0.10m, 0.20m),
        ["DaylightHarvesting"] = (0.15m, 0.30m),
        ["Geofencing"]         = (0.10m, 0.25m),
        ["SceneControl"]       = (0.05m, 0.15m),
    };

    private static readonly Dictionary<string, decimal> ThermostatSavingFactor = new()
    {
        ["Mechanical-HeatPump"]  = 0.22m,
        ["Mechanical-Gas"]       = 0.20m,
        ["Mechanical-Electric"]  = 0.25m,
        ["Mechanical-District"]  = 0.15m,
        ["Digital-HeatPump"]     = 0.18m,
        ["Digital-Gas"]          = 0.17m,
        ["Digital-Electric"]     = 0.20m,
        ["Digital-District"]     = 0.12m,
        ["Smart-HeatPump"]       = 0.05m,
        ["Smart-Gas"]            = 0.04m,
        ["Smart-Electric"]       = 0.05m,
        ["Smart-District"]       = 0.03m,
    };

    public SmartHomeCalculatorService(
        ISmartHomeCalculatorSessionRepository sessionRepo,
        IProductRepository productRepo,
        IMapper mapper,
        ISystemSettingService settingService)
    {
        _sessionRepo = sessionRepo;
        _productRepo = productRepo;
        _mapper = mapper;
        _settingService = settingService;
    }

    public async Task<SmartHomeCalculatorResultDto> CalculateAsync(
        SmartHomeCalculatorInputDto input, Guid? userId = null, CancellationToken ct = default)
    {
        var result = new SmartHomeCalculatorResultDto();
        var recommendedProducts = new List<ProductListDto>();
        decimal totalSavingsRsd = 0, totalSavingsKwh = 0, totalInvestment = 0;
        int score = 0;
        var insights = new List<string>();

        // LED component (max 20 pts)
        if (input.ExistingLedAnnualKwh.HasValue && input.ExistingLedAnnualKwh.Value > 0)
        {
            score += 20;
            insights.Add("You've already upgraded to LED lighting — great start!");
        }

        // Vampire Power
        if (input.VampirePower?.Devices.Count > 0)
        {
            var vampireResult = CalculateVampirePower(input.VampirePower, input.ElectricityPriceRsd);
            result.VampirePowerResult = vampireResult;
            totalSavingsKwh += vampireResult.TotalAnnualKwh;
            totalSavingsRsd += vampireResult.TotalAnnualCostRsd;

            if (vampireResult.TotalAnnualCostRsd > 2000)
                insights.Add($"Standby devices cost you {vampireResult.TotalAnnualCostRsd:N0} RSD/year — significant waste!");

            // Smart Plugs
            if (input.SmartPlug != null && input.SmartPlug.SmartPlugCount > 0)
            {
                var coveredDevices = input.SmartPlug.DeviceTypes.Count;
                var totalDevices = input.VampirePower.Devices.Count;
                var scorePct = totalDevices > 0 ? (decimal)coveredDevices / totalDevices : 0;
                score += (int)(scorePct * 20);

                var smartPlugResult = CalculateSmartPlug(input.SmartPlug, vampireResult, input.ElectricityPriceRsd);
                result.SmartPlugResult = smartPlugResult;
                totalSavingsRsd += smartPlugResult.AnnualSavingsRsd;
                totalInvestment += smartPlugResult.InvestmentRsd;

                // Get smart plug products
                var smartPlugProducts = await _productRepo.GetSmartDevicesByCategoryAsync("SmartPlug", ct);
                recommendedProducts.AddRange(_mapper.Map<IEnumerable<ProductListDto>>(smartPlugProducts).Take(2));

                if (input.SmartPlug.SmartPlugCount > 3)
                {
                    var hubProducts = await _productRepo.GetSmartDevicesByCategoryAsync("Hub", ct);
                    recommendedProducts.AddRange(_mapper.Map<IEnumerable<ProductListDto>>(hubProducts).Take(1));
                }
            }
        }

        // Thermostat (max 25 pts)
        if (input.Thermostat != null)
        {
            var thermostatResult = CalculateThermostat(input.Thermostat);
            result.ThermostatResult = thermostatResult;
            totalSavingsRsd += thermostatResult.AnnualSavingsRsd;
            totalInvestment += thermostatResult.InvestmentRsd;

            score += input.Thermostat.CurrentThermostatType switch
            {
                "Mechanical" => 5,
                "Digital" => 15,
                "Smart" => 25,
                _ => 0
            };

            var thermoProducts = await _productRepo.GetSmartDevicesByCategoryAsync("Thermostat", ct);
            recommendedProducts.AddRange(_mapper.Map<IEnumerable<ProductListDto>>(thermoProducts).Take(1));
        }

        // Lighting Automation (max 20 pts)
        if (input.LightingAutomation != null && input.LightingAutomation.AutomationTypes.Count > 0)
        {
            var automationResult = CalculateLightingAutomation(input.LightingAutomation);
            result.LightingAutomationResult = automationResult;
            totalSavingsRsd += automationResult.TotalAnnualSavingsRsd;
            totalInvestment += automationResult.InvestmentRsd;
            score += Math.Min(20, input.LightingAutomation.AutomationTypes.Count * 4);

            if (input.LightingAutomation.AutomationTypes.Contains("MotionSensor"))
            {
                var sensorProducts = await _productRepo.GetSmartDevicesByCategoryAsync("Sensor", ct);
                recommendedProducts.AddRange(_mapper.Map<IEnumerable<ProductListDto>>(sensorProducts).Take(2));
            }
        }

        // Solar (max 15 pts)
        if (input.Solar != null)
        {
            var solarInsolation = await _settingService.GetDecimalAsync("SolarInsolationSerbia", 1400m, ct);
            var panelEfficiency = await _settingService.GetDecimalAsync("SolarPanelEfficiency", 0.20m, ct);
            var co2Factor = await _settingService.GetDecimalAsync("Co2FactorKgPerKwh", 0.417m, ct);

            var solarResult = CalculateSolar(input.Solar, input.ElectricityPriceRsd, solarInsolation, panelEfficiency, co2Factor);
            result.SolarResult = solarResult;
            totalSavingsRsd += solarResult.AnnualSavingsRsd;
            totalSavingsKwh += solarResult.AnnualProductionKwh;
            totalInvestment += solarResult.InvestmentRsd;
            score += 15;
            insights.Add($"Solar system could offset {solarResult.CoveredConsumptionPercent:F0}% of your electricity consumption.");

            var solarProducts = await _productRepo.GetSmartDevicesByCategoryAsync("Solar", ct);
            recommendedProducts.AddRange(_mapper.Map<IEnumerable<ProductListDto>>(solarProducts).Take(1));
        }

        score = Math.Min(100, score);
        var grade = score switch
        {
            >= 90 => "A",
            >= 75 => "B",
            >= 60 => "C",
            >= 40 => "D",
            _ => "F"
        };

        if (score < 40)
        {
            insights.Add("Your home has significant savings potential. Start with smart plugs!");
            var starterProducts = await _productRepo.GetSmartDevicesByCategoryAsync("SmartPlug", ct);
            recommendedProducts.AddRange(_mapper.Map<IEnumerable<ProductListDto>>(starterProducts).Take(2));
        }

        var co2FactorOverall = await _settingService.GetDecimalAsync("Co2FactorKgPerKwh", 0.417m, ct);
        var co2 = totalSavingsKwh * co2FactorOverall;
        var averagePayback = totalSavingsRsd > 0
            ? (int)Math.Ceiling((double)totalInvestment / ((double)totalSavingsRsd / 12))
            : 999;

        var projection = GenerateTenYearProjection(totalSavingsRsd, totalInvestment, input.ElectricityPriceRsd);

        result.SmartHomeScore = score;
        result.ScoreGrade = grade;
        result.ScoreInsights = insights;
        result.TotalAnnualSavingsRsd = totalSavingsRsd;
        result.TotalAnnualSavingsKwh = totalSavingsKwh;
        result.TotalInvestmentRsd = totalInvestment;
        result.AveragePaybackMonths = averagePayback;
        result.Co2ReductionKgPerYear = co2;
        result.TenYearProjection = projection;
        result.RecommendedProducts = recommendedProducts.DistinctBy(p => p.Id).Take(8).ToList();

        // Save session
        if (userId.HasValue)
        {
            var session = new SmartHomeCalculatorSession
            {
                UserId = userId,
                InputJson = JsonSerializer.Serialize(input),
                ResultJson = "{}",
                SmartHomeScore = score,
                TotalAnnualSavingsRsd = totalSavingsRsd,
                TotalAnnualSavingsKwh = totalSavingsKwh,
                TotalInvestmentRsd = totalInvestment,
                PaybackMonths = averagePayback,
                Co2ReductionKg = co2,
                VampirePowerSavingsRsd = result.VampirePowerResult?.TotalAnnualCostRsd ?? 0,
                SmartPlugSavingsRsd = result.SmartPlugResult?.AnnualSavingsRsd ?? 0,
                ThermostatSavingsRsd = result.ThermostatResult?.AnnualSavingsRsd ?? 0,
                LightingAutomationSavingsRsd = result.LightingAutomationResult?.TotalAnnualSavingsRsd ?? 0,
                SolarSavingsRsd = result.SolarResult?.AnnualSavingsRsd ?? 0
            };
            var saved = await _sessionRepo.AddAsync(session, ct);
            result.SessionId = saved.Id;
        }

        return result;
    }

    private static VampirePowerResultDto CalculateVampirePower(
        VampirePowerInputDto input, decimal electricityPrice)
    {
        var deviceResults = new List<StandbyDeviceResultDto>();

        foreach (var device in input.Devices)
        {
            var standbyW = device.CustomStandbyWatts ??
                (DeviceStandbyProfiles.TryGetValue(device.DeviceType, out var p) ? p.Avg : 5m);
            var annualKwhPerUnit = (standbyW * 24 * 365) / 1000m;
            var totalKwh = annualKwhPerUnit * device.Quantity;
            var totalCost = totalKwh * electricityPrice;

            deviceResults.Add(new StandbyDeviceResultDto
            {
                DeviceName = device.CustomName ?? device.DeviceType,
                Quantity = device.Quantity,
                StandbyWatts = standbyW,
                AnnualKwhPerUnit = annualKwhPerUnit,
                TotalAnnualKwh = totalKwh,
                TotalAnnualCostRsd = totalCost
            });
        }

        return new VampirePowerResultDto
        {
            DeviceResults = deviceResults,
            TotalAnnualKwh = deviceResults.Sum(d => d.TotalAnnualKwh),
            TotalAnnualCostRsd = deviceResults.Sum(d => d.TotalAnnualCostRsd),
            PercentOfTotalBill = 0 // Calculated on frontend or with user's total bill
        };
    }

    private static SmartPlugResultDto CalculateSmartPlug(
        SmartPlugInputDto input, VampirePowerResultDto vampireResult, decimal electricityPrice)
    {
        // Smart plugs eliminate ~80% of standby for covered devices
        var coveredDevicesCost = vampireResult.DeviceResults
            .Where(d => input.DeviceTypes.Contains(d.DeviceName) ||
                        input.DeviceTypes.Contains(d.DeviceName.Replace(" ", "")))
            .Sum(d => d.TotalAnnualCostRsd);

        var eliminationFactor = 0.80m;
        var annualSavings = coveredDevicesCost * eliminationFactor;
        var investment = input.SmartPlugPriceRsd * input.SmartPlugCount;
        var payback = annualSavings > 0
            ? (int)Math.Ceiling((double)investment / ((double)annualSavings / 12))
            : 999;

        return new SmartPlugResultDto
        {
            EliminatedAnnualKwh = annualSavings / electricityPrice,
            AnnualSavingsRsd = annualSavings,
            InvestmentRsd = investment,
            PaybackMonths = payback
        };
    }

    private static ThermostatResultDto CalculateThermostat(ThermostatInputDto input)
    {
        var key = $"{input.CurrentThermostatType}-{input.HeatingType}";
        var savingFactor = ThermostatSavingFactor.TryGetValue(key, out var f) ? f : 0.15m;
        var annualHeatingCost = input.MonthlyHeatingCostRsd * 12;
        var annualSavings = annualHeatingCost * savingFactor;
        var investment = input.SmartThermostatPriceRsd * input.ZoneCount;
        var payback = annualSavings > 0
            ? (int)Math.Ceiling((double)investment / ((double)annualSavings / 12))
            : 999;

        return new ThermostatResultDto
        {
            AnnualSavingsRsd = annualSavings,
            SavingsPercent = savingFactor * 100,
            InvestmentRsd = investment,
            PaybackMonths = payback
        };
    }

    private static LightingAutomationResultDto CalculateLightingAutomation(
        LightingAutomationInputDto input)
    {
        var breakdowns = new List<AutomationBreakdownDto>();
        decimal totalSavingsRsd = 0;

        foreach (var automationType in input.AutomationTypes)
        {
            if (!AutomationSavings.TryGetValue(automationType, out var range)) continue;
            var avgSaving = (range.Min + range.Max) / 2;
            var annualSavings = input.AnnualLightingCostRsd * avgSaving;
            totalSavingsRsd += annualSavings;

            breakdowns.Add(new AutomationBreakdownDto
            {
                AutomationType = automationType,
                SavingsPercent = avgSaving * 100,
                AnnualSavingsRsd = annualSavings
            });
        }

        // Cap total savings at 60% to prevent overlap
        totalSavingsRsd = Math.Min(totalSavingsRsd, input.AnnualLightingCostRsd * 0.60m);
        var totalSavingsPct = input.AnnualLightingCostRsd > 0
            ? totalSavingsRsd / input.AnnualLightingCostRsd * 100 : 0;

        var payback = totalSavingsRsd > 0 && input.EquipmentCostRsd > 0
            ? (int)Math.Ceiling((double)input.EquipmentCostRsd / ((double)totalSavingsRsd / 12))
            : 999;

        return new LightingAutomationResultDto
        {
            Breakdowns = breakdowns,
            TotalAnnualSavingsRsd = totalSavingsRsd,
            TotalSavingsPercent = totalSavingsPct,
            InvestmentRsd = input.EquipmentCostRsd,
            PaybackMonths = payback
        };
    }

    private static SolarResultDto CalculateSolar(SolarInputDto input, decimal electricityPrice, decimal solarInsolation, decimal panelEfficiency, decimal co2Factor)
    {
        var capacityKwp = input.AvailableRoofAreaM2 * panelEfficiency;
        var annualProductionKwh = capacityKwp * solarInsolation;
        var annualSavings = annualProductionKwh * electricityPrice;

        if (input.HasNetMetering)
            annualSavings += annualProductionKwh * input.NetMeteringRateRsd * 0.2m; // 20% exported

        var co2OffsetKg = annualProductionKwh * co2Factor;
        var coveredConsumptionPct = input.AnnualElectricityCostRsd > 0
            ? (annualSavings / input.AnnualElectricityCostRsd * 100) : 0;
        var payback = annualSavings > 0
            ? (int)Math.Ceiling((double)input.InstallationCostRsd / ((double)annualSavings / 12))
            : 999;

        return new SolarResultDto
        {
            SystemCapacityKwp = capacityKwp,
            AnnualProductionKwh = annualProductionKwh,
            AnnualSavingsRsd = annualSavings,
            InvestmentRsd = input.InstallationCostRsd,
            PaybackMonths = payback,
            Co2OffsetKg = co2OffsetKg,
            CoveredConsumptionPercent = Math.Min(100, coveredConsumptionPct)
        };
    }

    private static List<YearlyProjectionDto> GenerateTenYearProjection(
        decimal annualSavingsRsd, decimal investmentRsd, decimal electricityPrice)
    {
        var projection = new List<YearlyProjectionDto>();
        decimal cumulative = -investmentRsd;

        for (int year = 1; year <= 10; year++)
        {
            cumulative += annualSavingsRsd;
            projection.Add(new YearlyProjectionDto
            {
                Year = year,
                CumulativeSavingsRsd = cumulative,
                CumulativeCostWithoutLed = 0,
                CumulativeCostWithLed = 0
            });
        }

        return projection;
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

    public async Task<SmartHomeCalculatorResultDto?> GetSessionAsync(
        Guid sessionId, Guid userId, CancellationToken ct = default)
    {
        var session = await _sessionRepo.GetWithRecommendationsAsync(sessionId, ct);
        if (session == null || session.UserId != userId) return null;

        try
        {
            var input = JsonSerializer.Deserialize<SmartHomeCalculatorInputDto>(session.InputJson);
            if (input == null) return null;
            return await CalculateAsync(input, null, ct);
        }
        catch
        {
            return null;
        }
    }
}
