namespace MovieTrackerBE.DTOs.Genres;

public class GenreDto
{
    public int Id { get; set; }
    public Guid? UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsDefault => UserId == null;
}
