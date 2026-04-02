import { Clapperboard, Film, Grid } from "lucide-react";
import { Genre, type MovieStats } from "../hooks/useQueries";

export type SidebarFilter = "all" | Genre;

const NAV_ITEMS: { label: string; filter: SidebarFilter; genre?: Genre }[] = [
  { label: "All Movies", filter: "all" },
  {
    label: "Bollywood Movies",
    filter: Genre.bollywood,
    genre: Genre.bollywood,
  },
  {
    label: "Hollywood Movies",
    filter: Genre.hollywood,
    genre: Genre.hollywood,
  },
  { label: "Gujarati Movies", filter: Genre.gujarati, genre: Genre.gujarati },
  {
    label: "Tollywood Movies",
    filter: Genre.tollywood,
    genre: Genre.tollywood,
  },
];

interface SidebarProps {
  activeFilter: SidebarFilter;
  onFilterChange: (f: SidebarFilter) => void;
  stats: MovieStats | undefined;
  statsLoading: boolean;
}

function getCount(
  stats: MovieStats | undefined,
  filter: SidebarFilter,
): number {
  if (!stats) return 0;
  if (filter === "all") return Number(stats.totalMovies);
  return Number(stats.genreCounts[filter]);
}

export default function Sidebar({
  activeFilter,
  onFilterChange,
  stats,
  statsLoading,
}: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 overflow-y-auto scrollbar-thin"
      style={{ background: "#121B2B", borderRight: "1px solid #2A364A" }}
    >
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: "1px solid #2A364A" }}>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(214,178,94,0.15)" }}
          >
            <Film size={20} style={{ color: "#D6B25E" }} />
          </div>
          <div>
            <div
              className="font-display font-bold text-sm tracking-widest"
              style={{ color: "#D6B25E" }}
            >
              INFINEXY
            </div>
            <div className="text-xs text-muted-foreground tracking-wider">
              SOLUTION
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 pl-12 font-medium tracking-wide">
          Movies Box
        </p>
      </div>

      {/* Navigation */}
      <div className="px-3 py-4 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2 mb-3">
          Browse
        </p>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeFilter === item.filter;
            const count = getCount(stats, item.filter);
            return (
              <button
                type="button"
                key={item.filter}
                onClick={() => onFilterChange(item.filter)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left"
                style={
                  active
                    ? { background: "rgba(214,178,94,0.12)", color: "#D6B25E" }
                    : { color: "#9AA7B6" }
                }
                data-ocid="nav.link"
              >
                <div className="flex items-center gap-2.5">
                  {item.filter === "all" ? (
                    <Grid size={15} />
                  ) : (
                    <Clapperboard size={15} />
                  )}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {!statsLoading && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={
                      active
                        ? {
                            background: "rgba(214,178,94,0.25)",
                            color: "#D6B25E",
                          }
                        : { background: "#1B2434", color: "#9AA7B6" }
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div
        className="px-5 py-4 text-xs text-muted-foreground"
        style={{ borderTop: "1px solid #2A364A" }}
      >
        <p>
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "#D6B25E" }}
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
