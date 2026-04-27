/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, History, Edit3, Shield, Clock, ExternalLink, AlertCircle } from "lucide-react";
import {
  adminGetStats,
  adminGetUserHistory,
  adminUpdateUserLimit,
  adminToggleUserBlock
} from "../../api/admin-api";
import { useToast, ToastContainer } from "../../components/Toast";
import { addNotification } from "../../utils/notifications";
import "../../styles/admin.css";

type RecentUser = {
  userId?: string;
  _id?: string;
  username: string;
  email?: string;
  createdAt?: string;
  isBlocked?: boolean;
};
type Scan = {
  _id: string;
  targetUrl?: string;
  scanType?: string;
  status?: string;
  createdAt?: string;
};

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserScans, setSelectedUserScans] = useState<Scan[] | null>(null);
  const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null);
  const [updating, setUpdating] = useState(false);
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminGetStats();
        const data = res.data;
        if (!data || data.success === false) {
          throw new Error(data?.error || "Failed to load users");
        }
        setUsers(Array.isArray(data.recentUsers) ? data.recentUsers : []);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const viewHistory = async (user: RecentUser) => {
    setSelectedUserScans(null);
    setSelectedUser(user);
    try {
      const id = user._id || (user as any).userId;
      const res = await adminGetUserHistory(id);
      const data = res.data;
      if (!data || data.success === false) {
        throw new Error(data?.error || "Failed to load user history");
      }
      setSelectedUserScans(Array.isArray(data.scans) ? data.scans : []);
    } catch (err: any) {
      addToast("error", "History Unavailable", err?.response?.data?.error || "Failed to retrieve history logs.", 5000);
    }
  };

  const handleUpdateLimit = async (user: RecentUser) => {
    const id = user._id || (user as any).userId;
    const input = window.prompt(`Set new scan quota for ${user.username}:`, "10");
    if (!input) return;
    const val = Number(input);
    if (Number.isNaN(val) || val < 0) {
      addToast("warning", "Invalid Quota", "Please enter a non-negative number.", 4000);
      return;
    }
    try {
      setUpdating(true);
      const res = await adminUpdateUserLimit(id, val);
      if (res.data?.success) {
        addNotification({
          type: "info",
          title: "Scan limit updated",
          message: `${user.username}'s daily scan limit is now ${val} scans per day.`,
        });
        addToast(
          "success",
          "Quota Updated",
          `${user.username} can now run ${val} scans per day.`,
          5000
        );
      } else {
        throw new Error(res.data?.error || "Update failed");
      }
    } catch (err: any) {
      addToast("error", "Update Failed", err?.response?.data?.error || "Failed to modify quota.", 5000);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleBlock = async (user: RecentUser) => {
    const id = user._id || (user as any).userId;
    const action = user.isBlocked ? "unblock" : "block";
    const confirm = window.confirm(`Are you sure you want to ${action} operator ${user.username}?`);
    if (!confirm) return;
    
    try {
      setUpdating(true);
      const res = await adminToggleUserBlock(id);
      if (res.data?.success) {
        setUsers(users.map(u => {
          const uid = u._id || (u as any).userId;
          if (uid === id) {
            return { ...u, isBlocked: !u.isBlocked };
          }
          return u;
        }));
        addToast("success", "Operator Updated", `Operator ${action}ed successfully.`, 4000);
      } else {
        throw new Error(res.data?.error || "Failed to toggle block status");
      }
    } catch (err: any) {
      addToast("error", "Action Failed", err?.response?.data?.error || "Action failed.", 5000);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString() : "";

  return (
    <div className="admin-page-v2">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="admin-content-wrap">
        <header className="admin-header-v2">
          <div className="header-info">
            <h1>Operator Registry</h1>
            <p>Managing system access and scan quotas</p>
          </div>
          <nav className="admin-sub-nav">
            <Link to="/admin" className="nav-link">Overview</Link>
            <Link to="/admin/scans" className="nav-link">Scans</Link>
            <Link to="/admin/users" className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}>Users</Link>
          </nav>
        </header>

        {loading ? (
          <div className="admin-loading">
            <div className="cyber-loader"></div>
            <span>Fetching user nodes…</span>
          </div>
        ) : error ? (
          <div className="alert-box error">{error}</div>
        ) : (
          <div className="admin-grid-layout">
            <section className="admin-panel-card glass-panel">
              <div className="panel-head">
                <Users size={18} />
                <h3>Registered Operators</h3>
              </div>
              <div className="admin-list">
                {users.map((u, i) => (
                  <div key={u._id || i} className="admin-list-item">
                    <div className="item-info">
                      <span className="title">{u.username}</span>
                      <span className="meta">{u.email}</span>
                      <span className="time">Joined: {formatDate(u.createdAt)}</span>
                    </div>
                    <div className="item-side actions">
                      <button className="admin-action-btn" onClick={() => viewHistory(u)} title="View Logs"><Clock size={16} /></button>
                      <button className="admin-action-btn" onClick={() => handleUpdateLimit(u)} title="Update Quota"><Edit3 size={16} /></button>
                      <button 
                        className={`admin-action-btn ${u.isBlocked ? 'blocked' : 'active'}`} 
                        onClick={() => handleToggleBlock(u)}
                        title={u.isBlocked ? 'Unblock Operator' : 'Block Operator'}
                      >
                        <Shield size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-panel-card glass-panel">
              <div className="panel-head">
                <Shield size={18} />
                <h3>{selectedUser ? `Operation Logs: ${selectedUser.username}` : 'Operator Activity'}</h3>
              </div>
              <div className="admin-list">
                {selectedUserScans === null ? (
                  <div className="empty-state-mini">
                    <AlertCircle size={32} opacity={0.2} />
                    <p>{selectedUser ? 'Retrieving logs…' : 'Select an operator to view activity'}</p>
                  </div>
                ) : selectedUserScans.length === 0 ? (
                  <div className="empty-state-mini">
                    <p>No activity recorded for this operator</p>
                  </div>
                ) : (
                  selectedUserScans.map((s) => (
                    <div key={s._id} className="admin-list-item">
                      <div className="item-info">
                        <span className="title">{s.targetUrl}</span>
                        <span className="meta">{(s.scanType || "unknown").toUpperCase()}</span>
                      </div>
                      <div className="item-side">
                        <span className={`status-badge ${s.status}`}>{s.status}</span>
                        <span className="time">{formatDate(s.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
