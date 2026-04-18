using LumiSave.Application.DTOs.Calculator;
using LumiSave.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LumiSave.API.Controllers;

[ApiController]
[Route("api/calculator")]
public class CalculatorController : ControllerBase
{
    private readonly ILedCalculatorService _ledService;
    private readonly ISmartHomeCalculatorService _smartHomeService;

    public CalculatorController(
        ILedCalculatorService ledService,
        ISmartHomeCalculatorService smartHomeService)
    {
        _ledService = ledService;
        _smartHomeService = smartHomeService;
    }

    private Guid? TryGetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    [HttpPost("led")]
    public async Task<IActionResult> CalculateLed(
        [FromBody] LedCalculatorInputDto dto, CancellationToken ct)
    {
        var userId = TryGetUserId();
        var result = await _ledService.CalculateAsync(dto, userId, ct);
        return Ok(result);
    }

    [HttpPost("smarthome")]
    public async Task<IActionResult> CalculateSmartHome(
        [FromBody] SmartHomeCalculatorInputDto dto, CancellationToken ct)
    {
        var userId = TryGetUserId();
        var result = await _smartHomeService.CalculateAsync(dto, userId, ct);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("sessions/led")]
    public async Task<IActionResult> GetLedSessions(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _ledService.GetUserSessionsAsync(userId, ct));
    }

    [Authorize]
    [HttpGet("sessions/smarthome")]
    public async Task<IActionResult> GetSmartHomeSessions(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _smartHomeService.GetUserSessionsAsync(userId, ct));
    }

    [Authorize]
    [HttpGet("sessions/led/{id:guid}")]
    public async Task<IActionResult> GetLedSession(Guid id, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _ledService.GetSessionAsync(id, userId, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [Authorize]
    [HttpGet("sessions/smarthome/{id:guid}")]
    public async Task<IActionResult> GetSmartHomeSession(Guid id, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _smartHomeService.GetSessionAsync(id, userId, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
