import { useState } from "react"
import {
  X,
  Tags,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useGenres,
  useCreateGenre,
  useUpdateGenre,
  useDeleteGenre,
} from "../hooks/useCatalog"
import type { GenreItem } from "../types"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"

interface GenreCatalogModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GenreCatalogModal({ isOpen, onClose }: GenreCatalogModalProps) {
  const [searchFilter, setSearchFilter] = useState("")

  // Form thêm mới
  const [newGenreName, setNewGenreName] = useState("")

  // Form sửa
  const [editingGenreId, setEditingGenreId] = useState<number | null>(null)
  const [editingGenreName, setEditingGenreName] = useState("")

  const [errorMsg, setErrorMsg] = useState("")

  // State xác nhận xóa
  const [genreToDelete, setGenreToDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // React Query hooks
  const { data: genres = [], isLoading } = useGenres()
  const createMutation = useCreateGenre()
  const updateMutation = useUpdateGenre()
  const deleteMutation = useDeleteGenre()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGenreName.trim()) return
    setErrorMsg("")
    try {
      await createMutation.mutateAsync({
        name: newGenreName.trim(),
      })
      setNewGenreName("")
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể tạo thể loại mới.")
    }
  }

  const handleStartEdit = (g: GenreItem) => {
    setEditingGenreId(g.id)
    setEditingGenreName(g.name)
  }

  const handleSaveEdit = async (id: number) => {
    if (!editingGenreName.trim()) return
    setErrorMsg("")
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          name: editingGenreName.trim(),
        },
      })
      setEditingGenreId(null)
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể cập nhật thể loại.")
    }
  }

  const handleConfirmDelete = async () => {
    if (!genreToDelete) return
    setErrorMsg("")
    try {
      setIsDeleting(true)
      await deleteMutation.mutateAsync(genreToDelete.id)
      setGenreToDelete(null)
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể xóa thể loại.")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredGenres = genres.filter(
    (g) =>
      g.name.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      (g.description &&
        g.description.toLowerCase().includes(searchFilter.toLowerCase().trim()))
  )

  if (!isOpen) return null

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50 duration-200"
    >
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cấu hình danh mục thể loại
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                  {genres.length} thể loại
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Thêm mới, chỉnh sửa tên hoặc xóa các thể loại phim trong cơ sở dữ liệu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Tìm kiếm nhanh */}
        <div className="p-4 border-b border-neutral-800/60 bg-neutral-950/40 space-y-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 h-8 text-xs bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-violet-500"
            />
          </div>

          {errorMsg && (
            <div className="p-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Form Thêm Thể Loại Mới */}
          <form
            onSubmit={handleCreate}
            className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              <Plus className="w-3.5 h-3.5 text-violet-400" />
              Thêm thể loại phim mới
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 min-w-0">
                <Label htmlFor="newGenreName" className="sr-only">Tên thể loại</Label>
                <Input
                  id="newGenreName"
                  placeholder="Nhập tên thể loại"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  className="h-8 text-xs bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-violet-500 w-full"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending || !newGenreName.trim()}
                className="h-8 text-xs bg-violet-600 hover:bg-violet-500 text-white px-4 rounded-lg shrink-0 cursor-pointer font-medium"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Thêm"
                )}
              </Button>
            </div>
          </form>

          {/* Danh sách Thể Loại */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-400 font-medium">
              Danh sách thể loại ({filteredGenres.length}):
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center items-center text-xs text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-2" />
                Đang tải danh mục thể loại...
              </div>
            ) : filteredGenres.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                Không tìm thấy thể loại nào phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredGenres.map((genre) => {
                  const isEditing = editingGenreId === genre.id
                  return (
                    <div
                      key={genre.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-all text-xs"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Input
                            value={editingGenreName}
                            onChange={(e) => setEditingGenreName(e.target.value)}
                            className="h-7 text-xs bg-neutral-950 border-neutral-700 text-white py-0 px-2 rounded"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(genre.id)}
                            disabled={updateMutation.isPending}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors cursor-pointer"
                            title="Lưu"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingGenreId(null)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors cursor-pointer"
                            title="Hủy"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-white truncate block">
                              {genre.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(genre)}
                              className="p-1 text-neutral-400 hover:text-violet-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="Sửa tên thể loại"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setGenreToDelete({ id: genre.id, name: genre.name })}
                              className="p-1 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="Xóa thể loại"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog Xác Nhận Xóa Thể Loại */}
      <ConfirmDeleteModal
        isOpen={!!genreToDelete}
        onClose={() => setGenreToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa thể loại"
        itemName={genreToDelete?.name}
        description={
          <>
            Bạn có chắc chắn muốn xóa thể loại{" "}
            <span className="font-semibold text-rose-300">
              &ldquo;{genreToDelete?.name}&rdquo;
            </span>
            ? Các bộ phim mang thể loại này sẽ không còn liên kết.
          </>
        }
        isLoading={isDeleting}
      />
    </div>
  )
}
