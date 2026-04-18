namespace LumiSave.Application.DTOs.Reviews;

public class CreateReviewDto
{
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsVerifiedPurchase { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProductReviewsDto
{
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = [];
    public IEnumerable<ReviewDto> Reviews { get; set; } = [];
    public int TotalPages { get; set; }
    public int Page { get; set; }
}
