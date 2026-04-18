using Microsoft.AspNetCore.Identity;

namespace LumiSave.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<LedCalculatorSession> LedCalculatorSessions { get; set; } = new List<LedCalculatorSession>();
    public ICollection<SmartHomeCalculatorSession> SmartHomeCalculatorSessions { get; set; } = new List<SmartHomeCalculatorSession>();
}
