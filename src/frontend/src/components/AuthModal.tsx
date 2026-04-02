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

export default function AuthModal({
  open,
  defaultTab = "login",
  onClose,
}: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (tab === "register") {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }
    setLoading(true);
    try {
      if (tab === "login") {
        const ok = await login(username.trim(), password);
        if (!ok) {
          toast.error("Invalid username or password");
        } else {
          toast.success(`Welcome back, ${username}!`);
          onClose();
          setUsername("");
          setPassword("");
        }
      } else {
        const ok = await register(username.trim(), password);
        if (!ok) {
          toast.error("Username already taken");
        } else {
          toast.success(`Account created! Welcome, ${username}!`);
          onClose();
          setUsername("");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
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
            className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
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

            {/* Tabs */}
            <div
              className="flex mx-6 rounded-xl overflow-hidden mb-6"
              style={{ background: "#0B1220" }}
            >
              <button
                type="button"
                onClick={() => setTab("login")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  tab === "login"
                    ? "rounded-xl text-navy-900 bg-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={
                  tab === "login"
                    ? { backgroundColor: "#D6B25E", color: "#0B1220" }
                    : {}
                }
                data-ocid="auth.tab"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab("register")}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
                  tab === "register"
                    ? "rounded-xl text-navy-900 bg-gold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={
                  tab === "register"
                    ? { backgroundColor: "#D6B25E", color: "#0B1220" }
                    : {}
                }
                data-ocid="auth.tab"
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
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
              {tab === "register" && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                    style={{ borderColor: "#2A364A" }}
                    data-ocid="auth.input"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all mt-2 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#D6B25E", color: "#0B1220" }}
                data-ocid="auth.submit_button"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading
                  ? "Please wait..."
                  : tab === "login"
                    ? "Sign In"
                    : "Create Account"}
              </button>
              {tab === "login" && (
                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="text-gold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
