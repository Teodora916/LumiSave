using LumiSave.Application.DTOs.Stripe;
using LumiSave.Application.DTOs.Users;
using LumiSave.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LumiSave.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IStripeAdminService _stripeAdminService;
    private readonly IReportService _reportService;
    private readonly ISystemSettingService _settingService;

    public AdminController(
        IUserService userService,
        IStripeAdminService stripeAdminService,
        IReportService reportService,
        ISystemSettingService settingService)
    {
        _userService = userService;
        _stripeAdminService = stripeAdminService;
        _reportService = reportService;
        _settingService = settingService;
    }

    // ─── Users ───

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
        => Ok(await _userService.GetAllUsersAsync(page, pageSize, search, ct));

    [HttpGet("users/{id:guid}")]
    public async Task<IActionResult> GetUser(Guid id, CancellationToken ct)
        => Ok(await _userService.GetUserByIdAsync(id, ct));

    [HttpPatch("users/{id:guid}/toggle")]
    public async Task<IActionResult> ToggleUser(Guid id, CancellationToken ct)
        => Ok(await _userService.ToggleUserActiveAsync(id, ct));

    [HttpPatch("users/{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(
        Guid id, [FromBody] UpdateUserRoleDto dto, CancellationToken ct)
        => Ok(await _userService.UpdateUserRoleAsync(id, dto.Role, ct));

    // ─── Transactions ───

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] TransactionFilterDto filter, CancellationToken ct)
        => Ok(await _stripeAdminService.GetTransactionsAsync(filter, ct));

    [HttpGet("transactions/stats")]
    public async Task<IActionResult> GetTransactionStats(CancellationToken ct)
        => Ok(await _stripeAdminService.GetTransactionStatsAsync(ct));

    [HttpPost("transactions/{id:guid}/refund")]
    public async Task<IActionResult> RefundTransaction(
        Guid id, [FromBody] RefundRequestDto dto, CancellationToken ct)
        => Ok(await _stripeAdminService.RefundTransactionAsync(id, dto, ct));

    // ─── Reports ───

    [HttpGet("reports/sales")]
    public async Task<IActionResult> GetSalesReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] string groupBy = "day",
        CancellationToken ct = default)
        => Ok(await _reportService.GetSalesReportAsync(from, to, groupBy, ct));

    // ─── Settings ───

    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings(CancellationToken ct)
        => Ok(await _settingService.GetAllAsync(ct));

    [HttpPut("settings/{id:guid}")]
    public async Task<IActionResult> UpdateSetting(
        Guid id, [FromBody] UpdateSettingDto dto, CancellationToken ct)
        => Ok(await _settingService.UpdateAsync(id, dto.Value, ct));
}

public class UpdateSettingDto
{
    public string Value { get; set; } = string.Empty;
}
