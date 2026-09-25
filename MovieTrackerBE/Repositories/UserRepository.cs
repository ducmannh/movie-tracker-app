using Dapper;
using MovieTrackerBE.Data;
using MovieTrackerBE.Models;

namespace MovieTrackerBE.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task EnsureSchemaAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'RefreshToken')
            BEGIN
                ALTER TABLE Users ADD RefreshToken NVARCHAR(500) NULL;
                ALTER TABLE Users ADD RefreshTokenExpiryTime DATETIME2 NULL;
                IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_RefreshToken')
                BEGIN
                    CREATE INDEX IX_Users_RefreshToken ON Users(RefreshToken);
                END
            END
            """;
        await connection.ExecuteAsync(sql);
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE Id = @Id";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE Email = @Email";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE Username = @Username";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE Username = @Input OR Email = @Input";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Input = usernameOrEmail });
    }

    public async Task<Guid> CreateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            INSERT INTO Users (Id, Username, Email, PasswordHash, FullName, RefreshToken, RefreshTokenExpiryTime)
            VALUES (@Id, @Username, @Email, @PasswordHash, @FullName, @RefreshToken, @RefreshTokenExpiryTime);
            """;
        await connection.ExecuteAsync(sql, user);
        return user.Id;
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT COUNT(1) FROM Users WHERE Email = @Email";
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Email = email });
        return count > 0;
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT COUNT(1) FROM Users WHERE Username = @Username";
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Username = username });
        return count > 0;
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE RefreshToken = @RefreshToken";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { RefreshToken = refreshToken });
    }

    public async Task UpdateRefreshTokenAsync(Guid userId, string? refreshToken, DateTime? expiryTime)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            UPDATE Users 
            SET RefreshToken = @RefreshToken, 
                RefreshTokenExpiryTime = @ExpiryTime 
            WHERE Id = @UserId;
            """;
        await connection.ExecuteAsync(sql, new 
        { 
            UserId = userId, 
            RefreshToken = refreshToken, 
            ExpiryTime = expiryTime 
        });
    }
}
