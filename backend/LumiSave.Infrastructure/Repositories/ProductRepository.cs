using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context) { }

    public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
        int page, int pageSize,
        string? search = null, Guid? categoryId = null,
        string? sortBy = null, string? sortDirection = null,
        decimal? minPrice = null, decimal? maxPrice = null,
        string? protocol = null, bool? isSmartDevice = null,
        string? bulbType = null, CancellationToken ct = default)
    {
        var query = _dbSet
            .Include(p => p.Category)
            .Include(p => p.Reviews)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p =>
                EF.Functions.ILike(p.Name, $"%{search}%") ||
                EF.Functions.ILike(p.Description, $"%{search}%") ||
                EF.Functions.ILike(p.SKU, $"%{search}%"));

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        if (!string.IsNullOrWhiteSpace(protocol))
            query = query.Where(p => p.SmartProtocol == protocol);

        if (isSmartDevice.HasValue)
            query = query.Where(p => p.IsSmartDevice == isSmartDevice.Value);

        if (!string.IsNullOrWhiteSpace(bulbType))
            query = query.Where(p => p.BulbType == bulbType);

        query = (sortBy?.ToLowerInvariant(), sortDirection?.ToLowerInvariant()) switch
        {
            ("price", "desc") => query.OrderByDescending(p => p.Price),
            ("price", _) => query.OrderBy(p => p.Price),
            ("name", "desc") => query.OrderByDescending(p => p.Name),
            ("name", _) => query.OrderBy(p => p.Name),
            ("createdat", "asc") => query.OrderBy(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Reviews).ThenInclude(r => r.User)
            .FirstOrDefaultAsync(p => p.Slug == slug, ct);

    public async Task<Product?> GetBySKUAsync(string sku, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(p => p.SKU == sku, ct);

    public async Task<IEnumerable<Product>> GetLedReplacementsAsync(
        string bulbType, int wattageOld, CancellationToken ct = default)
        => await _dbSet
            .Include(p => p.Category)
            .Where(p => p.BulbType == bulbType && p.WattageOld == wattageOld && p.WattageLed != null)
            .Take(5)
            .ToListAsync(ct);

    public async Task<IEnumerable<Product>> GetSmartDevicesByCategoryAsync(
        string smartHomeCategory, CancellationToken ct = default)
        => await _dbSet
            .Include(p => p.Category)
            .Where(p => p.IsSmartDevice && p.SmartHomeCategory == smartHomeCategory)
            .Take(5)
            .ToListAsync(ct);

    public async Task UpdateStockAsync(
        Guid productId, int quantityChange, CancellationToken ct = default)
    {
        // Row-level lock for concurrent stock updates
        var product = await _context.Products
            .FromSqlRaw("SELECT * FROM \"Products\" WHERE \"Id\" = {0} FOR UPDATE", productId)
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(ct);

        if (product == null) return;

        product.StockQuantity += quantityChange;
        if (product.StockQuantity < 0) product.StockQuantity = 0;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
    }

    public async Task<Product?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default)
        => await _dbSet
            .Include(p => p.Category)
            .Include(p => p.Reviews).ThenInclude(r => r.User)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
}
