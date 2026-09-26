/**
 * Tiện ích chuẩn hóa đường dẫn ảnh Poster của phim
 * Xử lý linh hoạt giữa môi trường Production (Domain/Server thật) và Localhost (Môi trường Dev)
 */

export function getImageUrl(url?: string | null): string {
  if (!url) return ""
  const trimmed = url.trim()
  if (!trimmed) return ""

  // 1. Nếu là blob URL hoặc base64 (preview trước khi lưu)
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed
  }

  // 2. Nếu là đường dẫn đầy đủ http/https
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed)
      // Nếu là link localhost (do lưu từ môi trường dev hoặc Kestrel tự sinh)
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        // Nếu trang web đang chạy trên server thật (domain khác localhost)
        if (
          typeof window !== "undefined" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          // Chuyển link localhost thành đường dẫn tương đối để load qua domain hiện tại
          return parsed.pathname
        }
      }
    } catch {
      // Nếu không parse được thì giữ nguyên link gốc
    }
    return trimmed
  }

  // 3. Nếu là đường dẫn tương đối (ví dụ: /uploads/posters/...)
  if (trimmed.startsWith("/")) {
    // Nếu đang chạy local dev (cổng 5173 của Vite) và Backend chạy riêng ở cổng 5032
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
