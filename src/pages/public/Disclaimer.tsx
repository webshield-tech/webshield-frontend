/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FileText, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../../styles/disclaimer.css";

const Disclaimer = () => {
  const navigate = useNavigate();
  const { checkAuth, logout, user, loading, authChecked, acceptTerms } = useAuth();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authChecked || loading) return;
    if (user?.agreedToTerms) {
      navigate("/dashboard", { replace: true });
    }
  }, [authChecked, loading, user?.agreedToTerms, navigate]);

  if (loading || !authChecked) {
    return (
      <div className="disclaimer-page-premium loading">
        <div className="cyber-loader"></div>
        <p>Verifying your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleAgree = async () => {
    setError("");
    setCheckboxError("");
    if (!checked) {
      setCheckboxError("You must acknowledge the terms to proceed.");
      return;
    }
    try {
      setIsLoading(true);
      const success = await acceptTerms();
      if (success) {
        await checkAuth();
        navigate("/dashboard", { replace: true });
      } else {
        setError("Could not record your agreement. Please try again.");
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || "Connection error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisagree = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="disclaimer-page-premium">
      <div className="noise-overlay"></div>

      <div className="disclaimer-content-wrap">
        <header className="disclaimer-header-premium">
          <div className="header-icon-wrap">
            <ShieldAlert size={48} className="text-accent" />
            <div className="pulse-ring"></div>
          </div>
          <h1 className="text-gradient">Ethical Use Agreement</h1>
          <p>Read once, accept once, and continue to the dashboard</p>
        </header>

        {error && (
          <div className="protocol-alert error">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="protocol-container glass-panel">
          <div className="protocol-grid">
            <section className="protocol-section">
              <div className="section-title">
                <FileText size={16} />
                <span>Purpose</span>
              </div>
              <p>
                Vuln Spectra is for <strong>authorized, educational security testing only</strong>. Use it to
                evaluate systems you own or are explicitly permitted to test.
              </p>
            </section>

            <section className="protocol-section">
              <div className="section-title">
                <Lock size={16} />
                <span>Not Allowed</span>
              </div>
              <div className="conduct-grid">
                <div className="conduct-item"><span>[✗]</span> Unauthorized data access</div>
                <div className="conduct-item"><span>[✗]</span> Disruption, DDoS, or sabotage</div>
                <div className="conduct-item"><span>[✗]</span> Attacking systems without permission</div>
                <div className="conduct-item"><span>[✗]</span> Testing public targets like production services you do not own</div>
              </div>
            </section>

            <section className="protocol-section protocol-wide">
              <div className="section-title">
                <AlertTriangle size={16} />
                <span>Responsibility</span>
              </div>
              <p>
                The platform is provided as-is. You are fully responsible for how you use it, and you must
                follow all applicable laws and internal policies.
              </p>
            </section>
          </div>

          <div className="protocol-acceptance">
            <label className={`checkbox-wrap ${checked ? "active" : ""}`}>
              <div className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => { setChecked(e.target.checked); setCheckboxError(""); }}
                  disabled={isLoading}
                />
                {checked && <CheckCircle2 size={16} />}
              </div>
              <span>I have read and agree to the ethical use terms above</span>
            </label>
            {checkboxError && <p className="error-hint">{checkboxError}</p>}
          </div>
        </div>

        <footer className="disclaimer-footer">
          <button className="disagree-btn" onClick={handleDisagree} disabled={isLoading}>
            <span>Decline & Sign Out</span>
          </button>
          <button className="agree-btn" onClick={handleAgree} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            <span>{isLoading ? "Saving…" : "Accept & Continue"}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Disclaimer;
