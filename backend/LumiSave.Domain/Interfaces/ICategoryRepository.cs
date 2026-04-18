using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<IEnumerable<Category>> GetAllActiveAsync(CancellationToken ct = default);
    Task<bool> HasActiveProductsAsync(Guid categoryId, CancellationToken ct = default);
}
