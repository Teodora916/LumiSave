using System.Text.Json;
using AutoMapper;
using LumiSave.Application.DTOs.Common;
using LumiSave.Application.DTOs.Products;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Exceptions;
using LumiSave.Domain.Helpers;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public interface IProductService
{
    Task<PagedResultDto<ProductListDto>> GetPagedAsync(ProductFilterDto filter, CancellationToken ct = default);
    Task<ProductDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ProductDetailDto> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<ProductDetailDto> CreateAsync(CreateProductDto dto, CancellationToken ct = default);
    Task<ProductDetailDto> UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<ProductDetailDto> UpdateStockAsync(Guid id, UpdateStockDto dto, CancellationToken ct = default);
    Task<List<ProductListDto>> GetLedReplacementsAsync(string bulbType, int wattage, CancellationToken ct = default);
}

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IMapper _mapper;

    public ProductService(
        IProductRepository productRepo,
        ICategoryRepository categoryRepo,
        IMapper mapper)
    {
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<ProductListDto>> GetPagedAsync(
        ProductFilterDto filter, CancellationToken ct = default)
    {
        var (items, total) = await _productRepo.GetPagedAsync(
            filter.Page, filter.PageSize,
            filter.Search, filter.CategoryId,
            filter.SortBy, filter.SortDirection,
            filter.MinPrice, filter.MaxPrice,
            filter.Protocol, filter.IsSmartDevice, filter.BulbType, ct);

        return new PagedResultDto<ProductListDto>
        {
            Items = _mapper.Map<IEnumerable<ProductListDto>>(items),
            TotalCount = total,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ProductDetailDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _productRepo.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Product", id);
        return _mapper.Map<ProductDetailDto>(product);
    }

    public async Task<ProductDetailDto> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var product = await _productRepo.GetBySlugAsync(slug, ct)
            ?? throw new NotFoundException($"Product with slug '{slug}' was not found.");
        return _mapper.Map<ProductDetailDto>(product);
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductDto dto, CancellationToken ct = default)
    {
        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId, ct)
            ?? throw new NotFoundException("Category", dto.CategoryId);

        if (!string.IsNullOrWhiteSpace(dto.SKU))
        {
            var existing = await _productRepo.GetBySKUAsync(dto.SKU, ct);
            if (existing != null)
                throw new ConflictException($"SKU '{dto.SKU}' is already in use.");
        }

        var product = _mapper.Map<Product>(dto);
        product.Slug = SlugHelper.GenerateSlug(dto.Name);
        product.ImageUrls = dto.ImageUrlsJson;
        product.Specifications = dto.SpecificationsJson;

        // Ensure slug uniqueness
        var existingSlug = await _productRepo.GetBySlugAsync(product.Slug, ct);
        if (existingSlug != null)
            product.Slug = $"{product.Slug}-{Guid.NewGuid().ToString()[..4]}";

        var created = await _productRepo.AddAsync(product, ct);
        return _mapper.Map<ProductDetailDto>(created);
    }

    public async Task<ProductDetailDto> UpdateAsync(
        Guid id, UpdateProductDto dto, CancellationToken ct = default)
    {
        var product = await _productRepo.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Product", id);

        if (dto.Name != null)
        {
            product.Name = dto.Name;
            product.Slug = SlugHelper.GenerateSlug(dto.Name);
        }
        if (dto.Description != null) product.Description = dto.Description;
        if (dto.ShortDescription != null) product.ShortDescription = dto.ShortDescription;
        if (dto.Price.HasValue) product.Price = dto.Price.Value;
        if (dto.CompareAtPrice.HasValue) product.CompareAtPrice = dto.CompareAtPrice.Value;
        if (dto.LowStockThreshold.HasValue) product.LowStockThreshold = dto.LowStockThreshold.Value;
        if (dto.IsFeatured.HasValue) product.IsFeatured = dto.IsFeatured.Value;
        if (dto.IsActive.HasValue) product.IsActive = dto.IsActive.Value;
        if (dto.CategoryId.HasValue) product.CategoryId = dto.CategoryId.Value;
        if (dto.Brand != null) product.Brand = dto.Brand;
        if (dto.ImageUrlsJson != null) product.ImageUrls = dto.ImageUrlsJson;
        if (dto.SpecificationsJson != null) product.Specifications = dto.SpecificationsJson;
        if (dto.WattageOld.HasValue) product.WattageOld = dto.WattageOld;
        if (dto.WattageLed.HasValue) product.WattageLed = dto.WattageLed;
        if (dto.LuminousFlux.HasValue) product.LuminousFlux = dto.LuminousFlux;
        if (dto.ColorTemperature.HasValue) product.ColorTemperature = dto.ColorTemperature;
        if (dto.CRI.HasValue) product.CRI = dto.CRI;
        if (dto.SocketType != null) product.SocketType = dto.SocketType;
        if (dto.BulbType != null) product.BulbType = dto.BulbType;
        if (dto.IsDimmable.HasValue) product.IsDimmable = dto.IsDimmable.Value;
        if (dto.SmartProtocol != null) product.SmartProtocol = dto.SmartProtocol;
        if (dto.StandbyWattage.HasValue) product.StandbyWattage = dto.StandbyWattage;
        if (dto.IsSmartDevice.HasValue) product.IsSmartDevice = dto.IsSmartDevice.Value;
        if (dto.SmartHomeCategory != null) product.SmartHomeCategory = dto.SmartHomeCategory;

        await _productRepo.UpdateAsync(product, ct);
        return _mapper.Map<ProductDetailDto>(product);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _productRepo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Product", id);
        product.IsActive = false;
        await _productRepo.UpdateAsync(product, ct);
    }

    public async Task<ProductDetailDto> UpdateStockAsync(
        Guid id, UpdateStockDto dto, CancellationToken ct = default)
    {
        await _productRepo.UpdateStockAsync(id, dto.Quantity, ct);
        var product = await _productRepo.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Product", id);
        return _mapper.Map<ProductDetailDto>(product);
    }

    public async Task<List<ProductListDto>> GetLedReplacementsAsync(
        string bulbType, int wattage, CancellationToken ct = default)
    {
        var products = await _productRepo.GetLedReplacementsAsync(bulbType, wattage, ct);
        return _mapper.Map<List<ProductListDto>>(products);
    }
}
