import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/disclaimer.css";

const Disclaimer = () => {
  const navigate = useNavigate();
  const { user, loading, authChecked, acceptTerms, logout } = useAuth();

  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authChecked || loading) return;

    if (user?.agreedToTerms) {
      navigate("/dashboard", { replace: true });
    }
  }, [authChecked, loading, user, navigate]);

  if (loading || !authChecked) return null;

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleAgree = async () => {
    setError("");
    setCheckboxError("");

    if (!checked) {
      setCheckboxError("Please check the agreement box to continue");
      return;
    }

    setIsLoading(true);
    const success = await acceptTerms();

    if (success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("Failed to accept terms. Please try again.");
    }
    setIsLoading(false);
  };

  const handleDisagree = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="disclaimer-container">
      <div className="disclaimer-card">
        <h2>Important Legal Disclaimer</h2>

        {error && <div className="disclaimer-error">{error}</div>}

        <label>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          I agree to the terms
        </label>

        {checkboxError && <p className="checkbox-error">{checkboxError}</p>}

        <button onClick={handleAgree} disabled={isLoading}>
          {isLoading ? "Processing..." : "I Agree & Continue"}
        </button>
        <button onClick={handleDisagree}>I Do Not Agree</button>
      </div>
    </div>
  );
};

export default Disclaimer;
