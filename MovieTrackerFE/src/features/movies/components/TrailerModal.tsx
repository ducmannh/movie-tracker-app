import { useEffect } from "react"
import { X, ExternalLink, AlertCircle } from "lucide-react"
import { getYouTubeEmbedUrl } from "../utils/youtube"
import { YouTubeIcon } from "./YouTubeIcon"
import type { Movie } from "../types"

interface TrailerModalProps {
  isOpen: boolean
  onClose: () => void
  movie?: Movie | null
  trailerUrl?: string | null
  title?: string
}

export function TrailerModal({
  isOpen,
  onClose,
  movie,
  trailerUrl: explicitUrl,
  title: explicitTitle,
}: TrailerModalProps) {
  const url = explicitUrl || movie?.trailerUrl
  const movieTitle = explicitTitle || movie?.title || "Trailer phim"
  const embedUrl = getYouTubeEmbedUrl(url)

  // Đóng modal khi bấm phím ESC
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-200"
    >
      <div className="relative w-full max-w-4xl bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-800/80 flex items-center justify-between gap-3 bg-neutral-950/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 shrink-0">
              <YouTubeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate" title={movieTitle}>
                {movieTitle}
              </h3>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <span>Video Trailer chính thức</span>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-0.5 text-red-400 hover:text-red-300 hover:underline"
                    title="Mở trực tiếp trên YouTube"
                  >
                    <span>Mở YouTube</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Đóng trailer (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khung phát video tỷ lệ chuẩn điện ảnh 16:9 */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Trailer ${movieTitle}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="p-6 text-center space-y-2 text-neutral-400">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm font-medium text-neutral-300">
                Không thể tải video Trailer
              </p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Đường dẫn Trailer YouTube chưa hợp lệ hoặc video này đã bị gỡ khỏi YouTube.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
