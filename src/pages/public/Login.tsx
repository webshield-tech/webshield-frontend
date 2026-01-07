/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../../api/auth-api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const { checkAuth, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setFormError("");

    try {
      setLoading(true);
      const response = await LoginUser({ email, password });

      if (response.data.success) {
        setFormError("Login successful");

        const roleFromResponse =
          response.data.user?.role || response.data?.role || null;

        await checkAuth();
        const finalRole = roleFromResponse || user?.role;

        setTimeout(() => {
          if (finalRole === "admin") {
            navigate("/admin", { replace: true });
            return;
          }

          if (response.data.user?.agreedToTerms || user?.agreedToTerms) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/disclaimer", { replace: true });
          }
        }, 400);
      }
    } catch (error: any) {
      const backendError = error?.response?.data?.error || "";
      if (
        backendError.toLowerCase().includes("not found") ||
        backendError.toLowerCase().includes("no user") ||
        backendError.toLowerCase().includes("email not registered")
      ) {
        setEmailError("This email is not registered. Please sign up first.");
      } else if (
        backendError.toLowerCase().includes("invalid") ||
        backendError.toLowerCase().includes("incorrect") ||
        backendError.toLowerCase().includes("wrong password")
      ) {
        setPasswordError("Incorrect password. Please try again.");
      } else if (
        backendError.toLowerCase().includes("rate") ||
        backendError.toLowerCase().includes("limit") ||
        backendError.toLowerCase().includes("too many")
      ) {
        setFormError("Too many login attempts. Please wait 5 minutes.");
      } else {
        setFormError(backendError || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {formError && (
          <div
            className={`message ${
              formError.includes("✅") ||
              formError.toLowerCase().includes("success")
                ? "success-message"
                : "error-message"
            }`}
          >
            {formError}
          </div>
        )}

        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "input-error" : ""}
            disabled={loading}
          />
          {emailError && <div className="field-error">{emailError}</div>}
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? "input-error" : ""}
            disabled={loading}
          />
          {passwordError && <div className="field-error">{passwordError}</div>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </button>

        <div className="auth-footer">
          <div style={{ marginBottom: "10px" }}>
            <a href="/forgot-password" style={{ fontSize: "0.9rem" }}>
              Forgot Password?
            </a>
          </div>
          New here? <a href="/signup">Create account</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
