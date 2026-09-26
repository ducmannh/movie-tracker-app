interface BrandLogoProps {
  className?: string
  size?: number
}

export function BrandLogo({ className = "w-7 h-7", size }: BrandLogoProps) {
  const style = size ? { width: size, height: size } : undefined

  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mt-bg-comp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="45%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="mt-gold-comp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="mt-glass-comp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Nền bo góc mềm cao cấp (Squircle) */}
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#mt-bg-comp)" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="18"
        fill="url(#mt-glass-comp)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />

      {/* Hộp cuộn phim Cinema */}
      <rect
        x="13"
        y="16"
        width="38"
        height="32"
        rx="6"
        fill="#0b0a14"
        fillOpacity="0.9"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2"
      />

      {/* Lỗ đục cuộn phim trên (Film Perforations Top) */}
      <rect x="17" y="19" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />
      <rect x="25" y="19" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />
      <rect x="34.5" y="19" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />
      <rect x="42.5" y="19" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />

      {/* Lỗ đục cuộn phim dưới (Film Perforations Bottom) */}
      <rect x="17" y="40.5" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />
      <rect x="25" y="40.5" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />
      <rect x="34.5" y="40.5" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />
      <rect x="42.5" y="40.5" width="4.5" height="4.5" rx="1.2" fill="#ffffff" />

      {/* Màn hình chiếu ở giữa */}
      <rect
        x="19"
        y="26.5"
        width="26"
        height="11"
        rx="3"
        fill="#6d28d9"
        fillOpacity="0.35"
        stroke="rgba(167,139,250,0.5)"
        strokeWidth="1"
      />

      {/* Nút Play vàng rực rỡ ở tâm */}
      <path
        d="M29 28.5L36 32L29 35.5V28.5Z"
        fill="url(#mt-gold-comp)"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Ngôi sao điện ảnh lấp lánh góc trên bên phải */}
      <path
        d="M51 7L52.5 11L56.5 11.5L53.5 14.5L54.5 18.5L51 16.5L47.5 18.5L48.5 14.5L45.5 11.5L49.5 11L51 7Z"
        fill="url(#mt-gold-comp)"
      />
    </svg>
  )
}
