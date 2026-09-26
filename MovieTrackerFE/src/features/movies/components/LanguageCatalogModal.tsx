import { useState } from "react"
import {
  X,
  Globe,
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
  useLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
} from "../hooks/useCatalog"
import type { LanguageItem } from "../types"
import { ConfirmDeleteModal } from "./ConfirmDeleteModal"

interface LanguageCatalogModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LanguageCatalogModal({ isOpen, onClose }: LanguageCatalogModalProps) {
  const [searchFilter, setSearchFilter] = useState("")

  // Form thêm mới
  const [newLangName, setNewLangName] = useState("")

  // Form sửa
  const [editingLangId, setEditingLangId] = useState<number | null>(null)
  const [editingLangName, setEditingLangName] = useState("")

  const [errorMsg, setErrorMsg] = useState("")

  // State xác nhận xóa
  const [langToDelete, setLangToDelete] = useState<{ id: number; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // React Query hooks
  const { data: languages = [], isLoading } = useLanguages()
  const createMutation = useCreateLanguage()
  const updateMutation = useUpdateLanguage()
  const deleteMutation = useDeleteLanguage()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLangName.trim()) return
    setErrorMsg("")
    try {
      await createMutation.mutateAsync({
        name: newLangName.trim(),
      })
      setNewLangName("")
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể tạo ngôn ngữ mới.")
    }
  }

  const handleStartEdit = (l: LanguageItem) => {
    setEditingLangId(l.id)
    setEditingLangName(l.name)
  }

  const handleSaveEdit = async (id: number) => {
    if (!editingLangName.trim()) return
    setErrorMsg("")
    try {
      await updateMutation.mutateAsync({
        id,
        payload: {
          name: editingLangName.trim(),
        },
      })
      setEditingLangId(null)
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể cập nhật ngôn ngữ.")
    }
  }

  const handleConfirmDelete = async () => {
    if (!langToDelete) return
    setErrorMsg("")
    try {
      setIsDeleting(true)
      await deleteMutation.mutateAsync(langToDelete.id)
      setLangToDelete(null)
    } catch (err: any) {
      setErrorMsg(err?.message || "Không thể xóa ngôn ngữ.")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredLanguages = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      (l.code &&
        l.code.toLowerCase().includes(searchFilter.toLowerCase().trim()))
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
            <div className="p-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cấu hình danh mục ngôn ngữ
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                  {languages.length} ngôn ngữ
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Thêm mới, chỉnh sửa tên hoặc xóa các ngôn ngữ phim trong cơ sở dữ liệu
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
              placeholder="Tìm kiếm ngôn ngữ..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 h-8 text-xs bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-sky-500"
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
          {/* Form Thêm Ngôn Ngữ Mới */}
          <form
            onSubmit={handleCreate}
            className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              Thêm ngôn ngữ phim mới
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 min-w-0">
                <Label htmlFor="newLangName" className="sr-only">Tên ngôn ngữ</Label>
                <Input
                  id="newLangName"
                  placeholder="Nhập tên ngôn ngữ"
                  value={newLangName}
                  onChange={(e) => setNewLangName(e.target.value)}
                  className="h-8 text-xs bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded-lg focus-visible:ring-sky-500 w-full"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending || !newLangName.trim()}
                className="h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white px-4 rounded-lg shrink-0 cursor-pointer font-medium"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Thêm"
                )}
              </Button>
            </div>
          </form>

          {/* Danh sách Ngôn Ngữ */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-400 font-medium">
              Danh sách ngôn ngữ ({filteredLanguages.length}):
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center items-center text-xs text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin text-sky-500 mr-2" />
                Đang tải danh mục ngôn ngữ...
              </div>
            ) : filteredLanguages.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                Không tìm thấy ngôn ngữ nào phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredLanguages.map((lang) => {
                  const isEditing = editingLangId === lang.id
                  return (
                    <div
                      key={lang.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700/80 transition-all text-xs"
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Input
                            value={editingLangName}
                            onChange={(e) => setEditingLangName(e.target.value)}
                            className="h-7 text-xs bg-neutral-950 border-neutral-700 text-white py-0 px-2 rounded flex-1"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(lang.id)}
                            disabled={updateMutation.isPending}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors cursor-pointer"
                            title="Lưu"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingLangId(null)}
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
                              {lang.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(lang)}
                              className="p-1 text-neutral-400 hover:text-sky-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="Sửa ngôn ngữ"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setLangToDelete({ id: lang.id, name: lang.name })}
                              className="p-1 text-neutral-400 hover:text-rose-400 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                              title="Xóa ngôn ngữ"
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

      {/* Dialog Xác Nhận Xóa Ngôn Ngữ */}
      <ConfirmDeleteModal
        isOpen={!!langToDelete}
        onClose={() => setLangToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa ngôn ngữ"
        itemName={langToDelete?.name}
        description={
          <>
            Bạn có chắc chắn muốn xóa ngôn ngữ{" "}
            <span className="font-semibold text-rose-300">
              &ldquo;{langToDelete?.name}&rdquo;
            </span>
            ? Các bộ phim mang ngôn ngữ này sẽ không còn liên kết.
          </>
        }
        isLoading={isDeleting}
      />
    </div>
  )
}
