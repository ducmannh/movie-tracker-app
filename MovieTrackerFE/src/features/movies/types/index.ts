export type MovieStatus = "Watched" | "PlanToWatch"
export type MovieType = "Movie" | "Series"

export interface Movie {
  id: number
  movieId?: number
  title: string
  englishTitle?: string
  movieType?: MovieType
  durationMinutes?: number
  season?: number
  episodeCount?: number
  releaseYear?: number
  genre?: string
  language?: string
  actors?: string
  posterUrl?: string
  trailerUrl?: string
  overview?: string
  status: MovieStatus
  rating?: number
  watchedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateMovieRequest {
  title: string
  englishTitle?: string
  movieType?: MovieType
  durationMinutes?: number
  season?: number
  episodeCount?: number
  releaseYear?: number
  genre?: string
  language?: string
  actors?: string
  posterUrl?: string
  trailerUrl?: string
  overview?: string
  status: MovieStatus
  rating?: number
}

export interface UpdateMovieRequest {
  title: string
  englishTitle?: string
  movieType?: MovieType
  durationMinutes?: number
  season?: number
  episodeCount?: number
  releaseYear?: number
  genre?: string
  language?: string
  actors?: string
  posterUrl?: string
  trailerUrl?: string
  overview?: string
  status: MovieStatus
  rating?: number
  watchedAt?: string
}

export interface GenreItem {
  id: number
  userId?: string | null
  name: string
  description?: string | null
  isDefault: boolean
}

export interface CreateGenreRequest {
  name: string
  description?: string
}

export interface UpdateGenreRequest {
  name: string
  description?: string
}

export interface LanguageItem {
  id: number
  userId?: string | null
  name: string
  code?: string | null
  isDefault: boolean
}

export interface CreateLanguageRequest {
  name: string
  code?: string
}

export interface UpdateLanguageRequest {
  name: string
  code?: string
}
