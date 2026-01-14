import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../api/auth-api.ts";
import {
  validateUsername,
  validateEmail,
  validatePassword,
} from "../../utils/validators";
import "../../styles/auth.css";

function Signup() {
  const navigate = useNavigate();

  // States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Error states for each field
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  // Password strength details
  const [passwordDetails, setPasswordDetails] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Real-time validation effects
  useEffect(() => {
    if (username) {
      const validation = validateUsername(username);
      setUsernameError(validation.message);
    } else {
      setUsernameError("");
    }
  }, [username]);

  useEffect(() => {
    if (email) {
      const validation = validateEmail(email);
      setEmailError(validation.message);
    } else {
      setEmailError("");
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordError(validation.message);
      setPasswordDetails(validation.details);
    } else {
      setPasswordError("");
      setPasswordDetails({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    } else {
      setConfirmPasswordError("");
    }
  }, [confirmPassword, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate all fields
    const usernameValidation = validateUsername(username);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!usernameValidation.isValid) {
      setUsernameError(usernameValidation.message);
      return;
    }

    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }

    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

  const response = await signupUser({
  username,
  email,
  password,
});

if (response.data.success) {
  setFormError("Account created successfully.");
  const token = response.data.token;
  if (token) {
    localStorage.setItem("authToken", token);
    // Auto login after signup
    setTimeout(() => navigate("/disclaimer"), 1000);
  } else {
    setFormError("Account created but login failed. Please login manually.");
    setTimeout(() => navigate("/login"), 2000);
  }

}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const backendError = error?.response?.data?.error || "";

      if (
        backendError.includes("username") ||
        backendError.includes("Username")
      ) {
        setUsernameError("Username already exists. Please choose another.");
      } else if (
        backendError.includes("email") ||
        backendError.includes("Email")
      ) {
        setEmailError("Email already registered. Please login instead.");
      } else {
        setFormError(backendError || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        {/* Form-level error */}
        {formError && (
          <div
            className={`message ${
              formError.includes("✅") ? "success-message" : "error-message"
            }`}
          >
            {formError}
          </div>
        )}

        {/* Username field */}
        <div className="form-group">
          <input
            type="text"
            placeholder="Username (min. 3 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={usernameError ? "input-error" : ""}
          />
          {usernameError && <div className="field-error">{usernameError}</div>}
        </div>

        {/* Email field */}
        <div className="form-group">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "input-error" : ""}
          />
          {emailError && <div className="field-error">{emailError}</div>}
        </div>

        {/* Password field */}
        <div className="form-group">
          <input
            type="password"
            placeholder="Password (8+ chars, 1 uppercase, 1 number, 1 special)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? "input-error" : ""}
          />
          {passwordError && <div className="field-error">{passwordError}</div>}

          {/* Password strength indicator */}
          {password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className={`strength-fill ${
                    Object.values(passwordDetails).filter(Boolean).length >= 4
                      ? "strong"
                      : Object.values(passwordDetails).filter(Boolean).length >=
                        2
                      ? "medium"
                      : "weak"
                  }`}
                ></div>
              </div>

              <div className="password-rules">
                <ul>
                  <li className={passwordDetails.length ? "valid" : "invalid"}>
                    {passwordDetails.length ? "✓" : "✗"} At least 8 characters
                  </li>
                  <li
                    className={passwordDetails.uppercase ? "valid" : "invalid"}
                  >
                    {passwordDetails.uppercase ? "✓" : "✗"} 1 uppercase letter
                  </li>
                  <li
                    className={passwordDetails.lowercase ? "valid" : "invalid"}
                  >
                    {passwordDetails.lowercase ? "✓" : "✗"} 1 lowercase letter
                  </li>
                  <li className={passwordDetails.number ? "valid" : "invalid"}>
                    {passwordDetails.number ? "✓" : "✗"} 1 number
                  </li>
                  <li className={passwordDetails.special ? "valid" : "invalid"}>
                    {passwordDetails.special ? "✓" : "✗"} 1 special character
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={confirmPasswordError ? "input-error" : ""}
          />
          {confirmPasswordError && (
            <div className="field-error">{confirmPasswordError}</div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="auth-footer">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;
