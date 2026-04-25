/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Play, 
  ArrowUpRight,
  Info,
  CheckCircle2,
  Globe,
  MessageSquare,
  Github,
  Linkedin,
  Mail
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getScanHistory } from "../../api/scan-api";
import "../../styles/dashboard.css";
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
  const { user, loading, authChecked } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authChecked || loading || !user?.agreedToTerms) return;

    const load = async () => {
      try {
        const res = await getScanHistory();
        const arr = res.data?.scans || res.data?.history || [];
        setScans(Array.isArray(arr) ? arr : []);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load dashboard data");
      } finally {
        setDashboardLoading(false);
      }
    };

    load();
  }, [authChecked, loading, user]);

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
    return { total, completed, pending, vulnerabilities, successRate };
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

  return (
    <div className="dashboard-v2">
      <div className="dashboard-header-section">
        <div className="welcome-text">
          <h1>Welcome, <span className="highlight">{user?.username || "Operator"}</span></h1>
          <p>System status is nominal. Security protocols active.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="initialize-btn" onClick={() => navigate("/about-tools")}>
            <Info size={20} />
            <span>About Tools</span>
          </button>
          <button className="initialize-btn" onClick={() => navigate("/start-scan")}>
            <Play size={20} fill="currentColor" />
            <span>Launch New Scan</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-alert error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <section className="metrics-grid">
        <div className="metric-card total">
          <div className="metric-icon">
            <Activity size={24} />
          </div>
          <div className="metric-info">
            <label>Total Scans</label>
            <h3>{dashboardLoading ? "..." : metrics.total}</h3>
          </div>
          <div className="metric-trend success">+12%</div>
        </div>

        <div className="metric-card pending">
          <div className="metric-icon">
            <Clock size={24} />
          </div>
          <div className="metric-info">
            <label>Active Tasks</label>
            <h3>{dashboardLoading ? "..." : metrics.pending}</h3>
          </div>
          <div className="metric-sub">Queue depth: {metrics.pending}</div>
        </div>

        <div className="metric-card security">
          <div className="metric-icon">
            <Shield size={24} />
          </div>
          <div className="metric-info">
            <label>Vulnerabilities</label>
            <h3 className={metrics.vulnerabilities > 0 ? "text-error" : ""}>
              {dashboardLoading ? "..." : metrics.vulnerabilities}
            </h3>
          </div>
          <div className="metric-trend danger">Alert High</div>
        </div>

        <div className="metric-card success-rate">
          <div className="metric-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-info">
            <label>Success Rate</label>
            <h3>{dashboardLoading ? "..." : `${metrics.successRate}%`}</h3>
          </div>
          <div className="progress-mini">
            <div className="progress-fill" style={{ width: `${metrics.successRate}%` }}></div>
          </div>
        </div>
      </section>

      <div className="main-grid">
        {/* Tools Section */}
        <section className="tools-section glass-panel">
          <div className="section-header">
            <h3>Security Tools</h3>
            <Link to="/about-tools" className="view-all">Details <ArrowUpRight size={14} /></Link>
          </div>
          <div className="tools-grid-v2">
            {[
              { name: "Nmap", animation: nmapAnimation, val: "nmap", desc: "Network Mapper", color: "cyan" },
              { name: "Nikto", animation: niktoAnimation, val: "nikto", desc: "Web Scanner", color: "magenta" },
              { name: "SQLMap", animation: sqlAnimation, val: "sqlmap", desc: "DB Injection", color: "gold" },
              { name: "SSLScan", animation: sslAnimation, val: "sslscan", desc: "TLS Auditor", color: "green" }
            ].map(t => (
              <div key={t.name} className={`tool-card-v2 ${t.color}`} onClick={() => navigate(`/start-scan?tool=${t.val}`)}>
                <div className="tool-animation">
                  <Lottie animationData={t.animation} loop={true} />
                </div>
                <div className="tool-info">
                  <h4>{t.name}</h4>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="activity-section glass-panel">
          <div className="section-header">
            <h3>Recent Operations</h3>
            <Link to="/scan-history" className="view-all">Full History <ArrowUpRight size={14} /></Link>
          </div>
          <div className="activity-list">
            {recent.length === 0 && !dashboardLoading && (
              <div className="empty-activity">
                <Shield size={40} opacity={0.1} />
                <p>No recent scans detected</p>
              </div>
            )}
            {recent.map((s) => (
              <div
                className="activity-item"
                key={s._id}
                onClick={() =>
                  navigate(
                    s.status === "running" || s.status === "pending"
                      ? `/scan-progress/${s._id}`
                      : `/scan-result/${s._id}`
                  )
                }
              >
                <div className="activity-target">
                  <span className="target-host">{s.targetUrl ?? s.url ?? "Unknown"}</span>
                  <div className="target-meta">
                    <span className="tool-tag">{(s.scanType ?? s.tool ?? "").toUpperCase()}</span>
                    <span className="dot">•</span>
                    <span className="time-ago">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>
                <div className={`status-pill ${s.status}`}>
                  {s.status}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FSociety PK Branding Section */}
      <section className="fsociety-section glass-panel" style={{ marginTop: "40px", padding: "32px" }}>
        <div className="section-header" style={{ marginBottom: "24px" }}>
          <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.4rem", color: "var(--cyber-primary)", letterSpacing: "2px" }}>ABOUT FSOCIETY PK</h3>
          <p style={{ color: "var(--cyber-text-dim)", marginTop: "8px", fontSize: "0.95rem" }}>Cybersecurity CTF Team & Platform Developers</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <a href="https://fsocietypk.tech" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "4px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
            <Globe size={24} color="var(--cyber-primary)" />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>Website</span>
          </a>
          <a href="https://discord.com/invite/YYpFYBzH" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "4px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
            <MessageSquare size={24} color="#5865F2" />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>Discord</span>
          </a>
          <a href="https://github.com/orgs/fsociety-pk" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "4px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
            <Github size={24} color="#fff" />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>GitHub</span>
          </a>
          <a href="https://www.linkedin.com/company/fsociety-pk/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "4px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
            <Linkedin size={24} color="#0077b5" />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>LinkedIn</span>
          </a>
          <a href="mailto:pkfsociety@gmail.com" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "4px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
            <Mail size={24} color="var(--cyber-accent)" />
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>Email Us</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
