namespace LumiSave.Domain.Entities;

public class StripeTransaction : BaseEntity
{
    public Guid OrderId { get; set; }
    public string StripeEventId { get; set; } = string.Empty;
    public string PaymentIntentId { get; set; } = string.Empty;
    public string? StripeSessionId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "rsd";
    public string Status { get; set; } = string.Empty;
    public string? ReceiptUrl { get; set; }
    public string? CustomerEmail { get; set; }
    public string? RefundId { get; set; }
    public decimal? RefundedAmount { get; set; }
    public DateTime? RefundedAt { get; set; }
    public string? RawWebhookPayload { get; set; }

    // Navigation
    public Order Order { get; set; } = null!;
}
