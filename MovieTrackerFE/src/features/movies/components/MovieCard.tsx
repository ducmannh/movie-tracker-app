import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Movie } from "../types"
import { Star, CheckCircle2 } from "lucide-react"

interface MovieCardProps {
  movie: Movie
  onToggleWatched: (id: number) => void
}

export function MovieCard({ movie, onToggleWatched }: MovieCardProps) {
  return (
    <Card className="bg-neutral-900/80 border-neutral-800 text-neutral-100 transition-all hover:border-neutral-700 shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{movie.title}</CardTitle>
          <CardDescription className="text-neutral-400 text-xs">
            {movie.year} • {movie.genre}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{movie.rating}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Trạng thái:</span>
          <Badge variant={movie.watched ? "default" : "secondary"} className="text-xs">
            {movie.watched ? "Đã xem" : "Chưa xem"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-end">
        <Button
          size="sm"
          variant={movie.watched ? "outline" : "default"}
          onClick={() => onToggleWatched(movie.id)}
          className="text-xs h-7"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          {movie.watched ? "Đánh dấu chưa xem" : "Đã xem"}
        </Button>
      </CardFooter>
    </Card>
  )
}
