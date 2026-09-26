using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieTrackerBE.DTOs.Common;
using MovieTrackerBE.DTOs.Movies;
using MovieTrackerBE.Repositories;

namespace MovieTrackerBE.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMovieRepository _movieRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<MoviesController> _logger;

    public MoviesController(
        IMovieRepository movieRepository,
        IWebHostEnvironment environment,
        ILogger<MoviesController> logger)
    {
        _movieRepository = movieRepository;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách phim cá nhân của người dùng (hỗ trợ lọc theo trạng thái: All | Watched | PlanToWatch và từ khóa tìm kiếm)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<MovieResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyMovies([FromQuery] string? status, [FromQuery] string? search)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<List<MovieResponseDto>>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var list = await _movieRepository.GetUserMoviesAsync(userId.Value, status, search);
        return Ok(ApiResponse<List<MovieResponseDto>>.SuccessResult(list, $"Đã tải {list.Count} phim."));
    }

    /// <summary>
    /// Lấy thông tin chi tiết một bộ phim
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<MovieResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<MovieResponseDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var movie = await _movieRepository.GetUserMovieByIdAsync(userId.Value, id);
        if (movie == null)
        {
            return NotFound(ApiResponse<MovieResponseDto>.FailureResult("Không tìm thấy phim trong danh sách của bạn."));
        }

        return Ok(ApiResponse<MovieResponseDto>.SuccessResult(movie));
    }

    /// <summary>
    /// Thêm một bộ phim mới vào danh sách cá nhân
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<MovieResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateMovie([FromBody] CreateMovieRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<MovieResponseDto>.FailureResult("Dữ liệu không hợp lệ.", errors));
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<MovieResponseDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        try
        {
            var result = await _movieRepository.CreateMovieAsync(userId.Value, request);
            return StatusCode(StatusCodes.Status201Created, ApiResponse<MovieResponseDto>.SuccessResult(result, "Thêm phim thành công."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi thêm phim: {Message}", ex.Message);
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<MovieResponseDto>.FailureResult("Không thể thêm phim lúc này."));
        }
    }

    /// <summary>
    /// Cập nhật thông tin bộ phim trong danh sách
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<MovieResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMovie(int id, [FromBody] UpdateMovieRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<MovieResponseDto>.FailureResult("Dữ liệu không hợp lệ.", errors));
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<MovieResponseDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var existingMovie = await _movieRepository.GetUserMovieByIdAsync(userId.Value, id);
        if (existingMovie == null)
        {
            return NotFound(ApiResponse<MovieResponseDto>.FailureResult("Không tìm thấy phim để cập nhật."));
        }

        var oldPosterUrl = existingMovie.PosterUrl;

        var updated = await _movieRepository.UpdateMovieAsync(userId.Value, id, request);
        if (updated == null)
        {
            return NotFound(ApiResponse<MovieResponseDto>.FailureResult("Không tìm thấy phim để cập nhật."));
        }

        // Nếu ảnh cũ bị xóa hoặc được thay thế bằng ảnh khác -> Xóa ảnh cũ ở wwwroot
        if (!string.IsNullOrWhiteSpace(oldPosterUrl) &&
            !string.Equals(oldPosterUrl.Trim(), request.PosterUrl?.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            DeleteLocalPosterFile(oldPosterUrl);
        }

        return Ok(ApiResponse<MovieResponseDto>.SuccessResult(updated, "Cập nhật phim thành công."));
    }

    /// <summary>
    /// Chuyển đổi nhanh trạng thái phim (Đã xem / Muốn xem)
    /// </summary>
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<MovieResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        if (status != "Watched" && status != "PlanToWatch")
        {
            return BadRequest(ApiResponse<MovieResponseDto>.FailureResult("Trạng thái phải là 'Watched' hoặc 'PlanToWatch'."));
        }

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<MovieResponseDto>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var updated = await _movieRepository.UpdateStatusAsync(userId.Value, id, status);
        if (updated == null)
        {
            return NotFound(ApiResponse<MovieResponseDto>.FailureResult("Không tìm thấy phim để cập nhật trạng thái."));
        }

        return Ok(ApiResponse<MovieResponseDto>.SuccessResult(updated, "Đã cập nhật trạng thái phim."));
    }

    /// <summary>
    /// Xóa bộ phim khỏi danh sách cá nhân
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized(ApiResponse<bool>.FailureResult("Phiên đăng nhập không hợp lệ."));
        }

        var existingMovie = await _movieRepository.GetUserMovieByIdAsync(userId.Value, id);
        if (existingMovie == null)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy phim để xóa."));
        }

        var success = await _movieRepository.DeleteMovieAsync(userId.Value, id);
        if (!success)
        {
            return NotFound(ApiResponse<bool>.FailureResult("Không tìm thấy phim để xóa."));
        }

        // Xóa file ảnh trong wwwroot nếu là ảnh upload cục bộ
        DeleteLocalPosterFile(existingMovie.PosterUrl);

        return Ok(ApiResponse<bool>.SuccessResult(true, "Đã xóa phim khỏi danh sách."));
    }

    /// <summary>
    /// Hàm tiện ích xóa file ảnh poster trong wwwroot nếu URL thuộc hệ thống nội bộ
    /// </summary>
    private void DeleteLocalPosterFile(string? posterUrl)
    {
        if (string.IsNullOrWhiteSpace(posterUrl)) return;

        try
        {
            const string marker = "/uploads/posters/";
            var index = posterUrl.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
            if (index < 0) return; // Không phải ảnh lưu trong wwwroot (ảnh TMDB hoặc URL ngoài)

            var fileName = posterUrl[(index + marker.Length)..].Trim();
            var queryIdx = fileName.IndexOf('?');
            if (queryIdx >= 0) fileName = fileName[..queryIdx];

            if (string.IsNullOrWhiteSpace(fileName)) return;

            // Đảm bảo chỉ lấy tên tệp để phòng ngừa Path Traversal
            fileName = Path.GetFileName(fileName);

            var webRoot = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
            }

            var filePath = Path.Combine(webRoot, "uploads", "posters", fileName);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                _logger.LogInformation("Đã xóa file ảnh poster trong wwwroot: {FilePath}", filePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Lỗi khi xóa file ảnh cũ: {PosterUrl}", posterUrl);
        }
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var userId))
        {
            return null;
        }
        return userId;
    }
}
