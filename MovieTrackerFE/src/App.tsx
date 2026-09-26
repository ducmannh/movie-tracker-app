import { AuthCard, useCurrentUser } from "@/features/auth"
import { MovieList } from "@/features/movies/components/MovieList"
import { Loader2 } from "lucide-react"

export default function App() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080e] text-neutral-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-xs sm:text-sm text-neutral-400">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#07080e] text-neutral-100 font-sans selection:bg-violet-600 selection:text-white flex flex-col overflow-x-hidden">
      {/* Hệ thống ánh sáng Ambient & Hạt Texture Điện Ảnh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Đường viền ánh sáng chân trời trên cùng */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />

        {/* Quầng sáng spotlight tím rạp phim ở giữa trên */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-212.5 h-120 bg-linear-to-b from-violet-600/25 via-purple-600/14 to-transparent rounded-full blur-[140px]" />

        {/* Đèn neon chàm sâu góc trên bên trái */}
        <div className="absolute top-[6%] -left-35 w-130 h-130 bg-indigo-600/16 rounded-full blur-[140px]" />

        {/* Đèn neon xanh cyan/sky góc phải */}
        <div className="absolute top-[28%] -right-30 w-140 h-140 bg-sky-500/12 rounded-full blur-[150px]" />

        {/* Đèn ấm fuchsia/tím góc dưới */}
        <div className="absolute -bottom-24 left-[15%] w-150 h-112.5 bg-fuchsia-900/16 rounded-full blur-[160px]" />

        {/* Lưới họa tiết hạt dot matrix tinh tế phong cách điện ảnh với sắc tím hài hòa, đậm nét hơn */}
        <div
          className="absolute inset-0 opacity-[0.075]"
          style={{
            backgroundImage: `radial-gradient(rgba(196, 181, 253, 0.9) 1.2px, transparent 1.2px)`,
            backgroundSize: "26px 26px",
          }}
        />

        {/* Hiệu ứng Vignette làm dịu 4 góc màn hình */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(7,8,14,0.65)_100%]" />
      </div>

      {/* Lớp hiển thị nội dung chính */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!user ? (
          // Chỉ hiển thị duy nhất form đăng nhập / đăng ký căn giữa màn hình
          <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
            <AuthCard />
          </main>
        ) : (
          // Giao diện người dùng sau khi đã đăng nhập
          <div className="flex-1 p-3 sm:p-6 lg:p-8">
            <div className="max-w-[1700px] mx-auto">
              <MovieList />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
