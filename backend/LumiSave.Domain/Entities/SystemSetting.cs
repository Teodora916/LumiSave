using System.ComponentModel.DataAnnotations;

namespace LumiSave.Domain.Entities;

public class SystemSetting : BaseEntity
{
    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Value { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = "string"; // string, decimal, int, json

    [MaxLength(500)]
    public string? Description { get; set; }
}
