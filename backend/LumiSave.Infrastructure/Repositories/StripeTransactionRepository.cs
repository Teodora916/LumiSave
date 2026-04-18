using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class StripeTransactionRepository : GenericRepository<StripeTransaction>, IStripeTransactionRepository
{
    public StripeTransactionRepository(AppDbContext context) : base(context) { }

    public async Task<(IEnumerable<StripeTransaction> Items, int TotalCount)> GetAllPagedAsync(
        int page, int pageSize,
        string? status = null, DateTime? from = null, DateTime? to = null,
        CancellationToken ct = default)
    {
        var query = _dbSet.Include(t => t.Order).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(t => t.Status == status);

        if (from.HasValue)
            query = query.Where(t => t.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(t => t.CreatedAt <= to.Value);

        query = query.OrderByDescending(t => t.CreatedAt);

        var total = await query.CountAsync(ct);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (items, total);
    }

    public async Task<StripeTransaction?> GetByPaymentIntentIdAsync(
        string paymentIntentId, CancellationToken ct = default)
        => await _dbSet.FirstOrDefaultAsync(t => t.PaymentIntentId == paymentIntentId, ct);

    public async Task<bool> ExistsByStripeEventIdAsync(
        string eventId, CancellationToken ct = default)
        => await _dbSet.AnyAsync(t => t.StripeEventId == eventId, ct);
}
