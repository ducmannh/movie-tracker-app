import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { Film } from "lucide-react"

interface AuthCardProps {
  defaultTab?: "login" | "register"
  onSuccess?: () => void
}

export function AuthCard({ defaultTab = "login", onSuccess }: AuthCardProps) {
  const [tab, setTab] = useState<string>(defaultTab)

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Hiệu ứng đèn ambient nhẹ nhàng phía sau */}
      <div className="absolute -top-16 -left-12 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -right-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Thẻ Form Đăng Nhập / Đăng Ký */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800 shadow-2xl shadow-black/60 text-neutral-100">
        
        {/* Tiêu đề & Logo thương hiệu */}
        <div className="flex flex-col items-center text-center space-y-2 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              MovieTracker
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {tab === "login" ? "Đăng nhập vào tài khoản của bạn" : "Tạo tài khoản mới"}
            </p>
          </div>
        </div>

        {/* Tabs Điều Hướng Đăng nhập / Đăng ký */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-11 p-1 bg-neutral-950/80 border border-neutral-800 rounded-xl mb-4">
            <TabsTrigger
              value="login"
              className="rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-linear-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow cursor-pointer"
            >
              Đăng Nhập
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-linear-to-r data-[state=active]:from-violet-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow cursor-pointer"
            >
              Đăng Ký
            </TabsTrigger>
          </TabsList>

          {/* Form Đăng Nhập */}
          <TabsContent value="login" className="mt-0 focus-visible:outline-none">
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToRegister={() => setTab("register")}
            />
          </TabsContent>

          {/* Form Đăng Ký */}
          <TabsContent value="register" className="mt-0 focus-visible:outline-none">
            <RegisterForm
              onSuccess={onSuccess}
              onSwitchToLogin={() => setTab("login")}
            />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}
