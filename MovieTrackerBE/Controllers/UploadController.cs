using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MovieTrackerBE.DTOs.Common;

namespace MovieTrackerBE.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadController> _logger;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"
    };

    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB

    public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Tải lên ảnh poster cho phim (hỗ trợ kéo thả, copy dán từ clipboard)
    /// </summary>
    [HttpPost("image")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<UploadResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<UploadResultDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadImage(IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<UploadResultDto>.FailureResult("Vui lòng chọn một tệp hình ảnh."));
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(ApiResponse<UploadResultDto>.FailureResult("Dung lượng hình ảnh không được vượt quá 10MB."));
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            // Nếu tệp dán từ clipboard không có phần mở rộng rõ ràng, thử đoán từ ContentType
            if (file.ContentType.Equals("image/png", StringComparison.OrdinalIgnoreCase))
                extension = ".png";
            else if (file.ContentType.Equals("image/webp", StringComparison.OrdinalIgnoreCase))
                extension = ".webp";
            else if (file.ContentType.Equals("image/gif", StringComparison.OrdinalIgnoreCase))
                extension = ".gif";
            else
                extension = ".jpg";
        }

        try
        {
            // Đường dẫn thư mục lưu trữ: wwwroot/uploads/posters
            var webRoot = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
            }

            var uploadsFolder = Path.Combine(webRoot, "uploads", "posters");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
            var destinationFilePath = Path.Combine(uploadsFolder, uniqueFileName);

            await using (var stream = new FileStream(destinationFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/posters/{uniqueFileName}";
            // Tạo URL tuyệt đối dựa trên host hiện tại
            var request = HttpContext.Request;
            var fullUrl = $"{request.Scheme}://{request.Host}{relativePath}";

            _logger.LogInformation("Đã tải ảnh lên thành công: {FileName} ({Size} bytes)", uniqueFileName, file.Length);

            var result = new UploadResultDto
            {
                Url = fullUrl,
                RelativeUrl = relativePath,
                FileName = uniqueFileName,
                Size = file.Length
            };

            return Ok(ApiResponse<UploadResultDto>.SuccessResult(result, "Tải ảnh lên thành công."));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xảy ra khi lưu tệp hình ảnh tải lên");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<UploadResultDto>.FailureResult("Lỗi hệ thống khi lưu ảnh: " + ex.Message));
        }
    }

    /// <summary>
    /// Lấy ảnh poster đã tải lên (hoạt động trực tiếp qua route API /api/upload/posters/{fileName})
    /// Không yêu cầu đăng nhập để các thẻ img trên web/mobile hiển thị trực tiếp được.
    /// </summary>
    [HttpGet("posters/{fileName}")]
    [AllowAnonymous]
    public IActionResult GetPoster(string fileName)
    {
        var cleanFileName = Path.GetFileName(fileName);
        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");
        }

        var filePath = Path.Combine(webRoot, "uploads", "posters", cleanFileName);
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = "Không tìm thấy tệp ảnh poster trên máy chủ." });
        }

        var ext = Path.GetExtension(cleanFileName).ToLowerInvariant();
        var contentType = ext switch
        {
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".avif" => "image/avif",
            _ => "image/jpeg"
        };

        // Cache 30 ngày ở trình duyệt
        Response.Headers.Append("Cache-Control", "public, max-age=2592000");

        return PhysicalFile(filePath, contentType);
    }
}

public class UploadResultDto
{
    public string Url { get; set; } = string.Empty;
    public string RelativeUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long Size { get; set; }
}
