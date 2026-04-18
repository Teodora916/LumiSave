using AutoMapper;
using LumiSave.Application.DTOs.Reviews;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Exceptions;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public interface IReviewService
{
    Task<ProductReviewsDto> GetProductReviewsAsync(Guid productId, int page, int pageSize, CancellationToken ct = default);
    Task<ReviewDto> CreateReviewAsync(Guid userId, Guid productId, CreateReviewDto dto, CancellationToken ct = default);
    Task DeleteReviewAsync(Guid reviewId, Guid userId, bool isAdmin, CancellationToken ct = default);
}

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepo;
    private readonly IProductRepository _productRepo;
    private readonly IMapper _mapper;

    public ReviewService(
        IReviewRepository reviewRepo,
        IProductRepository productRepo,
        IMapper mapper)
    {
        _reviewRepo = reviewRepo;
        _productRepo = productRepo;
        _mapper = mapper;
    }

    public async Task<ProductReviewsDto> GetProductReviewsAsync(
        Guid productId, int page, int pageSize, CancellationToken ct = default)
    {
        var product = await _productRepo.GetByIdAsync(productId, ct)
            ?? throw new NotFoundException("Product", productId);

        var (reviews, total) = await _reviewRepo.GetByProductIdAsync(productId, page, pageSize, ct);
        var reviewList = reviews.ToList();

        var avg = reviewList.Any() ? reviewList.Average(r => r.Rating) : 0;
        var distribution = Enumerable.Range(1, 5)
            .ToDictionary(k => k, k => reviewList.Count(r => r.Rating == k));

        return new ProductReviewsDto
        {
            AverageRating = avg,
            ReviewCount = total,
            RatingDistribution = distribution,
            Reviews = _mapper.Map<IEnumerable<ReviewDto>>(reviewList),
            TotalPages = (int)Math.Ceiling((double)total / pageSize),
            Page = page
        };
    }

    public async Task<ReviewDto> CreateReviewAsync(
        Guid userId, Guid productId, CreateReviewDto dto, CancellationToken ct = default)
    {
        var product = await _productRepo.GetByIdAsync(productId, ct)
            ?? throw new NotFoundException("Product", productId);

        var hasPurchased = await _reviewRepo.UserHasPurchasedProductAsync(userId, productId, ct);
        if (!hasPurchased)
            throw new BusinessException("Only verified buyers can leave reviews.", 403);

        var existingReview = await _reviewRepo.GetByUserAndProductAsync(userId, productId, ct);
        if (existingReview != null)
            throw new ConflictException("You have already reviewed this product.");

        var review = new Review
        {
            ProductId = productId,
            UserId = userId,
            Rating = dto.Rating,
            Title = dto.Title,
            Comment = dto.Comment,
            IsVerifiedPurchase = true,
            IsApproved = true
        };

        var created = await _reviewRepo.AddAsync(review, ct);
        return _mapper.Map<ReviewDto>(created);
    }

    public async Task DeleteReviewAsync(
        Guid reviewId, Guid userId, bool isAdmin, CancellationToken ct = default)
    {
        var review = await _reviewRepo.GetByIdAsync(reviewId, ct)
            ?? throw new NotFoundException("Review", reviewId);

        if (!isAdmin && review.UserId != userId)
            throw new UnauthorizedException("You can only delete your own reviews.");

        await _reviewRepo.DeleteAsync(reviewId, ct);
    }
}
