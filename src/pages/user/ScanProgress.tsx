/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { 
  Shield, 
  Terminal, 
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
  nikto: "Web Server Audit (Nikto)",
  ssl: "Encryption Analysis (SSLScan)",
  sqlmap: "Injection Testing (SQLMap)",
  ffuf: "Fuzzing & Enumeration (FFUF)",
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
  const [logs, setLogs] = useState<string[]>([]);
  const [technicalLogs, setTechnicalLogs] = useState<string[]>([]);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [pollErrors, setPollErrors] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [totalTools, setTotalTools] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");

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

          const planOrder = Array.isArray(scans[0]?.scanPlan?.run)
            ? scans[0]?.scanPlan?.run.map(normalizeTool)
            : scans.map((s: any) => normalizeTool(s?.scanType || s?.tool));
          
          setTotalTools(planOrder.length);
          setPollErrors(0);
          setTool("auto");
          setTarget(scans[0]?.targetUrl || scans[0]?.url);
          setPercent(Math.max(5, Math.min(100, Math.round(((completed + failed + canceled) / total) * 100))));

          if (runningScan) {
            const currentTool = normalizeTool(runningScan.scanType || runningScan.tool);
            const stepIndex = planOrder.indexOf(currentTool);
            const toolTitle = TOOL_TITLES[currentTool] || String(runningScan.scanType || "unknown").toUpperCase();
            
            setCurrentToolIndex(stepIndex >= 0 ? stepIndex + 1 : 1);
            setStatusMessage(`Step ${stepIndex + 1}/${planOrder.length} - ${toolTitle} in progress…`);

            const partial = runningScan.results?.partialOutput;
            if (partial && typeof partial === "string") {
              const lines = partial.split("\n").map((l: string) => l.trim()).filter(Boolean).slice(-6);
              if (lines.length) { 
                setTechnicalLogs(lines.reverse()); 
                setLogs([`▶ ${toolTitle}`, `Scanning: ${lines[0].substring(0, 55)}...`]);
              }
            } else {
              setLogs([`▶ ${toolTitle}`, "Collecting reconnaissance data..."]);
            }
          } else if (pendingScan && !runningScan) {
            const nextTool = normalizeTool(pendingScan.scanType || pendingScan.tool);
            const nextTitle = TOOL_TITLES[nextTool] || String(pendingScan.scanType || "unknown").toUpperCase();
            setStatusMessage(`[QUEUED] ${nextTitle}`);
            setLogs([`◌ ${nextTitle}`, "Waiting for previous tool to complete..."]);
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
                scanPlan={batchScans?.[0]?.results?.scanPlan || batchScans?.[0]?.scanPlan}
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
              <div style={{ marginTop: "24px", padding: "20px", background: "rgba(59, 130, 246, 0.05)", border: "1px solid var(--uber-border)", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", color: "var(--uber-accent)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <Lightbulb size={16} />
                  <span>Security Tip</span>
                </div>
                <p style={{ color: "var(--uber-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0, minHeight: "40px" }}>
                  {tips[currentTipIndex]}
                </p>
              </div>
            )}
          </section>

          {/* Right Panel: Live Logs with Dual Output */}
          <section className="progress-logs-panel glass-panel">
            <div className="panel-header-mini">
              <Terminal size={16} />
              <span>Live Output</span>
            </div>

            {/* Simplified Status Layer */}
            <div style={{ 
              marginBottom: "24px", 
              padding: "20px", 
              borderRadius: "12px", 
              background: "rgba(255, 255, 255, 0.02)", 
              border: "1px solid var(--uber-border)",
              minHeight: "80px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--uber-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Status
                </span>
                {showTechnicalDetails ? (
                  <button 
                    onClick={() => setShowTechnicalDetails(false)}
                    style={{ 
                      fontSize: "0.75rem",
                      padding: "6px 12px",
                      border: "1px solid var(--uber-border)",
                      background: "transparent",
                      color: "var(--uber-muted)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Hide Details
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowTechnicalDetails(true)}
                    style={{ 
                      fontSize: "0.75rem",
                      padding: "6px 12px",
                      border: "1px solid var(--uber-accent)",
                      background: "transparent",
                      color: "var(--uber-accent)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Show Details
                  </button>
                )}
              </div>
              <div style={{ fontSize: "0.95rem", color: "var(--uber-text)", fontWeight: 500 }}>
                {statusMessage || (status === "pending" ? "Initializing scan engine…" : `Status: ${status.toUpperCase()}`)}
              </div>
              {totalTools > 0 && currentToolIndex > 0 && (
                <div style={{ fontSize: "0.8rem", color: "var(--uber-muted)", marginTop: "8px" }}>
                  Progress: {currentToolIndex} of {totalTools} tools
                </div>
              )}
            </div>

            {/* Technical Details Layer (Expandable) */}
            {showTechnicalDetails && (
              <div style={{
                marginBottom: "24px",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid var(--uber-border)",
                maxHeight: "200px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--uber-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Raw Terminal Output
                </div>
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  fontSize: "0.8rem",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  color: "var(--uber-muted)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  {technicalLogs.length > 0 ? (
                    technicalLogs.map((log, i) => (
                      <div key={i} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "rgba(255, 255, 255, 0.3)" }}>No technical output yet…</div>
                  )}
                </div>
              </div>
            )}

            {/* Main Log Display */}
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
                  <span className="message">Analyzing…_</span>
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
                  <span className="message">Network recovery attempts: {pollErrors}</span>
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


      </div>
    </div>
  );
};

export default ScanProgress;
