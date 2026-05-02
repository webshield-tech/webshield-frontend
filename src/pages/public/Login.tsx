/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Mail, Lock, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { LoginUser } from "../../api/auth-api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";
import { validateEmail } from "../../utils/validators";

function GoogleBrandMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.35 11.1h-9.18v2.9h5.28c-.23 1.26-.95 2.33-2.03 3.05v2.53h3.29c1.92-1.77 3.02-4.38 3.02-7.48 0-.71-.06-1.22-.38-1.9Z" />
      <path fill="#34A853" d="M12.17 22c2.74 0 5.04-.9 6.72-2.4l-3.29-2.53c-.91.61-2.08.98-3.43.98-2.64 0-4.88-1.78-5.68-4.18H2.98v2.62A10 10 0 0 0 12.17 22Z" />
      <path fill="#FBBC05" d="M6.49 13.87A6.01 6.01 0 0 1 6.18 12c0-.65.11-1.28.31-1.87V7.51H2.98A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.45-2.62Z" />
      <path fill="#EA4335" d="M12.17 5.95c1.49 0 2.82.52 3.87 1.53l2.9-2.9C17.2 2.98 14.9 2 12.17 2 8.5 2 5.22 4.09 3.49 7.51l3.5 2.62c.78-2.4 3.02-4.18 5.18-4.18Z" />
    </svg>
  );
}

