export interface User {
  id: string
  username: string
  email: string
  fullName?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
}

export interface AuthResponseData {
  token: string
  expiresAt: string
  refreshToken?: string
  refreshTokenExpiresAt?: string
  user: User
}

export interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  fullName?: string
}
