using MovieTrackerBE.DTOs.Auth;
using MovieTrackerBE.DTOs.Common;
using MovieTrackerBE.Models;
using MovieTrackerBE.Repositories;

namespace MovieTrackerBE.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Kiểm tra username đã tồn tại chưa
        if (await _userRepository.ExistsByUsernameAsync(request.Username.Trim()))
        {
            return ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.");
        }

        // 2. Kiểm tra email đã tồn tại chưa
        if (await _userRepository.ExistsByEmailAsync(request.Email.Trim().ToLower()))
        {
            return ApiResponse<AuthResponseDto>.FailureResult("Email này đã được đăng ký tài khoản.");
        }

        // 3. Hash mật khẩu bằng BCrypt
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 4. Khởi tạo đối tượng User
        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            FullName = request.FullName?.Trim()
        };

        // 5. Tạo Access Token (JWT) & Refresh Token
        var (token, expiresAt) = _tokenService.GenerateJwtToken(newUser);
        var (refreshToken, refreshExpiresAt) = _tokenService.GenerateRefreshToken();

        newUser.RefreshToken = refreshToken;
        newUser.RefreshTokenExpiryTime = refreshExpiresAt;

        // 6. Lưu vào Database qua Dapper
        await _userRepository.CreateAsync(newUser);

        var userDto = MapToUserDto(newUser);

        return ApiResponse<AuthResponseDto>.SuccessResult(
            new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                RefreshToken = refreshToken,
                RefreshTokenExpiresAt = refreshExpiresAt,
                User = userDto
            },
            "Đăng ký tài khoản thành công!"
        );
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var input = request.UsernameOrEmail.Trim();

        // 1. Tìm user theo username hoặc email
        var user = await _userRepository.GetByUsernameOrEmailAsync(input);
        if (user == null)
        {
            return ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập/email hoặc mật khẩu không chính xác.");
        }

        // 2. Xác thực mật khẩu
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return ApiResponse<AuthResponseDto>.FailureResult("Tên đăng nhập/email hoặc mật khẩu không chính xác.");
        }

        // 3. Tạo Access Token & Refresh Token
        var (token, expiresAt) = _tokenService.GenerateJwtToken(user);
        var (refreshToken, refreshExpiresAt) = _tokenService.GenerateRefreshToken();

        // 4. Cập nhật Refresh Token vào Database
        await _userRepository.UpdateRefreshTokenAsync(user.Id, refreshToken, refreshExpiresAt);

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = refreshExpiresAt;

        var userDto = MapToUserDto(user);

        return ApiResponse<AuthResponseDto>.SuccessResult(
            new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                RefreshToken = refreshToken,
                RefreshTokenExpiresAt = refreshExpiresAt,
                User = userDto
            },
            "Đăng nhập thành công!"
        );
    }

    public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return ApiResponse<AuthResponseDto>.FailureResult("Refresh Token không hợp lệ.");
        }

        // 1. Tìm User sở hữu Refresh Token này trong Database
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken);
        if (user == null || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return ApiResponse<AuthResponseDto>.FailureResult("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
        }

        // 2. Tạo Access Token mới & xoay vòng Refresh Token mới (Token Rotation)
        var (newAccessToken, newAccessExpiresAt) = _tokenService.GenerateJwtToken(user);
        var (newRefreshToken, newRefreshExpiresAt) = _tokenService.GenerateRefreshToken();

        // 3. Cập nhật Refresh Token mới vào Database
        await _userRepository.UpdateRefreshTokenAsync(user.Id, newRefreshToken, newRefreshExpiresAt);

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = newRefreshExpiresAt;

        var userDto = MapToUserDto(user);

        return ApiResponse<AuthResponseDto>.SuccessResult(
            new AuthResponseDto
            {
                Token = newAccessToken,
                ExpiresAt = newAccessExpiresAt,
                RefreshToken = newRefreshToken,
                RefreshTokenExpiresAt = newRefreshExpiresAt,
                User = userDto
            },
            "Gia hạn Token thành công!"
        );
    }

    public async Task RevokeRefreshTokenAsync(Guid userId)
    {
        await _userRepository.UpdateRefreshTokenAsync(userId, null, null);
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return ApiResponse<UserDto>.FailureResult("Không tìm thấy thông tin người dùng.");
        }

        return ApiResponse<UserDto>.SuccessResult(MapToUserDto(user));
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName
        };
    }
}
