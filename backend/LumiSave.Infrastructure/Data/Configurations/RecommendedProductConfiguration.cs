using LumiSave.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LumiSave.Infrastructure.Data.Configurations;

public class RecommendedProductConfiguration : IEntityTypeConfiguration<RecommendedProduct>
{
    public void Configure(EntityTypeBuilder<RecommendedProduct> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.ReasonCode).IsRequired().HasMaxLength(100);
        builder.Property(r => r.ReasonDescription).HasMaxLength(500);

        builder.HasOne(r => r.LedSession)
            .WithMany(s => s.RecommendedProducts)
            .HasForeignKey(r => r.LedSessionId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        builder.HasOne(r => r.SmartHomeSession)
            .WithMany(s => s.RecommendedProducts)
            .HasForeignKey(r => r.SmartHomeSessionId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        builder.HasOne(r => r.Product)
            .WithMany(p => p.RecommendedProducts)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
