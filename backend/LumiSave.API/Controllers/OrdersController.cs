using LumiSave.Application.DTOs.Orders;
using LumiSave.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LumiSave.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin => User.IsInRole("ADMIN");

    [Authorize]
    [HttpPost("checkout")]
    public async Task<IActionResult> CreateCheckout(
        [FromBody] CreateOrderDto dto, CancellationToken ct)
        => Ok(await _orderService.CreateCheckoutSessionAsync(UserId, dto, ct));

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetMyOrders(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
        => Ok(await _orderService.GetUserOrdersAsync(UserId, page, pageSize, ct));

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken ct)
        => Ok(await _orderService.GetOrderDetailAsync(id, UserId, IsAdmin, ct));

    [Authorize(Roles = "ADMIN")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null,
        CancellationToken ct = default)
        => Ok(await _orderService.GetAllOrdersAsync(page, pageSize, status, from, to, ct));

    [Authorize(Roles = "ADMIN")]
    [HttpPatch("admin/{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id, [FromBody] UpdateOrderStatusDto dto, CancellationToken ct)
        => Ok(await _orderService.UpdateOrderStatusAsync(id, dto.Status, ct));
}
