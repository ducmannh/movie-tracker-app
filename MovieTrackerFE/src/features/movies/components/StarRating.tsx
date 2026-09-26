import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating?: number // 0 đến 10
  max?: number // 10 sao
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
}

export function StarRating({
  rating = 0,
  max = 10,
  onChange,
  readOnly = false,
  size = "sm",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const currentDisplay = hoverRating !== null ? hoverRating : rating

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(null)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1
        const isFilled = starValue <= currentDisplay

        return (
          <button
            type="button"
            key={starValue}
            disabled={readOnly}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            className={`p-0.5 transition-transform ${
              readOnly
                ? "cursor-default"
                : "cursor-pointer hover:scale-125 focus:outline-none"
            }`}
            title={`${starValue}/${max} điểm`}
          >
            <Star
              className={`${starSizes[size]} transition-colors ${
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                  : "fill-transparent text-neutral-600 hover:text-neutral-400"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
