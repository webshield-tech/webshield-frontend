/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { LoginUser } from "../../api/auth-api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [emailError, setEmailError]     = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(""); setPasswordError(""); setFormError(""); setFormSuccess("");

    if (!email) { setEmailError("Email is required."); return; }
    if (!password) { setPasswordError("Password is required."); return; }

    try {
      setLoading(true);
      const response = await LoginUser({ email, password });

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
      const msg = error?.response?.data?.error || "";
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("does not exist")) {
        setEmailError("No account found with this email.");
      } else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("incorrect")) {
        setPasswordError("Incorrect password. Please try again.");
      } else if (msg.toLowerCase().includes("suspended") || msg.toLowerCase().includes("blocked")) {
        setFormError(msg);
      } else {
        setFormError(msg || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="auth-logo-wrap">
          <motion.div
            className="auth-logo-icon"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Shield size={28} />
          </motion.div>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your Vuln Spectra account</p>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>
            <div className={`input-wrap ${emailError ? "has-error" : ""}`}>
              <Mail className="i-icon" size={17} />
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
              <Lock className="i-icon" size={17} />
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
              <><Loader2 size={18} className="animate-spin" /><span>Signing in…</span></>
            ) : (
              <><span>Sign in</span><ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Don't have an account?
            <Link to="/signup" className="auth-link">Create one</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
