using System.ComponentModel.DataAnnotations;

namespace MovieTrackerBE.DTOs.Languages;

public class UpdateLanguageDto
{
    [Required(ErrorMessage = "Tên ngôn ngữ không được để trống.")]
    [StringLength(100, ErrorMessage = "Tên ngôn ngữ tối đa 100 ký tự.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(20, ErrorMessage = "Mã ngôn ngữ tối đa 20 ký tự.")]
    public string? Code { get; set; }
}
