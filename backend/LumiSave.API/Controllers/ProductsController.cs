using LumiSave.Application.DTOs.Products;
using LumiSave.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LumiSave.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filter, CancellationToken ct)
        => Ok(await _productService.GetPagedAsync(filter, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _productService.GetByIdAsync(id, ct));

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
        => Ok(await _productService.GetBySlugAsync(slug, ct));

    [Authorize(Roles = "ADMIN")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto, CancellationToken ct)
    {
        var result = await _productService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto, CancellationToken ct)
        => Ok(await _productService.UpdateAsync(id, dto, ct));

    [Authorize(Roles = "ADMIN")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _productService.DeleteAsync(id, ct);
        return NoContent();
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPatch("{id:guid}/stock")]
    public async Task<IActionResult> UpdateStock(
        Guid id, [FromBody] UpdateStockDto dto, CancellationToken ct)
        => Ok(await _productService.UpdateStockAsync(id, dto, ct));
}
