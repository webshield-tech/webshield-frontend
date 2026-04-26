/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Mail, Lock, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { signupUser } from "../../api/auth-api.ts";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";
import { validateUsername, validateEmail, validatePassword } from "../../utils/validators";

/* ---- Password analysis ---- */
function analysePassword(pw: string) {
  const checks = {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

function strengthLabel(score: number) {
  if (score <= 1) return { label: "Too weak",  cls: "weak" };
  if (score === 2) return { label: "Weak",      cls: "weak" };
  if (score === 3) return { label: "Fair",      cls: "fair" };
  if (score === 4) return { label: "Good",      cls: "good" };
  return { label: "Strong", cls: "strong" };
}

function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername]             = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]               = useState(false);
  const [formError, setFormError]           = useState("");
  const [formSuccess, setFormSuccess]       = useState("");
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({});
  const [pwTouched, setPwTouched]           = useState(false);

  const { checks, score } = useMemo(() => analysePassword(password), [password]);
  const strength = strengthLabel(score);

  const setFieldError = (key: string, msg: string) =>
    setFieldErrors(prev => ({ ...prev, [key]: msg }));
  const clearFieldError = (key: string) =>
    setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });

  const validate = () => {
    const errs: Record<string, string> = {};
    
    const userVal = validateUsername(username);
    if (!userVal.isValid) errs.username = userVal.message;

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errs.email = emailVal.message;

    const passVal = validatePassword(password);
    if (!passVal.isValid) errs.password = passVal.message;
    else if (password !== confirmPassword) errs.confirm = "Passwords do not match.";
    
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});

    try {
      setLoading(true);
      const response = await signupUser({ username, email, password });

      if (response.data.success) {
        setFormSuccess("Account created! Redirecting…");
        const token = response.data.token;
        if (token) {
          localStorage.setItem("authToken", token);
          if (response.data.user) login(response.data.user);
          setTimeout(() => navigate("/disclaimer"), 800);
        } else {
          setTimeout(() => navigate("/login"), 1500);
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || "";
      if (msg.toLowerCase().includes("username")) setFieldError("username", "That username is already taken.");
      else if (msg.toLowerCase().includes("email")) setFieldError("email", "That email is already registered.");
      else setFormError(msg || "Registration failed. Please try again.");
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
          <h1>Create your account</h1>
          <p className="auth-subtitle">Join Vuln Spectra and start scanning securely.</p>

          {/* Alerts */}
          {formError && (
            <motion.div className="auth-alert error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={16} /><span>{formError}</span>
            </motion.div>
          )}
          {formSuccess && (
            <motion.div className="auth-alert success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CheckCircle2 size={16} /><span>{formSuccess}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'contents' }}>
            {/* Username */}
            <div className="auth-field">
              <label htmlFor="su-username">Username</label>
              <div className={`input-wrap ${fieldErrors.username ? "has-error" : ""}`}>
                <User className="i-icon" size={18} />
                <input
                  id="su-username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); clearFieldError("username"); }}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
              {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="su-email">Email</label>
              <div className={`input-wrap ${fieldErrors.email ? "has-error" : ""}`}>
                <Mail className="i-icon" size={18} />
                <input
                  id="su-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearFieldError("email"); }}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="su-password">Password</label>
              <div className={`input-wrap ${fieldErrors.password ? "has-error" : ""}`}>
                <Lock className="i-icon" size={18} />
                <input
                  id="su-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearFieldError("password"); setPwTouched(true); }}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}

              {/* Live strength meter */}
              {pwTouched && password.length > 0 && (
                <div className="pw-strength">
                  <div className="pw-bars">
                    {[1,2,3,4,5].map(i => {
                      let barClass = "";
                      if (i <= score) {
                        barClass = score <= 2 ? "active-weak" : score === 3 ? "active-fair" : score === 4 ? "active-good" : "active-strong";
                      }
                      return <div key={i} className={`pw-bar ${barClass}`} />;
                    })}
                  </div>
                  <span className={`pw-label ${strength.cls}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label htmlFor="su-confirm">Confirm password</label>
              <div className={`input-wrap ${fieldErrors.confirm ? "has-error" : ""}`}>
                <Lock className="i-icon" size={18} />
                <input
                  id="su-confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); clearFieldError("confirm"); }}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirm && <span className="field-error">{fieldErrors.confirm}</span>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /><span>Creating account…</span></>
              ) : (
                <span>Create account</span>
              )}
            </motion.button>

            {/* Footer */}
            <div className="auth-footer">
              <p>
                Already have an account?
                <Link to="/login" className="auth-link">Log in</Link>
              </p>
              <p style={{ marginTop: '12px' }}>
                <Link to="/" className="auth-home-link">← Back to Home</Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;