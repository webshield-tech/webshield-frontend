/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelScan, getScanResultsById } from "../../api/scan-api";
import "../../styles/scan-progress.css";

const POLL_MS = 3000;

const ScanProgress = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [percent, setPercent] = useState(12);
  const [error, setError] = useState("");
  const [tool, setTool] = useState<string | undefined>();
  const [target, setTarget] = useState<string | undefined>();
  const [startedAt, setStartedAt] = useState<string | undefined>();

  const statusLabel = useMemo(() => {
    if (status === "running") return "Running scan…";
    if (status === "pending") return "Queued, waiting for slot…";
    if (status === "completed") return "Completed";
    if (status === "failed") return "Failed";
    if (status === "canceled" || status === "cancelled") return "Cancelled";
    return status;
  }, [status]);

  const tip = useMemo(() => {
    const tips = [
      "Tip: Running Nmap with -sV helps identify service versions.",
      "Tip: Nikto scans for dangerous files and misconfigurations quickly.",
      "Tip: SQLMap automates SQLi detection; start with low risk levels.",
      "Tip: SSLScan checks weak ciphers and protocol support.",
      "Reminder: Only scan hosts you own or have permission to test.",
      "Best practice: Re-run scans after patching to validate fixes.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }, [status]);

  useEffect(() => {
    if (!scanId) return;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const res = await getScanResultsById(scanId);
        const data = res.data?.scan || res.data;
        const st = data?.status || "pending";
        setStatus(st);
        setTool(data?.scanType || data?.tool);
        setTarget(data?.targetUrl || data?.url);
        setStartedAt(data?.startedAt || data?.createdAt);

        if (st === "running") setPercent((p) => Math.min(96, p + 7));
        if (st === "completed") setPercent(100);

        if (st === "completed") {
          navigate(`/scan-result/${scanId}`, { replace: true });
          return;
        }
        if (["failed", "canceled", "cancelled"].includes(st)) {
          setError(`Scan ${st}.`);
          return;
        }
        timer = window.setTimeout(poll, POLL_MS);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to fetch scan status");
      }
    };

    poll();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [scanId, navigate]);

  const handleCancel = async () => {
    if (!scanId) return;
    try {
      await cancelScan(scanId);
      setStatus("canceled");
      setError("Scan cancelled.");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to cancel scan");
    }
  };

  return (
    <div className="scanp-container">
      <div className="scanp-card">
        <div className="scanp-header">
          <div>
            <h2 className="text-gradient">Scan Progress</h2>
            <p className="scanp-subtitle">Scan ID: {scanId}</p>
          </div>
          <div className={`chip chip-${status}`}>{statusLabel}</div>
        </div>

        <div className="scanp-meta">
          <div>
            <div className="meta-label">Target</div>
            <div className="meta-value">{target || "—"}</div>
          </div>
          <div>
            <div className="meta-label">Tool</div>
            <div className="meta-value">{(tool || "—").toUpperCase()}</div>
          </div>
          <div>
            <div className="meta-label">Started</div>
            <div className="meta-value">
              {startedAt ? new Date(startedAt).toLocaleString() : "—"}
            </div>
          </div>
        </div>

        {error && (
          <div className="scanp-error">
            <div className="error-text">{error}</div>
          </div>
        )}

        <div className="progress-wrap">
          <div className="progress-top">
            <span>{statusLabel}</span>
            <span className="percent">
              {Math.min(100, Math.max(0, percent))}%
            </span>
          </div>
          <div className="progress-bar-outer">
            <div
              className={`progress-bar-inner status-${status}`}
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
          <div className="progress-tip">{tip}</div>
        </div>

        <div className="scanp-footer">
          <button
            className="btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={["completed", "canceled", "cancelled", "failed"].includes(
              status
            )}
          >
            Cancel Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanProgress;
