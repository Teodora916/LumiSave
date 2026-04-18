using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface ISmartHomeCalculatorSessionRepository : IRepository<SmartHomeCalculatorSession>
{
    Task<IEnumerable<SmartHomeCalculatorSession>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<SmartHomeCalculatorSession?> GetWithRecommendationsAsync(Guid id, CancellationToken ct = default);
}
