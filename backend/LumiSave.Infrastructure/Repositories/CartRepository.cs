using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class CartRepository : GenericRepository<CartItem>, ICartRepository
{
    public CartRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<CartItem>> GetCartByUserIdAsync(
        Guid userId, CancellationToken ct = default)
        => await _dbSet
            .Include(c => c.Product).ThenInclude(p => p.Category)
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

    public async Task<CartItem?> GetCartItemAsync(
        Guid userId, Guid productId, CancellationToken ct = default)
        => await _dbSet
            .Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId, ct);

    public async Task ClearCartAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await _dbSet.Where(c => c.UserId == userId).ToListAsync(ct);
        _dbSet.RemoveRange(items);
        await _context.SaveChangesAsync(ct);
    }
}
