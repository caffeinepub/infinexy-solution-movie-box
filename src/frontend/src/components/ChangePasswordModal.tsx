import { Eye, EyeOff, KeyRound, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useAuth } from "../hooks/useAuth";

function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  open,
  onClose,
}: ChangePasswordModalProps) {
  const { user } = useAuth();
  const { actor } = useActor();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (!actor || !user) return;

    setLoading(true);
    try {
      const ok = await actor.changePassword(
        user.username,
        simpleHash(currentPassword),
        simpleHash(newPassword),
      );
      if (ok) {
        toast.success("Password changed successfully!");
        handleClose();
      } else {
        setError("Current password is incorrect");
      }
    } catch (err) {
      console.error("changePassword error:", err);
      setError("Something went wrong. Please try again.");
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
          data-ocid="change_password.modal"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
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
                <KeyRound size={20} style={{ color: "#D6B25E" }} />
                <span
                  className="font-display font-bold text-lg tracking-wide"
                  style={{ color: "#D6B25E" }}
                >
                  Change Password
                </span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="change_password.close_button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Subtitle */}
            <div className="px-6 mb-6">
              <p className="text-xs text-muted-foreground">
                Update the password for{" "}
                <span style={{ color: "#D6B25E" }}>{user?.username}</span>
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mx-6 mb-4 px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: "rgba(220,38,38,0.12)",
                    border: "1px solid rgba(220,38,38,0.3)",
                    color: "#f87171",
                  }}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  data-ocid="change_password.error_state"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-4">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="cp-current"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="cp-current"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors pr-10"
                    style={{ borderColor: "#2A364A" }}
                    data-ocid="change_password.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="cp-new"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="cp-new"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors pr-10"
                    style={{ borderColor: "#2A364A" }}
                    data-ocid="change_password.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label
                  htmlFor="cp-confirm"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="cp-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-lg px-4 py-2.5 text-sm bg-[#0B1220] border border-[#2A364A] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors pr-10"
                    style={{ borderColor: "#2A364A" }}
                    data-ocid="change_password.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all mt-2 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#D6B25E", color: "#0B1220" }}
                data-ocid="change_password.submit_button"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
