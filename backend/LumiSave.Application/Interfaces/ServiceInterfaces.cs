namespace LumiSave.Application.Interfaces;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(string toEmail, string firstName, Guid orderId, decimal totalAmount, CancellationToken ct = default);
    Task SendAsync(string toEmail, string toName, string subject, string htmlBody, CancellationToken ct = default);
}

public interface IStripeService
{
    Task<StripeCheckoutSession> CreateCheckoutSessionAsync(
        string customerEmail,
        List<(string Name, string? ImageUrl, long UnitAmountRsd, long Quantity)> lineItems,
        string successUrl, string cancelUrl,
        Dictionary<string, string>? metadata = null,
        CancellationToken ct = default);

    Task<StripeRefundResult> CreateRefundAsync(
        string paymentIntentId, long? amountRsd = null,
        string? reason = null, CancellationToken ct = default);

    (bool IsValid, string EventType, string EventId, object? EventObject, string ErrorMessage) ParseWebhookEvent(
        string payload, string signature, string secret);
}

// Abstractions so Application doesn't depend on Stripe SDK
public record StripeCheckoutSession(string Id, string Url, string? PaymentIntentId, string? CustomerEmail);
public record StripeRefundResult(string Id, long Amount, string Status, string PaymentIntentId);

public record StripeCheckoutCompleted(
    string SessionId,
    string? PaymentIntentId,
    long? AmountTotal,
    string? Currency,
    string? CustomerEmail,
    Dictionary<string, string> Metadata
);

public record StripePaymentFailed(
    string PaymentIntentId,
    long Amount,
    string Currency
);
