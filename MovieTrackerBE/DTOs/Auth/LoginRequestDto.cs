using System.ComponentModel.DataAnnotations;

namespace MovieTrackerBE.DTOs.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "Tên đăng nhập hoặc Email không được để trống.")]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    public string Password { get; set; } = string.Empty;
}
