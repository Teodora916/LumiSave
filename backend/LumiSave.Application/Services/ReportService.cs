using LumiSave.Application.DTOs.Reports;
using LumiSave.Domain.Enums;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public interface IReportService
{
    Task<SalesReportDto> GetSalesReportAsync(DateTime from, DateTime to, string groupBy = "day", CancellationToken ct = default);
}

public class ReportService : IReportService
{
    private readonly IOrderRepository _orderRepo;

    public ReportService(IOrderRepository orderRepo)
    {
        _orderRepo = orderRepo;
    }

    public async Task<SalesReportDto> GetSalesReportAsync(
        DateTime from, DateTime to, string groupBy = "day", CancellationToken ct = default)
    {
        var validStatuses = new[]
        {
            OrderStatus.Paid, OrderStatus.Completed, OrderStatus.Delivered,
            OrderStatus.Processing, OrderStatus.Shipped
        };

        // Get all orders in range using the existing repository method
        var (allOrders, _) = await _orderRepo.GetAllPagedAsync(1, int.MaxValue, null, from, to, ct);
        var orders = allOrders
            .Where(o => validStatuses.Contains(o.Status))
            .ToList();

        var allItems = orders.SelectMany(o => o.Items ?? []).ToList();

        var topProducts = allItems
            .GroupBy(i => new { i.ProductId, i.ProductNameSnapshot })
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductNameSnapshot,
                UnitsSold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.TotalPrice)
            })
            .OrderByDescending(p => p.Revenue)
            .Take(10)
            .ToList();

        var salesByCategory = allItems
            .GroupBy(i => i.Product?.Category?.Name ?? "Unknown")
            .Select(g => new SalesByCategoryDto
            {
                CategoryName = g.Key,
                UnitsSold = g.Sum(i => i.Quantity),
                Revenue = g.Sum(i => i.TotalPrice)
            })
            .OrderByDescending(c => c.Revenue)
            .ToList();

        var totalRevenue = orders.Sum(o => o.TotalAmount);
        foreach (var cat in salesByCategory)
            cat.RevenuePercent = totalRevenue > 0 ? (cat.Revenue / totalRevenue * 100) : 0;

        IEnumerable<SalesByPeriodDto> salesByPeriod = groupBy.ToLower() switch
        {
            "month" => orders.GroupBy(o => new DateTime(o.CreatedAt.Year, o.CreatedAt.Month, 1))
                .Select(g => new SalesByPeriodDto
                {
                    Period = g.Key.ToString("yyyy-MM"),
                    Revenue = g.Sum(o => o.TotalAmount),
                    Orders = g.Count(),
                    UnitsSold = g.SelectMany(o => o.Items ?? []).Sum(i => i.Quantity)
                }),
            "week" => orders.GroupBy(o => o.CreatedAt.Date.AddDays(-(int)o.CreatedAt.DayOfWeek))
                .Select(g => new SalesByPeriodDto
                {
                    Period = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(o => o.TotalAmount),
                    Orders = g.Count(),
                    UnitsSold = g.SelectMany(o => o.Items ?? []).Sum(i => i.Quantity)
                }),
            _ => orders.GroupBy(o => o.CreatedAt.Date)
                .Select(g => new SalesByPeriodDto
                {
                    Period = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(o => o.TotalAmount),
                    Orders = g.Count(),
                    UnitsSold = g.SelectMany(o => o.Items ?? []).Sum(i => i.Quantity)
                })
        };

        return new SalesReportDto
        {
            TotalRevenue = totalRevenue,
            TotalOrders = orders.Count,
            TotalUnitsSold = allItems.Sum(i => i.Quantity),
            AverageOrderValue = orders.Any() ? orders.Average(o => o.TotalAmount) : 0,
            From = from,
            To = to,
            SalesByPeriod = salesByPeriod.OrderBy(p => p.Period).ToList(),
            TopProducts = topProducts,
            SalesByCategory = salesByCategory
        };
    }
}
