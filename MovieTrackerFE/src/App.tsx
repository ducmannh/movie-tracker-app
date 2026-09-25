import { Header } from "@/components/layout/Header"
import { AuthCard, useCurrentUser } from "@/features/auth"
import { MovieList } from "@/features/movies/components/MovieList"
import { Loader2 } from "lucide-react"

export default function App() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-xs sm:text-sm text-neutral-400">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-violet-600 selection:text-white flex flex-col">
      {!user ? (
        // Chỉ hiển thị duy nhất form đăng nhập / đăng ký căn giữa màn hình
        <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
          <AuthCard />
        </main>
      ) : (
        // Giao diện người dùng sau khi đã đăng nhập
        <div className="flex-1 p-4 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            <Header />
            <MovieList />
          </div>
        </div>
      )}
    </div>
  )
}
