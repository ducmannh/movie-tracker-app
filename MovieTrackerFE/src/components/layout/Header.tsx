import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser, useLogout } from "@/features/auth"
import { Film, LogOut, User as UserIcon, Sparkles, Loader2 } from "lucide-react"

export function Header() {
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/10">
          <Film className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            MovieTracker
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30 font-normal">
              v1.0
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
            <span>Đang kiểm tra phiên...</span>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-1.5 pl-3 rounded-xl shadow-sm">
            <div className="text-right">
              <p className="text-xs font-medium text-white flex items-center gap-1 justify-end">
                <UserIcon className="w-3.5 h-3.5 text-violet-400" />
                {user.fullName || user.username}
              </p>
              <p className="text-[10px] text-neutral-400">{user.email}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              className="h-8 text-xs border-neutral-700 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              {logoutMutation.isPending ? "Đang thoát..." : "Đăng xuất"}
            </Button>
          </div>
        ) : (
          <Badge variant="outline" className="text-xs gap-1.5 py-1 px-3 border-amber-500/30 text-amber-400 bg-amber-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            Chưa đăng nhập
          </Badge>
        )}
      </div>
    </header>
  )
}
