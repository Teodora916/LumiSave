using System.Text.Json;
using AutoMapper;
using LumiSave.Application.DTOs.Cart;
using LumiSave.Application.DTOs.Categories;
using LumiSave.Application.DTOs.Orders;
using LumiSave.Application.DTOs.Products;
using LumiSave.Application.DTOs.Reviews;
using LumiSave.Application.DTOs.Stripe;
using LumiSave.Application.DTOs.Users;
using LumiSave.Domain.Entities;

namespace LumiSave.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Products ──

        CreateMap<Product, ProductListDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : ""))
            .ForMember(d => d.AverageRating, o => o.MapFrom(s =>
                s.Reviews != null && s.Reviews.Any() ? s.Reviews.Average(r => r.Rating) : 0.0))
            .ForMember(d => d.ReviewCount, o => o.MapFrom(s => s.Reviews != null ? s.Reviews.Count : 0))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s =>
                GetFirstImageUrl(s.ImageUrls)))
            .ForMember(d => d.IsLowStock, o => o.MapFrom(s =>
                s.StockQuantity <= s.LowStockThreshold));

        CreateMap<Product, ProductDetailDto>()
            .IncludeBase<Product, ProductListDto>()
            .ForMember(d => d.ImageUrls, o => o.MapFrom(s =>
                DeserializeList(s.ImageUrls)))
            .ForMember(d => d.Specifications, o => o.MapFrom(s =>
                DeserializeDict(s.Specifications)));

        CreateMap<CreateProductDto, Product>()
            .ForMember(d => d.ImageUrls, o => o.MapFrom(s => s.ImageUrlsJson))
            .ForMember(d => d.Specifications, o => o.MapFrom(s => s.SpecificationsJson))
            .ForMember(d => d.IsActive, o => o.MapFrom(_ => true));

        // ── Cart ──

        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
            .ForMember(d => d.ProductSlug, o => o.MapFrom(s => s.Product.Slug))
            .ForMember(d => d.Price, o => o.MapFrom(s => s.Product.Price))
            .ForMember(d => d.TotalPrice, o => o.MapFrom(s => s.Product.Price * s.Quantity))
            .ForMember(d => d.StockQuantity, o => o.MapFrom(s => s.Product.StockQuantity))
            .ForMember(d => d.IsAvailable, o => o.MapFrom(s =>
                s.Product.IsActive && s.Product.StockQuantity >= s.Quantity))
            .ForMember(d => d.ImageUrl, o => o.MapFrom(s =>
                GetFirstImageUrl(s.Product.ImageUrls)));

        // ── Orders ──

        CreateMap<Order, OrderSummaryDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.ItemCount, o => o.MapFrom(s =>
                s.Items != null ? s.Items.Sum(i => i.Quantity) : 0));

        CreateMap<Order, OrderDetailDto>()
            .IncludeBase<Order, OrderSummaryDto>()
            .ForMember(d => d.Items, o => o.MapFrom(s => s.Items))
            .ForMember(d => d.StripeTransaction, o => o.MapFrom(s => s.StripeTransaction));

        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.ProductImageUrl, o => o.MapFrom(s =>
                s.Product != null ? GetFirstImageUrl(s.Product.ImageUrls) : null));

        CreateMap<StripeTransaction, StripeTransactionSummaryDto>()
            .ForMember(d => d.IsRefunded, o => o.MapFrom(s => s.RefundId != null));

        // ── Stripe ──

        CreateMap<StripeTransaction, StripeTransactionDto>()
            .ForMember(d => d.IsRefunded, o => o.MapFrom(s => s.RefundId != null));

        // ── Reviews ──

        CreateMap<Review, ReviewDto>()
            .ForMember(d => d.UserFullName, o => o.MapFrom(s =>
                s.User != null ? $"{s.User.FirstName} {s.User.LastName}".Trim() : ""));

        // ── Categories ──

        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.ProductCount, o => o.MapFrom(s =>
                s.Products != null ? s.Products.Count : 0))
            .ForMember(d => d.SubCategories, o => o.MapFrom(s => s.SubCategories));

        CreateMap<CreateCategoryDto, Category>()
            .ForMember(d => d.IsActive, o => o.MapFrom(_ => true));

        // ── Users ──

        CreateMap<ApplicationUser, UserDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s =>
                $"{s.FirstName} {s.LastName}".Trim()));

        CreateMap<ApplicationUser, UserDetailDto>()
            .IncludeBase<ApplicationUser, UserDto>();
    }

    private static string? GetFirstImageUrl(string? imageUrlsJson)
    {
        if (string.IsNullOrEmpty(imageUrlsJson)) return null;
        try
        {
            var urls = JsonSerializer.Deserialize<List<string>>(imageUrlsJson);
            return urls?.FirstOrDefault();
        }
        catch { return null; }
    }

    private static List<string> DeserializeList(string? json)
    {
        if (string.IsNullOrEmpty(json)) return [];
        try { return JsonSerializer.Deserialize<List<string>>(json) ?? []; }
        catch { return []; }
    }

    private static Dictionary<string, string> DeserializeDict(string? json)
    {
        if (string.IsNullOrEmpty(json)) return [];
        try { return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? []; }
        catch { return []; }
    }
}
