using LumiSave.Domain.Enums;

namespace LumiSave.Application.DTOs.Orders;

public class CreateOrderDto
{
    public string ShippingFirstName { get; set; } = string.Empty;
    public string ShippingLastName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? StripeSessionId { get; set; }
}

public class OrderDetailDto : OrderSummaryDto
{
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingCost { get; set; }
    public string ShippingFirstName { get; set; } = string.Empty;
    public string ShippingLastName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
    public StripeTransactionSummaryDto? StripeTransaction { get; set; }
}

public class OrderItemDto
{
    public Guid ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;
    public string ProductSkuSnapshot { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string? ProductImageUrl { get; set; }
}

public class StripeTransactionSummaryDto
{
    public string PaymentIntentId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ReceiptUrl { get; set; }
    public bool IsRefunded { get; set; }
}

public class CheckoutSessionResponseDto
{
    public string SessionId { get; set; } = string.Empty;
    public string SessionUrl { get; set; } = string.Empty;
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = string.Empty;
}
