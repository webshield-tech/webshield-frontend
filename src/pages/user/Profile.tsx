import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Profile as getProfile } from "../../api/auth-api";
import "../../styles/profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);

   useEffect(() => {
    fetchProfile();
  }, [user]); 
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // ✅ FIX ONLY HERE
  const termsAccepted = Boolean(userData?.agreedToTerms);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {userData?.username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-gradient">{userData?.username}</h2>
          <p className="user-email">{userData?.email}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{userData?.userId}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Account Type:</span>
            <span className="info-value role-badge">
              {userData?.role?.toUpperCase()}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Scan Usage:</span>
            <span className="info-value">
              {userData?.usedScan || 0} / {userData?.scanLimit || 10}
              <span className="usage-percentage">
                (
                {userData
                  ? Math.round(
                      (userData.usedScan / userData.scanLimit) * 100
                    )
                  : 0}
                % used)
              </span>
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Member Since:</span>
            <span className="info-value">
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Terms Accepted:</span>
            <span
              className={`info-value ${
                termsAccepted ? "terms-yes" : "terms-no"
              }`}
            >
              {termsAccepted ? "Yes" : "No"}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/scan-history")}
            className="btn-history"
          >
            View Scan History
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
