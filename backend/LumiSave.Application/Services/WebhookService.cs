using LumiSave.Application.Interfaces;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Enums;
using LumiSave.Domain.Exceptions;
using LumiSave.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LumiSave.Application.Services;

public interface IWebhookService
{
    Task HandleStripeWebhookAsync(string payload, string stripeSignature, CancellationToken ct = default);
}

public class WebhookService : IWebhookService
{
    private readonly IStripeTransactionRepository _transactionRepo;
    private readonly IOrderRepository _orderRepo;
    private readonly ICartRepository _cartRepo;
    private readonly IProductRepository _productRepo;
    private readonly IEmailService _emailService;
    private readonly IStripeService _stripeService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;
    private readonly ILogger<WebhookService> _logger;

    public WebhookService(
        IStripeTransactionRepository transactionRepo,
        IOrderRepository orderRepo,
        ICartRepository cartRepo,
        IProductRepository productRepo,
        IEmailService emailService,
        IStripeService stripeService,
        UserManager<ApplicationUser> userManager,
        IConfiguration config,
        ILogger<WebhookService> logger)
    {
        _transactionRepo = transactionRepo;
        _orderRepo = orderRepo;
        _cartRepo = cartRepo;
        _productRepo = productRepo;
        _emailService = emailService;
        _stripeService = stripeService;
        _userManager = userManager;
        _config = config;
        _logger = logger;
    }

    public async Task HandleStripeWebhookAsync(
        string payload, string stripeSignature, CancellationToken ct = default)
    {
        var webhookSecret = _config["Stripe:WebhookSecret"]!;

        var (isValid, eventType, eventId, eventObject, errorMessage) =
            _stripeService.ParseWebhookEvent(payload, stripeSignature, webhookSecret);

        if (!isValid)
        {
            _logger.LogError("Stripe webhook signature verification failed: {Error}", errorMessage);
            throw new BusinessException("Invalid Stripe signature.", 400);
        }

        // Idempotency check
        if (await _transactionRepo.ExistsByStripeEventIdAsync(eventId, ct))
        {
            _logger.LogInformation("Duplicate Stripe event {EventId}, skipping", eventId);
            return;
        }

        _logger.LogInformation("Processing Stripe event: {EventType} ({EventId})", eventType, eventId);

        switch (eventType)
        {
            case "checkout.session.completed":
                if (eventObject is StripeCheckoutCompleted checkoutData)
                    await HandleCheckoutCompletedAsync(eventId, checkoutData, payload, ct);
                break;

            case "payment_intent.payment_failed":
                if (eventObject is StripePaymentFailed failedData)
                    await HandlePaymentFailedAsync(eventId, failedData, payload, ct);
                break;

            default:
                _logger.LogInformation("Unhandled Stripe event type: {Type}", eventType);
                break;
        }
    }

    private async Task HandleCheckoutCompletedAsync(
        string eventId, StripeCheckoutCompleted data, string rawPayload, CancellationToken ct)
    {
        var order = await _orderRepo.GetByStripeSessionIdAsync(data.SessionId, ct)
            ?? throw new NotFoundException($"Order with StripeSessionId '{data.SessionId}' not found.");

        order.Status = OrderStatus.Paid;
        order.StripePaymentIntentId = data.PaymentIntentId ?? string.Empty;

        // Reduce stock for each item using repository
        foreach (var item in order.Items)
            await _productRepo.UpdateStockAsync(item.ProductId, -item.Quantity, ct);

        // Record transaction
        var transaction = new StripeTransaction
        {
            OrderId = order.Id,
            StripeEventId = eventId,
            PaymentIntentId = data.PaymentIntentId ?? string.Empty,
            StripeSessionId = data.SessionId,
            Amount = (decimal)(data.AmountTotal ?? 0) / 100m,
            Currency = data.Currency ?? "rsd",
            Status = "succeeded",
            CustomerEmail = data.CustomerEmail,
            RawWebhookPayload = rawPayload
        };

        await _transactionRepo.AddAsync(transaction, ct);
        await _orderRepo.UpdateAsync(order, ct);

        // Clear cart
        await _cartRepo.ClearCartAsync(order.UserId, ct);

        // Get user for email
        var user = await _userManager.FindByIdAsync(order.UserId.ToString());

        // Send confirmation email
        await _emailService.SendOrderConfirmationAsync(
            user?.Email ?? data.CustomerEmail ?? string.Empty,
            order.ShippingFirstName,
            order.Id,
            order.TotalAmount,
            ct);
    }

    private async Task HandlePaymentFailedAsync(
        string eventId, StripePaymentFailed data, string rawPayload, CancellationToken ct)
    {
        var order = await _orderRepo.GetByStripeSessionIdAsync(data.PaymentIntentId, ct);

        if (order != null)
        {
            order.Status = OrderStatus.Cancelled;
            await _orderRepo.UpdateAsync(order, ct);
        }

        var transaction = new StripeTransaction
        {
            OrderId = order?.Id ?? Guid.Empty,
            StripeEventId = eventId,
            PaymentIntentId = data.PaymentIntentId,
            Amount = (decimal)data.Amount / 100m,
            Currency = data.Currency ?? "rsd",
            Status = "failed",
            RawWebhookPayload = rawPayload
        };

        await _transactionRepo.AddAsync(transaction, ct);
    }
}
