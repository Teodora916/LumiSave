using LumiSave.Application.DTOs.Products;

namespace LumiSave.Application.DTOs.Calculator;

// =============  LED CALCULATOR  =============

public class LedCalculatorInputDto
{
    public List<LightingGroupInputDto> LightingGroups { get; set; } = [];
    public decimal ElectricityPriceRsd { get; set; } = 7.5m;
    public string TariffType { get; set; } = "Single"; // Single, Dual, Custom
    public decimal? CustomPricePerKwh { get; set; }
    public decimal ApprovedPowerKw { get; set; } = 6.9m;
    public string? ConsumptionZone { get; set; } // Green, Blue, Red
}

public class LightingGroupInputDto
{
    public string RoomName { get; set; } = string.Empty;
    public string BulbType { get; set; } = string.Empty;
    public int WattageOld { get; set; }
    public int BulbCount { get; set; }
    public decimal DailyUsageHours { get; set; }
    public decimal DailyUsageHoursHighTariff { get; set; }
    public decimal DailyUsageHoursLowTariff { get; set; }
    public decimal? LedPricePerBulb { get; set; }
}

public class LedCalculatorResultDto
{
    public List<LightingGroupResultDto> GroupResults { get; set; } = [];
    public decimal TotalCurrentAnnualKwh { get; set; }
    public decimal TotalLedAnnualKwh { get; set; }
    public decimal TotalAnnualSavingsKwh { get; set; }
    public decimal TotalAnnualSavingsRsd { get; set; }
    public decimal TotalMonthlySavingsRsd { get; set; }
    public decimal TotalInvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
    public decimal Co2ReductionKgPerYear { get; set; }
    public decimal SavingsEfficiencyPercent { get; set; }
    public List<YearlyProjectionDto> TenYearProjection { get; set; } = [];
    public List<ProductListDto> RecommendedProducts { get; set; } = [];
    public Guid? SessionId { get; set; }
}

public class LightingGroupResultDto
{
    public string RoomName { get; set; } = string.Empty;
    public string BulbType { get; set; } = string.Empty;
    public int WattageOld { get; set; }
    public int WattageLed { get; set; }
    public int BulbCount { get; set; }
    public decimal DailyUsageHours { get; set; }
    public decimal CurrentAnnualKwh { get; set; }
    public decimal LedAnnualKwh { get; set; }
    public decimal AnnualSavingsKwh { get; set; }
    public decimal AnnualSavingsRsd { get; set; }
    public decimal InvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
    public decimal WattageSavingPercent { get; set; }
}

public class YearlyProjectionDto
{
    public int Year { get; set; }
    public decimal CumulativeSavingsRsd { get; set; }
    public decimal CumulativeCostWithoutLed { get; set; }
    public decimal CumulativeCostWithLed { get; set; }
}

// =============  SMART HOME CALCULATOR  =============

public class SmartHomeCalculatorInputDto
{
    public decimal ElectricityPriceRsd { get; set; } = 7.5m;
    public VampirePowerInputDto? VampirePower { get; set; }
    public SmartPlugInputDto? SmartPlug { get; set; }
    public ThermostatInputDto? Thermostat { get; set; }
    public LightingAutomationInputDto? LightingAutomation { get; set; }
    public decimal? ExistingLedAnnualKwh { get; set; }
}

public class VampirePowerInputDto
{
    public List<StandbyDeviceInputDto> Devices { get; set; } = [];
}

public class StandbyDeviceInputDto
{
    public string DeviceType { get; set; } = string.Empty;
    public string? CustomName { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal? CustomStandbyWatts { get; set; }
}

public class SmartPlugInputDto
{
    public List<string> DeviceTypes { get; set; } = [];
    public decimal SmartPlugPriceRsd { get; set; } = 1800m;
    public int SmartPlugCount { get; set; }
}

public class ThermostatInputDto
{
    public string HeatingType { get; set; } = string.Empty;
    public decimal MonthlyHeatingCostRsd { get; set; }
    public string CurrentThermostatType { get; set; } = string.Empty;
    public int ZoneCount { get; set; } = 1;
    public decimal SmartThermostatPriceRsd { get; set; } = 15000m;
}

public class LightingAutomationInputDto
{
    public decimal AnnualLightingCostRsd { get; set; }
    public List<string> AutomationTypes { get; set; } = [];
    public decimal EquipmentCostRsd { get; set; }
}

// Result DTOs
public class SmartHomeCalculatorResultDto
{
    public int SmartHomeScore { get; set; }
    public string ScoreGrade { get; set; } = string.Empty;
    public List<string> ScoreInsights { get; set; } = [];
    public VampirePowerResultDto? VampirePowerResult { get; set; }
    public SmartPlugResultDto? SmartPlugResult { get; set; }
    public ThermostatResultDto? ThermostatResult { get; set; }
    public LightingAutomationResultDto? LightingAutomationResult { get; set; }
    public decimal TotalAnnualSavingsRsd { get; set; }
    public decimal TotalAnnualSavingsKwh { get; set; }
    public decimal TotalInvestmentRsd { get; set; }
    public int AveragePaybackMonths { get; set; }
    public decimal Co2ReductionKgPerYear { get; set; }
    public List<YearlyProjectionDto> TenYearProjection { get; set; } = [];
    public List<ProductListDto> RecommendedProducts { get; set; } = [];
    public Guid? SessionId { get; set; }
}

public class VampirePowerResultDto
{
    public List<StandbyDeviceResultDto> DeviceResults { get; set; } = [];
    public decimal TotalAnnualKwh { get; set; }
    public decimal TotalAnnualCostRsd { get; set; }
    public decimal PercentOfTotalBill { get; set; }
}

public class StandbyDeviceResultDto
{
    public string DeviceName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal StandbyWatts { get; set; }
    public decimal AnnualKwhPerUnit { get; set; }
    public decimal TotalAnnualKwh { get; set; }
    public decimal TotalAnnualCostRsd { get; set; }
}

public class SmartPlugResultDto
{
    public decimal EliminatedAnnualKwh { get; set; }
    public decimal AnnualSavingsRsd { get; set; }
    public decimal InvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
}

public class ThermostatResultDto
{
    public decimal AnnualSavingsRsd { get; set; }
    public decimal SavingsPercent { get; set; }
    public decimal InvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
}

public class LightingAutomationResultDto
{
    public List<AutomationBreakdownDto> Breakdowns { get; set; } = [];
    public decimal TotalAnnualSavingsRsd { get; set; }
    public decimal TotalSavingsPercent { get; set; }
    public decimal InvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
}

public class AutomationBreakdownDto
{
    public string AutomationType { get; set; } = string.Empty;
    public decimal SavingsPercent { get; set; }
    public decimal AnnualSavingsRsd { get; set; }
}
// Session DTOs
public class CalculatorSessionSummaryDto
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalAnnualSavingsRsd { get; set; }
    public decimal TotalInvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
}
