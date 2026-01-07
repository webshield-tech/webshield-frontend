/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { adminGetAllScans, adminDeleteScan } from "../../api/admin-api";
import "../../styles/admin-dashboard.css";

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
        console.error("Load scans error:", err);
        setError(
          err?.response?.data?.error || err?.message || "Failed to load scans"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = window.confirm(
      "Delete this scan? This action cannot be undone."
    );
    if (!ok) return;
    try {
      setDeleting(id);
      await adminDeleteScan(id);
      setScans((s) => s.filter((x) => x._id !== id));
    } catch (err: any) {
      console.error("Delete scan error:", err);
      alert(
        err?.response?.data?.error || err?.message || "Failed to delete scan"
      );
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "";

  return (
    <div className="admin-simple" style={{ paddingTop: 8 }}>
      <div className="admin-simple-header">
        <h1>All Scans</h1>
        <p className="muted">
          All recorded scans (admin view). You can delete a scan from here.
        </p>
      </div>

      {loading ? (
        <div className="admin-loading">Loading scans…</div>
      ) : error ? (
        <div className="admin-error">Error: {error}</div>
      ) : scans.length === 0 ? (
        <div className="muted">No scans found</div>
      ) : (
        <div className="list-card" style={{ padding: 8 }}>
          <ul className="list-items">
            {scans.map((s) => (
              <li
                key={s._id}
                className="list-item"
                style={{ alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <div className="item-main">
                    <a
                      className="item-title link"
                      href={s.targetUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.targetUrl || "Unknown"}
                    </a>
                    <span className="item-meta"> — {s.scanType ?? "—"} </span>
                  </div>
                  <div className="item-meta">
                    {formatDate(s.createdAt)} — by{" "}
                    {s.userId?.username ?? s.userId ?? "unknown"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => handleDelete(s._id)}
                    disabled={deleting === s._id}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {deleting === s._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
