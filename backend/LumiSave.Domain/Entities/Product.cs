namespace LumiSave.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQuantity { get; set; } = 0;
    public int LowStockThreshold { get; set; } = 5;
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public Guid CategoryId { get; set; }
    public string? Brand { get; set; }
    public string? ImageUrls { get; set; }         // JSON array
    public string? Specifications { get; set; }    // JSONB

    // LED-specific fields
    public int? WattageOld { get; set; }
    public int? WattageLed { get; set; }
    public int? LuminousFlux { get; set; }
    public int? ColorTemperature { get; set; }
    public int? CRI { get; set; }
    public string? SocketType { get; set; }
    public string? BulbType { get; set; }
    public bool IsDimmable { get; set; } = false;

    // Smart Home fields
    public string? SmartProtocol { get; set; }
    public decimal? StandbyWattage { get; set; }
    public bool IsSmartDevice { get; set; } = false;
    public string? SmartHomeCategory { get; set; }

    // Navigation
    public Category Category { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<RecommendedProduct> RecommendedProducts { get; set; } = new List<RecommendedProduct>();
}
