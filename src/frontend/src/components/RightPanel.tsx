import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Clock } from "lucide-react";
import { Genre, type Movie, type MovieStats } from "../hooks/useQueries";

const GENRE_ITEMS = [
  { genre: Genre.bollywood, label: "Bollywood", color: "#E44B6A" },
  { genre: Genre.hollywood, label: "Hollywood", color: "#4B7CE4" },
  { genre: Genre.gujarati, label: "Gujarati", color: "#E48B4B" },
  { genre: Genre.tollywood, label: "Tollywood", color: "#4BE49A" },
];

const SKELETON_KEYS = ["rp-sk-1", "rp-sk-2", "rp-sk-3"];

interface RightPanelProps {
  stats: MovieStats | undefined;
  movies: Movie[] | undefined;
  statsLoading: boolean;
  moviesLoading: boolean;
}

export default function RightPanel({
  stats,
  movies,
  statsLoading,
  moviesLoading,
}: RightPanelProps) {
  const recentMovies = movies
    ? [...movies]
        .sort((a, b) => Number(b.uploadedAt) - Number(a.uploadedAt))
        .slice(0, 5)
    : [];

  return (
    <aside
      className="hidden xl:flex flex-col w-72 shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-thin"
      style={{ background: "#121B2B", borderLeft: "1px solid #2A364A" }}
    >
      {/* Total Movies */}
      <div className="p-5" style={{ borderBottom: "1px solid #2A364A" }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} style={{ color: "#D6B25E" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Library Overview
          </span>
        </div>
        <div
          className="rounded-xl p-4 text-center"
          style={{
            background: "rgba(214,178,94,0.08)",
            border: "1px solid rgba(214,178,94,0.2)",
          }}
        >
          {statsLoading ? (
            <Skeleton className="h-10 w-20 mx-auto mb-1" />
          ) : (
            <div
              className="text-4xl font-display font-bold"
              style={{ color: "#D6B25E" }}
            >
              {Number(stats?.totalMovies ?? 0)}
            </div>
          )}
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Total Movies
          </div>
        </div>
      </div>

      {/* By Category */}
      <div className="p-5" style={{ borderBottom: "1px solid #2A364A" }}>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          By Category
        </p>
        <div className="space-y-2.5">
          {GENRE_ITEMS.map(({ genre, label, color }) => {
            const count = stats ? Number(stats.genreCounts[genre]) : 0;
            const total = stats ? Number(stats.totalMovies) : 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={genre}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    {label}
                  </span>
                  {statsLoading ? (
                    <Skeleton className="h-3 w-6" />
                  ) : (
                    <span className="text-xs font-bold text-foreground">
                      {count}
                    </span>
                  )}
                </div>
                <div
                  className="h-1 rounded-full"
                  style={{ background: "#2A364A" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Additions */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} style={{ color: "#D6B25E" }} />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Recent Additions
          </p>
        </div>
        <div className="space-y-3">
          {moviesLoading ? (
            SKELETON_KEYS.map((key) => (
              <div key={key} className="flex gap-3 items-center">
                <Skeleton className="w-10 h-14 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-2/3" />
                </div>
              </div>
            ))
          ) : recentMovies.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No movies yet
            </p>
          ) : (
            recentMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex gap-3 items-center"
                data-ocid="recent.item.1"
              >
                <div
                  className="w-10 h-14 rounded-lg overflow-hidden shrink-0"
                  style={{ background: "#1A2538" }}
                >
                  <img
                    src={movie.thumbnail.getDirectURL()}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {movie.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Number(movie.year)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
