using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class LedCalculatorSessionRepository : GenericRepository<LedCalculatorSession>, ILedCalculatorSessionRepository
{
    public LedCalculatorSessionRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<LedCalculatorSession>> GetByUserIdAsync(
        Guid userId, CancellationToken ct = default)
        => await _dbSet
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync(ct);

    public async Task<LedCalculatorSession?> GetWithRecommendationsAsync(
        Guid id, CancellationToken ct = default)
        => await _dbSet
            .Include(s => s.RecommendedProducts).ThenInclude(r => r.Product)
            .FirstOrDefaultAsync(s => s.Id == id, ct);
}
