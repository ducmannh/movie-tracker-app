import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "../api/authApi"
import { onAuthExpired } from "@/api/client"
import type { LoginPayload, RegisterPayload } from "../types"

// Key định danh cho query user hiện tại trong TanStack Query Cache
export const AUTH_QUERY_KEY = ["currentUser"]

// 1. Hook lấy thông tin user hiện tại từ Cookie (kết hợp tự động gia hạn ngầm)
export function useCurrentUser() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Đăng ký lắng nghe sự kiện hết hạn hoàn toàn của phiên làm việc (khi cả refresh token cũng hết hạn)
    const unsubscribe = onAuthExpired(() => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    })
    return unsubscribe
  }, [queryClient])

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await authApi.getMe()
        if (res.success && res.data) {
          localStorage.setItem("user", JSON.stringify(res.data))
          return res.data
        }
        return null
      } catch (err: any) {
        // Nếu không có cookie hoặc phiên không hợp lệ
        if (err.response?.status === 401) {
          localStorage.removeItem("user")
          return null
        }
        return null
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 phút
  })
}

// 2. Hook Đăng nhập
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem("user", JSON.stringify(data.data.user))
        queryClient.setQueryData(AUTH_QUERY_KEY, data.data.user)
      }
    },
  })
}

// 3. Hook Đăng ký
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      if (data.success && data.data) {
        localStorage.setItem("user", JSON.stringify(data.data.user))
        queryClient.setQueryData(AUTH_QUERY_KEY, data.data.user)
      }
    },
  })
}

// 4. Hook Đăng xuất
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      localStorage.removeItem("user")
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    },
  })
}
