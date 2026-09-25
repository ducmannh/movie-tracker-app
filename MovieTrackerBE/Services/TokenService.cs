using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MovieTrackerBE.Models;

namespace MovieTrackerBE.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secret = jwtSettings["Secret"] 
            ?? throw new InvalidOperationException("JwtSettings:Secret chưa được thiết lập trong appsettings.json.");
        var issuer = jwtSettings["Issuer"] ?? "MovieTrackerBE";
        var audience = jwtSettings["Audience"] ?? "MovieTrackerFE";
        
        // Ưu tiên cấu hình AccessTokenExpirationInMinutes (mặc định 15 phút)
        var expirationMinutes = int.TryParse(jwtSettings["AccessTokenExpirationInMinutes"] ?? jwtSettings["ExpirationInMinutes"], out var minutes) 
            ? minutes 
            : 15;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return (tokenHandler.WriteToken(token), expiresAt);
    }

    public (string RefreshToken, DateTime ExpiresAt) GenerateRefreshToken()
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var expirationDays = int.TryParse(jwtSettings["RefreshTokenExpirationInDays"], out var days) 
            ? days 
            : 7;

        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var refreshToken = Convert.ToBase64String(randomBytes);

        var expiresAt = DateTime.UtcNow.AddDays(expirationDays);
        return (refreshToken, expiresAt);
    }
}
