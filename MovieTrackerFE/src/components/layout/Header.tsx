import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser, useLogout } from "@/features/auth"
import { useMovies } from "@/features/movies/hooks/useMovies"
import { GenreCatalogModal } from "@/features/movies/components/GenreCatalogModal"
import { LanguageCatalogModal } from "@/features/movies/components/LanguageCatalogModal"
import type { Movie } from "@/features/movies/types"
import { LogOut, Sparkles, Plus, Loader2, Tags, Globe, ChevronDown, SlidersHorizontal } from "lucide-react"
import { BrandLogo } from "@/components/common/BrandLogo"

interface HeaderProps {
  onAddMovie?: () => void
  movies?: Movie[]
}

export function Header({ onAddMovie, movies: propMovies }: HeaderProps) {
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: user, isLoading: isUserLoading } = useCurrentUser()
  const logoutMutation = useLogout()
  const { data: queryMovies = [] } = useMovies()

  // Xử lý đóng menu tài khoản khi click bên ngoài hoặc nhấn phím Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false)
      }
    }
    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isAccountMenuOpen])

  const movies = propMovies ?? queryMovies
  const watchedCount = movies.filter((m) => m.status === "Watched").length
  const planCount = movies.filter((m) => m.status === "PlanToWatch").length

  return (
    <>
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800/60 pb-5">
        {/* Cụm trái: Logo MovieTracker + Phân cách + Nhật Ký Điện Ảnh & Thống kê */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-xl bg-violet-600/10 border border-violet-500/20 shadow-lg shadow-violet-500/10 shrink-0">
              <BrandLogo className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              MovieTracker
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30 font-medium">
                v1.0
              </span>
            </h1>
          </div>

          {/* Đường phân cách */}
          <div className="hidden sm:block w-px h-6 bg-neutral-800/80" />

          {/* Nhật Ký Điện Ảnh và các số liệu thống kê */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-neutral-800/80 shadow-sm">
              <span>
                Tổng cộng: <strong className="text-white font-semibold">{movies.length}</strong> phim
              </span>
              <span className="text-neutral-700">•</span>
              <span className="text-emerald-400">
                Đã xem: <strong className="font-semibold">{watchedCount}</strong>
              </span>
              <span className="text-neutral-700">•</span>
              <span className="text-sky-400">
                Sẽ xem: <strong className="font-semibold">{planCount}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Cụm phải: Nút Thêm Phim Mới + Menu Tài Khoản chứa Tuỳ chọn Danh mục */}
        <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-auto">
          {onAddMovie && (
            <Button
              onClick={onAddMovie}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs h-8 px-3.5 rounded-xl shadow-md shadow-violet-600/20 font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm phim mới</span>
            </Button>
          )}

          {isUserLoading ? (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 px-3 py-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
              <span>Kiểm tra phiên...</span>
            </div>
          ) : user ? (
            <div className="relative" ref={menuRef}>
              {/* Nút bấm Tài khoản */}
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2 bg-neutral-900/70 hover:bg-neutral-800/90 border transition-all px-2.5 py-1.5 rounded-xl shadow-sm cursor-pointer select-none ${
                  isAccountMenuOpen
                    ? "border-violet-500/50 bg-neutral-800/90 ring-2 ring-violet-500/20"
                    : "border-neutral-800/80 hover:border-neutral-700"
                }`}
                title="Tùy chọn tài khoản"
              >
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                  {(user.fullName || user.username).charAt(0).toUpperCase()}
                </div>
                {/* Tên người dùng */}
                <span className="max-w-27.5 sm:max-w-37.5 truncate text-xs font-medium text-neutral-200">
                  {user.fullName || user.username}
                </span>
                {/* Chevron icon */}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                    isAccountMenuOpen ? "rotate-180 text-violet-400" : ""
                  }`}
                />
              </button>

              {/* Menu Dropdown Tài Khoản */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Thông tin người dùng */}
                  <div className="px-3 py-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-violet-600/25 border border-violet-500/40 text-violet-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {(user.fullName || user.username).charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {user.fullName || user.username}
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {user.email || user.username}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nhãn nhóm: Cấu hình danh mục */}
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-violet-400" />
                    <span>Cấu hình danh mục</span>
                  </div>

                  {/* Tuỳ chọn: Cấu hình danh mục thể loại */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGenreModalOpen(true)
                      setIsAccountMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-violet-600/15 transition-colors cursor-pointer group text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-800/80 group-hover:bg-violet-600/25 text-violet-400 flex items-center justify-center shrink-0 transition-colors border border-neutral-700/50 group-hover:border-violet-500/40">
                      <Tags className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-200 group-hover:text-white">
                        Cấu hình danh mục thể loại
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Quản lý danh sách thể loại phim
                      </p>
                    </div>
                  </button>

                  {/* Tuỳ chọn: Cấu hình danh mục ngôn ngữ */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLanguageModalOpen(true)
                      setIsAccountMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-sky-600/15 transition-colors cursor-pointer group text-left mt-0.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-800/80 group-hover:bg-sky-600/25 text-sky-400 flex items-center justify-center shrink-0 transition-colors border border-neutral-700/50 group-hover:border-sky-500/40">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-200 group-hover:text-white">
                        Cấu hình danh mục ngôn ngữ
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        Quản lý ngôn ngữ trong phim
                      </p>
                    </div>
                  </button>

                  {/* Đường phân cách */}
                  <div className="my-1.5 border-t border-neutral-800/80" />

                  {/* Tuỳ chọn: Đăng xuất */}
                  <button
                    type="button"
                    disabled={logoutMutation.isPending}
                    onClick={() => {
                      setIsAccountMenuOpen(false)
                      logoutMutation.mutate()
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer group text-left disabled:opacity-50"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-800/80 group-hover:bg-rose-500/20 text-neutral-400 group-hover:text-rose-400 flex items-center justify-center shrink-0 transition-colors border border-neutral-700/50 group-hover:border-rose-500/30">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium">
                      {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất tài khoản"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Badge variant="outline" className="text-xs gap-1.5 py-1 px-2.5 border-amber-500/30 text-amber-400 bg-amber-500/10">
              <Sparkles className="w-3 h-3" />
              Chưa đăng nhập
            </Badge>
          )}
        </div>
      </header>

      {/* Modal Cấu hình Danh mục Thể loại */}
      <GenreCatalogModal
        isOpen={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
      />

      {/* Modal Cấu hình Danh mục Ngôn ngữ */}
      <LanguageCatalogModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </>
  )
}
