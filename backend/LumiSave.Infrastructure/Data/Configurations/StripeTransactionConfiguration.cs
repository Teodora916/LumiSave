using LumiSave.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LumiSave.Infrastructure.Data.Configurations;

public class StripeTransactionConfiguration : IEntityTypeConfiguration<StripeTransaction>
{
    public void Configure(EntityTypeBuilder<StripeTransaction> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Amount).HasColumnType("decimal(10,2)");
        builder.Property(t => t.RefundedAmount).HasColumnType("decimal(10,2)");
        builder.Property(t => t.StripeEventId).IsRequired().HasMaxLength(200);
        builder.HasIndex(t => t.StripeEventId).IsUnique();
        builder.Property(t => t.PaymentIntentId).IsRequired().HasMaxLength(200);
        builder.Property(t => t.Currency).HasMaxLength(10);
        builder.Property(t => t.Status).IsRequired().HasMaxLength(50);
    }
}
