using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Repositories;

public class SystemSettingRepository : GenericRepository<SystemSetting>, ISystemSettingRepository
{
    public SystemSettingRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<SystemSetting?> GetByKeyAsync(string key, CancellationToken ct = default)
    {
        return await _dbSet.FirstOrDefaultAsync(s => s.Key == key, ct);
    }

    public async Task<IEnumerable<SystemSetting>> GetAllSettingsAsync(CancellationToken ct = default)
    {
        return await _dbSet.ToListAsync(ct);
    }
}
