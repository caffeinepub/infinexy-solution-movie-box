import { Play, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Genre, type Movie, useDeleteMovie } from "../hooks/useQueries";

const GENRE_LABELS: Record<Genre, string> = {
  [Genre.bollywood]: "Bollywood",
  [Genre.hollywood]: "Hollywood",
  [Genre.gujarati]: "Gujarati",
  [Genre.tollywood]: "Tollywood",
};

const GENRE_COLORS: Record<Genre, string> = {
  [Genre.bollywood]: "#E44B6A",
  [Genre.hollywood]: "#4B7CE4",
  [Genre.gujarati]: "#E48B4B",
  [Genre.tollywood]: "#4BE49A",
};

interface MovieCardProps {
  movie: Movie;
  isAdmin: boolean;
  index: number;
  onClick: () => void;
}

export default function MovieCard({
  movie,
  isAdmin,
  index,
  onClick,
}: MovieCardProps) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeleteMovie();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await deleteMutation.mutateAsync(movie.id);
      toast.success("Movie deleted successfully");
    } catch {
      toast.error("Failed to delete movie");
    }
  };

  const thumbnailUrl = movie.thumbnail.getDirectURL();
  const genreKey = movie.genre as Genre;
  const genreLabel = GENRE_LABELS[genreKey] ?? String(movie.genre);
  const genreColor = GENRE_COLORS[genreKey] ?? "#888";

  return (
    <motion.div
      className="relative rounded-xl overflow-hidden cursor-pointer group"
      style={{ background: "#1A2538", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setConfirmDelete(false);
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid={`movies.item.${index + 1}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/200x300/1A2538/9AA7B6?text=${encodeURIComponent(movie.title)}`;
          }}
        />
        {/* Overlay on hover */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(214,178,94,0.9)" }}
          >
            <Play size={24} fill="#0B1220" color="#0B1220" className="ml-1" />
          </div>
        </motion.div>
        {/* Genre Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: `${genreColor}CC` }}
        >
          {genreLabel}
        </div>
        {/* Delete button (admin only) */}
        {isAdmin && hovered && (
          <button
            type="button"
            className={`absolute top-2 left-2 p-1.5 rounded-lg transition-colors text-white font-semibold text-xs ${
              confirmDelete ? "bg-red-600" : "bg-black/60 hover:bg-red-600"
            }`}
            onClick={handleDelete}
            data-ocid={`movies.delete_button.${index + 1}`}
          >
            {confirmDelete ? (
              <span className="px-1">Confirm?</span>
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
          {movie.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {Number(movie.year)} · {genreLabel}
        </p>
      </div>
    </motion.div>
  );
}
