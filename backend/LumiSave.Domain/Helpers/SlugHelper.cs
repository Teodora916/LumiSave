using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;


namespace LumiSave.Domain.Helpers;

public static class SlugHelper
{
    public static string GenerateSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Normalize unicode characters
        var normalized = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        var slug = sb.ToString().Normalize(NormalizationForm.FormC);

        // Replace Serbian/Croatian chars
        slug = slug
            .Replace("č", "c").Replace("Č", "c")
            .Replace("ć", "c").Replace("Ć", "c")
            .Replace("š", "s").Replace("Š", "s")
            .Replace("ž", "z").Replace("Ž", "z")
            .Replace("đ", "dj").Replace("Đ", "dj")
            .Replace("&", "and")
            .ToLowerInvariant();

        // Replace spaces and special characters with hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        slug = slug.Trim('-');

        return slug;
    }
}
