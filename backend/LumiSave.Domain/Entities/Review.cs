namespace LumiSave.Domain.Entities;

public class Review : BaseEntity
{
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsVerifiedPurchase { get; set; } = false;
    public bool IsApproved { get; set; } = true;

    // Navigation
    public Product Product { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
