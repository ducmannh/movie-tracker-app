using MovieTrackerBE.Models;

namespace MovieTrackerBE.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail);
    Task<Guid> CreateAsync(User user);
    Task<bool> ExistsByEmailAsync(string email);
    Task<bool> ExistsByUsernameAsync(string username);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task UpdateRefreshTokenAsync(Guid userId, string? refreshToken, DateTime? expiryTime);
    Task EnsureSchemaAsync();
}
