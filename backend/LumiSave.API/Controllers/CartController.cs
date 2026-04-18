using LumiSave.Application.DTOs.Cart;
using LumiSave.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LumiSave.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken ct)
        => Ok(await _cartService.GetCartAsync(UserId, ct));

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto, CancellationToken ct)
        => Ok(await _cartService.AddToCartAsync(UserId, dto, ct));

    [HttpPut("{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(
        Guid itemId, [FromBody] UpdateCartItemDto dto, CancellationToken ct)
        => Ok(await _cartService.UpdateCartItemAsync(UserId, itemId, dto, ct));

    [HttpDelete("{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId, CancellationToken ct)
        => Ok(await _cartService.RemoveFromCartAsync(UserId, itemId, ct));

    [HttpDelete]
    public async Task<IActionResult> ClearCart(CancellationToken ct)
    {
        await _cartService.ClearCartAsync(UserId, ct);
        return NoContent();
    }
}
