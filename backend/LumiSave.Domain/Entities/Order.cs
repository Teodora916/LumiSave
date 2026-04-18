using LumiSave.Domain.Enums;

namespace LumiSave.Domain.Entities;

public class Order : BaseEntity
{
    public Guid UserId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal TotalAmount { get; set; }

    // Shipping address snapshot
    public string ShippingFirstName { get; set; } = string.Empty;
    public string ShippingLastName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;

    // Stripe
    public string? StripeSessionId { get; set; }
    public string? StripePaymentIntentId { get; set; }

    public string? Notes { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public StripeTransaction? StripeTransaction { get; set; }
}
