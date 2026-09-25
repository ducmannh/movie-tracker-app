using MovieTrackerBE.Models;

namespace MovieTrackerBE.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateJwtToken(User user);
    (string RefreshToken, DateTime ExpiresAt) GenerateRefreshToken();
}
