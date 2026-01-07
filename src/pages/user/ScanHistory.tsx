/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getScanHistory } from "../../api/scan-api";
import "../../styles/scan-result.css";

const ScanHistory = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getScanHistory();
        const arr = res.data?.scans || res.data?.history || [];
        setScans(Array.isArray(arr) ? arr : []);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load scan history");
        setScans([]);
      }
    };
    load();
  }, []);

  return (
    <div className="scan-container">
      <div className="scan-card">
        <h2 className="text-gradient">Scan History</h2>
        {error && (
          <div className="scan-error">
            <div className="error-text">{error}</div>
          </div>
        )}

        <div className="history-list">
          {(!scans || scans.length === 0) && <p>No scans yet.</p>}
          {Array.isArray(scans) &&
            scans.map((s: any) => (
              <div key={s._id || crypto.randomUUID()} className="scan-item">
                <div>
                  <strong>{s.targetUrl ?? s.url ?? "Unknown target"}</strong>
                  <p
                    style={{
                      color: "#88ccff",
                      fontSize: "0.9rem",
                      marginTop: "5px",
                    }}
                  >
                    {(s.scanType ?? s.tool ?? "unknown").toUpperCase()} •{" "}
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div className="scan-status-row">
                  <span className={`scan-status status-${s.status}`}>
                    {s.status}
                  </span>
                  {s.status === "running" || s.status === "pending" ? (
                    <button
                      className="tool-button"
                      onClick={() => navigate(`/scan-progress/${s._id}`)}
                    >
                      View Progress
                    </button>
                  ) : (
                    <button
                      className="tool-button"
                      onClick={() => navigate(`/scan-result/${s._id}`)}
                    >
                      View Result
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        <div className="form-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanHistory;
