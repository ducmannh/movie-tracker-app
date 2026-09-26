import { useState } from "react"
import type { Movie, MovieStatus } from "../types"
import { CheckCircle2, Trash2, Film, Edit2, Loader2, Tv, Clock, Star, Globe, Play } from "lucide-react"

interface MoviePosterCardProps {
  movie: Movie
  onToggleStatus: (id: number, nextStatus: MovieStatus) => Promise<void>
  onEdit: (movie: Movie) => void
  onDelete: (movie: Movie) => void
  onWatchTrailer?: (movie: Movie) => void
}

export function MoviePosterCard({
  movie,
  onToggleStatus,
  onEdit,
  onDelete,
  onWatchTrailer,
}: MoviePosterCardProps) {
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(movie)
  }

  return (
    <div
      onClick={handleEdit}
      className="group relative flex flex-col bg-neutral-900/60 backdrop-blur-md hover:bg-neutral-900/80 border border-neutral-800/80 hover:border-violet-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-violet-950/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Khung Poster tỷ lệ chuẩn điện ảnh 2:3 */}
      <div className="relative aspect-2/3 w-full overflow-hidden bg-neutral-950 flex items-center justify-center">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none"
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-linear-to-b from-neutral-900 to-neutral-950 text-neutral-600 gap-2">
            <div className="p-3 rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/20">
              <Film className="w-6 h-6" />
            </div>
            <span className="text-xs text-neutral-400 font-medium line-clamp-2 px-1">
              {movie.title}
            </span>
          </div>
        )}

        {/* Badge phân loại Phim bộ / Thời lượng phim lẻ */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 pointer-events-none">
          {movie.movieType === "Series" ? (
            <span className="px-1.5 py-0.5 rounded-md bg-neutral-950/85 backdrop-blur-md border border-sky-500/40 text-sky-300 text-[10px] font-semibold flex items-center gap-1 shadow-sm">
              <Tv className="w-2.5 h-2.5" />
              {movie.season ? `S${movie.season}` : "Bộ"}
              {movie.episodeCount ? ` • ${movie.episodeCount}T` : ""}
            </span>
          ) : movie.durationMinutes ? (
            <span className="px-1.5 py-0.5 rounded-md bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 text-amber-300 text-[10px] font-medium flex items-center gap-1 shadow-sm">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              {movie.durationMinutes}p
            </span>
          ) : null}
        </div>

        {/* Điểm đánh giá ở góc bên phải */}
        {movie.rating !== undefined && movie.rating !== null && movie.rating > 0 ? (
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded-md bg-neutral-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{movie.rating % 1 === 0 ? movie.rating : movie.rating.toFixed(1)}</span>
            </span>
          </div>
        ) : null}

        {/* Badge Trailer nếu có ở góc dưới bên phải poster */}
        {movie.trailerUrl && (
          <div className="absolute bottom-2 right-2 z-10 pointer-events-none group-hover:opacity-0 transition-opacity">
            <span className="px-1.5 py-0.5 rounded-md bg-neutral-950/85 backdrop-blur-md border border-red-500/40 text-red-400 text-[10px] font-bold flex items-center gap-1 shadow-sm">
              <Play className="w-2.5 h-2.5 fill-red-400" />
              Trailer
            </span>
          </div>
        )}

        {/* Lớp phủ Gradient bóng mờ từ trên và dưới */}
        <div className="absolute inset-0 bg-linear-to-t from-neutral-950/90 via-transparent to-neutral-950/60 pointer-events-none" />

        {/* Action Overlay khi hover: Nút thao tác nhanh */}
        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
          {movie.trailerUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onWatchTrailer?.(movie)
              }}
              className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all bg-red-600 hover:bg-red-500 text-white cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Xem Trailer
            </button>
          )}

          {!isWatched && (
            <button
              type="button"
              onClick={handleToggle}
              disabled={isUpdating}
              className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {isUpdating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đánh dấu Đã xem
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={handleEdit}
              className="flex-1 py-1.5 px-2 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center justify-center gap-1 transition-colors"
            >
              <Edit2 className="w-3 h-3 text-violet-400" /> Sửa
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 rounded-xl text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
              title="Xóa phim"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Thông tin vắn tắt dưới poster */}
      <div className="p-2.5 space-y-1.5">
        <h4
          title={movie.title}
          className="text-xs sm:text-sm font-bold text-neutral-100 line-clamp-1 group-hover:text-violet-300 transition-colors"
        >
          {movie.title}
        </h4>

        {/* Hàng 2: Năm, Thời lượng/Số tập & Ngôn ngữ */}
        <div className="flex items-center justify-between text-[11px] gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-neutral-300 font-medium">{movie.releaseYear || "N/A"}</span>
            {movie.movieType === "Series" ? (
              <span className="text-[10.5px] text-sky-400 font-semibold flex items-center gap-0.5">
                • {movie.episodeCount ? `${movie.episodeCount} tập` : "Phim bộ"}
              </span>
            ) : movie.durationMinutes ? (
              <span className="text-[10.5px] text-amber-400 font-semibold flex items-center gap-0.5">
                • {movie.durationMinutes}p
              </span>
            ) : null}
          </div>
          {movie.language && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-300 bg-teal-500/10 border border-teal-500/25 px-1.5 py-0.5 rounded-md truncate max-w-24 shrink-0 shadow-xs"
              title={movie.language}
            >
              <Globe className="w-2.5 h-2.5 text-teal-400 shrink-0" />
              <span className="truncate">{movie.language}</span>
            </span>
          )}
        </div>

        {/* Hàng 3: Thể loại phim dạng thẻ badge violet bắt mắt */}
        {movie.genre && (
          <div className="flex items-center gap-1 overflow-hidden" title={movie.genre}>
            {movie.genre
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
              .slice(0, 2)
              .map((genreItem, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium text-violet-300 bg-violet-500/10 border border-violet-500/25 px-1.5 py-0.5 rounded-md truncate max-w-25"
                >
                  {genreItem}
                </span>
              ))}
            {movie.genre.split(",").filter((g) => g.trim()).length > 2 && (
              <span className="text-[9px] text-neutral-400 font-medium shrink-0">
                +{movie.genre.split(",").filter((g) => g.trim()).length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
