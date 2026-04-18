using LumiSave.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Stripe.Checkout;

namespace LumiSave.Infrastructure.Services;

public class StripeService : IStripeService
{
    private readonly IConfiguration _config;
    private readonly ILogger<StripeService> _logger;

    public StripeService(IConfiguration config, ILogger<StripeService> logger)
    {
        _config = config;
        _logger = logger;
        StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
    }

    public async Task<StripeCheckoutSession> CreateCheckoutSessionAsync(
        string customerEmail,
        List<(string Name, string? ImageUrl, long UnitAmountRsd, long Quantity)> lineItems,
        string successUrl, string cancelUrl,
        Dictionary<string, string>? metadata = null,
        CancellationToken ct = default)
    {
        var sessionService = new SessionService();

        var options = new SessionCreateOptions
        {
            CustomerEmail = customerEmail,
            PaymentMethodTypes = ["card"],
            LineItems = lineItems.Select(li => new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    UnitAmount = li.UnitAmountRsd,
                    Currency = _config["Stripe:Currency"] ?? "rsd",
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = li.Name,
                        Images = li.ImageUrl != null ? [li.ImageUrl] : null
                    }
                },
                Quantity = li.Quantity
            }).ToList(),
            Mode = "payment",
            SuccessUrl = successUrl,
            CancelUrl = cancelUrl,
            Metadata = metadata
        };

        var session = await sessionService.CreateAsync(options, cancellationToken: ct);
        _logger.LogInformation("Stripe Checkout session created: {SessionId}", session.Id);

        return new StripeCheckoutSession(
            session.Id,
            session.Url,
            session.PaymentIntentId,
            customerEmail);
    }

    public async Task<StripeRefundResult> CreateRefundAsync(
        string paymentIntentId, long? amountRsd = null,
        string? reason = null, CancellationToken ct = default)
    {
        var refundService = new RefundService();
        var options = new RefundCreateOptions
        {
            PaymentIntent = paymentIntentId,
            Amount = amountRsd,
            Reason = reason ?? "requested_by_customer"
        };

        var refund = await refundService.CreateAsync(options, cancellationToken: ct);
        _logger.LogInformation("Stripe refund created: {RefundId} for PI {PaymentIntentId}",
            refund.Id, paymentIntentId);

        return new StripeRefundResult(refund.Id, refund.Amount, refund.Status, paymentIntentId);
    }

    public (bool IsValid, string EventType, string EventId, object? EventObject, string ErrorMessage)
        ParseWebhookEvent(string payload, string signature, string secret)
    {
        try
        {
            var stripeEvent = EventUtility.ConstructEvent(payload, signature, secret);

            object? eventObject = stripeEvent.Type switch
            {
                "checkout.session.completed" when stripeEvent.Data.Object is Session session =>
                    new StripeCheckoutCompleted(
                        session.Id,
                        session.PaymentIntentId,
                        session.AmountTotal,
                        session.Currency,
                        session.CustomerEmail,
                        session.Metadata ?? new Dictionary<string, string>()),

                "payment_intent.payment_failed" when stripeEvent.Data.Object is PaymentIntent pi =>
                    new StripePaymentFailed(pi.Id, pi.Amount, pi.Currency),

                _ => null
            };

            return (true, stripeEvent.Type, stripeEvent.Id, eventObject, string.Empty);
        }
        catch (StripeException ex)
        {
            return (false, string.Empty, string.Empty, null, ex.Message);
        }
    }
}
