using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface ILedCalculatorSessionRepository : IRepository<LedCalculatorSession>
{
    Task<IEnumerable<LedCalculatorSession>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<LedCalculatorSession?> GetWithRecommendationsAsync(Guid id, CancellationToken ct = default);
}
