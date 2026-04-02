import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Clapperboard,
  KeyRound,
  LogOut,
  Menu,
  Search,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AuthModal from "./components/AuthModal";
import ChangePasswordModal from "./components/ChangePasswordModal";
import MovieCard from "./components/MovieCard";
import MoviePlayerModal from "./components/MoviePlayerModal";
import RightPanel from "./components/RightPanel";
import Sidebar, { type SidebarFilter } from "./components/Sidebar";
import UploadMovieModal from "./components/UploadMovieModal";
import { AuthContext, useAuthState } from "./hooks/useAuth";
import {
  Genre,
  type Movie,
  useGetAllMovies,
  useGetStats,
} from "./hooks/useQueries";

const GENRE_LABELS: Record<string, string> = {
  all: "All Movies",
  [Genre.bollywood]: "Bollywood Movies",
  [Genre.hollywood]: "Hollywood Movies",
  [Genre.gujarati]: "Gujarati Movies",
  [Genre.tollywood]: "Tollywood Movies",
};

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

function AppContent() {
  const auth = useAuthState();
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<"all" | Genre>("all");
  const [yearFilter, setYearFilter] = useState<"all" | string>("all");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { data: movies, isLoading: moviesLoading } = useGetAllMovies();
  const { data: stats, isLoading: statsLoading } = useGetStats();

  const isAdmin = auth.user?.isAdmin ?? false;

  const uniqueYears = useMemo(() => {
    if (!movies) return [];
    const years = [...new Set(movies.map((m) => Number(m.year)))].sort(
      (a, b) => b - a,
    );
    return years;
  }, [movies]);

  const filteredMovies = useMemo(() => {
    if (!movies) return [];
    let list = [...movies];
    if (sidebarFilter !== "all")
      list = list.filter((m) => m.genre === sidebarFilter);
    if (genreFilter !== "all")
      list = list.filter((m) => m.genre === genreFilter);
    if (yearFilter !== "all")
      list = list.filter((m) => String(Number(m.year)) === yearFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [movies, sidebarFilter, genreFilter, yearFilter, debouncedSearch]);

  const handleOpenLogin = useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  const handleSidebarFilterChange = useCallback((filter: SidebarFilter) => {
    setSidebarFilter(filter);
    setMobileSidebarOpen(false);
  }, []);

  const pageTitle = GENRE_LABELS[sidebarFilter] ?? "All Movies";

  return (
    <AuthContext.Provider value={auth}>
      <div className="flex min-h-screen" style={{ background: "#0B1220" }}>
        <Sidebar
          activeFilter={sidebarFilter}
          onFilterChange={handleSidebarFilterChange}
          stats={stats}
          statsLoading={statsLoading}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header
            className="sticky top-0 z-30 flex items-center gap-2 px-3 sm:px-5 py-3"
            style={{
              background: "rgba(11,18,32,0.95)",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid #2A364A",
            }}
          >
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors shrink-0"
              style={{ background: "#172234", border: "1px solid #2A364A" }}
              aria-label="Open menu"
              data-ocid="nav.toggle"
            >
              <Menu size={18} />
            </button>

            <div className="lg:hidden flex items-center gap-2 shrink-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(214,178,94,0.15)" }}
              >
                <Clapperboard size={14} style={{ color: "#D6B25E" }} />
              </div>
              <span
                className="font-display font-bold text-sm"
                style={{ color: "#D6B25E" }}
              >
                INFINEXY
              </span>
            </div>

            <div className="flex-1 relative max-w-xl">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search movies..."
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none transition-colors"
                style={{
                  background: "#172234",
                  border: "1px solid #2A364A",
                  color: "#E9EEF7",
                }}
                data-ocid="search.search_input"
              />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {auth.isAuthenticated ? (
                <>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setUploadModalOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={{ backgroundColor: "#D6B25E", color: "#0B1220" }}
                      data-ocid="upload.open_modal_button"
                    >
                      <Upload size={14} />
                      <span className="hidden sm:inline">Upload</span>
                    </button>
                  )}
                  <div
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl"
                    style={{
                      background: "#172234",
                      border: "1px solid #2A364A",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: "rgba(214,178,94,0.2)",
                        color: "#D6B25E",
                      }}
                    >
                      {auth.user?.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground hidden sm:inline">
                      {auth.user?.username}
                    </span>
                    {auth.user?.isAdmin && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded hidden sm:inline"
                        style={{
                          background: "rgba(214,178,94,0.15)",
                          color: "#D6B25E",
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setChangePasswordOpen(true)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                    style={{
                      background: "#172234",
                      border: "1px solid #2A364A",
                    }}
                    title="Change Password"
                    data-ocid="change_password.open_modal_button"
                  >
                    <KeyRound size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={auth.logout}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                    style={{
                      background: "#172234",
                      border: "1px solid #2A364A",
                    }}
                    title="Logout"
                    data-ocid="nav.link"
                  >
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-foreground"
                  style={{
                    border: "1px solid #2A364A",
                    background: "#172234",
                  }}
                  data-ocid="nav.link"
                >
                  LOG IN
                </button>
              )}
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="px-3 sm:px-5 pt-6 pb-6">
              <motion.h1
                className="font-display font-bold mb-4 text-2xl sm:text-3xl"
                style={{ color: "#E9EEF7" }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {pageTitle}
              </motion.h1>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                <select
                  value={genreFilter}
                  onChange={(e) =>
                    setGenreFilter(e.target.value as "all" | Genre)
                  }
                  className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors flex-1 sm:flex-none min-w-0"
                  style={{
                    background: "#172234",
                    border: "1px solid #2A364A",
                    color: "#9AA7B6",
                  }}
                  data-ocid="filter.select"
                >
                  <option value="all">All Genres</option>
                  <option value={Genre.bollywood}>Bollywood</option>
                  <option value={Genre.hollywood}>Hollywood</option>
                  <option value={Genre.gujarati}>Gujarati</option>
                  <option value={Genre.tollywood}>Tollywood</option>
                </select>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors flex-1 sm:flex-none min-w-0"
                  style={{
                    background: "#172234",
                    border: "1px solid #2A364A",
                    color: "#9AA7B6",
                  }}
                  data-ocid="filter.select"
                >
                  <option value="all">All Years</option>
                  {uniqueYears.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {moviesLoading ? (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 gap-3 sm:gap-4"
                  data-ocid="movies.loading_state"
                >
                  {SKELETON_KEYS.map((key) => (
                    <div
                      key={key}
                      className="rounded-xl overflow-hidden"
                      style={{ background: "#1A2538" }}
                    >
                      <Skeleton className="aspect-[2/3] w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-2.5 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMovies.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-20 text-center"
                  data-ocid="movies.empty_state"
                >
                  <Clapperboard
                    size={56}
                    className="mb-4"
                    style={{ color: "#2A364A" }}
                  />
                  <h3 className="font-display font-bold text-lg text-muted-foreground mb-1">
                    {debouncedSearch ? "No results found" : "No movies yet"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {debouncedSearch
                      ? "Try a different search term"
                      : isAdmin
                        ? "Upload your first movie!"
                        : "Check back soon."}
                  </p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 gap-3 sm:gap-4"
                  data-ocid="movies.list"
                >
                  {filteredMovies.map((movie, idx) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isAdmin={isAdmin}
                      index={idx}
                      onClick={() => setSelectedMovie(movie)}
                    />
                  ))}
                </div>
              )}
            </div>

            <footer
              className="lg:hidden px-5 py-6 text-center text-xs text-muted-foreground"
              style={{ borderTop: "1px solid #2A364A" }}
            >
              <p>
                © {new Date().getFullYear()}. Built with ❤️ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#D6B25E" }}
                >
                  caffeine.ai
                </a>
              </p>
            </footer>
          </div>
        </main>

        <RightPanel
          stats={stats}
          movies={movies}
          statsLoading={statsLoading}
          moviesLoading={moviesLoading}
        />

        <MoviePlayerModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
        <UploadMovieModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
        />
        <ChangePasswordModal
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />

        <Toaster position="top-right" theme="dark" />
      </div>
    </AuthContext.Provider>
  );
}

export default function App() {
  return <AppContent />;
}
