using LumiSave.Domain.Entities;

namespace LumiSave.Domain.Interfaces;

public interface ISystemSettingRepository : IRepository<SystemSetting>
{
    Task<SystemSetting?> GetByKeyAsync(string key, CancellationToken ct = default);
    Task<IEnumerable<SystemSetting>> GetAllSettingsAsync(CancellationToken ct = default);
}
