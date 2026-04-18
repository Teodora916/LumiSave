using AutoMapper;
using LumiSave.Application.DTOs.Common;
using LumiSave.Application.DTOs.Orders;
using LumiSave.Application.Interfaces;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Enums;
using LumiSave.Domain.Exceptions;
using LumiSave.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace LumiSave.Application.Services;

public interface IOrderService
{
    Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(
        Guid userId, CreateOrderDto dto, CancellationToken ct = default);

    Task<PagedResultDto<OrderSummaryDto>> GetUserOrdersAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default);

    Task<OrderDetailDto> GetOrderDetailAsync(
        Guid orderId, Guid userId, bool isAdmin, CancellationToken ct = default);

    Task<PagedResultDto<OrderSummaryDto>> GetAllOrdersAsync(
        int page, int pageSize, string? status = null,
        DateTime? from = null, DateTime? to = null, CancellationToken ct = default);

    Task<OrderDetailDto> UpdateOrderStatusAsync(
        Guid orderId, string status, CancellationToken ct = default);
}

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly ICartRepository _cartRepo;
    private readonly IProductRepository _productRepo;
    private readonly IStripeService _stripeService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;
    private readonly IMapper _mapper;

    public OrderService(
        IOrderRepository orderRepo,
        ICartRepository cartRepo,
        IProductRepository productRepo,
        IStripeService stripeService,
        UserManager<ApplicationUser> userManager,
        IConfiguration config,
        IMapper mapper)
    {
        _orderRepo = orderRepo;
        _cartRepo = cartRepo;
        _productRepo = productRepo;
        _stripeService = stripeService;
        _userManager = userManager;
        _config = config;
        _mapper = mapper;
    }

    public async Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(
        Guid userId, CreateOrderDto dto, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User", userId);

        var cartItems = (await _cartRepo.GetCartByUserIdAsync(userId, ct)).ToList();
        if (!cartItems.Any())
            throw new BusinessException("Your cart is empty.");

        // Validate stock
        foreach (var item in cartItems)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId, ct)
                ?? throw new NotFoundException("Product", item.ProductId);

            if (item.Quantity > product.StockQuantity)
                throw new BusinessException(
                    $"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}");
        }

        // Calculate costs
        var shippingThreshold = decimal.Parse(_config["Stripe:FreeShippingThresholdRsd"] ?? "5000");
        var shippingCost = decimal.Parse(_config["Stripe:ShippingCostRsd"] ?? "490");
        var taxRate = decimal.Parse(_config["Stripe:TaxRate"] ?? "0.20");

        var subTotal = cartItems.Sum(i => i.Product.Price * i.Quantity);
        var actualShipping = subTotal >= shippingThreshold ? 0 : shippingCost;
        var tax = subTotal * taxRate;
        var total = subTotal + actualShipping + tax;

        // Create order
        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            SubTotal = subTotal,
            TaxAmount = tax,
            ShippingCost = actualShipping,
            TotalAmount = total,
            ShippingFirstName = dto.ShippingFirstName,
            ShippingLastName = dto.ShippingLastName,
            ShippingAddress = dto.ShippingAddress,
            ShippingCity = dto.ShippingCity,
            ShippingPostalCode = dto.ShippingPostalCode,
            ShippingCountry = dto.ShippingCountry,
            ShippingPhone = dto.ShippingPhone,
            Notes = dto.Notes,
            Items = cartItems.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                ProductNameSnapshot = i.Product.Name,
                ProductSkuSnapshot = i.Product.SKU,
                Quantity = i.Quantity,
                UnitPrice = i.Product.Price,
                TotalPrice = i.Product.Price * i.Quantity
            }).ToList()
        };

        var createdOrder = await _orderRepo.AddAsync(order, ct);

        // Build Stripe line items
        var lineItems = cartItems.Select(i =>
        {
            string? imageUrl = null;
            if (!string.IsNullOrEmpty(i.Product.ImageUrls))
            {
                try
                {
                    var urls = System.Text.Json.JsonSerializer
                        .Deserialize<List<string>>(i.Product.ImageUrls);
                    imageUrl = urls?.FirstOrDefault();
                }
                catch { }
            }

            return (
                i.Product.Name,
                imageUrl,
                (long)(i.Product.Price * 100),
                (long)i.Quantity
            );
        }).ToList();

        var successUrl = _config["Frontend:SuccessUrl"]!;
        var cancelUrl = _config["Frontend:CancelUrl"]!;

        var session = await _stripeService.CreateCheckoutSessionAsync(
            user.Email!,
            lineItems,
            successUrl,
            cancelUrl,
            new Dictionary<string, string> { { "order_id", createdOrder.Id.ToString() } },
            ct);

        createdOrder.StripeSessionId = session.Id;
        await _orderRepo.UpdateAsync(createdOrder, ct);

        return new CheckoutSessionResponseDto
        {
            SessionId = session.Id,
            SessionUrl = session.Url
        };
    }

    public async Task<PagedResultDto<OrderSummaryDto>> GetUserOrdersAsync(
        Guid userId, int page, int pageSize, CancellationToken ct = default)
    {
        var (items, total) = await _orderRepo.GetByUserIdAsync(userId, page, pageSize, ct);
        return new PagedResultDto<OrderSummaryDto>
        {
            Items = _mapper.Map<IEnumerable<OrderSummaryDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailDto> GetOrderDetailAsync(
        Guid orderId, Guid userId, bool isAdmin, CancellationToken ct = default)
    {
        var order = await _orderRepo.GetOrderWithDetailsAsync(orderId, ct)
            ?? throw new NotFoundException("Order", orderId);

        if (!isAdmin && order.UserId != userId)
            throw new UnauthorizedException();

        return _mapper.Map<OrderDetailDto>(order);
    }

    public async Task<PagedResultDto<OrderSummaryDto>> GetAllOrdersAsync(
        int page, int pageSize, string? status = null,
        DateTime? from = null, DateTime? to = null, CancellationToken ct = default)
    {
        var (items, total) = await _orderRepo.GetAllPagedAsync(page, pageSize, status, from, to, ct);
        return new PagedResultDto<OrderSummaryDto>
        {
            Items = _mapper.Map<IEnumerable<OrderSummaryDto>>(items),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<OrderDetailDto> UpdateOrderStatusAsync(
        Guid orderId, string status, CancellationToken ct = default)
    {
        var order = await _orderRepo.GetOrderWithDetailsAsync(orderId, ct)
            ?? throw new NotFoundException("Order", orderId);

        if (!Enum.TryParse<OrderStatus>(status, true, out var newStatus))
            throw new BusinessException($"Invalid order status: {status}");

        order.Status = newStatus;
        await _orderRepo.UpdateAsync(order, ct);
        return _mapper.Map<OrderDetailDto>(order);
    }
}
