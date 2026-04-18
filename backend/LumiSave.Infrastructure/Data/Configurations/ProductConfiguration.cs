using LumiSave.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LumiSave.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(300);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(300);
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.SKU).IsRequired().HasMaxLength(100);
        builder.HasIndex(p => p.SKU).IsUnique();
        builder.Property(p => p.Description).IsRequired();
        builder.Property(p => p.Price).HasColumnType("decimal(10,2)");
        builder.Property(p => p.CompareAtPrice).HasColumnType("decimal(10,2)");
        builder.Property(p => p.StandbyWattage).HasColumnType("decimal(5,2)");

        // JSONB columns for PostgreSQL
        builder.Property(p => p.ImageUrls).HasColumnType("jsonb");
        builder.Property(p => p.Specifications).HasColumnType("jsonb");

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Soft delete query filter
        builder.HasQueryFilter(p => p.IsActive);
    }
}
