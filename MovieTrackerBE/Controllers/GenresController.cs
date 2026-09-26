using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieTrackerBE.DTOs.Common;
using MovieTrackerBE.DTOs.Genres;
using MovieTrackerBE.Repositories;

namespace MovieTrackerBE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GenresController : ControllerBase
{
    private readonly IGenreRepository _genreRepository;
    private readonly ILogger<GenresController> _logger;

    public GenresController(IGenreRepository genreRepository, ILogger<GenresController> logger)
    {
        _genreRepository = genreRepository;
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
    public async Task<IActionResult> GetGenres()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<List<GenreDto>>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var genres = await _genreRepository.GetGenresAsync(userId.Value);
        return Ok(ApiResponse<List<GenreDto>>.SuccessResult(genres, $"Đã tải {genres.Count} thể loại."));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetGenre(int id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<GenreDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var genre = await _genreRepository.GetGenreByIdAsync(userId.Value, id);
        if (genre == null)
        {
            return NotFound(ApiResponse<GenreDto>.FailureResult("Không tìm thấy thể loại."));
        }

        return Ok(ApiResponse<GenreDto>.SuccessResult(genre));
    }

    [HttpPost]
    public async Task<IActionResult> CreateGenre([FromBody] CreateGenreDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<GenreDto>.FailureResult("Dữ liệu không hợp lệ.", errors));
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<GenreDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var created = await _genreRepository.CreateGenreAsync(userId.Value, request);
        return CreatedAtAction(nameof(GetGenre), new { id = created.Id }, ApiResponse<GenreDto>.SuccessResult(created, "Thêm thể loại mới thành công."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateGenre(int id, [FromBody] UpdateGenreDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<GenreDto>.FailureResult("Dữ liệu không hợp lệ.", errors));
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<GenreDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var updated = await _genreRepository.UpdateGenreAsync(userId.Value, id, request);
        if (updated == null)
        {
            return NotFound(ApiResponse<GenreDto>.FailureResult("Không tìm thấy thể loại hoặc bạn không có quyền chỉnh sửa."));
        }

        return Ok(ApiResponse<GenreDto>.SuccessResult(updated, "Cập nhật thể loại thành công."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteGenre(int id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<bool>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var success = await _genreRepository.DeleteGenreAsync(userId.Value, id);
        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy thể loại cần xóa hoặc bạn không có quyền xóa."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(true, "Xóa thể loại thành công."));
    }
}
