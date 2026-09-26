import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { catalogApi } from "../api/catalogApi"
import type { CreateGenreRequest, UpdateGenreRequest, CreateLanguageRequest, UpdateLanguageRequest } from "../types"

export const catalogKeys = {
  genres: ["genres"] as const,
  languages: ["languages"] as const,
}

// === GENRES HOOKS ===
export function useGenres() {
  return useQuery({
    queryKey: catalogKeys.genres,
    queryFn: () => catalogApi.getGenres(),
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  })
}

export function useCreateGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGenreRequest) => catalogApi.createGenre(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.genres })
    },
  })
}

export function useUpdateGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGenreRequest }) =>
      catalogApi.updateGenre(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.genres })
    },
  })
}

export function useDeleteGenre() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteGenre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.genres })
    },
  })
}

// === LANGUAGES HOOKS ===
export function useLanguages() {
  return useQuery({
    queryKey: catalogKeys.languages,
    queryFn: () => catalogApi.getLanguages(),
    staleTime: 1000 * 60 * 5, // Cache 5 phút
  })
}

export function useCreateLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateLanguageRequest) => catalogApi.createLanguage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.languages })
    },
  })
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateLanguageRequest }) =>
      catalogApi.updateLanguage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.languages })
    },
  })
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => catalogApi.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.languages })
    },
  })
}
