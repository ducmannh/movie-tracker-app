/**
 * Trợ giúp trích xuất và xác thực liên kết video từ YouTube
 */

/**
 * Trích xuất 11-ký tự Video ID từ các định dạng URL của YouTube
 * Hỗ trợ:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // Khớp ID 11 ký tự của YouTube
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  const match = trimmed.match(regExp)
  return match && match[1] ? match[1] : null
}

/**
 * Kiểm tra xem một chuỗi có phải là liên kết hợp lệ từ YouTube hay không.
 * Nếu chuỗi rỗng thì xem như hợp lệ (vì Trailer là trường tùy chọn).
 */
export function isValidYouTubeUrl(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return true
  const trimmed = url.trim()

  // Phải thuộc domain youtube.com hoặc youtu.be
  const domainPattern = /^(https?:\/\/)?((www|m)\.)?(youtube\.com|youtu\.be)\/.+$/i
  if (!domainPattern.test(trimmed)) {
    return false
  }

  // Phải trích xuất được YouTube Video ID
  return extractYouTubeId(trimmed) !== null
}

/**
 * Tạo URL iframe embed chuẩn với tính năng autoplay và bảo mật
 */
export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
}


