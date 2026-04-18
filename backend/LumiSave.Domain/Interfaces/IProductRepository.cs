using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        string? search = null,
        Guid? categoryId = null,
        string? sortBy = null,
        string? sortDirection = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        string? protocol = null,
        bool? isSmartDevice = null,
        string? bulbType = null,
        CancellationToken ct = default);

    Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<Product?> GetBySKUAsync(string sku, CancellationToken ct = default);
    Task<IEnumerable<Product>> GetLedReplacementsAsync(string bulbType, int wattageOld, CancellationToken ct = default);
    Task<IEnumerable<Product>> GetSmartDevicesByCategoryAsync(string smartHomeCategory, CancellationToken ct = default);
    Task UpdateStockAsync(Guid productId, int quantityChange, CancellationToken ct = default);
    Task<Product?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
}
