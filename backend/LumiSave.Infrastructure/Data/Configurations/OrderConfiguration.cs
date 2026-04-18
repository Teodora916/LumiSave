using LumiSave.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LumiSave.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.SubTotal).HasColumnType("decimal(10,2)");
        builder.Property(o => o.TaxAmount).HasColumnType("decimal(10,2)");
        builder.Property(o => o.ShippingCost).HasColumnType("decimal(10,2)");
        builder.Property(o => o.TotalAmount).HasColumnType("decimal(10,2)");
        builder.Property(o => o.Status).HasConversion<string>();

        builder.Property(o => o.ShippingFirstName).IsRequired().HasMaxLength(200);
        builder.Property(o => o.ShippingLastName).IsRequired().HasMaxLength(200);
        builder.Property(o => o.ShippingAddress).IsRequired().HasMaxLength(500);
        builder.Property(o => o.ShippingCity).IsRequired().HasMaxLength(200);
        builder.Property(o => o.ShippingPostalCode).IsRequired().HasMaxLength(20);
        builder.Property(o => o.ShippingCountry).IsRequired().HasMaxLength(200);
        builder.Property(o => o.ShippingPhone).IsRequired().HasMaxLength(50);

        builder.HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.StripeTransaction)
            .WithOne(t => t.Order)
            .HasForeignKey<StripeTransaction>(t => t.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
