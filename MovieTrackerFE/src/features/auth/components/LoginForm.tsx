import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, type LoginFormData } from "../schemas/authSchema"
import { useLogin } from "../hooks/useAuth"
import { Lock, User as UserIcon, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  })

  const loginMutation = useLogin()

  const onSubmit = (data: LoginFormData) => {
    setApiError(null)
    setApiSuccess(null)

    loginMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.success) {
          setApiSuccess("Đăng nhập thành công! Token đã được lưu an toàn vào HttpOnly Cookie.")
          setTimeout(() => {
            onSuccess?.()
          }, 400)
        } else {
          setApiError(res.message || "Tên đăng nhập hoặc mật khẩu không chính xác.")
        }
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
        setApiError(msg)
      },
    })
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

      {/* Username hoặc Email */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-username" className="text-xs sm:text-sm text-neutral-200 font-medium">
            Tài khoản hoặc Email
          </Label>
        </div>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-violet-400 transition-colors pointer-events-none">
            <UserIcon className="w-4 h-4" />
          </div>
          <Input
            id="login-username"
            type="text"
            placeholder="Nhập tên đăng nhập hoặc email"
            autoComplete="username"
            className="h-11 sm:h-12 pl-10.5 pr-4 bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 rounded-xl transition-all shadow-inner"
            disabled={loginMutation.isPending}
            {...register("usernameOrEmail")}
          />
        </div>
        {errors.usernameOrEmail && (
          <p className="text-[11px] sm:text-xs text-rose-400 pl-1 animate-in fade-in duration-150">
            {errors.usernameOrEmail.message}
          </p>
        )}
      </div>

      {/* Mật khẩu */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-xs sm:text-sm text-neutral-200 font-medium">
            Mật khẩu
          </Label>
        </div>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-violet-400 transition-colors pointer-events-none">
            <Lock className="w-4 h-4" />
          </div>
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu của bạn"
            autoComplete="current-password"
            className="h-11 sm:h-12 pl-10.5 pr-11 bg-neutral-900/80 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:border-violet-500 rounded-xl transition-all shadow-inner"
            disabled={loginMutation.isPending}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1 rounded-md transition-colors cursor-pointer"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] sm:text-xs text-rose-400 pl-1 animate-in fade-in duration-150">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Nút Đăng nhập */}
      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-11 sm:h-12 mt-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-violet-600/30 rounded-xl transition-all active:scale-[0.99] cursor-pointer hover:shadow-violet-600/40"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang xác thực thông tin...
          </>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Đăng nhập vào hệ thống
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </Button>

      {/* Chuyển tab */}
      {onSwitchToRegister && (
        <div className="pt-2 text-center text-xs sm:text-sm text-neutral-400">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-violet-400 hover:text-violet-300 font-semibold hover:underline cursor-pointer transition-colors"
          >
            Đăng ký tài khoản mới
          </button>
        </div>
      )}
    </form>
  )
}
