import { z } from "zod"

// Schema validate form Đăng nhập
export const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, "Vui lòng nhập tên đăng nhập hoặc email"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema validate form Đăng ký
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(50, "Tên đăng nhập tối đa 50 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Định dạng email không hợp lệ"),
    fullName: z
      .string()
      .max(100, "Họ và tên tối đa 100 ký tự")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(6, "Mật khẩu phải có độ dài ít nhất 6 ký tự"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
