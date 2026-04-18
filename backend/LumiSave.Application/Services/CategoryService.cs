using AutoMapper;
using LumiSave.Application.DTOs.Categories;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Exceptions;
using LumiSave.Domain.Helpers;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<CategoryDto> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken ct = default);
    Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryDto dto, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepo;
    private readonly IMapper _mapper;

    public CategoryService(ICategoryRepository categoryRepo, IMapper mapper)
    {
        _categoryRepo = categoryRepo;
        _mapper = mapper;
    }

    public async Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var categories = await _categoryRepo.GetAllActiveAsync(ct);
        return _mapper.Map<List<CategoryDto>>(categories);
    }

    public async Task<CategoryDto> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var category = await _categoryRepo.GetBySlugAsync(slug, ct)
            ?? throw new NotFoundException($"Category with slug '{slug}' was not found.");
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, CancellationToken ct = default)
    {
        var slug = SlugHelper.GenerateSlug(dto.Name);
        var existing = await _categoryRepo.GetBySlugAsync(slug, ct);
        if (existing != null)
            throw new ConflictException($"Category with slug '{slug}' already exists.");

        var category = new Category
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            SortOrder = dto.SortOrder,
            ParentCategoryId = dto.ParentCategoryId,
            IsActive = true
        };

        var created = await _categoryRepo.AddAsync(category, ct);
        return _mapper.Map<CategoryDto>(created);
    }

    public async Task<CategoryDto> UpdateAsync(
        Guid id, UpdateCategoryDto dto, CancellationToken ct = default)
    {
        var category = await _categoryRepo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Category", id);

        if (dto.Name != null)
        {
            category.Name = dto.Name;
            category.Slug = SlugHelper.GenerateSlug(dto.Name);
        }
        if (dto.Description != null) category.Description = dto.Description;
        if (dto.ImageUrl != null) category.ImageUrl = dto.ImageUrl;
        if (dto.SortOrder.HasValue) category.SortOrder = dto.SortOrder.Value;
        if (dto.ParentCategoryId.HasValue) category.ParentCategoryId = dto.ParentCategoryId.Value;
        if (dto.IsActive.HasValue) category.IsActive = dto.IsActive.Value;

        await _categoryRepo.UpdateAsync(category, ct);
        return _mapper.Map<CategoryDto>(category);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _categoryRepo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Category", id);

        var hasProducts = await _categoryRepo.HasActiveProductsAsync(id, ct);
        if (hasProducts)
            throw new BusinessException("Cannot delete category with active products.");

        category.IsActive = false;
        await _categoryRepo.UpdateAsync(category, ct);
    }
}
