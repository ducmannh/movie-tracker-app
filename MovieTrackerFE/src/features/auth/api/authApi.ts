import { apiClient } from "@/api/client"
import type { ApiResponse, AuthResponseData, LoginPayload, RegisterPayload, User } from "../types"

export const authApi = {
  // Đăng nhập
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>("/auth/login", payload)
    return res.data
  },

  // Đăng ký
  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthResponseData>> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>("/auth/register", payload)
    return res.data
  },

  // Tự động gia hạn Access Token qua Refresh Token trong Cookie
  refreshToken: async (): Promise<ApiResponse<AuthResponseData>> => {
    const res = await apiClient.post<ApiResponse<AuthResponseData>>("/auth/refresh-token")
    return res.data
  },

  // Lấy thông tin tài khoản hiện tại qua HttpOnly Cookie
  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>("/auth/me")
    return res.data
  },

  // Đăng xuất: Yêu cầu server xóa cookie accessToken và refreshToken
  logout: async (): Promise<ApiResponse<string>> => {
    const res = await apiClient.post<ApiResponse<string>>("/auth/logout")
    return res.data
  },
}
