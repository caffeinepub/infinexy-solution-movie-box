import { Eye, EyeOff, Film, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  defaultTab?: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const ok = await login(username.trim(), password);
      if (!ok) {
        toast.error("Invalid username or password");
      } else {
        toast.success(`Welcome back, ${username}!`);
        onClose();
        setUsername("");
        setPassword("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-ocid="auth.modal"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "#121B2B", border: "1px solid #2A364A" }}
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-2">
                <Film className="text-gold" size={20} />
                <span className="text-gold font-display font-bold text-lg tracking-wide">
                  INFINEXY
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="auth.close_button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Title */}
            <div className="px-6 mb-6">
              <h2
                className="text-xl font-display font-bold"
                style={{ color: "#E9EEF7" }}
              >
                Sign In
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-4">
              <div>
                <label
                  htmlFor="auth-username"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Username
                </label>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  style={{ borderColor: "#2A364A" }}
                  data-ocid="auth.input"
                />
              </div>
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors pr-10"
                    style={{ borderColor: "#2A364A" }}
                    data-ocid="auth.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all mt-2 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#D6B25E", color: "#0B1220" }}
                data-ocid="auth.submit_button"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
