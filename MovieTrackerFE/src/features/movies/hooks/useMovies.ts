import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { movieApi } from "../api/movieApi"
import type { CreateMovieRequest, UpdateMovieRequest, MovieStatus } from "../types"

export const movieKeys = {
  all: ["movies"] as const,
  list: (status?: string, search?: string) => ["movies", status ?? "All", search ?? ""] as const,
  detail: (id: number) => ["movie", id] as const,
}

// Hook lấy danh sách phim
export function useMovies(status?: string, search?: string) {
  return useQuery({
    queryKey: movieKeys.list(status, search),
    queryFn: () => movieApi.getMovies(status, search),
  })
}

// Hook thêm phim mới
export function useCreateMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateMovieRequest) => movieApi.createMovie(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.all })
    },
  })
}

// Hook cập nhật toàn bộ thông tin phim
export function useUpdateMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMovieRequest }) =>
      movieApi.updateMovie(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.all })
    },
  })
}

// Hook cập nhật nhanh trạng thái (Đã xem <-> Sẽ xem)
export function useUpdateMovieStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: MovieStatus }) =>
      movieApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.all })
    },
  })
}

// Hook xóa phim
export function useDeleteMovie() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => movieApi.deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.all })
    },
  })
}
