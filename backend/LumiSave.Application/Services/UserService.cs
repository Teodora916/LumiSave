using AutoMapper;
using LumiSave.Application.DTOs.Common;
using LumiSave.Application.DTOs.Users;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Exceptions;
using Microsoft.AspNetCore.Identity;

namespace LumiSave.Application.Services;

public interface IUserService
{
    Task<PagedResultDto<UserDto>> GetAllUsersAsync(int page, int pageSize, string? search, CancellationToken ct = default);
    Task<UserDetailDto> GetUserByIdAsync(Guid userId, CancellationToken ct = default);
    Task<UserDto> ToggleUserActiveAsync(Guid userId, CancellationToken ct = default);
    Task<UserDto> UpdateUserRoleAsync(Guid userId, string role, CancellationToken ct = default);
}

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public UserService(UserManager<ApplicationUser> userManager, IMapper mapper)
    {
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<UserDto>> GetAllUsersAsync(
        int page, int pageSize, string? search, CancellationToken ct = default)
    {
        IQueryable<ApplicationUser> query = _userManager.Users;

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(s)) ||
                u.FirstName.ToLower().Contains(s) ||
                u.LastName.ToLower().Contains(s));
        }

        var total = query.Count();
        var users = query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var dtos = new List<UserDto>();
        foreach (var user in users)
        {
            var dto = _mapper.Map<UserDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            dto.Role = roles.FirstOrDefault();
            dtos.Add(dto);
        }

        return new PagedResultDto<UserDto>
        {
            Items = dtos,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<UserDetailDto> GetUserByIdAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User", userId);
        var dto = _mapper.Map<UserDetailDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        dto.Role = roles.FirstOrDefault();
        return dto;
    }

    public async Task<UserDto> ToggleUserActiveAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User", userId);

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);

        var dto = _mapper.Map<UserDto>(user);
        var roles = await _userManager.GetRolesAsync(user);
        dto.Role = roles.FirstOrDefault();
        return dto;
    }

    public async Task<UserDto> UpdateUserRoleAsync(
        Guid userId, string role, CancellationToken ct = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User", userId);

        if (role != "ADMIN" && role != "CUSTOMER")
            throw new BusinessException($"Invalid role: {role}. Must be ADMIN or CUSTOMER.");

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, role);

        var dto = _mapper.Map<UserDto>(user);
        dto.Role = role;
        return dto;
    }
}
