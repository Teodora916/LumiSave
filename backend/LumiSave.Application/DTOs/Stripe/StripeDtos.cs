namespace LumiSave.Application.DTOs.Stripe;

public class StripeTransactionDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string PaymentIntentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? CustomerEmail { get; set; }
    public string? ReceiptUrl { get; set; }
    public bool IsRefunded { get; set; }
    public decimal? RefundedAmount { get; set; }
    public DateTime? RefundedAt { get; set; }
}

public class RefundRequestDto
{
    public string? Reason { get; set; }
}

public class TransactionFilterDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Status { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
}

public class AdminTransactionStatsDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalTransactions { get; set; }
    public decimal TodayRevenue { get; set; }
    public int TodayTransactions { get; set; }
    public decimal RefundedTotal { get; set; }
    public decimal AverageOrderValue { get; set; }
    public decimal TotalEnergySavedKwh { get; set; }
}
