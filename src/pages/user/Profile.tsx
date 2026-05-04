import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Clock, 
  LogOut, 
  ChevronLeft, 
  Activity,
  Calendar,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";
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
      console.warn("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page-premium loading">
        <div className="cyber-loader"></div>
        <p>Retrieving user profile…</p>
      </div>
    );
  }

  const termsAccepted = Boolean(userData?.agreedToTerms);
  const usedScans = userData?.usedScan || 0;
  const scanLimit = userData?.scanLimit || 10;
  const usagePercent = Math.round((usedScans / scanLimit) * 100);

  return (
    <div className="profile-container-v2">
      <div className="profile-header">
        <Link to="/dashboard" className="back-btn">
          <ChevronLeft size={20} />
          <span>Dashboard</span>
        </Link>
        <h1>User Profile</h1>
      </div>

      <div className="profile-grid-v2">
        {/* Profile Info Card */}
        <div className="profile-card identity glass-panel">
          <div className="card-header">
            <User size={20} className="text-primary" />
            <h3>Identity Core</h3>
          </div>
          
          <div className="user-hero-section">
            <div className="large-avatar">
              {userData?.username?.charAt(0).toUpperCase() || "O"}
            </div>
            <div className="hero-info">
              <h2>{userData?.username || "Operator"}</h2>
              <div className="role-tag">{userData?.role || "user"}</div>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <Mail size={16} />
              <div className="info-details">
                <label>Email Address</label>
                <span>{userData?.email || "N/A"}</span>
              </div>
            </div>
            <div className="info-item">
              <Key size={16} />
              <div className="info-details">
                <label>Operator ID</label>
                <span>{userData?._id?.slice(-12).toUpperCase() || "N/A"}</span>
              </div>
            </div>
            <div className="info-item">
              <Calendar size={16} />
              <div className="info-details">
                <label>Account Created</label>
                <span>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Card */}
        <div className="profile-card usage glass-panel">
          <div className="card-header">
            <Activity size={20} className="text-gold" />
            <h3>System Usage</h3>
          </div>
          
          <div className="usage-stats-container">
            <div className="usage-circle-wrap">
              <div className="usage-circle">
                <span className="usage-num">{usagePercent}%</span>
                <span className="usage-label">Used</span>
              </div>
            </div>
            <div className="usage-details-list">
              <div className="usage-row">
                <span>Scans Executed</span>
                <strong>{usedScans}</strong>
              </div>
              <div className="usage-row">
                <span>Monthly Limit</span>
                <strong>{scanLimit}</strong>
              </div>
              <div className="usage-row">
                <span>Remaining Quota</span>
                <strong>{scanLimit - usedScans}</strong>
              </div>
            </div>
          </div>
          
          <div className="usage-progress-bar-v2">
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${usagePercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Security Protocols Card */}
        <div className="profile-card security glass-panel">
          <div className="card-header">
            <Shield size={20} className="text-accent" />
            <h3>Security Protocols</h3>
          </div>
          
          <div className="protocol-list">
            <div className="protocol-item">
              <div className={`status-icon ${termsAccepted ? 'active' : 'pending'}`}>
                {termsAccepted ? <Unlock size={18} /> : <Lock size={18} />}
              </div>
              <div className="protocol-info">
                <h4>Ethical Usage Agreement</h4>
                <p>{termsAccepted ? "Verified & Accepted" : "Pending Acceptance"}</p>
              </div>
            </div>
            
            <div className="protocol-item">
              <div className="status-icon active">
                <Shield size={18} />
              </div>
              <div className="protocol-info">
                <h4>Two-Factor Authentication</h4>
                <p>Standard Security Layer Active</p>
              </div>
            </div>

            <div className="protocol-item">
              <div className="status-icon active">
                <AlertCircle size={18} />
              </div>
              <div className="protocol-info">
                <h4>Session Encryption</h4>
                <p>AES-256 Bit Tunneling Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <button className="btn-secondary" onClick={() => navigate("/scan-history")}>
          <Clock size={18} />
          <span>Operation History</span>
        </button>
        <button className="btn-danger" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
