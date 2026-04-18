namespace LumiSave.Domain.Entities;

public class SmartHomeCalculatorSession : BaseEntity
{
    public Guid? UserId { get; set; }
    public string InputJson { get; set; } = string.Empty;
    public string ResultJson { get; set; } = string.Empty;
    public int SmartHomeScore { get; set; }
    public decimal TotalAnnualSavingsRsd { get; set; }
    public decimal TotalAnnualSavingsKwh { get; set; }
    public decimal TotalInvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
    public decimal Co2ReductionKg { get; set; }

    // Module breakdown
    public decimal VampirePowerSavingsRsd { get; set; }
    public decimal SmartPlugSavingsRsd { get; set; }
    public decimal ThermostatSavingsRsd { get; set; }
    public decimal LightingAutomationSavingsRsd { get; set; }
    public decimal SolarSavingsRsd { get; set; }

    // Navigation
    public ApplicationUser? User { get; set; }
    public ICollection<RecommendedProduct> RecommendedProducts { get; set; } = new List<RecommendedProduct>();
}
