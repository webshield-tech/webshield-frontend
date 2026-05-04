import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, ChevronLeft, Loader2, ShieldCheck, Key } from "lucide-react";
import { resetPassword } from "../../api/auth-api";
import "../../styles/auth.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("RESET_TOKEN_MISSING_OR_INVALID");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token is missing. Please use the link from your email.");
      return;
    }
    if (!password || !confirm) {
      setError("Please fill out both password fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({ token, newPassword: password });
      if (res.data?.success) {
        setSuccess("PASSWORD_RESET_SUCCESSFUL // REDIRECTING...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.data?.error || "FAILED_TO_RESET_CREDENTIALS");
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || "PROTOCOL_FAILURE_RETRY_REQUIRED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-premium">
      <div className="noise-overlay"></div>
      
      <div className="auth-content-wrap">
        <header className="auth-header">
          <Link to="/login" className="back-link">
            <ChevronLeft size={18} />
            <span>ABORT_RESET</span>
          </Link>
          <div className="auth-logo-premium">
            <div className="logo-glow"></div>
            <ShieldCheck size={48} className="logo-icon" />
          </div>
          <h1 className="text-gradient">CREDENTIAL_RESET</h1>
          <p>ESTABLISH_NEW_SECURITY_KEY</p>
        </header>

        <form className="auth-form-premium glass-panel" onSubmit={handleSubmit} autoComplete="off">
          {error && <div className="auth-alert error">{error}</div>}
          {success && <div className="auth-alert success">{success}</div>}

          <div className="auth-input-group">
            <label>NEW_PASSPHRASE</label>
            <div className="input-wrap">
              <Lock size={18} className="i-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>CONFIRM_PASSPHRASE</label>
            <div className="input-wrap">
              <Key size={18} className="i-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading || !token}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : "UPDATE_CREDENTIALS"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
