import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import type { Movie, MovieStatus } from "../types"
import { Star, CheckCircle2, Trash2, Film, Loader2, Calendar, Users, Globe, Tv, Clock, Play } from "lucide-react"
import { getImageUrl } from "../utils/image"

interface MovieListItemProps {
  movie: Movie
  onToggleStatus: (id: number, nextStatus: MovieStatus) => Promise<void>
  onEdit: (movie: Movie) => void
  onDelete: (movie: Movie) => void
  onWatchTrailer?: (movie: Movie) => void
}

export function MovieListItem({
  movie,
  onToggleStatus,
  onEdit,
  onDelete,
  onWatchTrailer,
}: MovieListItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const isWatched = movie.status === "Watched"

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      setIsUpdating(true)
      await onToggleStatus(movie.id, "Watched")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(movie)
  }

  return (
    <div
      onClick={() => onEdit(movie)}
      className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-neutral-900/50 backdrop-blur-md hover:bg-neutral-900/80 border border-neutral-800/70 hover:border-violet-500/40 rounded-xl hover:shadow-md hover:shadow-violet-950/10 transition-all duration-200 cursor-pointer"
    >
      {/* Cột trái: Poster mini + Thông tin tên, năm, thể loại */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Poster thumbnail nhỏ */}
        <div className="relative shrink-0 w-9 sm:w-11 h-12 sm:h-15 rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
          {movie.posterUrl ? (
            <img
              src={getImageUrl(movie.posterUrl)}
              alt={movie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
              loading="lazy"
            />
          ) : (
            <Film className="w-4 h-4 text-neutral-600" />
          )}
        </div>

        {/* Tiêu đề & Thông số */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="flex items-baseline gap-1.5 min-w-0 truncate">
              <h4
                title={movie.title}
                className="text-xs sm:text-sm font-bold text-neutral-100 truncate group-hover:text-violet-300 transition-colors shrink-0"
              >
                {movie.title}
              </h4>
              {movie.englishTitle && (
                <span
                  title={movie.englishTitle}
                  className="text-[11px] text-neutral-400 font-normal italic truncate"
                >
                  ({movie.englishTitle})
                </span>
              )}
            </div>
            {movie.releaseYear && (
              <span className="text-[11px] text-neutral-400 flex items-center gap-0.5 shrink-0">
                <Calendar className="w-3 h-3" />
                {movie.releaseYear}
              </span>
            )}
            {movie.rating !== undefined && movie.rating !== null && movie.rating > 0 && (
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/25 shrink-0">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{movie.rating % 1 === 0 ? movie.rating : movie.rating.toFixed(1)}</span>
              </span>
            )}
            {movie.trailerUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onWatchTrailer?.(movie)
                }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400 hover:text-red-300 bg-red-600/15 hover:bg-red-600/25 px-1.5 py-0.5 rounded-md border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer shrink-0 shadow-xs"
                title="Xem Trailer YouTube"
              >
                <Play className="w-2.5 h-2.5 fill-red-400" />
                Trailer
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
            {movie.movieType === "Series" ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sky-500/40 text-sky-300 bg-sky-500/10 font-medium">
                <Tv className="w-2.5 h-2.5 mr-0.5 text-sky-400" />
                Phim bộ{movie.season ? ` • S${movie.season}` : ""}{movie.episodeCount ? ` • ${movie.episodeCount} tập` : ""}
              </Badge>
            ) : movie.durationMinutes ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-300 bg-amber-500/10 font-medium">
                <Clock className="w-2.5 h-2.5 mr-0.5 text-amber-400" />
                {movie.durationMinutes}p
              </Badge>
            ) : null}
            {movie.genre &&
              movie.genre
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .map((genreItem, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 border-violet-500/30 text-violet-300 bg-violet-500/10 font-medium">
                    {genreItem}
                  </Badge>
                ))}
            {movie.language && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-teal-500/40 text-teal-300 bg-teal-500/10 font-medium">
                <Globe className="w-2.5 h-2.5 mr-0.5 text-teal-400" />
                {movie.language}
              </Badge>
            )}
            {movie.actors && (
              <span className="text-[11px] inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <Users className="w-3 h-3 text-violet-400 shrink-0" />
                {movie.actors
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((actorItem, idx, arr) => {
                    const match = actorItem.match(/^(.*?)\s*(\(.*?\))$/)
                    return (
                      <span key={idx} className="inline-flex items-center gap-1 whitespace-nowrap">
                        {match ? (
                          <>
                            <span className="text-neutral-200 font-medium">{match[1]}</span>
                            <span className="text-neutral-400 text-[10px]">{match[2]}</span>
                          </>
                        ) : (
                          <span className="text-neutral-200 font-medium">{actorItem}</span>
                        )}
                        {idx < arr.length - 1 && <span className="text-neutral-600 mr-0.5">,</span>}
                      </span>
                    )
                  })}
              </span>
            )}
            {movie.overview && (
              <span className="text-xs text-neutral-400/90 truncate max-w-xs sm:max-w-md hidden sm:inline italic">
                "{movie.overview}"
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cột phải: Nút thao tác */}
      <div className="flex items-center gap-1 shrink-0">
        {!isWatched && (
          <button
            type="button"
              onClick={handleToggle}
              disabled={isUpdating}
              className="p-1.5 rounded-lg text-xs transition-colors text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              title="Đánh dấu Đã xem"
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Xóa phim khỏi danh sách"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
    </div>
  )
}
