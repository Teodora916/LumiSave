namespace LumiSave.Application.DTOs.Cart;

public class CartDto
{
    public List<CartItemDto> Items { get; set; } = [];
    public decimal TotalAmount => Items.Sum(i => i.TotalPrice);
    public int ItemCount => Items.Sum(i => i.Quantity);
}

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductSlug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; }
}

public class AddToCartDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartItemDto
{
    public int Quantity { get; set; }
}
