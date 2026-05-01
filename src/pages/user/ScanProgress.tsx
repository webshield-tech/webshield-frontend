/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
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
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { cancelScan, getBatchResults, getScanResultsById, startScan } from "../../api/scan-api";
import { AutoScanProgress } from "../../components/AutoScanProgress";
import { useToast } from "../../components/Toast";
import "../../styles/scan-progress.css";

const POLL_MS = 3000;

const TOOL_TITLES: Record<string, string> = {
  nmap: "Network Reconnaissance (Nmap)",
  nuclei: "Template Scan (Nuclei)",
  nikto: "Web Server Audit (Nikto)",
  ssl: "Encryption Analysis (SSLScan)",
  sqlmap: "Injection Testing (SQLMap)",
  wapiti: "Web App Audit (Wapiti)",
  gobuster: "Directory Discovery (Gobuster)",
  ffuf: "Fuzzing & Enumeration (FFUF)",
  ratelimit: "Rate Limiter Check",
  dns: "DNS Reconnaissance",
  whois: "WHOIS Lookup",
};

const normalizeTool = (value?: string) => {
  const key = String(value || "").toLowerCase();
  return key === "sslscan" ? "ssl" : key;
};

const ScanProgress = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const initialBatchId = searchParams.get("batchId") || "";
  const [status, setStatus] = useState("pending");
  const [percent, setPercent] = useState(12);
  const [error, setError] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [tool, setTool] = useState<string | undefined>();
  const [batchId, setBatchId] = useState<string>(initialBatchId);
  const [target, setTarget] = useState<string | undefined>();
  const [startedAt, setStartedAt] = useState<string | undefined>();
  const [logs, setLogs] = useState<string[]>([]);
  const [pollErrors, setPollErrors] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    "CVE stands for Common Vulnerabilities and Exposures, a list of publicly disclosed cybersecurity vulnerabilities.",
    "Did you know? Over 60% of web breaches involve unpatched software. Keeping systems updated is crucial.",
    "SQL Injection (SQLi) is one of the oldest and most dangerous web vulnerabilities, allowing attackers to access databases.",
    "Nmap (Network Mapper) is a free and open-source utility for network discovery and security auditing.",
    "A WAF (Web Application Firewall) helps protect web applications by filtering and monitoring HTTP traffic.",
    "Cross-Site Scripting (XSS) allows attackers to inject client-side scripts into web pages viewed by other users.",
    "If you select Deep Scan, the process takes longer but performs a much more thorough security analysis."
  ];

  const [batchScans, setBatchScans] = useState<any[]>([]);

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
        "Scanning remote assets_",
      ];
      const interval = setInterval(() => {
        setLogs(prev => [messages[Math.floor(Math.random() * messages.length)], ...prev].slice(0, 6));
      }, 4000);
      
      const tipInterval = setInterval(() => {
        setCurrentTipIndex(prev => (prev + 1) % tips.length);
      }, 8000);

      return () => {
        clearInterval(interval);
        clearInterval(tipInterval);
      };
    }
  }, [status, tips.length]);

  useEffect(() => {
    if (!scanId) return;
    let timer: number | undefined;

    const poll = async () => {
      try {
        if (batchId) {
          const batchRes = await getBatchResults(batchId);
          const scans = Array.isArray(batchRes.data?.scans) ? batchRes.data.scans : [];
          if (!scans.length) throw new Error("Batch scan not found.");
          setBatchScans(scans);

          const terminalStates = ["completed", "failed", "cancelled", "canceled"];
          const total    = scans.length;
          const completed = scans.filter((s: any) => s?.status === "completed").length;
          const failed    = scans.filter((s: any) => s?.status === "failed").length;
          const canceled  = scans.filter((s: any) => ["cancelled", "canceled"].includes(String(s?.status || ""))).length;
          const runningScan = scans.find((s: any) => s?.status === "running");
          const pendingScan = scans.find((s: any) => s?.status === "pending");

          setPollErrors(0);
          setTool("auto");
          setTarget(scans[0]?.targetUrl || scans[0]?.url);
          setStartedAt(scans[0]?.startedAt || scans[0]?.createdAt);
          setPercent(Math.max(5, Math.min(100, Math.round(((completed + failed + canceled) / total) * 100))));

          if (runningScan) {
            // Show real partial output if available, otherwise tool name
            const partial = runningScan.results?.partialOutput;
            if (partial && typeof partial === "string") {
              const lines = partial.split("\n").map((l: string) => l.trim()).filter(Boolean).slice(-4);
              if (lines.length) { setLogs(lines.reverse()); }
            } else {
              const planOrder = Array.isArray(scans[0]?.scanPlan?.run)
                ? scans[0]?.scanPlan?.run.map(normalizeTool)
                : scans.map((s: any) => normalizeTool(s?.scanType || s?.tool));
              const currentTool = normalizeTool(runningScan.scanType || runningScan.tool);
              const stepIndex = planOrder.indexOf(currentTool);
              const stepLabel = stepIndex >= 0
                ? `Step ${stepIndex + 1}/${planOrder.length}`
                : "Step";
              const toolTitle = TOOL_TITLES[currentTool] || String(runningScan.scanType || "unknown").toUpperCase();
              setLogs(prev => [`${stepLabel}: ${toolTitle} in progress…`, ...prev].slice(0, 6));
            }
          }
          if (pendingScan && !runningScan) {
            const nextTool = normalizeTool(pendingScan.scanType || pendingScan.tool);
            const nextTitle = TOOL_TITLES[nextTool] || String(pendingScan.scanType || "unknown").toUpperCase();
            setLogs(prev => [`Queued: ${nextTitle} will start after current tool finishes…`, ...prev].slice(0, 6));
          }

          const allDone = scans.every((s: any) => terminalStates.includes(String(s?.status || "")));
          if (allDone) {
            setStatus(failed > 0 ? "failed" : "completed");
            setPercent(100);
            const primaryScanId = scans[0]?._id || scanId;
            setTimeout(() => {
              navigate(`/scan-result/${primaryScanId}?batchId=${encodeURIComponent(batchId)}`, { replace: true });
            }, 1200);
            return;
          }

          setStatus("running");
          timer = window.setTimeout(poll, POLL_MS);
          return;
        }

        // ── Single-tool scan ────────────────────────────────────────────────────
        const res  = await getScanResultsById(scanId);
        const data = res.data?.scan || res.data;
        const st   = data?.status || "pending";
        const rawTool           = String(data?.scanType || data?.tool || "").toLowerCase();
        const normalizedToolForUi = rawTool === "all" ? "auto" : rawTool;

        if (!batchId && data?.results?.batchId) {
          setBatchId(String(data.results.batchId));
          timer = window.setTimeout(poll, 200);
          return;
        }

        setPollErrors(0);
        setStatus(st);
        setTool(normalizedToolForUi);
        setTarget(data?.targetUrl || data?.url);
        setStartedAt(data?.startedAt || data?.createdAt);
        setError(prev => (prev === "Failed to fetch scan status." ? "" : prev));

        // Show real partial output when available (scan-runner writes every 2s)
        const partialOutput = data?.results?.partialOutput;
        if (partialOutput && typeof partialOutput === "string" && st === "running") {
          const lines = partialOutput
            .split("\n")
            .map((line: string) => line.trim())
            .filter(Boolean)
            .slice(-5);
          if (lines.length) setLogs(lines.reverse());
        }

        if (st === "failed") {
          const backendError = data?.results?.error || data?.results?.message || "Scan failed on backend.";
          setError(backendError);
          const failOutput = data?.results?.partialOutput || data?.results?.rawOutput;
          if (failOutput && typeof failOutput === "string") {
            const lines = failOutput.split("\n").map((l: string) => l.trim()).filter(Boolean).slice(-6);
            if (lines.length) setLogs(lines.reverse());
          }
        }

        if (st === "running") {
          const startTime = data?.startedAt || data?.createdAt;
          const elapsedMs = startTime ? Math.max(Date.now() - new Date(startTime).getTime(), 0) : 0;
          const estimatedMs =
            rawTool === "sqlmap"                        ? 240000 :
            rawTool === "nikto"                         ? 180000 :
            rawTool === "ssl" || rawTool === "sslscan"  ? 120000 :
            rawTool === "all" || rawTool === "auto"     ? 540000 :
            360000;
          const estimatedPercent = Math.min(95, 8 + Math.floor((elapsedMs / estimatedMs) * 87));
          setPercent(p => Math.max(p, estimatedPercent));
        }

        if (st === "completed") {
          setPercent(100);
          setTimeout(() => navigate(`/scan-result/${scanId}`, { replace: true }), 1500);
          return;
        }

        if (st !== "cancelled" && st !== "canceled" && st !== "failed") {
          timer = window.setTimeout(poll, POLL_MS);
        }
      } catch (e: any) {
        const isTransient =
          e?.code === "ERR_NETWORK" ||
          e?.code === "ERR_NETWORK_CHANGED" ||
          String(e?.message || "").includes("Network Error");
        setPollErrors(prev => {
          const next = prev + 1;
          if (!isTransient || next >= 3) {
            setError(e?.response?.data?.error || "Failed to fetch scan status.");
          }
          return next;
        });
        timer = window.setTimeout(poll, POLL_MS + 2000);
      }
    };

    poll();
    return () => { if (timer) clearTimeout(timer); };
  }, [scanId, navigate, batchId]);

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
      addToast("error", "Retry Blocked", "Scan metadata lost. Please start a new scan.", 5000);
      return;
    }
    try {
      setScanLoading(true);
      setError("");
      
      const normalizedTool =
        tool.toLowerCase() === "sslscan" || tool.toLowerCase() === "ssl"
          ? "ssl"
          : tool.toLowerCase() === "auto" || tool.toLowerCase() === "all"
          ? "all"
          : tool.toLowerCase();

      addToast("info", "Restarting Audit", `Re-initializing ${normalizedTool.toUpperCase()} module…`, 3000);

      const response = await startScan({
        targetUrl: target,
        scanType: normalizedTool,
      });

      const newScanId =
        response.data?.scanId ||
        response.data?.scan?._id ||
        response.data?.scans?.[0]?._id;
      const newBatchId = response.data?.batchId;

      if (!newScanId) {
        throw new Error("System failed to generate a new scan reference.");
      }

      if (newBatchId) {
        navigate(`/scan-progress/${newScanId}?batchId=${encodeURIComponent(newBatchId)}`, { replace: true });
      } else {
        navigate(`/scan-progress/${newScanId}`, { replace: true });
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error || e.message || "Retry attempt failed.";
      setError(msg);
      addToast("error", "Deployment Failed", msg, 5000);
    } finally {
      setScanLoading(false);
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
              <AutoScanProgress
                status={status}
                percent={percent}
                batchScans={batchScans}
                scanPlan={batchScans?.[0]?.scanPlan}
              />
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

            {status === "running" && (
              <div style={{ marginTop: "20px", padding: "16px", background: "rgba(0, 255, 157, 0.05)", borderLeft: "4px solid var(--cyber-primary)", borderRadius: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--cyber-primary)", fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 800 }}>
                  <Lightbulb size={16} />
                  <span>Security Tip</span>
                </div>
                <p style={{ color: "var(--cyber-text-dim)", fontSize: "0.9rem", lineHeight: 1.5, margin: 0, minHeight: "40px" }}>
                  {tips[currentTipIndex]}
                </p>
              </div>
            )}
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
                <button 
                  className="result-btn" 
                  onClick={handleRetry} 
                  disabled={scanLoading}
                  style={{ opacity: scanLoading ? 0.7 : 1 }}
                >
                  {scanLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  <span>{scanLoading ? "Deploying…" : "Retry Scan"}</span>
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
