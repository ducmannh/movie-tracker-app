import { useState, useEffect, useRef } from "react"
import {
  X,
  Film,
  Star,
  Loader2,
  Image as ImageIcon,
  UploadCloud,
  ClipboardPaste,
  CheckCircle2,
  User,
  Globe,
  Plus,
  Tags,
  ChevronDown,
  Check,
  Clapperboard,
  Tv,
  Clock,
  Layers,
  Video,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StarRating } from "./StarRating"
import { movieApi } from "../api/movieApi"
import { useGenres, useLanguages } from "../hooks/useCatalog"
import { GenreCatalogModal } from "./GenreCatalogModal"
import { LanguageCatalogModal } from "./LanguageCatalogModal"
import { TrailerModal } from "./TrailerModal"
import { isValidYouTubeUrl, extractYouTubeId } from "../utils/youtube"
import { YouTubeIcon } from "./YouTubeIcon"
import { getImageUrl } from "../utils/image"
import type { Movie, CreateMovieRequest, UpdateMovieRequest, MovieStatus, MovieType } from "../types"

interface MovieFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateMovieRequest | UpdateMovieRequest) => Promise<void>
  initialData?: Movie | null
}

interface SearchedActor {
  id: number
  name: string
  country?: string
  birthday?: string
  imageUrl?: string
}

export interface CastMember {
  actor: string
  character?: string
}

// Chuyển chuỗi actors trong CSDL thành mảng CastMember
export const parseActorsString = (str?: string | null): CastMember[] => {
  if (!str || !str.trim()) return []
  return str
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      // Hỗ trợ định dạng: "Tên Diễn Viên (vai Tên Nhân Vật)" hoặc "Tên Diễn Viên (Tên Nhân Vật)"
      const match = item.match(/^(.*?)\s*\((?:vai\s*|role\s*|as\s*)?(.*?)\)$/i)
      if (match) {
        return {
          actor: match[1].trim(),
          character: match[2].trim(),
        }
      }
      return {
        actor: item,
        character: "",
      }
    })
}

// Chuyển mảng CastMember thành chuỗi lưu vào CSDL
export const formatCastList = (cast: CastMember[]): string | undefined => {
  if (cast.length === 0) return undefined
  const items = cast
    .map((c) => {
      const act = c.actor.trim()
      const char = c.character?.trim()
      return char ? `${act} (vai ${char})` : act
    })
    .filter(Boolean)
  return items.length > 0 ? items.join(", ") : undefined
}

