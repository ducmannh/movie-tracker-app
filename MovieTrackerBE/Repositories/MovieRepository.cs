using Dapper;
using MovieTrackerBE.Data;
using MovieTrackerBE.DTOs.Movies;

namespace MovieTrackerBE.Repositories;

public class MovieRepository : IMovieRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    public MovieRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<MovieResponseDto>> GetUserMoviesAsync(Guid userId, string? status = null, string? search = null)
    {
        using var connection = _connectionFactory.CreateConnection();

        var query = """
            SELECT 
                Id,
                Title,
                MovieType,
                DurationMinutes,
                Season,
                EpisodeCount,
                ReleaseYear,
                Genre,
                Language,
                Actors,
                PosterUrl,
                TrailerUrl,
                Overview,
                Status,
                Rating,
                WatchedAt,
                CreatedAt,
                UpdatedAt
            FROM Movies
            WHERE UserId = @UserId
              AND (@Status IS NULL OR Status = @Status)
              AND (@Search IS NULL OR Title LIKE @SearchPattern OR Genre LIKE @SearchPattern OR Language LIKE @SearchPattern OR Actors LIKE @SearchPattern OR MovieType LIKE @SearchPattern)
            ORDER BY UpdatedAt DESC;
            """;

        var searchPattern = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";

        var list = await connection.QueryAsync<MovieResponseDto>(query, new
        {
            UserId = userId,
            Status = string.IsNullOrWhiteSpace(status) || status.Equals("All", StringComparison.OrdinalIgnoreCase) ? null : status,
            Search = searchPattern,
            SearchPattern = searchPattern
        });

        return list.ToList();
    }

    public async Task<MovieResponseDto?> GetUserMovieByIdAsync(Guid userId, int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT 
                Id,
                Title,
                MovieType,
                DurationMinutes,
                Season,
                EpisodeCount,
                ReleaseYear,
                Genre,
                Language,
                Actors,
                PosterUrl,
                TrailerUrl,
                Overview,
                Status,
                Rating,
                WatchedAt,
                CreatedAt,
                UpdatedAt
            FROM Movies
            WHERE Id = @Id AND UserId = @UserId;
            """;

        return await connection.QuerySingleOrDefaultAsync<MovieResponseDto>(sql, new { Id = id, UserId = userId });
    }

    public async Task<MovieResponseDto> CreateMovieAsync(Guid userId, CreateMovieRequestDto request)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            INSERT INTO Movies (UserId, Title, MovieType, DurationMinutes, Season, EpisodeCount, ReleaseYear, Genre, Language, Actors, PosterUrl, TrailerUrl, Overview, Status, Rating, WatchedAt, CreatedAt, UpdatedAt)
            VALUES (
                @UserId, 
                @Title, 
                @MovieType,
                @DurationMinutes,
                @Season,
                @EpisodeCount,
                @ReleaseYear, 
                @Genre, 
                @Language,
                @Actors,
                @PosterUrl, 
                @TrailerUrl,
                @Overview, 
                @Status, 
                @Rating, 
                CASE WHEN @Status = 'Watched' THEN GETUTCDATE() ELSE NULL END, 
                GETUTCDATE(), 
                GETUTCDATE()
            );

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;

        var movieId = await connection.ExecuteScalarAsync<int>(sql, new
        {
            UserId = userId,
            request.Title,
            MovieType = string.IsNullOrWhiteSpace(request.MovieType) ? "Movie" : request.MovieType,
            request.DurationMinutes,
            request.Season,
            request.EpisodeCount,
            request.ReleaseYear,
            request.Genre,
            request.Language,
            request.Actors,
            request.PosterUrl,
            request.TrailerUrl,
            request.Overview,
            request.Status,
            request.Rating
        });

        var created = await GetUserMovieByIdAsync(userId, movieId);
        return created!;
    }

    public async Task<MovieResponseDto?> UpdateMovieAsync(Guid userId, int id, UpdateMovieRequestDto request)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            UPDATE Movies
            SET Title = @Title,
                MovieType = @MovieType,
                DurationMinutes = @DurationMinutes,
                Season = @Season,
                EpisodeCount = @EpisodeCount,
                ReleaseYear = @ReleaseYear,
                Genre = @Genre,
                Language = @Language,
                Actors = @Actors,
                PosterUrl = @PosterUrl,
                TrailerUrl = @TrailerUrl,
                Overview = @Overview,
                Status = @Status,
                Rating = @Rating,
                WatchedAt = CASE 
                    WHEN @WatchedAt IS NOT NULL THEN @WatchedAt
                    WHEN @Status = 'Watched' AND WatchedAt IS NULL THEN GETUTCDATE()
                    WHEN @Status = 'PlanToWatch' THEN NULL
                    ELSE WatchedAt
                END,
                UpdatedAt = GETUTCDATE()
            WHERE Id = @Id AND UserId = @UserId;
            """;

        var affected = await connection.ExecuteAsync(sql, new
        {
            Id = id,
            UserId = userId,
            request.Title,
            MovieType = string.IsNullOrWhiteSpace(request.MovieType) ? "Movie" : request.MovieType,
            request.DurationMinutes,
            request.Season,
            request.EpisodeCount,
            request.ReleaseYear,
            request.Genre,
            request.Language,
            request.Actors,
            request.PosterUrl,
            request.TrailerUrl,
            request.Overview,
            request.Status,
            request.Rating,
            request.WatchedAt
        });

        if (affected == 0) return null;

        return await GetUserMovieByIdAsync(userId, id);
    }

    public async Task<MovieResponseDto?> UpdateStatusAsync(Guid userId, int id, string status)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            UPDATE Movies
            SET Status = @Status,
                WatchedAt = CASE 
                    WHEN @Status = 'Watched' AND WatchedAt IS NULL THEN GETUTCDATE()
                    WHEN @Status = 'PlanToWatch' THEN NULL
                    ELSE WatchedAt
                END,
                UpdatedAt = GETUTCDATE()
            WHERE Id = @Id AND UserId = @UserId;
            """;

        var affected = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId, Status = status });
        if (affected == 0) return null;

        return await GetUserMovieByIdAsync(userId, id);
    }

    public async Task<bool> DeleteMovieAsync(Guid userId, int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = "DELETE FROM Movies WHERE Id = @Id AND UserId = @UserId";
        var affected = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return affected > 0;
    }
}
