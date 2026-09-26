using MovieTrackerBE.DTOs.Movies;

namespace MovieTrackerBE.Repositories;

public interface IMovieRepository
{
    Task<List<MovieResponseDto>> GetUserMoviesAsync(Guid userId, string? status = null, string? search = null);
    Task<MovieResponseDto?> GetUserMovieByIdAsync(Guid userId, int id);
    Task<MovieResponseDto> CreateMovieAsync(Guid userId, CreateMovieRequestDto request);
    Task<MovieResponseDto?> UpdateMovieAsync(Guid userId, int id, UpdateMovieRequestDto request);
    Task<MovieResponseDto?> UpdateStatusAsync(Guid userId, int id, string status);
    Task<bool> DeleteMovieAsync(Guid userId, int id);
}
