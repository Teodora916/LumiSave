using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface ICartRepository : IRepository<CartItem>
{
    Task<IEnumerable<CartItem>> GetCartByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<CartItem?> GetCartItemAsync(Guid userId, Guid productId, CancellationToken ct = default);
    Task ClearCartAsync(Guid userId, CancellationToken ct = default);
}
