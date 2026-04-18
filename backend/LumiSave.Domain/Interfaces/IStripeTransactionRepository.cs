using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface IStripeTransactionRepository : IRepository<StripeTransaction>
{
    Task<(IEnumerable<StripeTransaction> Items, int TotalCount)> GetAllPagedAsync(
        int page, int pageSize,
        string? status = null,
        DateTime? from = null,
        DateTime? to = null,
        CancellationToken ct = default);

    Task<StripeTransaction?> GetByPaymentIntentIdAsync(string paymentIntentId, CancellationToken ct = default);
    Task<bool> ExistsByStripeEventIdAsync(string eventId, CancellationToken ct = default);
}