export function MovieFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: MovieFormModalProps) {
  const [title, setTitle] = useState("")
  const [englishTitle, setEnglishTitle] = useState("")
  const [movieType, setMovieType] = useState<MovieType>("Movie")
  const [durationMinutes, setDurationMinutes] = useState<string>("")
  const [season, setSeason] = useState<string>("")
  const [episodeCount, setEpisodeCount] = useState<string>("")
  const [releaseYear, setReleaseYear] = useState<string>("")
  const [genre, setGenre] = useState("")
  const [language, setLanguage] = useState("")
  const [castList, setCastList] = useState<CastMember[]>([])
  const [actorInput, setActorInput] = useState("")
  const [characterInput, setCharacterInput] = useState("")
  const actorInputRef = useRef<HTMLInputElement>(null)
  const characterInputRef = useRef<HTMLInputElement>(null)
  const [posterUrl, setPosterUrl] = useState("")
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [status, setStatus] = useState<MovieStatus>("Watched")
  const [rating, setRating] = useState<number>(8)
  const [trailerUrl, setTrailerUrl] = useState("")
  const [trailerError, setTrailerError] = useState("")
  const [previewTrailerId, setPreviewTrailerId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleTrailerChange = (val: string) => {
    setTrailerUrl(val)
    if (!val.trim()) {
      setTrailerError("")
      return
    }
    if (!isValidYouTubeUrl(val)) {
      setTrailerError("Đường link Trailer chỉ chấp nhận liên kết video từ YouTube (youtube.com hoặc youtu.be).")
    } else {
      setTrailerError("")
    }
  }

  // Quản lý Modal Cấu hình danh mục riêng biệt (Thể loại / Ngôn ngữ)
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)

  // Tải danh mục Thể loại và Ngôn ngữ từ backend (CSDL)
  const { data: genres = [] } = useGenres()
  const { data: languages = [] } = useLanguages()

  // State hỗ trợ kéo thả, copy dán ảnh
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState("")

  // State tìm kiếm diễn viên toàn cầu qua TVMaze Open API
  const [actorSearchResults, setActorSearchResults] = useState<SearchedActor[]>([])
  const [isSearchingActors, setIsSearchingActors] = useState(false)
  const [showActorDropdown, setShowActorDropdown] = useState(false)
  const actorSearchRef = useRef<HTMLDivElement>(null)

  // Quản lý Select dropdown cho Thể loại (chọn nhiều) và Ngôn ngữ (chọn 1)
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false)
  const [genreSearch, setGenreSearch] = useState("")
  const genreDropdownRef = useRef<HTMLDivElement>(null)

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
  const [langSearch, setLangSearch] = useState("")
  const langDropdownRef = useRef<HTMLDivElement>(null)

  // Danh sách các thể loại đang chọn (tách từ chuỗi genre)
  const selectedGenres = genre
    ? genre.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const toggleGenre = (genreName: string) => {
    const exists = selectedGenres.some(
      (g) => g.toLowerCase() === genreName.toLowerCase()
    )
    let updated: string[]
    if (exists) {
      updated = selectedGenres.filter(
        (g) => g.toLowerCase() !== genreName.toLowerCase()
      )
    } else {
      updated = [...selectedGenres, genreName]
    }
    setGenre(updated.join(", "))
  }

  const removeGenre = (genreName: string) => {
    const updated = selectedGenres.filter(
      (g) => g.toLowerCase() !== genreName.toLowerCase()
    )
    setGenre(updated.join(", "))
  }

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(genreSearch.toLowerCase().trim())
  )

  const filteredLanguages = languages.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase().trim())
  )

  // Gọi API tìm kiếm diễn viên thế giới khi người dùng gõ
  useEffect(() => {
    const query = actorInput.trim()
    if (query.length < 2) {
      setActorSearchResults([])
      setIsSearchingActors(false)
      setShowActorDropdown(false)
      return
    }

    setIsSearchingActors(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.tvmaze.com/search/people?q=${encodeURIComponent(query)}`
        )
        if (response.ok) {
          const data = await response.json()
          const mapped: SearchedActor[] = data.map((item: any) => ({
            id: item.person.id,
            name: item.person.name,
            country: item.person.country?.name,
            birthday: item.person.birthday ? item.person.birthday.split("-")[0] : undefined,
            imageUrl: item.person.image?.medium,
          }))
          setActorSearchResults(mapped)
          setShowActorDropdown(true)
        }
      } catch {
        setActorSearchResults([])
      } finally {
        setIsSearchingActors(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [actorInput])

  // Đóng dropdown khi click chuột ra ngoài khu vực tìm kiếm hoặc select
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        actorSearchRef.current &&
        !actorSearchRef.current.contains(target)
      ) {
        setShowActorDropdown(false)
      }
      if (
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(target)
      ) {
        setIsGenreDropdownOpen(false)
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(target)
      ) {
        setIsLangDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setEnglishTitle(initialData.englishTitle ?? "")
      setMovieType(initialData.movieType || "Movie")
      setDurationMinutes(initialData.durationMinutes ? String(initialData.durationMinutes) : "")
      setSeason(initialData.season ? String(initialData.season) : "")
      setEpisodeCount(initialData.episodeCount ? String(initialData.episodeCount) : "")
      setReleaseYear(initialData.releaseYear ? String(initialData.releaseYear) : "")
      setGenre(initialData.genre ?? "")
      setLanguage(initialData.language ?? "")
      setCastList(parseActorsString(initialData.actors))
      setPosterUrl(initialData.posterUrl ?? "")
      setPreviewUrl(initialData.posterUrl ?? "")
      setStatus(initialData.status)
      setRating(initialData.rating ?? 8)
      setTrailerUrl(initialData.trailerUrl ?? "")
    } else {
      setTitle("")
      setEnglishTitle("")
      setMovieType("Movie")
      setDurationMinutes("")
      setSeason("")
      setEpisodeCount("")
      setReleaseYear(new Date().getFullYear().toString())
      setGenre("")
      setLanguage("")
      setCastList([])
      setPosterUrl("")
      setPreviewUrl("")
      setStatus("Watched")
      setRating(8)
      setTrailerUrl("")
    }
    setTrailerError("")
    setPendingImageFile(null)
    setActorInput("")
    setCharacterInput("")
    setError("")
    setUploadError("")
    setIsDragging(false)
    setShowActorDropdown(false)
    setIsGenreDropdownOpen(false)
    setIsLangDropdownOpen(false)
    setGenreSearch("")
    setLangSearch("")
  }, [initialData, isOpen])

  // Chọn diễn viên từ danh sách gợi ý TVMaze: điền tên và tự động nhảy con trỏ sang ô vai diễn
  const handleSelectActorFromDropdown = (name: string) => {
    setActorInput(name)
    setShowActorDropdown(false)
    setTimeout(() => {
      characterInputRef.current?.focus()
    }, 50)
  }

  // Thêm diễn viên & vai diễn vào danh sách
  const handleAddCastMember = (explicitActor?: string, explicitCharacter?: string) => {
    const actorName = (explicitActor !== undefined ? explicitActor : actorInput).trim()
    const charName = (explicitCharacter !== undefined ? explicitCharacter : characterInput).trim()

    if (!actorName) return

    // Hỗ trợ trường hợp copy dán danh sách diễn viên ngăn cách bằng dấu phẩy
    if (actorName.includes(",")) {
      const parsed = parseActorsString(actorName)
      if (parsed.length > 0) {
        setCastList((prev) => {
          const existingNames = new Set(prev.map((c) => c.actor.toLowerCase()))
          const toAdd = parsed.filter((p) => !existingNames.has(p.actor.toLowerCase()))
          return [...prev, ...toAdd]
        })
        setActorInput("")
        setCharacterInput("")
        setShowActorDropdown(false)
        return
      }
    }

    setCastList((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.actor.toLowerCase() === actorName.toLowerCase()
      )
      if (existingIndex >= 0) {
        // Cập nhật vai diễn nếu diễn viên đã có trong danh sách
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          character: charName || updated[existingIndex].character,
        }
        return updated
      }
      return [...prev, { actor: actorName, character: charName || undefined }]
    })

    setActorInput("")
    setCharacterInput("")
    setShowActorDropdown(false)
    actorInputRef.current?.focus()
  }

  // Xóa diễn viên khỏi danh sách
  const handleRemoveCastMember = (indexToRemove: number) => {
    setCastList((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // Sửa lại diễn viên/vai diễn khi bấm vào tên trong danh sách
  const handleEditCastMember = (index: number) => {
    const target = castList[index]
    if (!target) return
    setActorInput(target.actor)
    setCharacterInput(target.character || "")
    setCastList((prev) => prev.filter((_, idx) => idx !== index))
    characterInputRef.current?.focus()
  }

  // Bắt phím khi nhập tên diễn viên
  const handleActorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (actorInput.trim()) {
        if (characterInput.trim()) {
          handleAddCastMember()
        } else {
          setShowActorDropdown(false)
          characterInputRef.current?.focus()
        }
      }
    } else if (e.key === "Backspace" && !actorInput && castList.length > 0) {
      handleRemoveCastMember(castList.length - 1)
    }
  }

  // Bắt phím Enter khi nhập tên nhân vật/vai diễn
  const handleCharacterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (actorInput.trim()) {
        handleAddCastMember()
      }
    }
  }

  // Chọn tệp ảnh cục bộ (tạo preview qua ObjectURL, CHƯA upload lên wwwroot)
  const handleSelectImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Tệp được chọn không phải là hình ảnh hợp lệ.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Dung lượng hình ảnh không được vượt quá 10MB.")
      return
    }

    setUploadError("")
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    const localUrl = URL.createObjectURL(file)
    setPendingImageFile(file)
    setPreviewUrl(localUrl)
  }

  // Xóa ảnh poster đã chọn
  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setPendingImageFile(null)
    setPosterUrl("")
    setPreviewUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Lắng nghe sự kiện Paste (Ctrl + V) bất cứ lúc nào trong Modal
  useEffect(() => {
    if (!isOpen) return

    const handleGlobalPaste = (e: ClipboardEvent) => {
      // 1. Kiểm tra nếu trong clipboard có tệp ảnh (Screenshot, Copy Image trên web, Snipping tool...)
      const items = e.clipboardData?.items
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            const file = items[i].getAsFile()
            if (file) {
              e.preventDefault()
              handleSelectImageFile(file)
              return
            }
          }
        }
      }

      // 2. Nếu đang gõ text vào các input/textarea khác thì không can thiệp paste text
      const activeEl = document.activeElement
      const isTypingText =
        activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA"

      if (!isTypingText) {
        const text = e.clipboardData?.getData("text")?.trim()
        if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
          if (previewUrl && previewUrl.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl)
          }
          setPendingImageFile(null)
          setPosterUrl(text)
          setPreviewUrl(text)
        }
      }
    }

    window.addEventListener("paste", handleGlobalPaste)
    return () => {
      window.removeEventListener("paste", handleGlobalPaste)
    }
  }, [isOpen, previewUrl])

  // Kéo thả ảnh vào khu vực dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    // A. Kéo thả file từ máy tính
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        handleSelectImageFile(file)
        return
      } else {
        setUploadError("Vui lòng thả đúng tệp hình ảnh.")
        return
      }
    }

    // B. Kéo thả trực tiếp ảnh từ tab trình duyệt khác
    const uri =
      e.dataTransfer.getData("text/uri-list") ||
      e.dataTransfer.getData("text/plain")
    if (uri && (uri.startsWith("http://") || uri.startsWith("https://"))) {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
      setPendingImageFile(null)
      setPosterUrl(uri.trim())
      setPreviewUrl(uri.trim())
    }
  }

  const handleDropzoneClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleSelectImageFile(files[0])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Vui lòng nhập tên phim.")
      return
    }

    if (trailerUrl.trim() && !isValidYouTubeUrl(trailerUrl)) {
      setTrailerError("Đường link Trailer chỉ chấp nhận liên kết video từ YouTube (youtube.com hoặc youtu.be).")
      setError("Đường link Trailer không hợp lệ. Vui lòng kiểm tra lại.")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      let finalPosterUrl = posterUrl

      // Chỉ khi người dùng bấm Lưu, tệp ảnh mới được tải lên và lưu vào wwwroot!
      if (pendingImageFile) {
        finalPosterUrl = await movieApi.uploadPoster(pendingImageFile)
      } else if (!previewUrl) {
        // Người dùng đã xóa ảnh hoặc không chọn ảnh
        finalPosterUrl = ""
      }

      const yearNum = releaseYear ? parseInt(releaseYear, 10) : undefined
      const durNum = movieType === "Movie" && durationMinutes.trim() ? parseInt(durationMinutes, 10) : undefined
      const seasonNum = movieType === "Series" && season.trim() ? parseInt(season, 10) : undefined
      const epNum = movieType === "Series" && episodeCount.trim() ? parseInt(episodeCount, 10) : undefined

      const finalCastList = [...castList]
      if (actorInput.trim()) {
        const existingIdx = finalCastList.findIndex(
          (c) => c.actor.toLowerCase() === actorInput.trim().toLowerCase()
        )
        if (existingIdx < 0) {
          finalCastList.push({
            actor: actorInput.trim(),
            character: characterInput.trim() || undefined,
          })
        }
      }

      await onSubmit({
        title: title.trim(),
        englishTitle: englishTitle.trim() || undefined,
        movieType: movieType,
        durationMinutes: isNaN(durNum as number) ? undefined : durNum,
        season: isNaN(seasonNum as number) ? undefined : seasonNum,
        episodeCount: isNaN(epNum as number) ? undefined : epNum,
        releaseYear: isNaN(yearNum as number) ? undefined : yearNum,
        genre: genre.trim() || undefined,
        language: language.trim() || undefined,
        actors: formatCastList(finalCastList),
        posterUrl: finalPosterUrl.trim() || undefined,
        trailerUrl: trailerUrl.trim() || undefined,
        overview: initialData?.overview ?? undefined,
        status: status,
        rating: status === "Watched" ? rating : undefined,
      })

      onClose()
    } catch (err: any) {
      setError(err?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50 duration-200"
    >
      <div className="relative w-full max-w-lg bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialData ? "Chỉnh sửa thông tin phim" : "Thêm phim mới vào danh sách"}
              </h3>
              <p className="text-xs text-neutral-400">
                {initialData ? "Cập nhật đánh giá và chi tiết phim" : "Nhập thông tin phim bạn đã xem hoặc muốn xem"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto scrollbar-gutter-stable p-6 space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Tên phim (Tiếng Việt / Gốc) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between h-5">
              <Label htmlFor="title" className="text-xs font-semibold text-neutral-200">
                Tên phim <span className="text-rose-400">*</span>
              </Label>
            </div>
            <Input
              id="title"
              placeholder="Nhập tên phim"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 bg-neutral-950 border-neutral-800 text-white text-sm focus-visible:ring-violet-500"
              required
            />
          </div>

          {/* Tên phim Tiếng Anh */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between h-5">
              <Label htmlFor="english-title" className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Tên phim tiếng Anh
              </Label>
              <span className="text-[10px] text-neutral-500 font-normal">Tùy chọn</span>
            </div>
            <Input
              id="english-title"
              placeholder="Nhập tên phim Tiếng Anh"
              value={englishTitle}
              onChange={(e) => setEnglishTitle(e.target.value)}
              className="h-9 bg-neutral-950 border-neutral-800 text-white text-sm focus-visible:ring-sky-500"
            />
          </div>

          {/* Phân loại phim: Phim lẻ / Phim bộ */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between h-5">
              <Label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-violet-400" />
                Loại phim
              </Label>
              <span className="text-[11px] text-neutral-400">
                {movieType === "Movie" ? "Phim một tập / điện ảnh" : "Phim nhiều tập / truyền hình"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovieType("Movie")}
                className={`h-9 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  movieType === "Movie"
                    ? "bg-violet-600/25 border-violet-500/70 text-violet-200 shadow-xs"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <Clapperboard className="w-3.5 h-3.5 text-violet-400" />
                <span>Phim lẻ</span>
              </button>

              <button
                type="button"
                onClick={() => setMovieType("Series")}
                className={`h-9 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  movieType === "Series"
                    ? "bg-sky-600/25 border-sky-500/70 text-sky-200 shadow-xs"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-sky-400" />
                <span>Phim bộ</span>
              </button>
            </div>
          </div>

          {/* Chi tiết theo Loại phim: Thời lượng phút cho Phim lẻ, Mùa & Số tập cho Phim bộ */}
          {movieType === "Movie" ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between h-5">
                <Label htmlFor="duration" className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Thời lượng phim (phút)
                </Label>
                {durationMinutes && !isNaN(parseInt(durationMinutes)) && parseInt(durationMinutes) > 0 && (
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    ≈ {Math.floor(parseInt(durationMinutes) / 60)} giờ {parseInt(durationMinutes) % 60} phút
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium pointer-events-none select-none">
                  Phút:
                </span>
                <Input
                  id="duration"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="120"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value.replace(/\D/g, ""))}
                  maxLength={5}
                  className="h-9 pl-14 bg-neutral-950/80 border-neutral-800/80 rounded-xl text-white text-sm focus-visible:ring-violet-500 placeholder:text-neutral-500 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 items-start">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between h-5">
                  <Label htmlFor="season" className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    Mùa (Season)
                  </Label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium pointer-events-none select-none">
                    Mùa:
                  </span>
                  <Input
                    id="season"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="1"
                    value={season}
                    onChange={(e) => setSeason(e.target.value.replace(/\D/g, ""))}
                    maxLength={3}
                    className="h-9 pl-14 bg-neutral-950/80 border-neutral-800/80 rounded-xl text-white text-sm focus-visible:ring-violet-500 placeholder:text-neutral-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between h-5">
                  <Label htmlFor="episodeCount" className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-emerald-400" />
                    Số tập
                  </Label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium pointer-events-none select-none">
                    Tập:
                  </span>
                  <Input
                    id="episodeCount"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="16"
                    value={episodeCount}
                    onChange={(e) => setEpisodeCount(e.target.value.replace(/\D/g, ""))}
                    maxLength={5}
                    className="h-9 pl-14 bg-neutral-950/80 border-neutral-800/80 rounded-xl text-white text-sm focus-visible:ring-violet-500 placeholder:text-neutral-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Năm phát hành & Ngôn ngữ phim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start relative z-20">
            <div>
              <div className="flex items-center justify-between h-5 mb-1.5">
                <Label htmlFor="year" className="text-xs font-semibold text-neutral-200">
                  Năm phát hành
                </Label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium pointer-events-none select-none">
                  Năm:
                </span>
                <Input
                  id="year"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="2024"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  className="h-9 pl-14 bg-neutral-950/80 border-neutral-800/80 rounded-xl text-white text-sm focus-visible:ring-violet-500 placeholder:text-neutral-500 transition-all"
                />
              </div>
            </div>

            {/* Ngôn ngữ phim - Select chọn 1 */}
            <div className="relative" ref={langDropdownRef}>
              <div className="flex items-center justify-between h-5 mb-1.5">
                <Label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  Ngôn ngữ trong phim
                </Label>
                <button
                  type="button"
                  onClick={() => setIsLanguageModalOpen(true)}
                  className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Cấu hình danh mục ngôn ngữ"
                >
                  <Globe className="w-3 h-3" />
                  Cấu hình
                </button>
              </div>

              {/* Wrapper độc lập cho Select trigger và dropdown menu, không chịu tác động của margin/space-y */}
              <div className="relative">
                {/* Hộp Select Ngôn ngữ: chiều cao h-9 chuẩn bằng với ô Năm phát hành */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setIsLangDropdownOpen((prev) => !prev)
                    }
                  }}
                  className={`h-9 w-full px-3 rounded-lg bg-neutral-950 border text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                    isLangDropdownOpen
                      ? "border-sky-500/80 ring-1 ring-sky-500/30"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {language ? (
                      <span className="text-white font-medium flex items-center gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        {language}
                      </span>
                    ) : (
                      <span className="text-neutral-500">
                        Chọn ngôn ngữ phim
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-neutral-400 shrink-0">
                    {language && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLanguage("")
                        }}
                        className="p-1 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Bỏ chọn ngôn ngữ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isLangDropdownOpen ? "rotate-180 text-sky-400" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Menu Dropdown Ngôn ngữ (Chỉ chọn 1) */}
                {isLangDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/90 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                    {languages.length > 5 && (
                      <div className="mb-2">
                        <Input
                          type="text"
                          placeholder="Tìm kiếm ngôn ngữ..."
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 text-xs bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-sky-500"
                          autoFocus
                        />
                      </div>
                    )}

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {/* Tùy chọn Bỏ chọn */}
                      {language && (
                        <button
                          type="button"
                          onClick={() => {
                            setLanguage("")
                            setIsLangDropdownOpen(false)
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-400 hover:text-rose-300 hover:bg-neutral-800/60 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <span>-- Chưa chọn / Bỏ chọn --</span>
                        </button>
                      )}

                      {languages.length === 0 ? (
                        <div className="py-3 text-center text-xs text-neutral-400">
                          Chưa có ngôn ngữ nào trong danh mục.
                          <button
                            type="button"
                            onClick={() => {
                              setIsLangDropdownOpen(false)
                              setIsLanguageModalOpen(true)
                            }}
                            className="block mx-auto mt-1 text-sky-400 hover:underline"
                          >
                            + Thêm ngôn ngữ ngay
                          </button>
                        </div>
                      ) : filteredLanguages.length === 0 ? (
                        <div className="py-2.5 text-center text-xs text-neutral-500">
                          Không tìm thấy ngôn ngữ nào phù hợp.
                        </div>
                      ) : (
                        filteredLanguages.map((lang) => {
                          const isSelected =
                            language.toLowerCase() === lang.name.toLowerCase()
                          return (
                            <button
                              type="button"
                              key={lang.id}
                              onClick={() => {
                                setLanguage(lang.name)
                                setIsLangDropdownOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                                isSelected
                                  ? "bg-sky-600/25 text-sky-200 font-medium border border-sky-500/30"
                                  : "text-neutral-300 hover:bg-neutral-800/80 hover:text-white border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="truncate">{lang.name}</span>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thể loại chính - Select chọn nhiều (Nằm riêng full width ở dưới, cực kỳ rộng rãi cho thẻ thể loại) */}
          <div className="pt-1 relative z-10" ref={genreDropdownRef}>
            <div className="flex items-center justify-between h-5 mb-1.5">
              <Label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Tags className="w-3.5 h-3.5 text-violet-400" />
                Thể loại chính
              </Label>
              <button
                type="button"
                onClick={() => setIsGenreModalOpen(true)}
                className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="Cấu hình danh mục thể loại"
              >
                <Tags className="w-3 h-3" />
                Cấu hình
              </button>
            </div>

            {/* Wrapper độc lập cho Select trigger và dropdown menu Thể loại */}
            <div className="relative">
              {/* Hộp Select Thể loại */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsGenreDropdownOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setIsGenreDropdownOpen((prev) => !prev)
                  }
                }}
                className={`min-h-9 w-full px-2.5 py-1 rounded-lg bg-neutral-950 border text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                  isGenreDropdownOpen
                    ? "border-violet-500/70 ring-1 ring-violet-500/30"
                    : "border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                  {selectedGenres.length === 0 ? (
                    <span className="text-neutral-500 py-0.5">
                      Chọn các thể loại phim
                    </span>
                  ) : (
                    selectedGenres.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-600/25 border border-violet-500/40 text-violet-200 text-xs font-medium"
                      >
                        {g}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeGenre(g)
                          }}
                          className="text-violet-300 hover:text-white rounded-sm p-0.5 transition-colors cursor-pointer"
                          title={`Bỏ chọn ${g}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-1 text-neutral-400 shrink-0">
                  {selectedGenres.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setGenre("")
                      }}
                      className="p-1 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      title="Xóa tất cả thể loại đã chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isGenreDropdownOpen ? "rotate-180 text-violet-400" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Menu Dropdown Thể loại (Chọn được nhiều) */}
              {isGenreDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/90 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                  {genres.length > 5 && (
                    <div className="mb-2">
                      <Input
                        type="text"
                        placeholder="Tìm kiếm thể loại..."
                        value={genreSearch}
                        onChange={(e) => setGenreSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-xs bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-violet-500"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {genres.length === 0 ? (
                      <div className="py-3 text-center text-xs text-neutral-400">
                        Chưa có thể loại nào trong danh mục.
                        <button
                          type="button"
                          onClick={() => {
                            setIsGenreDropdownOpen(false)
                            setIsGenreModalOpen(true)
                          }}
                          className="block mx-auto mt-1 text-violet-400 hover:underline"
                        >
                          + Thêm thể loại ngay
                        </button>
                      </div>
                    ) : filteredGenres.length === 0 ? (
                      <div className="py-2.5 text-center text-xs text-neutral-500">
                        Không tìm thấy thể loại nào phù hợp.
                      </div>
                    ) : (
                      filteredGenres.map((g) => {
                        const isSelected = selectedGenres.some(
                          (item) => item.toLowerCase() === g.name.toLowerCase()
                        )
                        return (
                          <button
                            type="button"
                            key={g.id}
                            onClick={() => toggleGenre(g.name)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                              isSelected
                                ? "bg-violet-600/25 text-violet-200 font-medium border border-violet-500/30"
                                : "text-neutral-300 hover:bg-neutral-800/80 hover:text-white border border-transparent"
                            }`}
                          >
                            <span>{g.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>

                  {selectedGenres.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 px-1">
                      <span>Đã chọn: <strong className="text-white">{selectedGenres.length}</strong> thể loại</span>
                      <button
                        type="button"
                        onClick={() => setIsGenreDropdownOpen(false)}
                        className="text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
                      >
                        Xong
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Diễn viên tham gia & Tên vai diễn */}
          <div className="space-y-2 pt-1" ref={actorSearchRef}>
            {/* Khối 2 ô nhập: Tên diễn viên + Tên vai diễn + Nút Thêm */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-end">
              {/* Input Diễn viên (có TVMaze Search) */}
              <div className="flex-1 w-full space-y-1">
                <label htmlFor="actors" className="text-[11px] font-medium text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-violet-400" />
                  Tên diễn viên
                </label>
                <div className="relative">
                  <div className="relative">
                    <Input
                      ref={actorInputRef}
                      id="actors"
                      type="text"
                      value={actorInput}
                      placeholder="Nhập tên diễn viên"
                      onChange={(e) => {
                        setActorInput(e.target.value)
                        if (!showActorDropdown) setShowActorDropdown(true)
                      }}
                      onFocus={() => {
                        if (actorInput.trim().length >= 2) setShowActorDropdown(true)
                      }}
                      onKeyDown={handleActorKeyDown}
                      className="bg-neutral-950 border-neutral-800 text-white text-xs focus-visible:ring-violet-500 pr-8"
                    />
                    {isSearchingActors && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                      </div>
                    )}
                  </div>

                  {/* Floating Dropdown: Kết quả tìm kiếm diễn viên toàn cầu (TVMaze API) */}
                  {showActorDropdown && actorInput.trim().length >= 2 && (
                    <div className="absolute top-full left-0 right-0 sm:min-w-[320px] mt-1.5 z-40 bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-md animate-in fade-in-50 duration-150">
                      <div className="px-3 py-1.5 bg-neutral-950/90 border-b border-neutral-800 text-[10px] text-neutral-400 font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1 text-violet-300">
                          <Globe className="w-3 h-3 text-sky-400" />
                          KẾT QUẢ TÌM KIẾM TOÀN CẦU
                        </span>
                        {isSearchingActors ? (
                          <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Đang tìm...
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500">
                            {actorSearchResults.length} kết quả
                          </span>
                        )}
                      </div>

                      {actorSearchResults.length > 0 ? (
                        <div className="p-1 space-y-0.5">
                          {actorSearchResults.map((actor) => {
                            const isAlreadyAdded = castList.some(
                              (c) => c.actor.toLowerCase() === actor.name.toLowerCase()
                            )
                            return (
                              <div
                                key={actor.id}
                                className={`w-full flex items-center justify-between gap-2 p-2 rounded-lg text-left transition-colors ${
                                  isAlreadyAdded
                                    ? "opacity-50 bg-neutral-950/30"
                                    : "hover:bg-violet-600/20 text-neutral-200"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleSelectActorFromDropdown(actor.name)}
                                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                                >
                                  {actor.imageUrl ? (
                                    <img
                                      src={actor.imageUrl}
                                      alt={actor.name}
                                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-700"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-400">
                                      <User className="w-4 h-4" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                                      <span>{actor.name}</span>
                                      {isAlreadyAdded && (
                                        <span className="text-[10px] text-violet-400 font-normal">
                                          (Đã chọn)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-neutral-400 truncate">
                                      {actor.country || "Quốc tế"}
                                      {actor.birthday && ` • Sinh năm ${actor.birthday}`}
                                    </div>
                                  </div>
                                </button>
                                {!isAlreadyAdded && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddCastMember(actor.name, "")}
                                    title="Thêm nhanh không cần vai diễn"
                                    className="shrink-0 p-1.5 rounded-md bg-neutral-800 hover:bg-violet-600 text-neutral-300 hover:text-white transition-colors text-[10px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : !isSearchingActors ? (
                        <div className="p-3 text-center text-xs text-neutral-400">
                          Không tìm thấy diễn viên trên cơ sở dữ liệu quốc tế. Bạn vẫn có thể nhấn "Thêm" để lưu tên tùy ý.
                        </div>
                      ) : null}

                      {/* Tùy chọn chọn tên người dùng vừa gõ */}
                      <button
                        type="button"
                        onClick={() => handleSelectActorFromDropdown(actorInput)}
                        className="w-full p-2.5 bg-neutral-950 hover:bg-neutral-800/90 border-t border-neutral-800 text-xs text-violet-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Chọn tên: <strong className="text-white truncate">"{actorInput.trim()}"</strong>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Tên nhân vật / vai diễn */}
              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <label htmlFor="character-role" className="text-neutral-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                    Tên nhân vật
                  </label>
                  <span className="text-[10px] text-neutral-500 font-normal">Tùy chọn</span>
                </div>
                <Input
                  id="character-role"
                  ref={characterInputRef}
                  type="text"
                  placeholder="Nhập tên nhân vật"
                  value={characterInput}
                  onChange={(e) => setCharacterInput(e.target.value)}
                  onKeyDown={handleCharacterKeyDown}
                  className="bg-neutral-950 border-neutral-800 text-white text-xs focus-visible:ring-violet-500"
                />
              </div>

              {/* Nút Thêm (chỉ có icon dấu cộng) */}
              <Button
                type="button"
                onClick={() => handleAddCastMember()}
                disabled={!actorInput.trim()}
                title="Thêm diễn viên"
                aria-label="Thêm diễn viên"
                className="shrink-0 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white h-9 w-9 p-0 rounded-md transition-colors flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Danh sách diễn viên + vai diễn đã thêm */}
            {castList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] text-neutral-400 font-medium">
                  Diễn viên đã chọn ({castList.length}):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-neutral-950/70 border border-neutral-800/80 rounded-xl">
                  {castList.map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-violet-500/30 text-xs text-neutral-200 shadow-sm animate-in fade-in-50 group hover:border-violet-500/60 transition-all"
                    >
                      <User className="w-3 h-3 text-violet-400 shrink-0" />
                      <button
                        type="button"
                        onClick={() => handleEditCastMember(idx)}
                        className="font-medium text-white hover:text-violet-300 hover:underline transition-colors text-left cursor-pointer"
                        title="Bấm để chỉnh sửa diễn viên hoặc vai diễn"
                      >
                        {item.actor}
                      </button>
                      {item.character && (
                        <span className="text-[11px] text-violet-300 flex items-center gap-1">
                          <span className="text-neutral-600">•</span>
                          <span className="text-neutral-400">vai</span>
                          <span className="text-amber-300 font-medium">"{item.character}"</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCastMember(idx)}
                        className="ml-1 text-neutral-400 hover:text-rose-400 rounded p-0.5 transition-colors cursor-pointer"
                        title="Xóa diễn viên này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trạng thái xem */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-xs font-semibold text-neutral-200">Trạng thái</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("Watched")}
                className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  status === "Watched"
                    ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Đã xem
              </button>

              <button
                type="button"
                onClick={() => setStatus("PlanToWatch")}
                className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  status === "PlanToWatch"
                    ? "bg-sky-600/20 border-sky-500/50 text-sky-300 shadow-sm"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Sẽ xem
              </button>
            </div>
          </div>

          {/* Đánh giá điểm (Nếu là Đã xem) */}
          {status === "Watched" && (
            <div className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl space-y-1.5 animate-in fade-in-50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-medium">Chấm điểm của bạn:</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {rating} / 10 điểm
                </span>
              </div>
              <div className="pt-1 flex justify-center">
                <StarRating rating={rating} max={10} onChange={setRating} size="md" />
              </div>
            </div>
          )}

          {/* Video Trailer YouTube */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <Label htmlFor="trailer-url" className="text-neutral-200 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" />
                Video Trailer (YouTube)
              </Label>
              <span className="text-[10px] text-neutral-500 font-normal">Tùy chọn</span>
            </div>
            <div className="relative">
              <Input
                id="trailer-url"
                type="text"
                placeholder="Dán liên kết YouTube: https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                value={trailerUrl}
                onChange={(e) => handleTrailerChange(e.target.value)}
                className={`bg-neutral-950 border-neutral-800 text-white text-xs pl-9 pr-9 focus-visible:ring-red-500 ${
                  trailerError ? "border-rose-500 focus-visible:ring-rose-500" : ""
                }`}
              />
              <YouTubeIcon className="w-4 h-4 text-red-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {trailerUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setTrailerUrl("")
                    setTrailerError("")
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="Xóa link"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {trailerError ? (
              <p className="text-[11px] text-rose-400 font-medium">{trailerError}</p>
            ) : trailerUrl && extractYouTubeId(trailerUrl) ? (
              <div className="flex items-center justify-between text-[11px] text-emerald-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Đường link YouTube hợp lệ (ID: {extractYouTubeId(trailerUrl)})
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewTrailerId(extractYouTubeId(trailerUrl))}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Play className="w-3 h-3 fill-red-400" />
                  Xem thử Trailer
                </button>
              </div>
            ) : null}
          </div>

          {/* Khu vực chèn ảnh Poster: Kéo thả, Copy Dán & URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
                Ảnh Poster Phim
              </Label>
            </div>

            {/* Input file ẩn hỗ trợ click để chọn tệp */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Khung Kéo Thả & Dán Ảnh */}
            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDropzoneClick}
                className={`relative group border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-violet-500 bg-violet-600/15 scale-[1.01]"
                    : "border-neutral-700/80 hover:border-violet-500/60 bg-neutral-950/60 hover:bg-neutral-900/60"
                }`}
              >
                <div className="p-3 rounded-full bg-violet-600/10 text-violet-400 border border-violet-500/20 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-200">
                    Kéo & thả ảnh vào đây, hoặc{" "}
                    <span className="text-violet-400 underline underline-offset-2">bấm để chọn tệp</span>
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-medium text-violet-300">
                    <ClipboardPaste className="w-3.5 h-3.5 text-violet-400" />
                    Copy ảnh bất kỳ rồi nhấn <strong className="text-white">Ctrl + V</strong> để dán ngay
                  </div>
                </div>

                <p className="text-[10px] text-neutral-500">
                  Hỗ trợ PNG, JPG, WEBP, GIF (Tối đa 10MB) • Chỉ lưu vào máy chủ khi bấm "Lưu"
                </p>
              </div>
            ) : (
              /* Đã có ảnh poster: Hiển thị Preview & Nút thay thế / xóa */
              <div className="relative p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0">
                    <img
                      src={getImageUrl(previewUrl)}
                      alt="Poster Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {pendingImageFile ? `Đã chọn: ${pendingImageFile.name}` : "Đã có ảnh poster"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDropzoneClick}
                        disabled={isSubmitting}
                        className="text-[11px] text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
                      >
                        Thay ảnh khác
                      </button>
                      <span className="text-neutral-600">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thông báo lỗi upload nếu có */}
            {uploadError && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                {uploadError}
              </p>
            )}

          </div>

          {/* Footer nút hành động: chỉ cần button "Lưu" */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs h-9 bg-violet-600 hover:bg-violet-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white px-5 rounded-lg cursor-pointer transition-colors font-medium shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Đang lưu...
                </>
              ) : (
                "Lưu"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal Cấu hình danh mục thể loại riêng */}
      <GenreCatalogModal
        isOpen={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
      />

      {/* Modal Cấu hình danh mục ngôn ngữ riêng */}
      <LanguageCatalogModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Modal Xem thử Trailer YouTube */}
      <TrailerModal
        isOpen={!!previewTrailerId}
        onClose={() => setPreviewTrailerId(null)}
        trailerUrl={trailerUrl}
        title={title ? `Xem thử: ${title}` : "Xem thử Trailer"}
      />
    </div>
  )
}
