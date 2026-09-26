using MovieTrackerBE.DTOs.Genres;

namespace MovieTrackerBE.Repositories;

public interface IGenreRepository
{
    Task<List<GenreDto>> GetGenresAsync(Guid userId);
    Task<GenreDto?> GetGenreByIdAsync(Guid userId, int id);
    Task<GenreDto> CreateGenreAsync(Guid userId, CreateGenreDto request);
    Task<GenreDto?> UpdateGenreAsync(Guid userId, int id, UpdateGenreDto request);
    Task<bool> DeleteGenreAsync(Guid userId, int id);
}
