using System.ComponentModel.DataAnnotations;

namespace MovieTrackerBE.DTOs.Movies;

public class CreateMovieRequestDto
{
    [Required(ErrorMessage = "Tên phim không được để trống.")]
    public string Title { get; set; } = string.Empty;

    public string? EnglishTitle { get; set; }

    [RegularExpression("^(Movie|Series)$", ErrorMessage = "Loại phim chỉ có thể là 'Movie' hoặc 'Series'.")]
    public string MovieType { get; set; } = "Movie";

    [Range(1, 10000, ErrorMessage = "Thời lượng phim phải lớn hơn 0 phút.")]
    public int? DurationMinutes { get; set; }

    [Range(1, 100, ErrorMessage = "Season phải từ 1 trở lên.")]
    public int? Season { get; set; }

    [Range(1, 5000, ErrorMessage = "Số tập phải lớn hơn 0.")]
    public int? EpisodeCount { get; set; }

    [Range(1888, 2100, ErrorMessage = "Năm phát hành không hợp lệ.")]
    public int? ReleaseYear { get; set; }

    public string? Genre { get; set; }
    public string? Language { get; set; }

    public string? Actors { get; set; }

    public string? PosterUrl { get; set; }

    [RegularExpression(@"^(https?://)?((www|m)\.)?(youtube\.com/(watch\?v=|embed/|shorts/|v/)|youtu\.be/)[\w\-]+.*$", 
        ErrorMessage = "Đường link Trailer chỉ chấp nhận liên kết video từ YouTube (ví dụ: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...).")]
    public string? TrailerUrl { get; set; }

    public string? Overview { get; set; }

    [Required(ErrorMessage = "Trạng thái theo dõi là bắt buộc.")]
    [RegularExpression("^(Watched|PlanToWatch)$", ErrorMessage = "Trạng thái chỉ có thể là 'Watched' hoặc 'PlanToWatch'.")]
    public string Status { get; set; } = "Watched";

    [Range(0, 10, ErrorMessage = "Điểm đánh giá phải từ 0 đến 10.")]
    public double? Rating { get; set; }
}
