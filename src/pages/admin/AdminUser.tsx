/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, AlertCircle } from "lucide-react";
import {
  adminGetStats,
  adminGetUserHistory,
  adminUpdateUserLimit,
  adminToggleUserBlock
} from "../../api/admin-api";
import { sendAnnouncement } from "../../api/notification-api";
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
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementType, setAnnouncementType] = useState<"info" | "success" | "warning" | "error">("info");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
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
        // Send notification to the user
        try {
          await sendAnnouncement(
            "Your scan quota has been updated",
            `Your daily scan limit has been changed to ${val} scans per day. Plan your security assessments accordingly.`,
            "info",
            [id]
          );
        } catch (notifErr) {
          console.warn("Failed to send notification:", notifErr);
        }

        addNotification({
          type: "info",
          title: "Quota Updated",
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
        // Send notification to the user
        try {
          if (user.isBlocked) {
            await sendAnnouncement(
              "Your account has been unblocked",
              "Your account is now active and you can resume scanning.",
              "success",
              [id]
            );
          } else {
            await sendAnnouncement(
              "Your account has been temporarily blocked",
              "Your account has been suspended. Please contact support for more information.",
              "warning",
              [id]
            );
          }
        } catch (notifErr) {
          console.warn("Failed to send notification:", notifErr);
        }

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

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      addToast("warning", "Missing Content", "Please fill in both title and message.", 3000);
      return;
    }

    try {
      setSendingAnnouncement(true);
      // Send announcement to all users
      const userIds = users.map(u => u._id || (u as any).userId).filter(Boolean);
      
      await sendAnnouncement(
        announcementTitle,
        announcementMessage,
        announcementType,
        userIds
      );

      addToast("success", "Announcement Sent", "Your announcement has been sent to all operators.", 4000);
      setAnnouncementTitle("");
      setAnnouncementMessage("");
      setAnnouncementType("info");
    } catch (err: any) {
      addToast("error", "Failed to Send", err?.response?.data?.error || "Failed to send announcement.", 5000);
    } finally {
      setSendingAnnouncement(false);
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
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span className="time">Joined: {formatDate(u.createdAt)}</span>
                        {u.lastIp && <span className="meta" style={{ color: 'var(--cyber-primary)', fontSize: '0.7rem' }}>IP: {u.lastIp}</span>}
                      </div>
                    </div>
                    <div className="item-side actions">
                      <button className="admin-action-btn" onClick={() => viewHistory(u)} title="View Logs">📋</button>
                      <button className="admin-action-btn" onClick={() => handleUpdateLimit(u)} title="Update Quota">✏️</button>
                      <button 
                        className={`admin-action-btn ${u.isBlocked ? 'blocked' : 'active'}`} 
                        onClick={() => handleToggleBlock(u)}
                        title={u.isBlocked ? 'Unblock Operator' : 'Block Operator'}
                      >
                        {u.isBlocked ? '🔒' : '🔓'}
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

            <section className="admin-panel-card glass-panel">
              <div className="panel-head">
                <AlertCircle size={18} />
                <h3>Send Announcement</h3>
              </div>
              <div className="announcement-form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="e.g., System Maintenance Notice"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    disabled={sendingAnnouncement}
                  />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    placeholder="Enter the announcement message here..."
                    rows={4}
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    disabled={sendingAnnouncement}
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={announcementType}
                    onChange={(e) => setAnnouncementType(e.target.value as any)}
                    disabled={sendingAnnouncement}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <button
                  onClick={handleSendAnnouncement}
                  disabled={sendingAnnouncement}
                  className="btn-primary"
                >
                  {sendingAnnouncement ? "Sending..." : "Send to All Operators"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
