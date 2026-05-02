/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, Lock, Loader2, AlertCircle, CheckCircle2, Chrome
} from "lucide-react";
import { motion } from "framer-motion";
import { LoginUser } from "../../api/auth-api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";
import { validateEmail } from "../../utils/validators";

import { useToast, ToastContainer } from "../../components/Toast";
import { useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  const { login, socialLogin } = useAuth();
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

  const handleSocialAction = async (provider: "google" | "github") => {
    try {
      setLoading(true);
      const user = await socialLogin(provider);
      if (user?.agreedToTerms) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/disclaimer", { replace: true });
      }
    } catch (err: any) {
      if (err.code === "auth/account-exists-with-different-credential" || err.message?.includes("account-exists")) {
        setFormError("This email is already registered with a different sign-in method (e.g., password or another social provider). Please use your original method to log in.");
      } else {
        setFormError(err.message || `${provider} authentication failed`);
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

        setTimeout(() => {
          if (loggedInUser?.role === "admin") {
            navigate("/admin", { replace: true });
          } else if (loggedInUser?.agreedToTerms) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/disclaimer", { replace: true });
          }
        }, 600);
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
              onClick={() => handleSocialAction("google")}
              disabled={loading}
            >
              <Chrome size={20} />
              <span>Google</span>
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
