/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  adminGetStats,
  adminGetUserHistory,
  adminUpdateUserLimit,
} from "../../api/admin-api";
import "../../styles/admin-dashboard.css";

type RecentUser = {
  userId?: string;
  _id?: string;
  username: string;
  email?: string;
  createdAt?: string;
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
  const [selectedUserScans, setSelectedUserScans] = useState<Scan[] | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<RecentUser | null>(null);
  const [updating, setUpdating] = useState(false);

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

        setUsers(
          Array.isArray(data.recentUsers)
            ? data.recentUsers.map((u: any) => ({ ...u }))
            : []
        );
      } catch (err: any) {
        console.error("Load users error:", err);
        setError(
          err?.response?.data?.error || err?.message || "Failed to load users"
        );
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
      console.error("User history error:", err);
      alert(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to load user history"
      );
    }
  };

  const handleUpdateLimit = async (user: RecentUser) => {
    const id = user._id || (user as any).userId;
    const input = window.prompt(
      `Set new scan limit for ${user.username} (leave empty to cancel):`,
      "10"
    );
    if (!input) return;
    const val = Number(input);
    if (Number.isNaN(val) || val < 0) {
      alert("Please enter a valid non-negative number");
      return;
    }

    try {
      setUpdating(true);
      const res = await adminUpdateUserLimit(id, val);
      if (res.data?.success) {
        alert("Scan limit updated");
      } else {
        throw new Error(res.data?.error || "Failed to update");
      }
    } catch (err: any) {
      console.error("Update limit error:", err);
      alert(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to update scan limit"
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "";

  return (
    <div className="admin-simple" style={{ paddingTop: 8 }}>
      <div className="admin-simple-header">
        <h1>Users</h1>
        <p className="muted">
          Recent users (quick access). Select a user to view scan history or
          update limits.
        </p>
      </div>

      {loading ? (
        <div className="admin-loading">Loading users…</div>
      ) : error ? (
        <div className="admin-error">Error: {error}</div>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 320, flex: "0 0 420px" }}>
            <div className="list-card">
              <h3>Recent users</h3>
              <ul className="list-items">
                {users.map((u: any, i) => (
                  <li
                    key={u._id || i}
                    className="list-item"
                    style={{ alignItems: "center" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="item-main">
                        <span className="item-title">{u.username}</span>
                        <span className="item-meta"> — {u.email ?? "—"}</span>
                      </div>
                      <div className="item-meta">{formatDate(u.createdAt)}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => viewHistory(u)}
                        style={{ padding: "6px 10px", borderRadius: 8 }}
                      >
                        History
                      </button>
                      <button
                        onClick={() => handleUpdateLimit(u)}
                        disabled={updating}
                        style={{ padding: "6px 10px", borderRadius: 8 }}
                      >
                        {updating ? "Updating…" : "Set Limit"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 320 }}>
            <div className="list-card">
              <h3>
                {selectedUser
                  ? `Scans for ${selectedUser.username}`
                  : "Selected user scans"}
              </h3>
              {selectedUserScans === null ? (
                <div className="muted">
                  {selectedUser ? "Loading..." : "Select a user to view scans"}
                </div>
              ) : selectedUserScans.length === 0 ? (
                <div className="muted">No scans for this user</div>
              ) : (
                <ul className="list-items">
                  {selectedUserScans.map((s) => (
                    <li key={s._id} className="list-item">
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
                        <span className={`scan-status ${s.status ?? ""}`}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
