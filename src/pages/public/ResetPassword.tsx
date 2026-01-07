import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/auth-api";
import "../../styles/auth.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Reset link is missing or invalid. Please use the link from your email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token is missing. Please use the link from your email.");
      return;
    }
    if (!password || !confirm) {
      setError("Please fill out both password fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword({ token, newPassword: password });
      if (res.data?.success) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError(res.data?.error || "Failed to reset password. Please try again.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        {error && <div className="auth-message error">{error}</div>}
        {success && <div className="auth-message success">{success}</div>}

       <form onSubmit={handleSubmit} autoComplete="off">
  <div className="auth-field">
    <input
      type="password"
      name="new-password"
      autoComplete="new-password"
      placeholder="New password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      disabled={loading}
    />
  </div>
  <div className="auth-field">
    <input
      type="password"
      name="confirm-new-password"
      autoComplete="new-password"
      placeholder="Confirm new password"
      value={confirm}
      onChange={(e) => setConfirm(e.target.value)}
      disabled={loading}
    />
  </div>
  <button className="auth-button" type="submit" disabled={loading || !token}>
    {loading ? "Resetting..." : "Reset Password"}
  </button>
</form>

      </div>
    </div>
  );
};

export default ResetPassword;