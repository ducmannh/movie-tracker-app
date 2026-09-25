import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MovieCard } from "./MovieCard"
import type { Movie } from "../types"
import { Plus, Search } from "lucide-react"

const DEFAULT_MOVIES: Movie[] = [
  { id: 1, title: "Inception", year: 2010, rating: 8.8, genre: "Sci-Fi", watched: true },
  { id: 2, title: "Interstellar", year: 2014, rating: 8.7, genre: "Adventure", watched: true },
  { id: 3, title: "Oppenheimer", year: 2023, rating: 8.9, genre: "Biography", watched: false },
]

export function MovieList() {
  const [movies, setMovies] = useState<Movie[]>(DEFAULT_MOVIES)
  const [searchTerm, setSearchTerm] = useState("")
  const [newTitle, setNewTitle] = useState("")

  const toggleWatched = (id: number) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m))
    )
  }

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newMovie: Movie = {
      id: Date.now(),
      title: newTitle.trim(),
      year: new Date().getFullYear(),
      rating: 8.0,
      genre: "Drama",
      watched: false,
    }
    setMovies([newMovie, ...movies])
    setNewTitle("")
  }

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <form onSubmit={handleAddMovie} className="md:col-span-2 flex gap-2">
          <Input
            placeholder="Thêm tên phim mới muốn xem..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus-visible:ring-violet-500"
          />
          <Button type="submit" className="shrink-0 bg-violet-600 hover:bg-violet-500 text-white text-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Thêm phim
          </Button>
        </form>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 text-sm focus-visible:ring-violet-500"
          />
        </div>
      </div>

      {/* Grid danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onToggleWatched={toggleWatched} />
        ))}
      </div>
    </div>
  )
}
