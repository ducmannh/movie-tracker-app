import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Movie, MovieStatus } from "../types"
import { Star, CheckCircle2, Trash2, Calendar, Film, Loader2, Users, Globe, Tv, Clock, Play } from "lucide-react"
import { getImageUrl } from "../utils/image"

interface MovieCardProps {
  movie: Movie
  onToggleStatus: (id: number, nextStatus: MovieStatus) => Promise<void>
  onEdit: (movie: Movie) => void
  onDelete: (movie: Movie) => void
  onWatchTrailer?: (movie: Movie) => void
}

export function MovieCard({
  movie,
  onToggleStatus,
  onEdit,
  onDelete,
  onWatchTrailer,
}: MovieCardProps) {
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
    <Card
      onClick={() => onEdit(movie)}
      className="bg-neutral-900/60 border-neutral-800/80 hover:border-violet-500/50 text-neutral-100 hover:bg-neutral-900/80 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl hover:shadow-violet-950/20 hover:-translate-y-1 flex flex-col group backdrop-blur-md cursor-pointer"
    >
      <CardContent className="p-4 flex gap-4 flex-1">
        {/* Poster ảnh phim hoặc Placeholder biểu tượng */}
        <div className="relative shrink-0 w-24 sm:w-28 h-36 sm:h-40 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-md flex items-center justify-center">
          {movie.posterUrl ? (
            <img
              src={getImageUrl(movie.posterUrl)}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Nếu URL ảnh hỏng, ẩn thẻ img để hiện placeholder
                e.currentTarget.style.display = "none"
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-1.5 p-2 text-center bg-linear-to-b from-neutral-900 to-neutral-950">
              <div className="p-2.5 rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/20">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-neutral-500 font-medium line-clamp-1">
                {movie.genre || "Phim"}
              </span>
            </div>
          )}
          {/* Nút Play xem trailer nhanh khi hover trên poster nếu có trailer */}
          {movie.trailerUrl && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                onWatchTrailer?.(movie)
              }}
              className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer z-10"
              title="Bấm để xem Trailer YouTube"
            >
              <div className="w-8 h-8 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Nội dung thông tin phim */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-1.5">
            {/* Tiêu đề & Nút Xóa góc trên bên phải */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  title={movie.title}
                  className="text-base font-bold text-white line-clamp-1 group-hover:text-violet-300 transition-colors"
                >
                  {movie.title}
                </h3>
                {movie.englishTitle && (
                  <p
                    title={movie.englishTitle}
                    className="text-xs text-neutral-400 font-medium truncate italic"
                  >
                    {movie.englishTitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 -mr-1 -mt-0.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Xóa phim khỏi danh sách"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Badges thông tin: Loại phim, Năm & Ngôn ngữ & Trailer */}
            <div className="flex flex-wrap items-center gap-1.5">
              {movie.movieType === "Series" ? (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-sky-500/40 bg-sky-500/10 text-sky-300 font-medium">
                  <Tv className="w-3 h-3 mr-1 text-sky-400" />
                  Phim bộ{movie.season ? ` • Mùa ${movie.season}` : ""}{movie.episodeCount ? ` • ${movie.episodeCount} tập` : ""}
                </Badge>
              ) : movie.durationMinutes ? (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-amber-500/40 bg-amber-500/10 text-amber-300 font-medium">
                  <Clock className="w-3 h-3 mr-1 text-amber-400" />
                  {movie.durationMinutes} phút
                </Badge>
              ) : null}
              {movie.releaseYear && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-neutral-700/80 bg-neutral-800/60 text-neutral-300 font-medium">
                  <Calendar className="w-3 h-3 mr-1 text-neutral-400" />
                  {movie.releaseYear}
                </Badge>
              )}
              {movie.language && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 border-teal-500/40 bg-teal-500/10 text-teal-300 font-medium">
                  <Globe className="w-3 h-3 mr-1 text-teal-400" />
                  {movie.language}
                </Badge>
              )}
              {movie.trailerUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onWatchTrailer?.(movie)
                  }}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold text-red-400 hover:text-red-300 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer shadow-xs shrink-0"
                  title="Xem Trailer YouTube"
                >
                  <Play className="w-2.5 h-2.5 fill-red-400" />
                  Trailer
                </button>
              )}
            </div>

            {/* Dòng Điểm số (chỉ hiển thị số sao) & Thể loại phim */}
            <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
              {movie.rating !== undefined && movie.rating !== null && movie.rating > 0 && (
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 shadow-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{movie.rating % 1 === 0 ? movie.rating : movie.rating.toFixed(1)}</span>
                </span>
              )}

              {movie.genre && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {movie.genre
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((genreItem, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-violet-300 bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 rounded-md"
                      >
                        {genreItem}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Diễn viên tham gia (xuống dòng thông minh giữ nguyên cụm tên + vai diễn) */}
            {movie.actors && (
              <div className="flex items-start gap-1.5 text-xs text-neutral-300 pt-0.5 leading-relaxed">
                <Users className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
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
                              <span className="text-neutral-400 text-[11px]">{match[2]}</span>
                            </>
                          ) : (
                            <span className="text-neutral-200 font-medium">{actorItem}</span>
                          )}
                          {idx < arr.length - 1 && <span className="text-neutral-600 mr-0.5">,</span>}
                        </span>
                      )
                    })}
                </div>
              </div>
            )}

            {/* Ghi chú / Cảm nhận */}
            {movie.overview && (
              <p className="text-xs text-neutral-400 line-clamp-2 pt-1 italic">
                "{movie.overview}"
              </p>
            )}
          </div>

          {/* Action Footer: Chỉ hiển thị nút Đánh dấu Đã xem khi phim đang ở Sẽ xem */}
          {!isWatched && (
            <div className="pt-2.5 mt-2 border-t border-neutral-800/60 flex items-center">
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={handleToggle}
                className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
              >
                {isUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 mr-1 text-white" />
                )}
                Đánh dấu Đã xem
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
