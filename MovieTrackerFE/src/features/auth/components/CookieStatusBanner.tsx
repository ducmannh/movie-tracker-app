import { useState } from "react"
import { Button } from "@/components/ui/button"
import { authApi } from "../api/authApi"
import { ShieldCheck, RefreshCw } from "lucide-react"

export function CookieStatusBanner() {
  const [status, setStatus] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleTest = async () => {
    setIsChecking(true)
    setStatus(null)
    try {
      const res = await authApi.getMe()
      if (res.success && res.data) {
        setStatus(`✅ Cookie hợp lệ! Server xác thực: ${res.data.fullName || res.data.username} (${res.data.email})`)
      }
    } catch (err: any) {
      setStatus(`❌ Thất bại: ${err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn."}`)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-violet-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Token đang được bảo vệ an toàn trong <strong>HttpOnly Cookie</strong> (trình duyệt tự đính kèm).
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isChecking}
          onClick={handleTest}
          className="h-7 text-xs shrink-0 border-violet-600/40 hover:bg-violet-600/20 text-violet-200"
        >
          <RefreshCw className={`w-3 h-3 mr-1.5 ${isChecking ? "animate-spin" : ""}`} />
          Test gửi Cookie (/api/auth/me)
        </Button>
      </div>

      {status && (
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
          {status}
        </div>
      )}
    </div>
  )
}
