using LumiSave.Application.DTOs.Reviews;
using LumiSave.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LumiSave.API.Controllers;

[ApiController]
[Route("api/products/{productId:guid}/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet]
    public async Task<IActionResult> GetReviews(
        Guid productId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
        => Ok(await _reviewService.GetProductReviewsAsync(productId, page, pageSize, ct));

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateReview(
        Guid productId, [FromBody] CreateReviewDto dto, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _reviewService.CreateReviewAsync(userId, productId, dto, ct);
        return CreatedAtAction(nameof(GetReviews), new { productId }, result);
    }

    [Authorize]
    [HttpDelete("{reviewId:guid}")]
    public async Task<IActionResult> DeleteReview(
        Guid productId, Guid reviewId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = User.IsInRole("ADMIN");
        await _reviewService.DeleteReviewAsync(reviewId, userId, isAdmin, ct);
        return NoContent();
    }
}
