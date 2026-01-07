/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
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
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        {message && (
          <div
            className={`message ${
              message.toLowerCase().includes("fail")
                ? "error-message"
                : "success-message"
            }`}
          >
            {message}
          </div>
        )}
        <div className="form-group">
          <input
            type="email"
            placeholder="Your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
