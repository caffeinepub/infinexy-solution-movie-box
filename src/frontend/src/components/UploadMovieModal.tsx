import { Film, Image, Loader2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Genre, useAddMovie } from "../hooks/useQueries";

interface UploadMovieModalProps {
  open: boolean;
  onClose: () => void;
}

const GENRES = [
  { value: Genre.bollywood, label: "Bollywood" },
  { value: Genre.hollywood, label: "Hollywood" },
  { value: Genre.gujarati, label: "Gujarati" },
  { value: Genre.tollywood, label: "Tollywood" },
];

// Accept all common video formats explicitly plus the wildcard
const VIDEO_ACCEPT = [
  "video/*",
  "video/mp4",
  "video/x-m4v",
  "video/quicktime", // MOV
  "video/x-msvideo", // AVI
  "video/x-matroska", // MKV
  "video/x-ms-wmv", // WMV
  "video/x-flv", // FLV
  "video/webm",
  "video/ogg",
  "video/3gpp",
  "video/3gpp2",
  "video/mpeg",
  "video/x-mpeg",
  "video/mp2t", // TS
  "video/x-ms-asf", // ASF
  "video/divx",
  "video/x-divx",
  ".mp4,.m4v,.mov,.avi,.mkv,.wmv,.flv,.webm,.ogv,.3gp,.3g2,.mpeg,.mpg,.ts,.asf,.divx,.rm,.rmvb,.vob",
].join(",");

const currentYear = new Date().getFullYear();

