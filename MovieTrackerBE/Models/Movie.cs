namespace MovieTrackerBE.Models;

public class Movie
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? EnglishTitle { get; set; }
    public string MovieType { get; set; } = "Movie"; // "Movie" | "Series"
    public int? DurationMinutes { get; set; }
    public int? Season { get; set; }
    public int? EpisodeCount { get; set; }
    public int? ReleaseYear { get; set; }
    public string? Genre { get; set; }
    public string? Language { get; set; }
    public string? Actors { get; set; }
    public string? PosterUrl { get; set; }
    public string? TrailerUrl { get; set; }
    public string? Overview { get; set; }
    public string Status { get; set; } = "Watched"; // "Watched" | "PlanToWatch"
    public double? Rating { get; set; }
    public DateTime? WatchedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
