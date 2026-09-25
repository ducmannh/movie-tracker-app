import axios, { type AxiosRequestConfig } from "axios"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5032/api"

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // BẮT BUỘC: Cho phép gửi/nhận HttpOnly Cookie tự động
  headers: {
    "Content-Type": "application/json",
  },
})

// Danh sách các callback khi phiên đăng nhập hết hạn hoàn toàn (khi cả Refresh Token cũng hết hạn)
type AuthCallback = () => void
const authExpiredCallbacks: AuthCallback[] = []

export const onAuthExpired = (cb: AuthCallback) => {
  authExpiredCallbacks.push(cb)
  return () => {
    const idx = authExpiredCallbacks.indexOf(cb)
    if (idx !== -1) authExpiredCallbacks.splice(idx, 1)
  }
}

// Trạng thái theo dõi quá trình Silent Refresh Token
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
    }
  })
  failedQueue = []
}

// Response interceptor: Tự động gia hạn ngầm (Silent Refresh) khi gặp lỗi 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Kiểm tra các endpoint không được thử lại refresh để tránh lặp vô hạn
    const requestUrl = originalRequest?.url || ""
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh-token")

    // Nếu mã lỗi là 401 và chưa từng thử lại request này
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      const hadSession = !!localStorage.getItem("user")

      // Chỉ thực hiện gia hạn nếu người dùng trước đó đã đăng nhập
      if (hadSession) {
        if (isRefreshing) {
          // Nếu đang có 1 tiến trình refresh chạy dở, đẩy request này vào hàng đợi
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => apiClient(originalRequest))
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // Gọi API gia hạn ngầm (Trình duyệt tự đính kèm cookie refreshToken)
          await axios.post(
            `${baseURL}/auth/refresh-token`,
            {},
            { withCredentials: true }
          )

          // Gia hạn thành công: Giải phóng hàng đợi và thử lại các request
          processQueue(null)
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh Token cũng đã hết hạn (sau 7 ngày) -> Đăng xuất hoàn toàn
          processQueue(refreshError)
          console.warn("Phiên làm việc dài hạn (Refresh Token) đã hết hạn. Đang đăng xuất...")
          localStorage.removeItem("user")
          authExpiredCallbacks.forEach((cb) => cb())
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }

    return Promise.reject(error)
  }
)
