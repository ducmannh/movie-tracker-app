namespace MovieTrackerBE.DTOs.Languages;

public class LanguageDto
{
    public int Id { get; set; }
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public bool IsDefault => UserId == null;
}
