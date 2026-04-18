using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class ReviewRepository : GenericRepository<Review>, IReviewRepository
{
    public ReviewRepository(AppDbContext context) : base(context) { }

    public async Task<(IEnumerable<Review> Items, int TotalCount)> GetByProductIdAsync(
        Guid productId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _dbSet
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<bool> UserHasPurchasedProductAsync(
        Guid userId, Guid productId, CancellationToken ct = default)
        => await _context.OrderItems
            .AnyAsync(oi =>
                oi.ProductId == productId &&
                oi.Order.UserId == userId &&
                oi.Order.Status == Domain.Enums.OrderStatus.Delivered ||
                oi.Order.Status == Domain.Enums.OrderStatus.Completed, ct);

    public async Task<Review?> GetByUserAndProductAsync(
        Guid userId, Guid productId, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(r => r.UserId == userId && r.ProductId == productId, ct);
}
