/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { acceptTerms } from "../../api/auth-api";
import "../../styles/disclaimer.css";

const Disclaimer = () => {
  const navigate = useNavigate();
  const { checkAuth, logout, user, loading, authChecked } = useAuth();

  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Prevent rendering until auth is fully checked
  useEffect(() => {
    if (authChecked && !loading && user) {
      // If user has already accepted terms, redirect immediately
      if (user.agreedToTerms) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [authChecked, loading, user, navigate]);

  // Don't show anything while checking
  if (loading || !authChecked) {
    return null;
  }

  // If user doesn't exist (shouldn't happen with ProtectedRoute, but just in case)
  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  // If user has accepted terms (double check - in case useEffect hasn't run yet)
  if (user.agreedToTerms) {
    return null;
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
      const response = await acceptTerms();

      if (response.data.success) {
        // Update auth state and redirect immediately
        await checkAuth();
        navigate("/dashboard", { replace: true });
      } else {
        setError(
          response.data.error || "Failed to accept terms. Please try again."
        );
        setIsLoading(false);
      }
    } catch (e: any) {
      setError(e.response?.data?.error || "Network error. Please try again.");
      console.error("Error accepting terms:", e);
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
          <div className="disclaimer-section">
            <h3>Purpose of Tools</h3>
            <p>
              All tools and information provided on WebShield are intended
              strictly for
              <strong> educational and ethical hacking purposes</strong> only.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>Authorized Use Only</h3>
            <p>
              Users are prohibited from using tools for illegal or unauthorized
              activity:
            </p>
            <ul>
              <li>Accessing systems without explicit permission</li>
              <li>Data theft or unauthorized access</li>
              <li>Causing damage to systems or networks</li>
              <li>Engaging in any form of cybercrime</li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h3>No Liability</h3>
            <p>
              We disclaim liability for harm resulting from misuse. Software is
              provided "as is" without warranty, to the extent permitted by law.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>User Responsibility</h3>
            <p>
              You are solely responsible for following all applicable laws and
              ensuring proper authorization before testing any system or
              network.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>Security Risks</h3>
            <p>
              Some tools may be flagged by antivirus. Test in a controlled
              environment and use responsibly.
            </p>
          </div>
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
            I Do Not Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
