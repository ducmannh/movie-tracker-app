using Dapper;
using MovieTrackerBE.Data;
using MovieTrackerBE.DTOs.Languages;

namespace MovieTrackerBE.Repositories;

public class LanguageRepository : ILanguageRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<LanguageRepository> _logger;

    public LanguageRepository(IDbConnectionFactory connectionFactory, ILogger<LanguageRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<List<LanguageDto>> GetLanguagesAsync(Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            SELECT Id, UserId, Name, Code
            FROM Languages
            WHERE UserId IS NULL OR UserId = @UserId
            ORDER BY CASE WHEN UserId IS NULL THEN 0 ELSE 1 END, Name ASC;
            """;
        var list = await connection.QueryAsync<LanguageDto>(sql, new { UserId = userId });
        return list.ToList();
    }

    public async Task<LanguageDto?> GetLanguageByIdAsync(Guid userId, int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            SELECT Id, UserId, Name, Code
            FROM Languages
            WHERE Id = @Id AND (UserId IS NULL OR UserId = @UserId);
            """;
        return await connection.QuerySingleOrDefaultAsync<LanguageDto>(sql, new { Id = id, UserId = userId });
    }

    public async Task<LanguageDto> CreateLanguageAsync(Guid userId, CreateLanguageDto request)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            INSERT INTO Languages (UserId, Name, Code, CreatedAt)
            VALUES (@UserId, @Name, @Code, GETUTCDATE());

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;
        var id = await connection.ExecuteScalarAsync<int>(sql, new
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Code = request.Code?.Trim()
        });

        var created = await GetLanguageByIdAsync(userId, id);
        return created!;
    }

    public async Task<LanguageDto?> UpdateLanguageAsync(Guid userId, int id, UpdateLanguageDto request)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            UPDATE Languages
            SET Name = @Name,
                Code = @Code
            WHERE Id = @Id AND (UserId = @UserId OR UserId IS NULL);
            """;
        var rows = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            UserId = userId,
            Name = request.Name.Trim(),
            Code = request.Code?.Trim()
        });

        if (rows == 0) return null;
        return await GetLanguageByIdAsync(userId, id);
    }

    public async Task<bool> DeleteLanguageAsync(Guid userId, int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            DELETE FROM Languages
            WHERE Id = @Id AND (UserId = @UserId OR UserId IS NULL);
            """;
        var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rows > 0;
    }
}
