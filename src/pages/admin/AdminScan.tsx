/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Trash2, Clock, User, ExternalLink, ChevronLeft, Search } from "lucide-react";
import { adminGetAllScans, adminDeleteScan } from "../../api/admin-api";
import "../../styles/admin.css";

type Scan = {
  _id: string;
  targetUrl?: string;
  scanType?: string;
  status?: string;
  createdAt?: string;
  userId?: any;
};

export default function AdminScans() {
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminGetAllScans();
        const data = res.data;
        if (!data || data.success === false) {
          throw new Error(data?.error || "Failed to load scans");
        }
        setScans(Array.isArray(data.scans) ? data.scans : []);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || "Failed to load scans");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this scan entry? This action cannot be undone.")) return;
    try {
      setDeleting(id);
      await adminDeleteScan(id);
      setScans((s) => s.filter((x) => x._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.error || "Deletion protocol failure.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : "";

  return (
    <div className="admin-page-v2">
      <div className="admin-content-wrap">
        <header className="admin-header-v2">
          <div className="header-info">
            <h1>Scan Repository</h1>
            <p>Global registry of all operational security scans</p>
          </div>
          <nav className="admin-sub-nav">
            <Link to="/admin" className="nav-link">Overview</Link>
            <Link to="/admin/scans" className={`nav-link ${location.pathname === '/admin/scans' ? 'active' : ''}`}>Scans</Link>
            <Link to="/admin/users" className="nav-link">Users</Link>
          </nav>
        </header>

        {loading ? (
          <div className="admin-loading">
            <div className="cyber-loader"></div>
            <span>Querying global database…</span>
          </div>
        ) : error ? (
          <div className="alert-box error">{error}</div>
        ) : (
          <div className="admin-panel-card glass-panel full-width">
            <div className="panel-head">
              <Shield size={18} />
              <h3>Global Operation Logs</h3>
            </div>
            <div className="admin-list">
              {scans.length === 0 ? (
                <div className="empty-state-mini">
                  <p>No scans found in the system registry</p>
                </div>
              ) : (
                scans.map((s) => (
                  <div key={s._id} className="admin-list-item">
                    <div className="item-info">
                      <div className="target-row">
                        <span className="title">{s.targetUrl || "Unknown Target"}</span>
                        <a href={s.targetUrl} target="_blank" rel="noreferrer" className="link-icon"><ExternalLink size={14} /></a>
                      </div>
                      <div className="meta-row">
                        <span className="tool-tag">{(s.scanType || "unknown").toUpperCase()}</span>
                        <span className="dot">•</span>
                        <span className="meta"><User size={12} /> {s.userId?.username || "Unknown Operator"}</span>
                      </div>
                    </div>
                    <div className="item-side actions">
                      <div className={`status-badge ${s.status}`}>{s.status}</div>
                      <span className="time">{formatDate(s.createdAt)}</span>
                      <button 
                        className="admin-action-btn danger" 
                        onClick={() => handleDelete(s._id)}
                        disabled={deleting === s._id}
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
