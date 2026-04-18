using LumiSave.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace LumiSave.API.Controllers;

[ApiController]
[Route("api/webhooks")]
public class WebhooksController : ControllerBase
{
    private readonly IWebhookService _webhookService;
    private readonly ILogger<WebhooksController> _logger;

    public WebhooksController(IWebhookService webhookService, ILogger<WebhooksController> logger)
    {
        _webhookService = webhookService;
        _logger = logger;
    }

    [HttpPost("stripe")]
    public async Task<IActionResult> StripeWebhook(CancellationToken ct)
    {
        string payload;

        // Must read as raw string — do NOT use [FromBody]
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, leaveOpen: true);
        payload = await reader.ReadToEndAsync(ct);

        var stripeSignature = Request.Headers["Stripe-Signature"].ToString();

        try
        {
            await _webhookService.HandleStripeWebhookAsync(payload, stripeSignature, ct);
            // Always return 200 to Stripe, even for unhandled event types
            return Ok(new { received = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Stripe webhook");
            // Return 200 to prevent Stripe from retrying for signature failures
            return Ok(new { received = false, error = ex.Message });
        }
    }
}
