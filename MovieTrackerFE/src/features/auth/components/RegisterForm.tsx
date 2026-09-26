import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerSchema, type RegisterFormData } from "../schemas/authSchema"
import { useRegister } from "../hooks/useAuth"
import { Lock, Mail, User as UserIcon, BadgeCheck, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, UserPlus } from "lucide-react"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  })

  const registerMutation = useRegister()

  const onSubmit = (data: RegisterFormData) => {
    setApiError(null)
    setApiSuccess(null)

    registerMutation.mutate(
      {
        username: data.username,
        email: data.email,
        password: data.password,
        fullName: data.fullName || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setApiSuccess("Tạo tài khoản thành công! Token đã lưu an toàn vào Cookie.")
            setTimeout(() => {
              onSuccess?.()
            }, 600)
          } else {
            setApiError(res.message || "Đăng ký không thành công. Vui lòng kiểm tra lại.")
          }
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại sau."
          setApiError(msg)
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1 sm:pt-2">
      {/* Thông báo lỗi */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-inner">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-relaxed">{apiError}</span>
        </div>
      )}

      {/* Thông báo thành công */}
      {apiSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-inner">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span className="leading-relaxed font-medium">{apiSuccess}</span>
        </div>
      )}

      {/* 1. Tên đăng nhập (1 dòng riêng) */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-username" className="text-xs sm:text-sm text-neutral-200 font-medium">
          Tên đăng nhập <span className="text-rose-400">*</span>
        </Label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-violet-400 transition-colors pointer-events-none">
            <UserIcon className="w-4 h-4" />
          </div>
          <Input
            id="reg-username"
            type="text"
            placeholder="ví dụ: tranvanb"
            autoComplete="username"
            className="h-11 sm:h-12 pl-10.5 pr-4 bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 rounded-xl transition-all shadow-inner"
            disabled={registerMutation.isPending}
            {...register("username")}
          />
        </div>
        {errors.username && <p className="text-[11px] sm:text-xs text-rose-400 pl-1">{errors.username.message}</p>}
      </div>

      {/* 2. Địa chỉ Email (1 dòng riêng) */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-email" className="text-xs sm:text-sm text-neutral-200 font-medium">
          Địa chỉ Email <span className="text-rose-400">*</span>
        </Label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-violet-400 transition-colors pointer-events-none">
            <Mail className="w-4 h-4" />
          </div>
          <Input
            id="reg-email"
            type="email"
            placeholder="email@domain.com"
            autoComplete="email"
            className="h-11 sm:h-12 pl-10.5 pr-4 bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 rounded-xl transition-all shadow-inner"
            disabled={registerMutation.isPending}
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-[11px] sm:text-xs text-rose-400 pl-1">{errors.email.message}</p>}
      </div>

      {/* 3. Họ và tên hiển thị (1 dòng riêng) */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-fullname" className="text-xs sm:text-sm text-neutral-200 font-medium">
          Họ và tên hiển thị (Tùy chọn)
        </Label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-violet-400 transition-colors pointer-events-none">
            <BadgeCheck className="w-4 h-4" />
          </div>
          <Input
            id="reg-fullname"
            type="text"
            placeholder="Nguyễn Văn A"
            className="h-11 sm:h-12 pl-10.5 pr-4 bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 rounded-xl transition-all shadow-inner"
            disabled={registerMutation.isPending}
            {...register("fullName")}
          />
        </div>
        {errors.fullName && <p className="text-[11px] sm:text-xs text-rose-400 pl-1">{errors.fullName.message}</p>}
      </div>

      {/* 4. Mật khẩu (1 dòng riêng) */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-password" className="text-xs sm:text-sm text-neutral-200 font-medium">
          Mật khẩu <span className="text-rose-400">*</span>
        </Label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-violet-400 transition-colors pointer-events-none">
            <Lock className="w-4 h-4" />
          </div>
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            autoComplete="new-password"
            className="h-11 sm:h-12 pl-10.5 pr-11 bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 rounded-xl transition-all shadow-inner"
            disabled={registerMutation.isPending}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1 cursor-pointer"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] sm:text-xs text-rose-400 pl-1">{errors.password.message}</p>}
      </div>

      {/* 5. Xác nhận lại mật khẩu (1 dòng riêng) */}
      <div className="space-y-1.5">
        <Label htmlFor="reg-confirm" className="text-xs sm:text-sm text-neutral-200 font-medium">
          Xác nhận lại mật khẩu <span className="text-rose-400">*</span>
        </Label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-violet-400 transition-colors pointer-events-none">
            <Lock className="w-4 h-4" />
          </div>
          <Input
            id="reg-confirm"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu phía trên"
            autoComplete="new-password"
            className="h-11 sm:h-12 pl-10.5 pr-11 bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 rounded-xl transition-all shadow-inner"
            disabled={registerMutation.isPending}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1 cursor-pointer"
            aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[11px] sm:text-xs text-rose-400 pl-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Nút gửi */}
      <Button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full h-11 sm:h-12 mt-3 bg-linear-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-violet-600/30 rounded-xl transition-all active:scale-[0.99] cursor-pointer hover:shadow-violet-600/40"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang khởi tạo tài khoản...
          </>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            Đăng ký tài khoản mới
          </span>
        )}
      </Button>

      {/* Chuyển sang đăng nhập */}
      {onSwitchToLogin && (
        <p className="text-center text-xs sm:text-sm text-neutral-400 pt-2">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-violet-400 hover:text-violet-300 font-semibold hover:underline cursor-pointer transition-colors"
          >
            Đăng nhập ngay
          </button>
        </p>
      )}
    </form>
  )
}
