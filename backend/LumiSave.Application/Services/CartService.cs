using AutoMapper;
using LumiSave.Application.DTOs.Cart;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Exceptions;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId, CancellationToken ct = default);
    Task<CartDto> AddToCartAsync(Guid userId, AddToCartDto dto, CancellationToken ct = default);
    Task<CartDto> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemDto dto, CancellationToken ct = default);
    Task<CartDto> RemoveFromCartAsync(Guid userId, Guid cartItemId, CancellationToken ct = default);
    Task ClearCartAsync(Guid userId, CancellationToken ct = default);
}

public class CartService : ICartService
{
    private readonly ICartRepository _cartRepo;
    private readonly IProductRepository _productRepo;
    private readonly IMapper _mapper;

    public CartService(
        ICartRepository cartRepo,
        IProductRepository productRepo,
        IMapper mapper)
    {
        _cartRepo = cartRepo;
        _productRepo = productRepo;
        _mapper = mapper;
    }

    public async Task<CartDto> GetCartAsync(Guid userId, CancellationToken ct = default)
    {
        var items = await _cartRepo.GetCartByUserIdAsync(userId, ct);
        return new CartDto { Items = _mapper.Map<List<CartItemDto>>(items) };
    }

    public async Task<CartDto> AddToCartAsync(
        Guid userId, AddToCartDto dto, CancellationToken ct = default)
    {
        var product = await _productRepo.GetByIdAsync(dto.ProductId, ct)
            ?? throw new NotFoundException("Product", dto.ProductId);

        var existing = await _cartRepo.GetCartItemAsync(userId, dto.ProductId, ct);
        int currentQty = existing?.Quantity ?? 0;
        int newQty = currentQty + dto.Quantity;

        if (newQty > product.StockQuantity)
            throw new BusinessException(
                $"Insufficient stock. Only {product.StockQuantity - currentQty} items available.");

        if (existing != null)
        {
            existing.Quantity = newQty;
            await _cartRepo.UpdateAsync(existing, ct);
        }
        else
        {
            var item = new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };
            await _cartRepo.AddAsync(item, ct);
        }

        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto> UpdateCartItemAsync(
        Guid userId, Guid cartItemId, UpdateCartItemDto dto, CancellationToken ct = default)
    {
        var item = await _cartRepo.GetByIdAsync(cartItemId, ct)
            ?? throw new NotFoundException("Cart item", cartItemId);

        if (item.UserId != userId)
            throw new UnauthorizedException();

        var product = await _productRepo.GetByIdAsync(item.ProductId, ct)
            ?? throw new NotFoundException("Product", item.ProductId);

        if (dto.Quantity > product.StockQuantity)
            throw new BusinessException(
                $"Insufficient stock. Only {product.StockQuantity} items available.");

        item.Quantity = dto.Quantity;
        await _cartRepo.UpdateAsync(item, ct);
        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto> RemoveFromCartAsync(
        Guid userId, Guid cartItemId, CancellationToken ct = default)
    {
        var item = await _cartRepo.GetByIdAsync(cartItemId, ct)
            ?? throw new NotFoundException("Cart item", cartItemId);

        if (item.UserId != userId)
            throw new UnauthorizedException();

        await _cartRepo.DeleteAsync(cartItemId, ct);
        return await GetCartAsync(userId, ct);
    }

    public async Task ClearCartAsync(Guid userId, CancellationToken ct = default)
        => await _cartRepo.ClearCartAsync(userId, ct);
}
