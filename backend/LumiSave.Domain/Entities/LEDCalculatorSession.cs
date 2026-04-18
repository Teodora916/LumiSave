namespace LumiSave.Domain.Entities;

public class LedCalculatorSession : BaseEntity
{
    public Guid? UserId { get; set; }
    public string InputJson { get; set; } = string.Empty;
    public string ResultJson { get; set; } = string.Empty;
    public decimal TotalAnnualSavingsRsd { get; set; }
    public decimal TotalAnnualSavingsKwh { get; set; }
    public decimal TotalInvestmentRsd { get; set; }
    public int PaybackMonths { get; set; }
    public decimal Co2ReductionKg { get; set; }

    // Navigation
    public ApplicationUser? User { get; set; }
    public ICollection<RecommendedProduct> RecommendedProducts { get; set; } = new List<RecommendedProduct>();
}