export default function UploadMovieModal({
  open,
  onClose,
}: UploadMovieModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [genre, setGenre] = useState(Genre.bollywood);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [fetchingMovie, setFetchingMovie] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMovie = useAddMovie();

  const fetchMovieInfo = useCallback(async (movieTitle: string) => {
    if (!movieTitle.trim()) {
      setPosterUrl(null);
      setYear(String(currentYear));
      return;
    }
    setFetchingMovie(true);
    try {
      const res = await fetch(
        `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle.trim())}&apikey=trilogy`,
      );
      const data = await res.json();
      if (data.Response === "True") {
        if (data.Year) {
          // Extract 4-digit year from strings like "2021–" or "2019"
          const yearMatch = String(data.Year).match(/\d{4}/);
          if (yearMatch) setYear(yearMatch[0]);
        }
        if (data.Poster && data.Poster !== "N/A") {
          setPosterUrl(data.Poster);
        }
      }
    } catch {
      // Silently ignore network errors
    } finally {
      setFetchingMovie(false);
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value.trim()) {
      setPosterUrl(null);
      setYear(String(currentYear));
      setFetchingMovie(false);
      return;
    }

    setFetchingMovie(true);
    debounceTimer.current = setTimeout(() => {
      fetchMovieInfo(value);
    }, 800);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setYear(String(currentYear));
    setGenre(Genre.bollywood);
    setThumbnailFile(null);
    setVideoFile(null);
    setThumbProgress(0);
    setVideoProgress(0);
    setPosterUrl(null);
    setFetchingMovie(false);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    // Thumbnail is optional if posterUrl is set
    if (!thumbnailFile && !posterUrl) {
      toast.error("Thumbnail is required");
      return;
    }
    if (!videoFile) {
      toast.error("Video file is required");
      return;
    }
    const yearNum = Number.parseInt(year, 10);
    if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 2) {
      toast.error("Invalid year");
      return;
    }

    let finalThumbnailFile = thumbnailFile;

    // If no file chosen but posterUrl exists, fetch poster and convert to File
    if (!finalThumbnailFile && posterUrl) {
      try {
        const imgRes = await fetch(posterUrl);
        const blob = await imgRes.blob();
        finalThumbnailFile = new File([blob], "poster.jpg", {
          type: "image/jpeg",
        });
      } catch {
        toast.error("Failed to fetch auto-poster. Please upload manually.");
        return;
      }
    }

    try {
      await addMovie.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        year: yearNum,
        genre,
        thumbnailFile: finalThumbnailFile!,
        videoFile,
        onThumbnailProgress: setThumbProgress,
        onVideoProgress: setVideoProgress,
      });
      toast.success("Movie uploaded successfully!");
      onClose();
      resetForm();
    } catch (err) {
      toast.error(
        `Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const uploading = addMovie.isPending;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-ocid="upload.modal"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={!uploading ? onClose : undefined}
          />
          <motion.div
            className="relative w-full max-w-lg mx-0 sm:mx-auto rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{ background: "#121B2B", border: "1px solid #2A364A" }}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid #2A364A" }}
            >
              <div className="flex items-center gap-2">
                <Film size={18} style={{ color: "#D6B25E" }} />
                <span className="font-display font-bold text-base text-foreground">
                  Upload Movie
                </span>
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="upload.close_button"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin"
            >
              {/* Title */}
              <div>
                <label
                  htmlFor="upload-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Title *
                </label>
                <div className="relative">
                  <input
                    id="upload-title"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Movie title (auto-fetches year & poster)"
                    className="w-full rounded-lg px-4 py-2.5 pr-10 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
                    data-ocid="upload.input"
                    disabled={uploading}
                  />
                  {fetchingMovie && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Loader2
                        size={15}
                        className="animate-spin"
                        style={{ color: "#D6B25E" }}
                      />
                    </div>
                  )}
                </div>
                {posterUrl && !thumbnailFile && (
                  <p
                    className="mt-1 text-xs font-medium"
                    style={{ color: "#4CAF50" }}
                  >
                    ✓ Movie found — year &amp; poster auto-filled
                  </p>
                )}
              </div>
              {/* Description */}
              <div>
                <label
                  htmlFor="upload-desc"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="upload-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Movie description"
                  rows={2}
                  className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors resize-none"
                  data-ocid="upload.textarea"
                  disabled={uploading}
                />
              </div>
              {/* Year + Genre row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="upload-year"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                  >
                    Year *
                  </label>
                  <input
                    id="upload-year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min="1900"
                    max={currentYear + 2}
                    className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground focus:outline-none transition-colors"
                    data-ocid="upload.input"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label
                    htmlFor="upload-genre"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                  >
                    Genre *
                  </label>
                  <select
                    id="upload-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as Genre)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground focus:outline-none transition-colors"
                    data-ocid="upload.select"
                    disabled={uploading}
                  >
                    {GENRES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Thumbnail */}
              <div>
                <p className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Thumbnail Image{thumbnailFile || posterUrl ? " " : " *"}
                  {posterUrl && !thumbnailFile && (
                    <span
                      className="ml-2 normal-case font-medium text-xs px-1.5 py-0.5 rounded"
                      style={{
                        color: "#4CAF50",
                        background: "rgba(76,175,80,0.12)",
                        border: "1px solid rgba(76,175,80,0.3)",
                      }}
                    >
                      Auto-fetched
                    </span>
                  )}
                </p>

                {/* Auto-fetched poster preview */}
                {posterUrl && !thumbnailFile && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-3 mb-2 p-2 rounded-lg"
                    style={{
                      background: "rgba(76,175,80,0.07)",
                      border: "1px solid rgba(76,175,80,0.2)",
                    }}
                  >
                    <img
                      src={posterUrl}
                      alt="Auto-fetched poster"
                      className="rounded object-cover flex-shrink-0"
                      style={{ width: 54, height: 80 }}
                      onError={() => setPosterUrl(null)}
                    />
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "#4CAF50" }}
                      >
                        ✓ Auto-fetched poster
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You can override with your own image below
                      </p>
                    </div>
                  </motion.div>
                )}

                <label
                  htmlFor="upload-thumbnail"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    background: "#0B1220",
                    border: `1px dashed ${
                      thumbnailFile ? "#D6B25E" : "#2A364A"
                    }`,
                  }}
                  data-ocid="upload.upload_button"
                >
                  <Image size={18} style={{ color: "#D6B25E" }} />
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {thumbnailFile
                      ? thumbnailFile.name
                      : posterUrl
                        ? "Override poster (optional)..."
                        : "Choose thumbnail image..."}
                  </span>
                  {thumbnailFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setThumbnailFile(null);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                      disabled={uploading}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <input
                    id="upload-thumbnail"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setThumbnailFile(e.target.files?.[0] ?? null)
                    }
                    disabled={uploading}
                  />
                </label>
                {uploading && thumbProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Thumbnail</span>
                      <span>{thumbProgress}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#2A364A] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${thumbProgress}%`,
                          backgroundColor: "#D6B25E",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* Video */}
              <div>
                <p className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Video File *
                </p>
                <label
                  htmlFor="upload-video"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    background: "#0B1220",
                    border: "1px dashed #2A364A",
                  }}
                  data-ocid="upload.dropzone"
                >
                  <Upload size={18} style={{ color: "#D6B25E" }} />
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {videoFile ? videoFile.name : "Choose video file..."}
                  </span>
                  <input
                    id="upload-video"
                    type="file"
                    accept={VIDEO_ACCEPT}
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                    disabled={uploading}
                  />
                </label>
                <p
                  className="mt-1.5 text-xs text-muted-foreground"
                  style={{ color: "#6B7A8D" }}
                >
                  Supports MP4, MOV, AVI, MKV, WMV, FLV, WebM, MPEG and all
                  other video formats
                </p>
                {uploading && videoProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Video</span>
                      <span>{videoProgress}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-[#2A364A] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${videoProgress}%`,
                          backgroundColor: "#D6B25E",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-opacity disabled:opacity-60"
                style={{ backgroundColor: "#D6B25E", color: "#0B1220" }}
                data-ocid="upload.submit_button"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Upload Movie
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
