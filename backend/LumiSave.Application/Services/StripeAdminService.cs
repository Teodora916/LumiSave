using AutoMapper;
using LumiSave.Application.DTOs.Common;
using LumiSave.Application.DTOs.Stripe;
using LumiSave.Application.Interfaces;
using LumiSave.Domain.Enums;
using LumiSave.Domain.Exceptions;
using LumiSave.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace LumiSave.Application.Services;

public interface IStripeAdminService
{
    Task<PagedResultDto<StripeTransactionDto>> GetTransactionsAsync(TransactionFilterDto filter, CancellationToken ct = default);
    Task<AdminTransactionStatsDto> GetTransactionStatsAsync(CancellationToken ct = default);
    Task<StripeTransactionDto> RefundTransactionAsync(Guid transactionId, RefundRequestDto dto, CancellationToken ct = default);
}

public class StripeAdminService : IStripeAdminService
{
    private readonly IStripeTransactionRepository _transactionRepo;
    private readonly IOrderRepository _orderRepo;
    private readonly IStripeService _stripeService;
    private readonly IMapper _mapper;
    private readonly ILogger<StripeAdminService> _logger;

    public StripeAdminService(
        IStripeTransactionRepository transactionRepo,
        IOrderRepository orderRepo,
        IStripeService stripeService,
        IMapper mapper,
        ILogger<StripeAdminService> logger)
    {
        _transactionRepo = transactionRepo;
        _orderRepo = orderRepo;
        _stripeService = stripeService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<PagedResultDto<StripeTransactionDto>> GetTransactionsAsync(
        TransactionFilterDto filter, CancellationToken ct = default)
    {
        var (items, total) = await _transactionRepo.GetAllPagedAsync(
            filter.Page, filter.PageSize, filter.Status, filter.From, filter.To, ct);

        return new PagedResultDto<StripeTransactionDto>
        {
            Items = _mapper.Map<IEnumerable<StripeTransactionDto>>(items),
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<AdminTransactionStatsDto> GetTransactionStatsAsync(CancellationToken ct = default)
    {
        // Use repository to get all transactions
        var allTransactions = (await _transactionRepo.GetAllAsync(ct)).ToList();
        var succeeded = allTransactions.Where(t => t.Status == "succeeded").ToList();
        var today = DateTime.UtcNow.Date;
        var todayTx = succeeded.Where(t => t.CreatedAt >= today).ToList();
        var refundedTotal = allTransactions.Where(t => t.RefundId != null)
            .Sum(t => t.RefundedAmount ?? 0);

        return new AdminTransactionStatsDto
        {
            TotalRevenue = succeeded.Sum(t => t.Amount),
            TotalTransactions = succeeded.Count,
            TodayRevenue = todayTx.Sum(t => t.Amount),
            TodayTransactions = todayTx.Count,
            RefundedTotal = refundedTotal,
            AverageOrderValue = succeeded.Any() ? succeeded.Average(t => t.Amount) : 0
        };
    }

    public async Task<StripeTransactionDto> RefundTransactionAsync(
        Guid transactionId, RefundRequestDto dto, CancellationToken ct = default)
    {
        var transaction = await _transactionRepo.GetByIdAsync(transactionId, ct)
            ?? throw new NotFoundException("Transaction", transactionId);

        if (transaction.RefundId != null)
            throw new BusinessException("This transaction has already been refunded.");

        var refund = await _stripeService.CreateRefundAsync(
            transaction.PaymentIntentId, null, dto.Reason, ct);

        transaction.RefundId = refund.Id;
        transaction.RefundedAmount = refund.Amount / 100m;
        transaction.RefundedAt = DateTime.UtcNow;
        transaction.Status = "refunded";

        await _transactionRepo.UpdateAsync(transaction, ct);

        // Update order status
        var order = await _orderRepo.GetByIdAsync(transaction.OrderId, ct);
        if (order != null)
        {
            order.Status = OrderStatus.Refunded;
            await _orderRepo.UpdateAsync(order, ct);
        }

        return _mapper.Map<StripeTransactionDto>(transaction);
    }
}
