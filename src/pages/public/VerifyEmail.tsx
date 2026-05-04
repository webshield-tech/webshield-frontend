import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, RefreshCw, ChevronLeft } from "lucide-react";
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
    const locationState = location.state as { email?: string } | null;
    const emailParam = params.get("email") || locationState?.email;
    if (emailParam) {
      setEmail(emailParam);
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
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
        const verifiedUser = res.data.user;
        login(verifiedUser);
        if (res.data.token) sessionStorage.setItem("authToken", res.data.token);
        
        setTimeout(() => {
          if (verifiedUser.agreedToTerms) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/disclaimer", { replace: true });
          }
        }, 2000);
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || "Verification failed. Please check the code.");
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
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="cyber-grid-overlay"></div>
      
      <motion.div 
        className="auth-card verification-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-info-panel">
          <div className="auth-logo">
            <Shield size={32} color="var(--cyber-primary)" />
            <span>VULN SPECTRA</span>
          </div>
          <div className="verification-visual">
            <Mail size={80} className="floating-icon" />
          </div>
          <h2>Security Check</h2>
          <p>Protecting your infrastructure starts with a verified identity. We've dispatched a code to:</p>
          <div className="target-email-badge">
             {email}
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="form-header">
             <h1>IDENTITY VERIFICATION</h1>
             <p className="auth-subtitle">ENTER THE 6-DIGIT ENCRYPTION KEY</p>
          </div>

          {error && (
            <motion.div className="auth-alert error" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div className="auth-alert success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleVerify} className="otp-form">
            <div className="auth-field">
              <div className="otp-input-container">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="· · · · · ·"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="premium-otp-input"
                  autoFocus
                />
                <div className="otp-input-glitch"></div>
              </div>
              <p className="field-hint">Enter the code from your inbox to proceed</p>
            </div>

            <motion.button
              type="submit"
              className="auth-submit-btn premium-btn"
              disabled={loading || code.length !== 6}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /><span>VERIFYING SYSTEM...</span></>
              ) : (
                <><span>COMPLETE ACTIVATION</span> <ArrowRight size={20} /></>
              )}
            </motion.button>
          </form>

          <div className="auth-footer verification-footer">
            <div className="resend-section">
               <span>Didn't receive the transmission?</span>
               <button 
                 className="resend-link-btn" 
                 onClick={handleResend} 
                 disabled={resending || timer > 0}
               >
                 {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                 {timer > 0 ? `Retry in ${timer}s` : "Resend Protocol"}
               </button>
            </div>
            
            <button onClick={() => navigate("/login")} className="back-to-login-btn">
               <ChevronLeft size={16} />
               Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
