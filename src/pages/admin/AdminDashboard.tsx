/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, Shield, Activity, Clock } from "lucide-react";
import api from "../../api/axios";
import "../../styles/admin.css";

type RecentUser = { username: string; email?: string; createdAt?: string; isBlocked?: boolean; lastIp?: string };
type RecentScan = {
  targetUrl?: string;
  scanType?: string;
  status?: string;
  createdAt?: string;
  userId?: any;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalScans, setTotalScans] = useState<number | null>(null);
  const [activeScans, setActiveScans] = useState<number | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/admin/stats");
        const data = res.data;
        if (!data || data.success === false) {
          throw new Error(data?.error || `Unexpected response (${res.status})`);
        }
        setTotalUsers(typeof data.totalUsers === "number" ? data.totalUsers : null);
        setTotalScans(typeof data.totalScans === "number" ? data.totalScans : null);
        setActiveScans(typeof data.activeScans === "number" ? data.activeScans : null);
        setRecentUsers(Array.isArray(data.recentUsers) ? data.recentUsers.slice(0, 8) : []);
        setRecentScans(Array.isArray(data.recentScans) ? data.recentScans.slice(0, 12) : []);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : "";

  return (
    <div className="admin-page-v2">
      <div className="admin-content-wrap">
        <header className="admin-header-v2">
          <div className="header-info">
            <h1>Admin Overwatch</h1>
            <p>System-wide monitoring and operator management</p>
          </div>
          <nav className="admin-sub-nav">
            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Overview</Link>
            <Link to="/admin/scans" className="nav-link">Scans</Link>
            <Link to="/admin/users" className="nav-link">Users</Link>
          </nav>
        </header>

        {loading ? (
          <div className="admin-loading">
            <div className="cyber-loader"></div>
            <span>Synchronizing stats…</span>
          </div>
        ) : error ? (
            <div className="admin-grid-layout">
              <div className="admin-section">
                <h2 className="admin-section-title">Active Operations</h2>
                {recentScans && recentScans.slice(0, 8).map((scan, idx) => (
                  <div key={idx} className="log-entry">
                    <span className="log-time">{formatDate(scan.createdAt)?.split(',')[1]?.trim() || "—"}</span>
                    <span className={`log-status ${scan.status}`}>{scan.status}</span>
                    <span className="log-target">{scan.targetUrl || "—"}</span>
                    <span className="log-user">{scan.userId?.username || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="admin-section">
                <h2 className="admin-section-title">User Activity & IP Tracking</h2>
                {recentUsers && recentUsers.slice(0, 8).map((user, idx) => (
                  <div key={idx} className="user-ip-entry">
                    <div className="user-info">
                      <span className="user-name">{user.username}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="user-ip">
                      <span className="ip-label">IP:</span>
                      <span className={`ip-value ${user.isBlocked ? 'blocked' : ''}`}>{user.lastIp || "Unknown"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        ) : (
          <>
            <div className="admin-stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-icon"><Users size={20} /></div>
                <div className="val">{totalUsers ?? "—"}</div>
                <div className="lab">Total Operators</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon"><Activity size={20} /></div>
                <div className="val">{totalScans ?? "—"}</div>
                <div className="lab">Operational Scans</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon"><Clock size={20} /></div>
                <div className="val">{activeScans ?? "—"}</div>
                <div className="lab">Active Threads</div>
              </div>
            </div>

            <div className="admin-grid-layout">
              <section className="admin-panel-card glass-panel">
                <div className="panel-head">
                  <Users size={18} />
                  <h3>Recent Registrations</h3>
                </div>
                <div className="admin-list">
                  {recentUsers.length === 0 ? <p className="empty">No recent users</p> : 
                    recentUsers.map((u, i) => (
                      <div key={i} className="admin-list-item">
                        <div className="item-info">
                          <span className="title">{u.username}</span>
                          <span className="meta">{u.email || "No email provided"}</span>
                        </div>
                        <div className="item-side">
                          <span className="time">{formatDate(u.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </section>

              <section className="admin-panel-card glass-panel">
                <div className="panel-head">
                  <Shield size={18} />
                  <h3>Recent Operations</h3>
                </div>
                <div className="admin-list">
                  {recentScans.length === 0 ? <p className="empty">No recent scans</p> : 
                    recentScans.map((s, i) => (
                      <div key={i} className="admin-list-item">
                        <div className="item-info">
                          <span className="title">{s.targetUrl || "Unknown Target"}</span>
                          <span className="meta">{(s.scanType || "unknown").toUpperCase()}</span>
                        </div>
                        <div className="item-side">
                          <span className={`status-badge ${s.status}`}>{s.status}</span>
                          <span className="time">{formatDate(s.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
