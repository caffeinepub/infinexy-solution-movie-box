import { Calendar, Tag, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Genre, type Movie } from "../hooks/useQueries";

const GENRE_LABELS: Record<Genre, string> = {
  [Genre.bollywood]: "Bollywood",
  [Genre.hollywood]: "Hollywood",
  [Genre.gujarati]: "Gujarati",
  [Genre.tollywood]: "Tollywood",
};

interface MoviePlayerModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MoviePlayerModal({
  movie,
  onClose,
}: MoviePlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!movie && videoRef.current) {
      videoRef.current.pause();
    }
  }, [movie]);

  const genreLabel = movie
    ? (GENRE_LABELS[movie.genre as Genre] ?? String(movie.genre))
    : "";

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-ocid="player.modal"
        >
          <motion.div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
            style={{ background: "#121B2B", border: "1px solid #2A364A" }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid #2A364A" }}
            >
              <h2 className="font-display font-bold text-lg text-foreground truncate pr-4">
                {movie.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                data-ocid="player.close_button"
              >
                <X size={20} />
              </button>
            </div>
            {/* Video */}
            <div className="bg-black">
              {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded movie content */}
              <video
                ref={videoRef}
                src={movie.video.getDirectURL()}
                controls
                autoPlay
                className="w-full max-h-[55vh]"
                data-ocid="player.canvas_target"
              />
            </div>
            {/* Movie Info */}
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} style={{ color: "#D6B25E" }} />
                  {Number(movie.year)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag size={14} style={{ color: "#D6B25E" }} />
                  {genreLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <User size={14} style={{ color: "#D6B25E" }} />
                  {movie.uploadedBy.toString().slice(0, 12)}...
                </span>
              </div>
              {movie.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {movie.description}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
