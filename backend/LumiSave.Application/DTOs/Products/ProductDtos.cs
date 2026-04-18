namespace LumiSave.Application.DTOs.Products;

public class ProductListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQuantity { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public bool IsSmartDevice { get; set; }
    public string? SmartProtocol { get; set; }
    public int? WattageLed { get; set; }
    public int? WattageOld { get; set; }
    public bool IsLowStock { get; set; }
    public bool IsFeatured { get; set; }
}

public class ProductDetailDto : ProductListDto
{
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public List<string> ImageUrls { get; set; } = [];
    public Dictionary<string, string> Specifications { get; set; } = [];
    public string? SocketType { get; set; }
    public string? BulbType { get; set; }
    public int? ColorTemperature { get; set; }
    public int? LuminousFlux { get; set; }
    public int? CRI { get; set; }
    public bool IsDimmable { get; set; }
    public decimal? StandbyWattage { get; set; }
    public string? SmartHomeCategory { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 5;
    public bool IsFeatured { get; set; }
    public Guid CategoryId { get; set; }
    public string? Brand { get; set; }
    public string? ImageUrlsJson { get; set; }
    public string? SpecificationsJson { get; set; }
    public int? WattageOld { get; set; }
    public int? WattageLed { get; set; }
    public int? LuminousFlux { get; set; }
    public int? ColorTemperature { get; set; }
    public int? CRI { get; set; }
    public string? SocketType { get; set; }
    public string? BulbType { get; set; }
    public bool IsDimmable { get; set; }
    public string? SmartProtocol { get; set; }
    public decimal? StandbyWattage { get; set; }
    public bool IsSmartDevice { get; set; }
    public string? SmartHomeCategory { get; set; }
}

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? ShortDescription { get; set; }
    public string? SKU { get; set; }
    public decimal? Price { get; set; }
    public decimal? CompareAtPrice { get; set; }
    public int? LowStockThreshold { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsActive { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Brand { get; set; }
    public string? ImageUrlsJson { get; set; }
    public string? SpecificationsJson { get; set; }
    public int? WattageOld { get; set; }
    public int? WattageLed { get; set; }
    public int? LuminousFlux { get; set; }
    public int? ColorTemperature { get; set; }
    public int? CRI { get; set; }
    public string? SocketType { get; set; }
    public string? BulbType { get; set; }
    public bool? IsDimmable { get; set; }
    public string? SmartProtocol { get; set; }
    public decimal? StandbyWattage { get; set; }
    public bool? IsSmartDevice { get; set; }
    public string? SmartHomeCategory { get; set; }
}

public class UpdateStockDto
{
    public int Quantity { get; set; }
}

public class ProductFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Protocol { get; set; }
    public bool? IsSmartDevice { get; set; }
    public string? BulbType { get; set; }
}
