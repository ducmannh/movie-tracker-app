/**
 * Tiện ích chuẩn hóa đường dẫn ảnh Poster của phim
 * Xử lý linh hoạt và đồng bộ giữa môi trường Production (Server) và Localhost (Dev)
 */

export function getImageUrl(url?: string | null): string {
  if (!url) return ""
  let trimmed = url.trim()
  if (!trimmed) return ""

  // 1. Nếu là blob URL hoặc base64 (preview trước khi lưu)
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed
  }

  // 2. Nếu là đường dẫn đầy đủ http/https
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed)
      // Nếu là link localhost cũ lưu trong DB từ máy dev
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        trimmed = parsed.pathname
      } else {
        // Link ảnh ngoài hợp lệ (TMDB, IMDb, Amazon...)
        return trimmed
      }
    } catch {
      return trimmed
    }
  }

  // 3. Nếu là đường dẫn /uploads/posters/{fileName}, chuyển hướng qua API endpoint /api/upload/posters/{fileName}
  // Tuyến đường /api/* luôn được reverse proxy Caddy chuyển tiếp đến Backend .NET 100% không bị Nginx chặn
  if (trimmed.startsWith("/uploads/posters/")) {
    const fileName = trimmed.replace("/uploads/posters/", "")
    trimmed = `/api/upload/posters/${fileName}`
  }

  // 4. Nếu là đường dẫn tương đối (bắt đầu bằng "/")
  if (trimmed.startsWith("/")) {
    // Nếu đang chạy local dev (cổng 5173/3000 của Vite) và Backend chạy riêng ở cổng 5032
    if (
      typeof window !== "undefined" &&
      (window.location.port === "5173" || window.location.port === "3000")
    ) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5032/api"
      if (apiBase.startsWith("http")) {
        try {
          const origin = new URL(apiBase).origin
          return `${origin}${trimmed}`
        } catch {
          return trimmed
        }
      }
    }
    return trimmed
  }

  return trimmed
}
