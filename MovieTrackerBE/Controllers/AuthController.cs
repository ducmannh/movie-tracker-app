using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieTrackerBE.DTOs.Auth;
using MovieTrackerBE.DTOs.Common;
using MovieTrackerBE.Services;

namespace MovieTrackerBE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Đăng ký tài khoản người dùng mới
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.FailureResult("Dữ liệu đầu vào không hợp lệ.", errors));
        }

        var result = await _authService.RegisterAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        // Lưu Access Token & Refresh Token vào HttpOnly Cookie
        if (result.Data != null)
        {
            SetTokenCookies(
                result.Data.Token, 
                result.Data.ExpiresAt, 
                result.Data.RefreshToken, 
                result.Data.RefreshTokenExpiresAt
            );
        }

        return Ok(result);
    }

    /// <summary>
    /// Đăng nhập tài khoản
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<AuthResponseDto>.FailureResult("Dữ liệu đầu vào không hợp lệ.", errors));
        }

        var result = await _authService.LoginAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        // Lưu Access Token & Refresh Token vào HttpOnly Cookie
        if (result.Data != null)
        {
            SetTokenCookies(
                result.Data.Token, 
                result.Data.ExpiresAt, 
                result.Data.RefreshToken, 
                result.Data.RefreshTokenExpiresAt
            );
        }

        return Ok(result);
    }

    /// <summary>
    /// Tự động gia hạn Access Token bằng Refresh Token (Đọc từ HttpOnly Cookie hoặc Body)
    /// </summary>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] RefreshTokenRequestDto? body)
    {
        // 1. Lấy Refresh Token từ Cookie hoặc từ Request Body
        var refreshToken = Request.Cookies["refreshToken"] ?? body?.RefreshToken;

        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            ClearTokenCookies();
            return Unauthorized(ApiResponse<AuthResponseDto>.FailureResult("Không tìm thấy Refresh Token. Vui lòng đăng nhập lại."));
        }

        // 2. Gọi service kiểm tra và sinh token mới
        var result = await _authService.RefreshTokenAsync(refreshToken);
        if (!result.Success)
        {
            ClearTokenCookies();
            return Unauthorized(result);
        }

        // 3. Cập nhật Cookies với Access Token và Refresh Token mới
        if (result.Data != null)
        {
            SetTokenCookies(
                result.Data.Token, 
                result.Data.ExpiresAt, 
                result.Data.RefreshToken, 
                result.Data.RefreshTokenExpiresAt
            );
        }

        return Ok(result);
    }

    /// <summary>
    /// Đăng xuất: Xóa Cookies và thu hồi Refresh Token trong CSDL
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        // Thu hồi refresh token trong CSDL nếu user đã được xác thực
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
        {
            await _authService.RevokeRefreshTokenAsync(userId);
        }

        ClearTokenCookies();
        return Ok(ApiResponse<string>.SuccessResult("Đã đăng xuất thành công."));
    }

    /// <summary>
    /// Lấy thông tin tài khoản hiện tại từ JWT Token
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiResponse<UserDto>.FailureResult("Token không hợp lệ hoặc đã hết hạn."));
        }

        var result = await _authService.GetCurrentUserAsync(userId);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    private void SetTokenCookies(string accessToken, DateTime accessExpiresAt, string? refreshToken, DateTime? refreshExpiresAt)
    {
        // 1. Cookie Access Token
        Response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = accessExpiresAt,
            Path = "/"
        });

        // 2. Cookie Refresh Token
        if (!string.IsNullOrEmpty(refreshToken) && refreshExpiresAt.HasValue)
        {
            Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Lax,
                Expires = refreshExpiresAt.Value,
                Path = "/"
            });
        }
    }

    private void ClearTokenCookies()
    {
        Response.Cookies.Delete("accessToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });
    }
}
