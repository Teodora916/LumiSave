using LumiSave.Domain.Entities;
using LumiSave.Domain.Enums;

namespace LumiSave.Domain.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<(IEnumerable<Order> Items, int TotalCount)> GetByUserIdAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default);

    Task<(IEnumerable<Order> Items, int TotalCount)> GetAllPagedAsync(
        int page, int pageSize,
        string? status = null,
        DateTime? from = null,
        DateTime? to = null,
        CancellationToken ct = default);

    Task<Order?> GetByStripeSessionIdAsync(string sessionId, CancellationToken ct = default);
    Task<Order?> GetOrderWithDetailsAsync(Guid orderId, CancellationToken ct = default);
}
