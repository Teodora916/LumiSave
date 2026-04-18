using LumiSave.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace LumiSave.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOrderConfirmationAsync(
        string toEmail, string firstName, Guid orderId,
        decimal totalAmount, CancellationToken ct = default)
    {
        var subject = $"Order Confirmation — LumiSave #{orderId.ToString()[..8].ToUpper()}";
        var body = $"""
            <html><body>
            <h2>Thank you for your order, {firstName}!</h2>
            <p>Your order <strong>#{orderId.ToString()[..8].ToUpper()}</strong> has been confirmed.</p>
            <p>Total: <strong>{totalAmount:N2} RSD</strong></p>
            <p>You will receive a shipping notification when your order is dispatched.</p>
            <br/>
            <p>Best regards,<br/>The LumiSave Team</p>
            </body></html>
            """;

        await SendAsync(toEmail, firstName, subject, body, ct);
    }

    public async Task SendAsync(
        string toEmail, string toName, string subject,
        string htmlBody, CancellationToken ct = default)
    {
        try
        {
            var host = _config["Email:Host"];
            var port = int.Parse(_config["Email:Port"] ?? "587");
            var username = _config["Email:Username"];
            var password = _config["Email:Password"];
            var fromAddress = _config["Email:FromAddress"] ?? "noreply@lumisave.rs";
            var fromName = _config["Email:FromName"] ?? "LumiSave";

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                _logger.LogWarning("Email credentials not configured. Skipping email to {ToEmail}", toEmail);
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromAddress));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(username, password, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            _logger.LogInformation("Email sent to {ToEmail}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
        }
    }
}
