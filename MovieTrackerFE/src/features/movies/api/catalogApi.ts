import { apiClient } from "@/api/client"
import type { ApiResponse } from "@/features/auth/types"
import type {
  GenreItem,
  CreateGenreRequest,
  UpdateGenreRequest,
  LanguageItem,
  CreateLanguageRequest,
  UpdateLanguageRequest,
} from "../types"

export const catalogApi = {
  // === THỂ LOẠI (GENRES) ===
  getGenres: async (): Promise<GenreItem[]> => {
    const res = await apiClient.get<ApiResponse<GenreItem[]>>("/genres")
    return res.data.data ?? []
  },

  createGenre: async (payload: CreateGenreRequest): Promise<GenreItem> => {
    const res = await apiClient.post<ApiResponse<GenreItem>>("/genres", payload)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Không thể thêm thể loại mới.")
    }
    return res.data.data
  },

  updateGenre: async (id: number, payload: UpdateGenreRequest): Promise<GenreItem> => {
    const res = await apiClient.put<ApiResponse<GenreItem>>(`/genres/${id}`, payload)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Không thể cập nhật thể loại.")
    }
    return res.data.data
  },

  deleteGenre: async (id: number): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/genres/${id}`)
    return res.data.success
  },

  // === NGÔN NGỮ (LANGUAGES) ===
  getLanguages: async (): Promise<LanguageItem[]> => {
    const res = await apiClient.get<ApiResponse<LanguageItem[]>>("/languages")
    return res.data.data ?? []
  },

  createLanguage: async (payload: CreateLanguageRequest): Promise<LanguageItem> => {
    const res = await apiClient.post<ApiResponse<LanguageItem>>("/languages", payload)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Không thể thêm ngôn ngữ mới.")
    }
    return res.data.data
  },

  updateLanguage: async (id: number, payload: UpdateLanguageRequest): Promise<LanguageItem> => {
    const res = await apiClient.put<ApiResponse<LanguageItem>>(`/languages/${id}`, payload)
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || "Không thể cập nhật ngôn ngữ.")
    }
    return res.data.data
  },

  deleteLanguage: async (id: number): Promise<boolean> => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/languages/${id}`)
    return res.data.success
  },
}
