using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface IReviewRepository : IRepository<Review>
{
    Task<(IEnumerable<Review> Items, int TotalCount)> GetByProductIdAsync(
        Guid productId, int page, int pageSize, CancellationToken ct = default);

    Task<bool> UserHasPurchasedProductAsync(Guid userId, Guid productId, CancellationToken ct = default);
    Task<Review?> GetByUserAndProductAsync(Guid userId, Guid productId, CancellationToken ct = default);
}
