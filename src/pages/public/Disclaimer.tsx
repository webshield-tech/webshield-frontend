import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/disclaimer.css";

const Disclaimer = () => {
  const navigate = useNavigate();
  // 🎯 Import refreshUser from context
  const { logout, user, loading, authChecked, acceptTerms, refreshUser } = useAuth(); 
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user has agreed to terms or is not logged in
  useEffect(() => {
    if (!authChecked || loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.agreedToTerms) {
      navigate("/dashboard", { replace: true });
    }
  }, [authChecked, loading, user, navigate]);

  if (loading || !authChecked) {
    return (
      <div className="disclaimer-container">
        <div className="disclaimer-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAgree = async () => {
    setError("");
    setCheckboxError("");
    if (!checked) {
      setCheckboxError("Please check the agreement box to continue");
      return;
    }
    try {
      setIsLoading(true);
      const success = await acceptTerms();
  
      if (success) {
        await refreshUser();
      
        navigate("/dashboard", { replace: true });
      } else {
        setError("Failed to accept terms. Please try again.");
      }
      setIsLoading(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.response?.data?.error || "Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDisagree = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="disclaimer-container">
      <div className="disclaimer-card">
        <div className="disclaimer-header">
          <div className="warning-icon">⚠️</div>
          <h2>Important Legal Disclaimer</h2>
          <p>Please read this carefully before proceeding</p>
        </div>
        {error && (
          <div className="disclaimer-message disclaimer-error">{error}</div>
        )}
        <div className="disclaimer-content">
          {/* ...disclaimer sections (unchanged)... */}
          <div className="disclaimer-section">
            <h3>Purpose of Tools</h3>
            <p>
              All tools and information provided on WebShield are intended
              strictly for
              <strong> educational and ethical hacking purposes</strong> only.
            </p>
          </div>
          {/* ...rest omitted for brevity... */}
        </div>
        <div className="checkbox-container">
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="agree-checkbox" className="checkbox-label">
              I have read, understood, and agree to the terms above
            </label>
          </div>
          {checkboxError && (
            <div className="checkbox-error">{checkboxError}</div>
          )}
        </div>
        <div className="disclaimer-actions">
          <button
            className="disclaimer-button agree-button"
            onClick={handleAgree}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "I Agree & Continue"}
          </button>
          <button
            className="disclaimer-button disagree-button"
            onClick={handleDisagree}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "I Agree & Continue"}
          </button>
          <button
            className="disclaimer-button disagree-button"
            onClick={handleDisagree}
            disabled={isLoading}
          >
            I Do Not Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;