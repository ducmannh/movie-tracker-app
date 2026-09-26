import { useEffect } from "react"
import { Trash2, X, Loader2, Film } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface DeleteItemDetails {
  posterUrl?: string | null
  subtitle?: string
  badge?: string
}

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  description?: React.ReactNode
  itemName?: string
  itemDetails?: DeleteItemDetails
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  description,
  itemName,
  itemDetails,
  confirmText = "Xóa vĩnh viễn",
  cancelText = "Hủy bỏ",
  isLoading = false,
}: ConfirmDeleteModalProps) {
  // Lắng nghe phím Escape để đóng modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200"
    >
      <div className="relative w-full max-w-md bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800/90 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors disabled:opacity-50 cursor-pointer"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Khối Header với Icon cảnh báo phát sáng */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/40">
            <Trash2 className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-semibold text-white tracking-tight">
              {title}
            </h3>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              {description || (
                <>
                  Bạn có chắc chắn muốn xóa{" "}
                  {itemName ? (
                    <span className="font-semibold text-rose-300">
                      &ldquo;{itemName}&rdquo;
                    </span>
                  ) : (
                    "mục này"
                  )}
                  ? Hành động này sẽ không thể hoàn tác.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Khối Preview chi tiết item (nếu có poster / thông tin) */}
        {itemDetails && (
          <div className="mt-4 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center gap-3">
            <div className="relative shrink-0 w-11 h-15 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              {itemDetails.posterUrl ? (
                <img
                  src={itemDetails.posterUrl}
                  alt={itemName || "Poster"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Film className="w-5 h-5 text-neutral-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">
                {itemName || "Không có tên"}
              </h4>
              {itemDetails.subtitle && (
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  {itemDetails.subtitle}
                </p>
              )}
              {itemDetails.badge && (
                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                  {itemDetails.badge}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl border border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
