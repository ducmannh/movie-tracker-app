using MovieTrackerBE.DTOs.Languages;

namespace MovieTrackerBE.Repositories;

public interface ILanguageRepository
{
    Task<List<LanguageDto>> GetLanguagesAsync(Guid userId);
    Task<LanguageDto?> GetLanguageByIdAsync(Guid userId, int id);
    Task<LanguageDto> CreateLanguageAsync(Guid userId, CreateLanguageDto request);
    Task<LanguageDto?> UpdateLanguageAsync(Guid userId, int id, UpdateLanguageDto request);
    Task<bool> DeleteLanguageAsync(Guid userId, int id);
}
