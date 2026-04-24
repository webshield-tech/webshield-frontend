/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    navigate("/login", { replace: true });
    return null;
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
          <p>Please read and accept the terms before continuing</p>
        </header>

        {error && (
          <div className="protocol-alert error">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="protocol-container glass-panel">
          <div className="protocol-scroll-area">
            <section className="protocol-section">
              <div className="section-title">
                <FileText size={16} />
                <span>Section 1 — Purpose</span>
              </div>
              <p>
                All tools and intelligence provided within Vuln Spectra are designed exclusively for
                <strong> educational and ethical security assessment</strong> purposes. Any use outside this
                scope constitutes a violation of the operator agreement and may result in account termination.
              </p>
            </section>

            <section className="protocol-section">
              <div className="section-title">
                <Lock size={16} />
                <span>Section 2 — Prohibited Actions</span>
              </div>
              <div className="conduct-grid">
                <div className="conduct-item"><span>[✗]</span> Unauthorized data exfiltration</div>
                <div className="conduct-item"><span>[✗]</span> Network disruption attacks (DDoS, etc.)</div>
                <div className="conduct-item"><span>[✗]</span> Unauthorized system infiltration</div>
                <div className="conduct-item"><span>[✗]</span> Scanning systems you don't own or have permission to test</div>
              </div>
            </section>

            <section className="protocol-section">
              <div className="section-title">
                <AlertTriangle size={16} />
                <span>Section 3 — Liability</span>
              </div>
              <p>
                Vuln Spectra and its developers assume <strong>no liability</strong> for actions taken by
                operators. All tools are provided "as-is" with no guarantee of stability or outcome.
                You assume 100% legal responsibility for how you use this platform.
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
              <span>I have read and agree to all terms and conditions above</span>
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
