using LumiSave.Application.DTOs.Common;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;

namespace LumiSave.Application.Services;

public class SystemSettingDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = "string";
    public string? Description { get; set; }
}

public interface ISystemSettingService
{
    Task<IEnumerable<SystemSettingDto>> GetAllAsync(CancellationToken ct = default);
    Task<SystemSettingDto> UpdateAsync(Guid id, string value, CancellationToken ct = default);
    Task<decimal> GetDecimalAsync(string key, decimal defaultValue, CancellationToken ct = default);
    Task<string> GetStringAsync(string key, string defaultValue, CancellationToken ct = default);
}

public class SystemSettingService : ISystemSettingService
{
    private readonly ISystemSettingRepository _repo;

    public SystemSettingService(ISystemSettingRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<SystemSettingDto>> GetAllAsync(CancellationToken ct = default)
    {
        var settings = await _repo.GetAllSettingsAsync(ct);
        return settings.Select(s => new SystemSettingDto
        {
            Id = s.Id,
            Key = s.Key,
            Value = s.Value,
            Type = s.Type,
            Description = s.Description
        });
    }

    public async Task<SystemSettingDto> UpdateAsync(Guid id, string value, CancellationToken ct = default)
    {
        var setting = await _repo.GetByIdAsync(id, ct);
        if (setting == null) throw new Exception("Setting not found");

        setting.Value = value;
        await _repo.UpdateAsync(setting, ct);

        return new SystemSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Type = setting.Type,
            Description = setting.Description
        };
    }

    public async Task<decimal> GetDecimalAsync(string key, decimal defaultValue, CancellationToken ct = default)
    {
        var setting = await _repo.GetByKeyAsync(key, ct);
        if (setting != null && decimal.TryParse(setting.Value, out var val))
        {
            return val;
        }
        return defaultValue;
    }

    public async Task<string> GetStringAsync(string key, string defaultValue, CancellationToken ct = default)
    {
        var setting = await _repo.GetByKeyAsync(key, ct);
        return setting?.Value ?? defaultValue;
    }
}
