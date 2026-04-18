using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class OrderRepository : GenericRepository<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext context) : base(context) { }

    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetByUserIdAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _dbSet
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<(IEnumerable<Order> Items, int TotalCount)> GetAllPagedAsync(
        int page, int pageSize,
        string? status = null, DateTime? from = null, DateTime? to = null,
        CancellationToken ct = default)
    {
        var query = _dbSet
            .Include(o => o.User)
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<Domain.Enums.OrderStatus>(status, true, out var parsedStatus))
            query = query.Where(o => o.Status == parsedStatus);

        if (from.HasValue)
            query = query.Where(o => o.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(o => o.CreatedAt <= to.Value);

        query = query.OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<Order?> GetByStripeSessionIdAsync(string sessionId, CancellationToken ct = default)
        => await _dbSet
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.StripeSessionId == sessionId, ct);

    public async Task<Order?> GetOrderWithDetailsAsync(Guid orderId, CancellationToken ct = default)
        => await _dbSet
            .Include(o => o.User)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.StripeTransaction)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);
}
