using LumiSave.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LumiSave.Infrastructure.Data.Configurations;

public class SmartHomeCalculatorSessionConfiguration : IEntityTypeConfiguration<SmartHomeCalculatorSession>
{
    public void Configure(EntityTypeBuilder<SmartHomeCalculatorSession> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.TotalAnnualSavingsRsd).HasColumnType("decimal(12,2)");
        builder.Property(s => s.TotalAnnualSavingsKwh).HasColumnType("decimal(12,2)");
        builder.Property(s => s.TotalInvestmentRsd).HasColumnType("decimal(12,2)");
        builder.Property(s => s.Co2ReductionKg).HasColumnType("decimal(12,2)");
        builder.Property(s => s.VampirePowerSavingsRsd).HasColumnType("decimal(12,2)");
        builder.Property(s => s.SmartPlugSavingsRsd).HasColumnType("decimal(12,2)");
        builder.Property(s => s.ThermostatSavingsRsd).HasColumnType("decimal(12,2)");
        builder.Property(s => s.LightingAutomationSavingsRsd).HasColumnType("decimal(12,2)");
        builder.Property(s => s.SolarSavingsRsd).HasColumnType("decimal(12,2)");
        builder.Property(s => s.InputJson).HasColumnType("jsonb");
        builder.Property(s => s.ResultJson).HasColumnType("jsonb");

        builder.HasOne(s => s.User)
            .WithMany(u => u.SmartHomeCalculatorSessions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}
