import { useState, useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { MovieCard } from "./MovieCard"
import { MoviePosterCard } from "./MoviePosterCard"
import { MovieListItem } from "./MovieListItem"
import { MovieFormModal } from "./MovieFormModal"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"
import { TrailerModal } from "./TrailerModal"
import {
  useMovies,
  useCreateMovie,
  useUpdateMovie,
  useUpdateMovieStatus,
  useDeleteMovie,
} from "../hooks/useMovies"
import { useLanguages } from "../hooks/useCatalog"
import type { Movie, CreateMovieRequest, UpdateMovieRequest, MovieStatus } from "../types"
import {
  Search,
  Film,
  CheckCircle2,
  Bookmark,
  Plus,
  Grid3X3,
  List as ListIcon,
  LayoutGrid,
  ArrowUpDown,
  Globe,
  Clapperboard,
  Tv,
  X,
  Filter,
  RotateCcw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ViewMode = "poster" | "list" | "card"
type SortOption = "latest" | "rating" | "year" | "title"
type MovieTypeFilter = "all" | "Movie" | "Series"

const typeLabels: Record<MovieTypeFilter, string> = {
  all: "Tất cả loại phim",
  Movie: "Phim lẻ",
  Series: "Phim bộ",
}

const sortLabels: Record<SortOption, string> = {
  latest: "Mới cập nhật",
  rating: "Điểm cao nhất",
  year: "Năm phát hành",
  title: "Tên phim (A-Z)",
}

export function MovieList() {
  const [activeTab, setActiveTab] = useState<"Watched" | "PlanToWatch">("Watched")
  const [filterSearch, setFilterSearch] = useState("")
  const [filterType, setFilterType] = useState<MovieTypeFilter>("all")
  const [filterLang, setFilterLang] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("latest")
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("movietracker_view_mode") as ViewMode) || "poster"
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)

  // Lưu chế độ xem ưa thích vào localStorage
  useEffect(() => {
    localStorage.setItem("movietracker_view_mode", viewMode)
  }, [viewMode])

  // React Query hooks
  const { data: movies = [], isLoading, isError } = useMovies()
  const { data: languages = [] } = useLanguages()
  const createMutation = useCreateMovie()
  const updateMutation = useUpdateMovie()
  const updateStatusMutation = useUpdateMovieStatus()
  const deleteMutation = useDeleteMovie()

  // Thu thập danh sách ngôn ngữ khả dụng từ CSDL và các phim hiện có
  const availableLanguages = Array.from(
    new Set([
      ...languages.map((l) => l.name),
      ...movies.map((m) => m.language).filter(Boolean) as string[],
    ])
  ).sort((a, b) => a.localeCompare(b, "vi"))

  const handleOpenAddModal = () => {
    setEditingMovie(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (movie: Movie) => {
    setEditingMovie(movie)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (data: CreateMovieRequest | UpdateMovieRequest) => {
    if (editingMovie) {
      await updateMutation.mutateAsync({
        id: editingMovie.id,
        payload: data as UpdateMovieRequest,
      })
    } else {
      await createMutation.mutateAsync(data as CreateMovieRequest)
    }
  }

  const handleToggleStatus = async (id: number, nextStatus: MovieStatus) => {
    await updateStatusMutation.mutateAsync({ id, status: nextStatus })
  }

  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null)
  const [isDeletingMovie, setIsDeletingMovie] = useState(false)
  const [trailerMovie, setTrailerMovie] = useState<Movie | null>(null)

  const handleRequestDelete = (movie: Movie) => {
    setMovieToDelete(movie)
  }

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return
    try {
      setIsDeletingMovie(true)
      await deleteMutation.mutateAsync(movieToDelete.id)
      setMovieToDelete(null)
    } finally {
      setIsDeletingMovie(false)
    }
  }

  // Đặt lại tất cả bộ lọc
  const isFiltered = filterType !== "all" || filterLang !== "all" || filterSearch.trim() !== ""

  const handleResetFilters = () => {
    setFilterSearch("")
    setFilterType("all")
    setFilterLang("all")
  }

  // Thống kê nhanh
  const watchedMovies = movies.filter((m) => m.status === "Watched")
  const planMovies = movies.filter((m) => m.status === "PlanToWatch")

  // Lọc theo 2 Tab: Đã xem hoặc Sẽ xem
  const currentTabMovies = activeTab === "Watched" ? watchedMovies : planMovies

  // Lọc theo loại phim, ngôn ngữ và từ khóa
  const filtered = currentTabMovies.filter((m) => {
    // 1. Lọc theo Loại phim (Phim lẻ / Phim bộ)
    if (filterType === "Movie" && m.movieType && m.movieType !== "Movie") {
      return false
    }
    if (filterType === "Series" && m.movieType !== "Series") {
      return false
    }

    // 2. Lọc theo Ngôn ngữ trong phim
    if (filterLang !== "all") {
      if (!m.language || m.language.toLowerCase() !== filterLang.toLowerCase()) {
        return false
      }
    }

    // 3. Tìm kiếm theo từ khóa (tên, thể loại, ngôn ngữ, diễn viên, nội dung, loại phim)
    const q = filterSearch.toLowerCase().trim()
    if (!q) return true
    const typeText = m.movieType === "Series" ? "phim bộ series" : "phim lẻ movie"
    return (
      m.title.toLowerCase().includes(q) ||
      (m.genre && m.genre.toLowerCase().includes(q)) ||
      (m.language && m.language.toLowerCase().includes(q)) ||
      (m.actors && m.actors.toLowerCase().includes(q)) ||
      (m.overview && m.overview.toLowerCase().includes(q)) ||
      typeText.includes(q)
    )
  })

  // Sắp xếp
  const sortedMovies = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
    if (sortBy === "year") return (b.releaseYear || 0) - (a.releaseYear || 0)
    if (sortBy === "title") return a.title.localeCompare(b.title)
    // "latest" mặc định theo thời gian cập nhật mới nhất
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header chính: MovieTracker + Nhật Ký Điện Ảnh + Thống kê + Thêm phim + Đăng xuất gọn gàng */}
      <Header onAddMovie={handleOpenAddModal} movies={movies} />

      {/* Control Bar: Tabs, Search, Filters, Sort & View Mode Switcher */}
      <section className="space-y-3">
        {/* Control Bar: Hàng điều khiển duy nhất (Tabs, Search, Select Filters, Sort, Reset & View Mode) */}
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-between gap-2.5 pb-3 border-b border-neutral-800/60">
          {/* Nhóm trái: 2 Tabs trạng thái (Đã xem & Sẽ xem) */}
          <div className="flex items-center gap-1 bg-neutral-900/60 backdrop-blur-md p-1 rounded-xl border border-neutral-800/80 shrink-0 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("Watched")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "Watched"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã xem
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-neutral-950/40 font-semibold">
                {watchedMovies.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PlanToWatch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "PlanToWatch"
                  ? "bg-sky-600 text-white shadow"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Sẽ xem
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-neutral-950/40 font-semibold">
                {planMovies.length}
              </span>
            </button>
          </div>

          {/* Nhóm phải: Tất cả trên 1 hàng (Search Bar + Lọc loại phim + Lọc ngôn ngữ + Sắp xếp + Đặt lại + View Mode) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
            {/* Ô tìm kiếm nhanh với Icon Search nổi rõ ràng & nút Xóa nhanh */}
            <div className="relative w-full sm:w-56 md:w-64 lg:w-72 xl:w-80 2xl:w-96 shrink-0 transition-all duration-200">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Tìm phim, thể loại, diễn viên..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="pl-9 pr-7 h-9 text-xs bg-neutral-900/60 backdrop-blur-md border-neutral-800/80 text-white placeholder:text-neutral-500 rounded-xl focus-visible:ring-violet-500 focus-visible:border-violet-500/50"
              />
              {filterSearch && (
                <button
                  type="button"
                  onClick={() => setFilterSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer z-10"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Select Loại phim (Sử dụng thư viện UI cao cấp) */}
            <Select
              value={filterType}
              onValueChange={(val) => setFilterType((val ?? "all") as MovieTypeFilter)}
            >
              <SelectTrigger
                className={`h-9 px-2.5 text-xs rounded-xl backdrop-blur-md border transition-all cursor-pointer font-medium gap-1.5 shrink-0 ${
                  filterType !== "all"
                    ? "bg-violet-600/15 border-violet-500/60 text-violet-200"
                    : "bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:border-neutral-700"
                }`}
                title="Lọc theo loại phim"
              >
                {filterType === "Series" ? (
                  <Tv className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                ) : filterType === "Movie" ? (
                  <Clapperboard className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                ) : (
                  <Film className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
                <SelectValue>
                  {typeLabels[filterType] || "Tất cả loại phim"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 text-neutral-200 shadow-2xl rounded-xl p-1 min-w-37.5"
              >
                <SelectItem value="all">Tất cả loại phim</SelectItem>
                <SelectItem value="Movie">🎬 Phim lẻ</SelectItem>
                <SelectItem value="Series">📺 Phim bộ</SelectItem>
              </SelectContent>
            </Select>

            {/* Select Ngôn ngữ trong phim (Sử dụng thư viện UI cao cấp) */}
            <Select
              value={filterLang}
              onValueChange={(val) => setFilterLang(val ?? "all")}
            >
              <SelectTrigger
                className={`h-9 px-2.5 text-xs rounded-xl backdrop-blur-md border transition-all cursor-pointer font-medium gap-1.5 shrink-0 max-w-38.75 ${
                  filterLang !== "all"
                    ? "bg-sky-600/15 border-sky-500/60 text-sky-200"
                    : "bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:border-neutral-700"
                }`}
                title="Lọc theo ngôn ngữ trong phim"
              >
                <Globe
                  className={`w-3.5 h-3.5 shrink-0 ${
                    filterLang !== "all" ? "text-sky-400" : "text-neutral-400"
                  }`}
                />
                <SelectValue>
                  {filterLang === "all" ? "Tất cả ngôn ngữ" : filterLang}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 text-neutral-200 shadow-2xl rounded-xl p-1 min-w-40 max-h-60"
              >
                <SelectItem value="all">Tất cả ngôn ngữ</SelectItem>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Select Sắp xếp (Sử dụng thư viện UI cao cấp) */}
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy((val ?? "latest") as SortOption)}
            >
              <SelectTrigger
                className="h-9 px-2.5 text-xs bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-xl gap-1.5 hover:border-neutral-700 transition-colors text-neutral-300 cursor-pointer font-medium shrink-0"
                title="Sắp xếp danh sách phim"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <SelectValue>
                  {sortLabels[sortBy] || "Mới cập nhật"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger={false}
                className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 text-neutral-200 shadow-2xl rounded-xl p-1 min-w-38.75"
              >
                <SelectItem value="latest">Mới cập nhật</SelectItem>
                <SelectItem value="rating">⭐ Điểm cao nhất</SelectItem>
                <SelectItem value="year">📅 Năm phát hành</SelectItem>
                <SelectItem value="title">🔤 Tên phim (A-Z)</SelectItem>
              </SelectContent>
            </Select>

            {/* Nút Xóa bộ lọc nhanh (chỉ hiện khi đang có tiêu chí lọc) */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-300 bg-neutral-900/60 hover:bg-rose-500/10 border border-neutral-800 hover:border-rose-500/30 px-2.5 h-9 rounded-xl transition-all cursor-pointer shadow-sm shrink-0 animate-in fade-in zoom-in-95 duration-150"
                title="Đặt lại toàn bộ bộ lọc"
              >
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span>Đặt lại</span>
              </button>
            )}

            {/* View Mode Switcher: 1. Thẻ chi tiết | 2. Lưới Poster | 3. Danh sách cô đọng */}
            <div className="flex items-center gap-0.5 bg-neutral-900/60 backdrop-blur-md p-0.5 rounded-xl border border-neutral-800/80 shadow-sm shrink-0">
              {/* 1. Thẻ chi tiết */}
              <button
                type="button"
                onClick={() => setViewMode("card")}
                title="Thẻ chi tiết (Đọc cảm nhận & ghi chú)"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "card"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              {/* 2. Lưới Poster */}
              <button
                type="button"
                onClick={() => setViewMode("poster")}
                title="Lưới Poster (Tối đa số lượng phim trên màn hình)"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "poster"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>

              {/* 3. Danh sách cô đọng */}
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="Danh sách cô đọng (Mật độ thông tin cao nhất)"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Thanh chip hiển thị bộ lọc đang áp dụng */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5 pb-1 animate-in fade-in-50 duration-200">
            <span className="text-neutral-500 flex items-center gap-1 text-[11px] font-medium">
              <Filter className="w-3 h-3 text-violet-400" />
              Đang lọc:
            </span>

            {filterType !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-200 font-medium text-xs">
                {filterType === "Movie" ? (
                  <>
                    <Clapperboard className="w-3 h-3 text-violet-400" /> Phim lẻ
                  </>
                ) : (
                  <>
                    <Tv className="w-3 h-3 text-sky-400" /> Phim bộ
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className="p-0.5 hover:text-white rounded transition-colors cursor-pointer"
                  title="Bỏ lọc loại phim"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterLang !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-600/20 border border-sky-500/40 text-sky-200 font-medium text-xs">
                <Globe className="w-3 h-3 text-sky-400" />
                {filterLang}
                <button
                  type="button"
                  onClick={() => setFilterLang("all")}
                  className="p-0.5 hover:text-white rounded transition-colors cursor-pointer"
                  title="Bỏ lọc ngôn ngữ"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterSearch.trim() && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/90 border border-neutral-700 text-neutral-200 text-xs">
                <Search className="w-3 h-3 text-neutral-400" />
                "{filterSearch.trim()}"
                <button
                  type="button"
                  onClick={() => setFilterSearch("")}
                  className="p-0.5 hover:text-white rounded transition-colors cursor-pointer"
                  title="Xóa từ khóa tìm kiếm"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-neutral-400 hover:text-rose-400 transition-colors underline cursor-pointer ml-1"
            >
              Xóa tất cả
            </button>

            <span className="ml-auto text-[11px] text-neutral-400 font-medium">
              Hiển thị <strong className="text-white">{sortedMovies.length}</strong> / {currentTabMovies.length} phim
            </span>
          </div>
        )}

        {/* Content Display */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="aspect-2/3 bg-neutral-900/50 border border-neutral-800/60 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl space-y-2">
            <p className="text-sm text-rose-400">Không thể tải danh sách phim lúc này.</p>
            <p className="text-xs text-neutral-500">Vui lòng kiểm tra kết nối API backend và thử lại.</p>
          </div>
        ) : sortedMovies.length === 0 ? (
          <div className="py-16 px-4 text-center bg-neutral-900/40 backdrop-blur-md border border-neutral-800/70 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-neutral-500 border border-neutral-700/40">
              <Film className="w-7 h-7" />
            </div>
            {isFiltered ? (
              <>
                <h3 className="text-base font-semibold text-neutral-200">
                  Không tìm thấy phim phù hợp với bộ lọc
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  {filterSearch && (
                    <span className="block mb-1">Từ khóa: "{filterSearch}"</span>
                  )}
                  Thử đổi loại phim, ngôn ngữ hoặc xóa bộ lọc để tìm thấy phim bạn muốn.
                </p>
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="mt-1 text-xs border-neutral-700 hover:bg-neutral-800 text-neutral-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-violet-400" /> Đặt lại tất cả bộ lọc
                </Button>
              </>
            ) : movies.length === 0 ? (
              <>
                <h3 className="text-base font-semibold text-neutral-200">
                  Danh sách phim của bạn đang trống
                </h3>
                <p className="text-xs text-neutral-400 max-w-md">
                  Hãy bắt đầu bằng cách thêm bộ phim đầu tiên bạn đã xem hoặc sẽ xem vào bộ sưu tập cá nhân!
                </p>
                <Button
                  onClick={handleOpenAddModal}
                  className="mt-2 bg-violet-600 hover:bg-violet-500 text-white text-xs h-9 px-4 rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Thêm phim ngay
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-neutral-200">
                  Chưa có phim nào ở mục {activeTab === "Watched" ? "Đã xem" : "Sẽ xem"}
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  Hãy đổi trạng thái hoặc thêm phim mới để xuất hiện tại đây.
                </p>
              </>
            )}
          </div>
        ) : viewMode === "poster" ? (
          /* CHẾ ĐỘ 1: LƯỚI POSTER ĐIỆN ẢNH (Hiển thị được tối đa 6 - 8 phim trên một hàng) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 gap-3 sm:gap-4">
            {sortedMovies.map((movie) => (
              <MoviePosterCard
                key={movie.id}
                movie={movie}
                onToggleStatus={handleToggleStatus}
                onEdit={handleOpenEditModal}
                onDelete={handleRequestDelete}
                onWatchTrailer={(m) => setTrailerMovie(m)}
              />
            ))}
          </div>
        ) : viewMode === "list" ? (
          /* CHẾ ĐỘ 2: BẢNG DANH SÁCH THU GỌN (Hiển thị 20 - 30 phim trên một màn hình) */
          <div className="flex flex-col gap-2">
            {sortedMovies.map((movie) => (
              <MovieListItem
                key={movie.id}
                movie={movie}
                onToggleStatus={handleToggleStatus}
                onEdit={handleOpenEditModal}
                onDelete={handleRequestDelete}
                onWatchTrailer={(m) => setTrailerMovie(m)}
              />
            ))}
          </div>
        ) : (
          /* CHẾ ĐỘ 3: THẺ CHI TIẾT (Hiển thị cả cảm nhận / ghi chú) */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sortedMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onToggleStatus={handleToggleStatus}
                onEdit={handleOpenEditModal}
                onDelete={handleRequestDelete}
                onWatchTrailer={(m) => setTrailerMovie(m)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal Thêm & Chỉnh Sửa Phim */}
      <MovieFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingMovie}
      />

      {/* Modal Xem Video Trailer YouTube */}
      <TrailerModal
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
        movie={trailerMovie}
      />

      {/* Dialog Xác Nhận Xóa Phim (UI Cao Cấp Dark Cinema) */}
      <ConfirmDeleteModal
        isOpen={!!movieToDelete}
        onClose={() => setMovieToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phim"
        itemName={movieToDelete?.title}
        itemDetails={
          movieToDelete
            ? {
                posterUrl: movieToDelete.posterUrl,
                subtitle: [
                  movieToDelete.releaseYear,
                  movieToDelete.genre,
                  movieToDelete.language,
                ]
                  .filter(Boolean)
                  .join(" • "),
                badge:
                  movieToDelete.movieType === "Series"
                    ? `📺 Phim bộ${movieToDelete.episodeCount ? ` (${movieToDelete.episodeCount} tập)` : ""}`
                    : `🎬 Phim lẻ${movieToDelete.durationMinutes ? ` (${movieToDelete.durationMinutes} phút)` : ""}`,
              }
            : undefined
        }
        isLoading={isDeletingMovie}
      />
    </div>
  )
}
