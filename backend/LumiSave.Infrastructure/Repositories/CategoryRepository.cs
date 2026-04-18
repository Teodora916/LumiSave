using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context) { }

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _dbSet
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public async Task<IEnumerable<Category>> GetAllActiveAsync(CancellationToken ct = default)
        => await _dbSet
            .Include(c => c.SubCategories)
            .Include(c => c.Products)
            .Where(c => c.ParentCategoryId == null)
            .OrderBy(c => c.SortOrder)
            .ToListAsync(ct);

    public async Task<bool> HasActiveProductsAsync(Guid categoryId, CancellationToken ct = default)
        => await _context.Products
            .IgnoreQueryFilters()
            .AnyAsync(p => p.CategoryId == categoryId && p.IsActive, ct);
}
