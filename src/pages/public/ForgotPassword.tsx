/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ChevronLeft, Loader2, ShieldCheck } from "lucide-react";
import { forgotPassword } from "../../api/auth-api";
import "../../styles/auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!email.trim()) {
      setMessage("Please enter your email.");
      return;
    }
    try {
      setLoading(true);
      const res = await forgotPassword(email.trim());
      setMessage(
        res.data?.message ||
          "If the email exists, reset instructions were sent."
      );
    } catch (err: any) {
      const backendError = err?.response?.data?.error;
      setMessage(backendError || "Failed to send reset email. Try again.");
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
            <span>RETURN_TO_LOGIN</span>
          </Link>
          <div className="auth-logo-premium">
            <div className="logo-glow"></div>
            <ShieldCheck size={48} className="logo-icon" />
          </div>
          <h1 className="text-gradient">RECOVERY_PROTOCOL</h1>
          <p>INITIALIZE_PASSWORD_RESET_SEQUENCE</p>
        </header>

        <form className="auth-form-premium glass-panel" onSubmit={handleSubmit}>
          {message && (
            <div className={`auth-alert ${message.toLowerCase().includes("fail") ? "error" : "success"}`}>
              {message}
            </div>
          )}
          
          <div className="auth-input-group">
            <label>EMAIL_ADDRESS</label>
            <div className="input-wrap">
              <Mail size={18} className="i-icon" />
              <input
                type="email"
                placeholder="operator@vulnspectra.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : "REQUEST_RESET_LINK"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

