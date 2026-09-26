using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieTrackerBE.DTOs.Common;
using MovieTrackerBE.DTOs.Languages;
using MovieTrackerBE.Repositories;

namespace MovieTrackerBE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LanguagesController : ControllerBase
{
    private readonly ILanguageRepository _languageRepository;
    private readonly ILogger<LanguagesController> _logger;

    public LanguagesController(ILanguageRepository languageRepository, ILogger<LanguagesController> logger)
    {
        _languageRepository = languageRepository;
        _logger = logger;
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (claim == null || !Guid.TryParse(claim.Value, out var userId))
        {
            return null;
        }
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetLanguages()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<List<LanguageDto>>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var languages = await _languageRepository.GetLanguagesAsync(userId.Value);
        return Ok(ApiResponse<List<LanguageDto>>.SuccessResult(languages, $"Đã tải {languages.Count} ngôn ngữ."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetLanguage(int id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<LanguageDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var language = await _languageRepository.GetLanguageByIdAsync(userId.Value, id);
        if (language == null)
        {
            return NotFound(ApiResponse<LanguageDto>.FailureResult("Không tìm thấy ngôn ngữ."));
        }

        return Ok(ApiResponse<LanguageDto>.SuccessResult(language));
    }

    [HttpPost]
    public async Task<IActionResult> CreateLanguage([FromBody] CreateLanguageDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<LanguageDto>.FailureResult("Dữ liệu không hợp lệ.", errors));
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<LanguageDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var created = await _languageRepository.CreateLanguageAsync(userId.Value, request);
        return CreatedAtAction(nameof(GetLanguage), new { id = created.Id }, ApiResponse<LanguageDto>.SuccessResult(created, "Thêm ngôn ngữ mới thành công."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateLanguage(int id, [FromBody] UpdateLanguageDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<LanguageDto>.FailureResult("Dữ liệu không hợp lệ.", errors));
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<LanguageDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var updated = await _languageRepository.UpdateLanguageAsync(userId.Value, id, request);
        if (updated == null)
        {
            return NotFound(ApiResponse<LanguageDto>.FailureResult("Không tìm thấy ngôn ngữ hoặc bạn không có quyền chỉnh sửa."));
        }

        return Ok(ApiResponse<LanguageDto>.SuccessResult(updated, "Cập nhật ngôn ngữ thành công."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLanguage(int id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<bool>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var success = await _languageRepository.DeleteLanguageAsync(userId.Value, id);
        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy ngôn ngữ cần xóa hoặc bạn không có quyền xóa."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa ngôn ngữ thành công."));
    }
}
