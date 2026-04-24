/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  Shield, 
  Activity, 
  Terminal, 
  AlertCircle, 
  ArrowLeft, 
  Loader2,
  XCircle,
  CheckCircle2,
  Cpu,
  Database,
  Wifi,
  RefreshCw
} from "lucide-react";
import { cancelScan, getScanResultsById, startScan } from "../../api/scan-api";
import { AutoScanProgress } from "../../components/AutoScanProgress";
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
  const [logs, setLogs] = useState<string[]>([]);
  const [pollErrors, setPollErrors] = useState(0);

  const statusLabel = useMemo(() => {
    if (status === "running")   return "Scan in Progress";
    if (status === "pending")   return "Initializing…";
    if (status === "completed") return "Scan Completed";
    if (status === "failed")    return "Scan Failed";
    if (status === "canceled" || status === "cancelled") return "Scan Cancelled";
    return status;
  }, [status]);

  useEffect(() => {
    if (status === "running") {
      const messages = [
        "Probing open ports…",
        "Identifying service versions…",
        "Analyzing response headers…",
        "Auditing SSL/TLS configuration…",
        "Mapping network topology…",
        "Checking for known CVEs…",
        "Scanning for web vulnerabilities…",
      ];
      const interval = setInterval(() => {
        setLogs(prev => [messages[Math.floor(Math.random() * messages.length)], ...prev].slice(0, 6));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (!scanId) return;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const res = await getScanResultsById(scanId);
        const data = res.data?.scan || res.data;
        const st = data?.status || "pending";
        const rawTool = String(data?.scanType || data?.tool || "").toLowerCase();
        const normalizedToolForUi = rawTool === "all" ? "auto" : rawTool;
        setPollErrors(0);
        setStatus(st);
        setTool(normalizedToolForUi);
        setTarget(data?.targetUrl || data?.url);
        setStartedAt(data?.startedAt || data?.createdAt);
        setError((prev) => (prev === "Failed to fetch scan status." ? "" : prev));

        if (st === "failed") {
          const backendError =
            data?.results?.error ||
            data?.results?.message ||
            "Scan failed on backend.";
          setError(backendError);

          const partialOutput = data?.results?.partialOutput || data?.results?.rawOutput;
          if (partialOutput && typeof partialOutput === "string") {
            const lines = partialOutput
              .split("\n")
              .map((line: string) => line.trim())
              .filter(Boolean)
              .slice(-6);
            if (lines.length) setLogs(lines.reverse());
          }
        }

        if (st === "running") {
          const startTime = data?.startedAt || data?.createdAt;
          const elapsedMs = startTime ? Math.max(Date.now() - new Date(startTime).getTime(), 0) : 0;
          const toolType = rawTool;
          const estimatedMs =
            toolType === "sqlmap" ? 185000 :
            toolType === "nikto" ? 180000 :
            toolType === "ssl" || toolType === "sslscan" ? 180000 :
            toolType === "all" || toolType === "auto" ? 540000 :
            360000;
          const estimatedPercent = Math.min(95, 8 + Math.floor((elapsedMs / estimatedMs) * 87));
          setPercent((p) => Math.max(p, estimatedPercent));
        }
        if (st === "completed") setPercent(100);

        if (st === "completed") {
          setTimeout(() => navigate(`/scan-result/${scanId}`, { replace: true }), 1500);
          return;
        }

        if (st !== "cancelled" && st !== "canceled" && st !== "failed") {
          timer = window.setTimeout(poll, POLL_MS);
        }
      } catch (e: any) {
        const isTransientNetworkError =
          e?.code === "ERR_NETWORK" ||
          e?.code === "ERR_NETWORK_CHANGED" ||
          String(e?.message || "").includes("Network Error");
        setPollErrors((prev) => {
          const next = prev + 1;
          if (!isTransientNetworkError || next >= 3) {
            setError(e?.response?.data?.error || "Failed to fetch scan status.");
          }
          return next;
        });
        timer = window.setTimeout(poll, POLL_MS + 2000);
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
      setError("Scan cancelled by user.");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to cancel scan.");
    }
  };

  const handleRetry = async () => {
    if (!target || !tool) {
      setError("Cannot retry because scan target/tool is missing.");
      return;
    }
    try {
      setError("");
      const normalizedTool =
        tool.toLowerCase() === "sslscan"
          ? "ssl"
          : tool.toLowerCase() === "auto"
          ? "all"
          : tool.toLowerCase();
      const response = await startScan({
        targetUrl: target,
        scanType: normalizedTool,
      });
      const newScanId =
        response.data?.scanId ||
        response.data?.scan?._id ||
        response.data?.scans?.[0]?._id;
      if (!newScanId) {
        setError("Retry started but scan id was not returned.");
        return;
      }
      navigate(`/scan-progress/${newScanId}`, { replace: true });
    } catch (e: any) {
      setError(e?.response?.data?.error || "Retry failed.");
    }
  };

  return (
    <div className="progress-page-premium">
      <div className="noise-overlay"></div>

      <div className="progress-container-premium">
        <header className="progress-header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="system-status-indicator">
            <div className={`status-dot ${status}`}></div>
            <span>{statusLabel}</span>
          </div>
        </header>

        <div className="progress-main-grid">
          {/* Left Panel */}
          <section className="progress-visual-panel glass-panel">
            <div className="scan-radar-wrap">
              <div className="radar-circle"></div>
              <div className="radar-scanner"></div>
              <div className="radar-center">
                <Shield size={40} className={status === "running" ? "pulse" : ""} />
              </div>
            </div>

            {tool === "auto" || tool === "all" ? (
              <AutoScanProgress status={status} percent={percent} />
            ) : (
              <div className="progress-data-wrap">
                <div className="progress-labels">
                  <span>Scan Progress</span>
                  <span>{percent}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className={`progress-bar-fill ${status}`} style={{ width: `${percent}%` }}>
                    <div className="progress-glow"></div>
                  </div>
                </div>
              </div>
            )}

            <div className="progress-details-grid">
              <div className="p-detail">
                <Cpu size={18} />
                <div className="p-text">
                  <label>Tool</label>
                  <span>{(tool || "N/A").toUpperCase()}</span>
                </div>
              </div>
              <div className="p-detail">
                <Wifi size={18} />
                <div className="p-text">
                  <label>Target</label>
                  <span className="truncate">{target || "N/A"}</span>
                </div>
              </div>
              <div className="p-detail">
                <Database size={18} />
                <div className="p-text">
                  <label>Scan ID</label>
                  <span>{scanId?.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Panel: Live Logs */}
          <section className="progress-logs-panel glass-panel">
            <div className="panel-header-mini">
              <Terminal size={16} />
              <span>Live Output</span>
            </div>
            <div className="logs-terminal">
              {status === "pending" && (
                <div className="log-entry system">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="message">Initializing scan engine…</span>
                </div>
              )}
              {logs.map((log, i) => (
                <div key={i} className="log-entry">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="message">{log}</span>
                </div>
              ))}
              {status === "running" && (
                <div className="log-entry cursor">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="message">Scanning remote assets_</span>
                </div>
              )}
              {error && (
                <div className="log-entry error">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="message">{error}</span>
                </div>
              )}
              {pollErrors > 0 && status === "running" && (
                <div className="log-entry system">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="message">Network recovered attempts: {pollErrors}</span>
                </div>
              )}
            </div>

            <div className="progress-actions">
              <button
                className="abort-btn"
                onClick={handleCancel}
                disabled={["completed", "canceled", "cancelled", "failed"].includes(status)}
              >
                <XCircle size={18} />
                <span>Cancel Scan</span>
              </button>
              {status === "completed" && (
                <button className="result-btn" onClick={() => navigate(`/scan-result/${scanId}`)}>
                  <CheckCircle2 size={18} />
                  <span>View Results</span>
                </button>
              )}
              {status === "failed" && (
                <button className="result-btn" onClick={handleRetry}>
                  <RefreshCw size={18} />
                  <span>Retry Scan</span>
                </button>
              )}
            </div>
          </section>
        </div>

        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>
      </div>
    </div>
  );
};

export default ScanProgress;
