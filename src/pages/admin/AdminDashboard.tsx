/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "../../styles/admin-dashboard.css";

type RecentUser = { username: string; email?: string; createdAt?: string };
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

        setTotalUsers(
          typeof data.totalUsers === "number" ? data.totalUsers : null
        );
        setTotalScans(
          typeof data.totalScans === "number" ? data.totalScans : null
        );
        setActiveScans(
          typeof data.activeScans === "number" ? data.activeScans : null
        );
        setRecentUsers(
          Array.isArray(data.recentUsers) ? data.recentUsers.slice(0, 8) : []
        );
        setRecentScans(
          Array.isArray(data.recentScans) ? data.recentScans.slice(0, 12) : []
        );
      } catch (err: any) {
        console.error("Admin stats error:", err);
        const serverMsg = err?.response?.data?.error || err?.message;
        setError(serverMsg || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "";

  return (
    <div className="admin-simple">
      <div className="admin-simple-header">
        <h1>Admin — Overview</h1>
        <p className="muted">Quick view of users and recent scans</p>

        {/* Admin action links */}
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <Link to="/admin/scans" className="admin-action-btn">
            Manage Scans
          </Link>
          <Link to="/admin/users" className="admin-action-btn">
            Manage Users
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading admin stats…</div>
      ) : error ? (
        <div className="admin-error">Error: {error}</div>
      ) : (
        <>
          <div className="admin-metrics-row">
            <div className="metric-card">
              <div className="metric-value">{totalUsers ?? "—"}</div>
              <div className="metric-label">Users</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{totalScans ?? "—"}</div>
              <div className="metric-label">Scans</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{activeScans ?? "—"}</div>
              <div className="metric-label">Active</div>
            </div>
          </div>

          <div className="admin-lists">
            <section className="list-card">
              <h3>Recent users</h3>
              {recentUsers.length === 0 ? (
                <div className="muted">No recent users</div>
              ) : (
                <ul className="list-items">
                  {recentUsers.map((u, i) => (
                    <li key={i} className="list-item">
                      <div className="item-main">
                        <span className="item-title">{u.username}</span>
                        <span className="item-meta">{u.email ?? "—"}</span>
                      </div>
                      <div className="item-time">{formatDate(u.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="list-card">
              <h3>Recent scans</h3>
              {recentScans.length === 0 ? (
                <div className="muted">No recent scans</div>
              ) : (
                <ul className="list-items">
                  {recentScans.map((s, i) => (
                    <li key={i} className="list-item">
                      <div className="item-main">
                        <a
                          className="item-title link"
                          href={s.targetUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.targetUrl ?? "Unknown"}
                        </a>
                        <span className="item-meta">
                          {" "}
                          — {s.scanType ?? "—"}
                        </span>
                      </div>
                      <div className="item-extra">
                        <span className={`scan-status ${s.status || ""}`}>
                          {s.status ?? "—"}
                        </span>
                        <div className="item-time">
                          {formatDate(s.createdAt)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
