using LumiSave.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LumiSave.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.UnitPrice).HasColumnType("decimal(10,2)");
        builder.Property(oi => oi.TotalPrice).HasColumnType("decimal(10,2)");
        builder.Property(oi => oi.ProductNameSnapshot).IsRequired().HasMaxLength(300);
        builder.Property(oi => oi.ProductSkuSnapshot).IsRequired().HasMaxLength(100);

        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oi => oi.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
