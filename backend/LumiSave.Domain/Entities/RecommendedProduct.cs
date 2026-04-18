namespace LumiSave.Domain.Entities;

public class RecommendedProduct : BaseEntity
{
    public Guid? LedSessionId { get; set; }
    public Guid? SmartHomeSessionId { get; set; }
    public Guid ProductId { get; set; }
    public string ReasonCode { get; set; } = string.Empty;
    public string? ReasonDescription { get; set; }
    public int SortOrder { get; set; } = 0;

    // Navigation
    public LedCalculatorSession? LedSession { get; set; }
    public SmartHomeCalculatorSession? SmartHomeSession { get; set; }
    public Product Product { get; set; } = null!;
}
