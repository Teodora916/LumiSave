namespace LumiSave.Domain.Entities;

public class CartItem : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
