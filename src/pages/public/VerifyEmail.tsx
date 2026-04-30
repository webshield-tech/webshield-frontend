import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email") || (location.state as any)?.email;
    if (emailParam) {
      setEmail(emailParam);
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.post("/user/verify-email", { email, code });
      
      if (res.data.success) {
        setSuccess("Email verified successfully! Redirecting...");
        login(res.data.user);
        if (res.data.token) localStorage.setItem("authToken", res.data.token);
        
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    try {
      setResending(true);
      setError("");
      const res = await api.post("/user/resend-verification", { email });
      if (res.data.success) {
        setSuccess("A new code has been sent to your email.");
        setTimer(60); // 1 min cooldown
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-info-panel">
          <div className="auth-logo">
            <Shield size={32} color="var(--cyber-primary)" />
            <span>VULN SPECTRA</span>
          </div>
          <h2>Verify Your Identity</h2>
          <p>We've sent a 6-digit security code to <strong>{email}</strong>. Enter it below to activate your account.</p>
        </div>

        <div className="auth-form-panel">
          <h1>Email Verification</h1>
          <p className="auth-subtitle">Final step to secure your workspace.</p>

          {error && (
            <motion.div className="auth-alert error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div className="auth-alert success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleVerify}>
            <div className="auth-field">
              <label>Verification Code</label>
              <div className="input-wrap">
                <Mail className="i-icon" size={18} />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="otp-input"
                  autoFocus
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || code.length !== 6}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /><span>Verifying…</span></>
              ) : (
                <><span>Complete Activation</span> <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div className="auth-footer">
            <button 
              className="resend-btn" 
              onClick={handleResend} 
              disabled={resending || timer > 0}
            >
              {resending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {timer > 0 ? `Resend code in ${timer}s` : "Resend verification code"}
            </button>
            <p style={{ marginTop: '20px' }}>
              <button onClick={() => navigate("/login")} className="text-link">Back to Login</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
