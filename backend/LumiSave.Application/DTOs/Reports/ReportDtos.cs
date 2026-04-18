namespace LumiSave.Application.DTOs.Reports;

public class SalesReportDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TotalUnitsSold { get; set; }
    public decimal AverageOrderValue { get; set; }
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public List<SalesByPeriodDto> SalesByPeriod { get; set; } = [];
    public List<TopProductDto> TopProducts { get; set; } = [];
    public List<SalesByCategoryDto> SalesByCategory { get; set; } = [];
}

public class SalesByPeriodDto
{
    public string Period { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Orders { get; set; }
    public int UnitsSold { get; set; }
}

public class TopProductDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}

public class SalesByCategoryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
    public decimal RevenuePercent { get; set; }
}