import { useToast, ToastContainer } from "../../components/Toast";
import { useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin, refreshUser, user } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [emailError, setEmailError]     = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session") === "expired") {
      addToast("info", "Session Expired", "Your session has timed out. Please log in again to continue.", 6000);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [addToast]);

  useEffect(() => {
    if (loading || !location.pathname.startsWith("/login")) return;

    if (user) {
      const role = String(user.role || "").trim().toLowerCase();
      if (role === "admin" || role === "superadmin") {
        navigate("/admin", { replace: true });
      } else if (user.agreedToTerms) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/disclaimer", { replace: true });
      }
    }
  }, [loading, location.pathname, navigate, user]);

  const handleSocialAction = async () => {
    try {
      setLoading(true);
      const user = await socialLogin("google");

      // Redirect flows will continue after the Firebase redirect completes.
      if (!user) return;

      const freshUser = await refreshUser();
      const activeUser = freshUser || user;
      const role = String(activeUser?.role || "").trim().toLowerCase();
      if (role === "admin" || role === "superadmin") {
        navigate("/admin", { replace: true });
      } else if (activeUser?.agreedToTerms) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/disclaimer", { replace: true });
      }
    } catch (err: any) {
      if (err.code === "auth/account-exists-with-different-credential" || err.message?.includes("account-exists")) {
        setFormError("This email is already registered with a different sign-in method (e.g., password or another social provider). Please use your original method to log in.");
      } else {
        setFormError(err.message || "Google authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(""); setPasswordError(""); setFormError(""); setFormSuccess("");

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }

    if (!password) { setPasswordError("Password is required."); return; }

    const maliciousPatterns = [
      /['";]\s*(OR|AND)\s+['"]?1['"]?\s*=\s*['"]?1/i, // SQLi
      /<script\b[^>]*>([\s\S]*?)<\/script>/i, // XSS
      /(javascript|vbscript|data):/i, // XSS
      /UNION\s+SELECT/i, // SQLi
      /\b(DROP|DELETE|TRUNCATE|UPDATE)\s+TABLE\b/i, // SQLi
    ];
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(email) || pattern.test(password)) {
        setFormError("Nice try, hacker! 🕵️‍♂️ But we're the ones building the shields here. Save your SQLi and XSS for the training labs!");
        return;
      }
    }

    try {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      console.log(`[AUTH] Attempting login for: "${cleanEmail}"`);
      const response = await LoginUser({ email: cleanEmail, password });

      if (response.data.success) {
        setFormSuccess("Login successful! Redirecting…");

        const token = response.data.token;
        if (token) localStorage.setItem("authToken", token);

        const loggedInUser = response.data.user;
        login(loggedInUser);

        try {
          const freshUser = await refreshUser();
          const activeUser = freshUser || loggedInUser;
          const role = String(activeUser?.role || "").trim().toLowerCase();
          if (role === "admin" || role === "superadmin") {
            navigate("/admin", { replace: true });
          } else if (activeUser?.agreedToTerms) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/disclaimer", { replace: true });
          }
        } catch {
          const role = String(loggedInUser?.role || "").trim().toLowerCase();
          if (role === "admin" || role === "superadmin") {
            navigate("/admin", { replace: true });
          } else if (loggedInUser?.agreedToTerms) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/disclaimer", { replace: true });
          }
        }
      }
    } catch (error: any) {
      // error.response exists for real axios errors (login/signup route passthrough)
      const msg: string =
        error?.response?.data?.error ||
        error?.message ||
        "";

      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("does not exist")) {
        setEmailError("No account found with this email.");
      } else if (msg.includes("EMAIL_NOT_VERIFIED")) {
        const emailToVerify = error?.response?.data?.email || email;
        setFormError("Email not verified. Redirecting to verification page...");
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(emailToVerify)}`, { state: { email: emailToVerify } });
        }, 1500);
      } else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("incorrect")) {
        setPasswordError("Incorrect password. Please try again.");
      } else if (msg.toLowerCase().includes("suspended") || msg.toLowerCase().includes("blocked")) {
        setFormError(msg);
      } else if (msg.toLowerCase().includes("too many")) {
        setFormError("Too many attempts. Please try again in 15 minutes.");
      } else if (msg) {
        setFormError(msg);
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-split-container"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* LEFT PANEL - BRANDING */}
        <div className="auth-brand-panel">
          <img src="/logo.png" alt="Vuln Spectra Shield" className="brand-logo-img" />
          <h2>Empowering your security posture</h2>
          <p>
            The exclusive platform for security professionals to engage the most trusted vulnerability scanning and reporting solutions.
          </p>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="auth-form-panel">
          <div className="auth-header-mini">
            <img src="/logo.png" alt="Logo" className="mini-logo" />
          </div>
          <h1>Welcome back!</h1>
          <p className="auth-subtitle">Log in to your Vuln Spectra account.</p>

          {/* Alerts */}
          {formError && (
            <motion.div className="auth-alert error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={16} />
              <span>{formError}</span>
            </motion.div>
          )}
          {formSuccess && (
            <motion.div className="auth-alert success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CheckCircle2 size={16} />
              <span>{formSuccess}</span>
            </motion.div>
          )}

          {/* SOCIAL LOGIN AT TOP */}
          <div className="social-grid">
            <button 
              type="button" 
              className="social-btn google" 
              onClick={handleSocialAction}
              disabled={loading}
            >
              <span className="social-icon-bubble"><GoogleBrandMark /></span>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="social-divider">
            <span>Or use email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <div className={`input-wrap ${emailError ? "has-error" : ""}`}>
                <Mail className="i-icon" size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {emailError && <span className="field-error">{emailError}</span>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-field-row">
                <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className={`input-wrap ${passwordError ? "has-error" : ""}`}>
                <Lock className="i-icon" size={18} />
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(""); }}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              {passwordError && <span className="field-error">{passwordError}</span>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /><span>Logging in…</span></>
              ) : (
                <span>Log in</span>
              )}
            </motion.button>
          </form>


          {/* Footer */}
          <div className="auth-footer">
            <p>
              Don't have an account?
              <Link to="/signup" className="auth-link">Sign up</Link>
            </p>
            <p style={{ marginTop: '12px' }}>
              <Link to="/" className="auth-home-link">← Back to Home</Link>
            </p>
          </div>
        </div>
      </motion.div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default Login;
