using MovieTrackerBE.DTOs.Auth;
using MovieTrackerBE.DTOs.Common;

namespace MovieTrackerBE.Services;

public interface IAuthService
{
    Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request);
    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request);
    Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
    Task RevokeRefreshTokenAsync(Guid userId);
}
