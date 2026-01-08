/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getScanHistory } from "../../api/scan-api";
import "../../styles/dashboard.css";
import successAnimation from "../../assets/icons/Success.json";
import pendingAnimation from "../../assets/icons/pending.json";
import foundAimation from "../../assets/icons/found.json";
import startAnimation from "../../assets/icons/start.json";
import HistoryAnimation from "../../assets/icons/History.json";
import infoAnimation from "../../assets/icons/info.json";
import profileAnimation from "../../assets/icons/profile.json";
import logoutAnimation from "../../assets/icons/logout.json";
import nmapAnimation from "../../assets/icons/nmap.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import Lottie from "lottie-react";
interface Scan {
  _id: string;
  targetUrl?: string;
  url?: string;
  scanType?: string;
  tool?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  results?: any;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user, loading, authChecked } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState("");
  if (loading || !authChecked) {
    return null;
  }

  if (user && !user.agreedToTerms) {
    navigate("/disclaimer", { replace: true });
    return null;
  }
  useEffect(() => {
    if (user?.agreedToTerms) {
      const load = async () => {
        try {
          const res = await getScanHistory();
          const arr = res.data?.scans || res.data?.history || [];
          setScans(Array.isArray(arr) ? arr : []);
        } catch (e: any) {
          setError(e?.response?.data?.error || "Failed to load stats");
        } finally {
          setDashboardLoading(false);
        }
      };
      load();
    }
  }, [user]);

  const isAdmin = user?.role === "admin";

  const metrics = useMemo(() => {
    const total = scans.length;
    const completed = scans.filter((s) => s.status === "completed").length;
    const pending = scans.filter(
      (s) => s.status === "pending" || s.status === "running"
    ).length;
    const vulnerabilities = scans.reduce((sum, s) => {
      const vulns = (s.results?.vulnerabilities ||
        s.results?.vulns ||
        []) as any[];
      return sum + (Array.isArray(vulns) ? vulns.length : 0);
    }, 0);
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    return { completed, pending, vulnerabilities, successRate };
  }, [scans]);

  const recent = useMemo(() => {
    return [...scans]
      .sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      )
      .slice(0, 5);
  }, [scans]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">
      <div className="nav-strip">
        <span>WebShield • Secure. Scan. Repeat.</span>
        <div className="nav-right">
          <button onClick={() => navigate("/start-scan")}>Start Scan</button>
          <button onClick={() => navigate("/about-tools")}>Tools Info</button>
          {isAdmin && (
            <button
              onClick={() => navigate("/admin-dashboard")}
              style={{
                backgroundColor: "#ff6b6b",
                color: "white",
                border: "none",
              }}
            >
              Admin Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="top-bar">
        <div className="top-left">
          <div className="logo-circle">
            <img
              src="/logo.gif"
              alt="WebShield Logo"
              className="logo-animated"
            />
          </div>

          <div>
            <h2 className="text-color">WebShield Dashboard</h2>
            <p className="welcome-text">
              Welcome back, {user?.username || user?.email || "User"}!
              {isAdmin && " (Administrator)"}
            </p>
          </div>
        </div>

        <div className="top-right">
          <button
            className="pill-btn ghost pill-icon"
            onClick={() => navigate("/profile")}
          >
            <Lottie
              animationData={profileAnimation}
              loop
              className="profile-pill-lottie"
            />
            <span>Profile</span>
          </button>
          <button className="pill-btn danger pill-icon" onClick={handleLogout}>
            <Lottie
              animationData={logoutAnimation}
              loop
              className="logout-pill-lottie"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="banner-error">
          <span> {error}</span>
        </div>
      )}

      <div className="quick-row">
        <button className="quick-card" onClick={() => navigate("/start-scan")}>
          <div className="stat-icon">
            <Lottie
              animationData={startAnimation}
              loop
              className="stat-lottie"
            />
          </div>
          <div className="quick-text">
            <div className="quick-title">Start Scan</div>
            <div className="quick-sub">Launch a new security scan</div>
          </div>
        </button>
        <button
          className="quick-card"
          onClick={() => navigate("/scan-history")}
        >
          <div className="stat-icon">
            <Lottie
              animationData={HistoryAnimation}
              loop
              className="stat-lottie"
            />
          </div>
          <div className="quick-text">
            <div className="quick-title">Scan History</div>
            <div className="quick-sub">Review past scans</div>
          </div>
        </button>
        <button className="quick-card" onClick={() => navigate("/about-tools")}>
          <div className="stat-icon">
            <Lottie
              animationData={infoAnimation}
              loop
              className="stat-lottie"
            />
          </div>
          <div className="quick-text">
            <div className="quick-title">Learn Tools</div>
            <div className="quick-sub">Know what each tool does</div>
          </div>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Lottie
              animationData={successAnimation}
              loop
              className="stat-lottie"
            />
          </div>
          <div className="stat-value">
            {dashboardLoading ? "…" : metrics.completed}
          </div>
          <div className="stat-label">Scans Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Lottie
              animationData={pendingAnimation}
              loop
              className="stat-lottie"
            />
          </div>
          <div className="stat-value">
            {dashboardLoading ? "…" : metrics.pending}
          </div>
          <div className="stat-label">Pending / Running</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Lottie
              animationData={foundAimation}
              loop
              className="stat-lottie"
            />
          </div>
          <div className="stat-value">
            {dashboardLoading ? "…" : metrics.vulnerabilities}
          </div>
          <div className="stat-label">Vulnerabilities Found</div>
        </div>
      </div>

      <h3 className="section-title">Available Security Tools</h3>
      <div className="tools-grid legacy-look">
        {[
          {
            animation: nmapAnimation,
            name: "Nmap",
            desc: "Network discovery & port scanning",
          },
          {
            animation: niktoAnimation,
            name: "Nikto",
            desc: "Web server vulnerability scanner",
          },
          {
            animation: sqlAnimation,
            name: "SQLMap",
            desc: "SQL injection detection",
          },
          { animation: sslAnimation, name: "SSLScan", desc: "SSL/TLS checker" },
        ].map((t) => (
          <div className="tool-card legacy" key={t.name}>
            <div className="tool-header">
              <div className="tool-icon legacy">
                <Lottie
                  animationData={t.animation}
                  loop
                  className="tool-lottie"
                />
              </div>
              <h3 className="tool-title legacy">{t.name}</h3>
            </div>
            <p className="tool-description legacy">{t.desc}</p>
            <button
              className="tool-button legacy"
              onClick={() => navigate("/start-scan")}
            >
              Use {t.name} Scanner
            </button>
          </div>
        ))}
      </div>

      <div className="recent-scans">
        <h3>Recent Scans</h3>
        {recent.length === 0 && !dashboardLoading && (
          <p className="muted">No scans yet.</p>
        )}
        {recent.map((s) => (
          <div className="scan-item" key={s._id}>
            <div>
              <strong>{s.targetUrl ?? s.url ?? "Unknown target"}</strong>
              <p
                style={{
                  color: "#88ccff",
                  fontSize: "0.9rem",
                  marginTop: "5px",
                }}
              >
                {(s.scanType ?? s.tool ?? "").toUpperCase() || "—"} •{" "}
                {s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A"}
              </p>
            </div>
            <div className={`scan-status status-${s.status}`}>
              {s.status === "running" ? "In Progress" : s.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
