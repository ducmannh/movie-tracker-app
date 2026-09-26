import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/features/auth/types"
import type { Movie, CreateMovieRequest, UpdateMovieRequest, MovieStatus } from "../types"

export const movieApi = {
  // Lấy danh sách phim cá nhân (có thể lọc theo trạng thái và tìm kiếm)
  getMovies: async (status?: string, search?: string): Promise<Movie[]> => {
    const res = await apiClient.get<ApiResponse<Movie[]>>("/movies", {
      params: { status, search },
    })
    return res.data.data ?? []
  },

  // Lấy chi tiết một bộ phim
  getMovieById: async (id: number): Promise<Movie | null> => {
    const res = await apiClient.get<ApiResponse<Movie>>(`/movies/${id}`)
    return res.data.data ?? null
  },

  // Thêm phim mới vào danh sách
  createMovie: async (payload: CreateMovieRequest): Promise<Movie> => {
    const res = await apiClient.post<ApiResponse<Movie>>("/movies", payload)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Không thể thêm phim.")
    }
    return res.data.data
  },

  // Cập nhật thông tin phim
  updateMovie: async (id: number, payload: UpdateMovieRequest): Promise<Movie> => {
    const res = await apiClient.put<ApiResponse<Movie>>(`/movies/${id}`, payload)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Không thể cập nhật phim.")
    }
    return res.data.data
  },

  // Chuyển đổi nhanh trạng thái phim
  updateStatus: async (id: number, status: MovieStatus): Promise<Movie> => {
    const res = await apiClient.patch<ApiResponse<Movie>>(`/movies/${id}/status`, null, {
      params: { status },
    })
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Không thể cập nhật trạng thái.")
    }
    return res.data.data
  },

  // Xóa phim khỏi danh sách
  deleteMovie: async (id: number): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/movies/${id}`)
    return res.data.success
  },

  // Tải lên ảnh poster (hỗ trợ kéo thả & dán từ clipboard)
  uploadPoster: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await apiClient.post<ApiResponse<{ url: string; relativeUrl: string }>>(
      "/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    if (!res.data.success || !res.data.data?.url) {
      throw new Error(res.data.message || "Không thể tải ảnh lên.")
    }
    return res.data.data.url
  },
}
