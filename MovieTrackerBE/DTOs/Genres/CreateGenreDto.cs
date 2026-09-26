using System.ComponentModel.DataAnnotations;

namespace MovieTrackerBE.DTOs.Genres;

public class CreateGenreDto
{
    [Required(ErrorMessage = "Tên thể loại không được để trống.")]
    [StringLength(100, ErrorMessage = "Tên thể loại tối đa 100 ký tự.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(255, ErrorMessage = "Mô tả tối đa 255 ký tự.")]
    public string? Description { get; set; }
}
