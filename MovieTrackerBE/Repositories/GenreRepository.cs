using Dapper;
using MovieTrackerBE.Data;
using MovieTrackerBE.DTOs.Genres;

namespace MovieTrackerBE.Repositories;

public class GenreRepository : IGenreRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<GenreRepository> _logger;

    public GenreRepository(IDbConnectionFactory connectionFactory, ILogger<GenreRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<List<GenreDto>> GetGenresAsync(Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            SELECT Id, UserId, Name, Description
            FROM Genres
            WHERE UserId IS NULL OR UserId = @UserId
            ORDER BY CASE WHEN UserId IS NULL THEN 0 ELSE 1 END, Name ASC;
            """;
        var list = await connection.QueryAsync<GenreDto>(sql, new { UserId = userId });
        return list.ToList();
    }

    public async Task<GenreDto?> GetGenreByIdAsync(Guid userId, int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            SELECT Id, UserId, Name, Description
            FROM Genres
            WHERE Id = @Id AND (UserId IS NULL OR UserId = @UserId);
            """;
        return await connection.QuerySingleOrDefaultAsync<GenreDto>(sql, new { Id = id, UserId = userId });
    }

    public async Task<GenreDto> CreateGenreAsync(Guid userId, CreateGenreDto request)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            INSERT INTO Genres (UserId, Name, Description, CreatedAt)
            VALUES (@UserId, @Name, @Description, GETUTCDATE());

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;
        var id = await connection.ExecuteScalarAsync<int>(sql, new
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim()
        });

        var created = await GetGenreByIdAsync(userId, id);
        return created!;
    }

    public async Task<GenreDto?> UpdateGenreAsync(Guid userId, int id, UpdateGenreDto request)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            UPDATE Genres
            SET Name = @Name,
                Description = @Description
            WHERE Id = @Id AND (UserId = @UserId OR UserId IS NULL);
            """;
        var rows = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            UserId = userId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim()
        });

        if (rows == 0) return null;
        return await GetGenreByIdAsync(userId, id);
    }

    public async Task<bool> DeleteGenreAsync(Guid userId, int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = """
            DELETE FROM Genres
            WHERE Id = @Id AND (UserId = @UserId OR UserId IS NULL);
            """;
        var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rows > 0;
    }
}
