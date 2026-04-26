/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  Shield, 
  Globe, 
  Zap, 
  Terminal, 
  Info, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  ChevronLeft,
  X,
  Smartphone
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { startScan } from "../../api/scan-api";
import type { ScanTool } from "../../utils/types";
import "../../styles/start-scan.css";
import Lottie from "lottie-react";
import nmapAnimation from "../../assets/icons/nmap.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import sqlmapAnimation from "../../assets/icons/sql.json";
import sslscanAnimation from "../../assets/icons/ssl.json";
import autoAnimation from "../../assets/icons/Success.json";
import { useToast, ToastContainer } from "../../components/Toast";

const StartScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, authChecked, refreshUser } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [url, setUrl] = useState("");
  const [tool, setTool] = useState<ScanTool>("nmap");
  const [scanMode, setScanMode] = useState<"quick" | "full">("quick");
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSqlmapModal, setShowSqlmapModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const toolParam = searchParams.get("tool");
    if (toolParam) {
      const toolMap: Record<string, ScanTool> = {
        auto: "auto",
        all: "auto",
        nmap: "nmap",
        nikto: "nikto",
        sqlmap: "sqlmap",
        ssl: "sslscan",
        sslscan: "sslscan",
      };
      const mappedTool = toolMap[toolParam];
      if (mappedTool) setTool(mappedTool);
    }
  }, [searchParams]);

  if (!authChecked || authLoading) return null;

  const tools = [
    { id: "auto", name: "Auto-Scan", desc: "Full Security Audit", anim: autoAnimation, color: "#fff", tag: "ALL-IN-ONE", tooltip: "Automated orchestration. Sequentially executes Nmap, Nikto, SSLScan, and SQLMap for a comprehensive vulnerability report." },
    { id: "nmap", name: "Nmap", desc: "Network Reconnaissance", anim: nmapAnimation, color: "#00f2ff", tag: "RECON", tooltip: "Advanced port reconnaissance and OS fingerprinting engine. Scans all common TCP ports and identifies running services." },
    { id: "nikto", name: "Nikto", desc: "Web Server Scanner", anim: niktoAnimation, color: "#ff0055", tag: "WEB VULN", tooltip: "Comprehensive web server scanner. Identifies 6700+ dangerous files/programs, outdated versions, and server configuration issues." },
    { id: "sqlmap", name: "SQLMap", desc: "SQL Injection Probe", anim: sqlmapAnimation, color: "#ffd54f", tag: "DB AUDIT", tooltip: "Automatic SQL injection detection and database takeover tool. Probes for various injection types including boolean, error, and time-based." },
    { id: "sslscan", name: "SSLScan", desc: "TLS Configuration", anim: sslscanAnimation, color: "#00ff9d", tag: "ENCRYPTION", tooltip: "SSL/TLS security auditor. Evaluates cipher suites, certificate validity, and identifies weak encryption protocols." },
  ] as const;

  const handleToolSelect = (toolId: string) => {
    if (scanLoading) return;
    setTool(toolId as ScanTool);
    const selectedTool = tools.find(t => t.id === toolId);
    if (selectedTool) {
      addToast("info", `${selectedTool.name} Selected`, selectedTool.tooltip, 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent, skipSqlmapCheck = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (user && user.usedScan >= user.scanLimit) {
      const msg = `Daily limit reached (${user.scanLimit}). Buy Premium to run more scans.`;
      setError(msg);
      addToast("error", "Scan Limit Reached", `You have used all ${user.scanLimit} scans for today.`, 4000);
      return;
    }

    if (!url.trim() || !url.startsWith("http")) {
      setError("Invalid Target: Please provide a valid URL (starting with http:// or https://).");
      addToast("error", "Invalid URL", "Please provide a valid target URL.", 4000);
      return;
    }

    if (tool === "sqlmap" && !skipSqlmapCheck) {
      setShowSqlmapModal(true);
      return;
    }

    try {
      setScanLoading(true);
      setShowSqlmapModal(false);
      const scanData = {
        targetUrl: url.trim().replace(/\/+$/, ""),
        scanType: tool === "sslscan" ? "ssl" : tool === "auto" ? "all" : tool,
        scanMode,
      };
      
      addToast("info", "Starting Scan", `Launching ${tool.toUpperCase()} scan...`, 3000);
      
      const response = await startScan(scanData);

      if (response?.data?.success) {
        await refreshUser();
        const scanId = response.data.scanId || response.data.scan?._id || response.data.scans?.[0]?._id;
        const batchId = response.data.batchId;
        if (scanId) {
          addToast("success", "Scan Started", `Scan initialized successfully.`, 3000);
          if (batchId) {
            navigate(`/scan-progress/${scanId}?batchId=${encodeURIComponent(batchId)}`);
          } else {
            navigate(`/scan-progress/${scanId}`);
          }
        } else {
          const err = "System Error: Scan initiation successful but ID not received.";
          setError(err);
          addToast("error", "System Error", err, 4000);
        }
      } else {
        const err = response?.data?.error || "Initialization Failed: The scan could not be started.";
        setError(err);
        addToast("error", "Scan Failed", err, 4000);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Target Unreachable: Please check the URL and try again.";
      setError(errMsg);
      addToast("error", "Connection Error", errMsg, 4000);
    } finally {
      setScanLoading(false);
    }
  };

  const scanLimit = user?.scanLimit || 0;
  const usedScans = user ? Math.min(user.usedScan, scanLimit) : 0;
  const usagePercent = scanLimit > 0 ? (usedScans / scanLimit) * 100 : 0;

  return (
    <div className={`scan-page-premium ${isMobile ? "mobile" : ""}`}>
      <div className="noise-overlay"></div>
      
      <div className="scan-content-wrap">
        <header className="scan-header-v2">
          <Link to="/dashboard" className="back-btn-v2">
            <ChevronLeft size={20} />
            <span>Dashboard</span>
          </Link>
          <div className="header-text">
            <h1>Security Scan Module</h1>
            <p>Select tool & target {isMobile && <Smartphone size={14} className="inline" />}</p>
          </div>
        </header>

        <div className={`scan-main-grid-v2 ${isMobile ? "mobile-layout" : ""}`}>
          {/* Main Form Section */}
          <div className="form-panel glass-panel">
            {error && (
              <div className="alert-box error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form className="scan-form-v2" onSubmit={handleSubmit}>
              <div className="input-group">
                <div className="label-row">
                  <label>Target URL</label>
                  <div className="usage-indicator">
                    {usedScans} / {scanLimit}
                  </div>
                </div>
                <div className="url-input-wrap">
                  <Globe className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={scanLoading}
                    required
                  />
                </div>
                <div className="usage-bar">
                  <div className="bar-fill" style={{ width: `${usagePercent}%` }}></div>
                </div>
              </div>

              <div className="module-group">
                <label>Security Tool</label>
                <div className={`module-selector ${isMobile ? "mobile-grid" : ""}`}>
                  {tools.map((t) => (
                    <div
                      key={t.id}
                      className={`module-card ${tool === t.id ? "selected" : ""}`}
                      onClick={() => handleToolSelect(t.id)}
                      title={t.tooltip}
                      style={{ "--accent-color": t.color } as any}
                    >
                      <div className="module-tag">{t.tag}</div>
                      <div className="module-icon">
                        <Lottie animationData={t.anim} loop className="lottie-mini" />
                      </div>
                      <div className="module-info">
                        <h3>{t.name}</h3>
                        <p>{t.desc}</p>
                      </div>
                      <div className="selection-indicator">
                        <Zap size={14} fill="currentColor" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="module-group">
                <label>Scan Intensity</label>
                <div className={`intensity-selector ${isMobile ? "mobile-grid" : ""}`}>
                  <div 
                    className={`intensity-card ${scanMode === "quick" ? "selected" : ""}`}
                    onClick={() => setScanMode("quick")}
                  >
                    <h4>Quick Scan</h4>
                    <p>Fast recon, minimal intrusive probes. Best for general check.</p>
                    <div className="selection-indicator">
                      <Zap size={14} fill="currentColor" />
                    </div>
                  </div>
                  <div 
                    className={`intensity-card ${scanMode === "full" ? "selected" : ""}`}
                    onClick={() => setScanMode("full")}
                  >
                    <h4>Deep Scan</h4>
                    <p>Comprehensive scan, tests all vectors and ports. Takes longer.</p>
                    <div className="selection-indicator">
                      <Zap size={14} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="launch-btn" disabled={scanLoading || !url.trim()}>
                {scanLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <Shield size={22} />
                    <span>{isMobile ? "Scan" : "Execute Scan"}</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Panel - Hidden on mobile */}
          {!isMobile && (
            <aside className="info-panel-v2">
              <div className="info-card glass-panel">
                <div className="card-header">
                  <Info size={18} className="text-primary" />
                  <span>Module Info</span>
                </div>
                <div className="module-details">
                  <h2 style={{ color: tools.find(t => t.id === tool)?.color }}>
                    {tools.find(t => t.id === tool)?.name}
                  </h2>
                  <p className="desc-text">
                    {tool === "auto" && "Automated orchestration. Sequentially executes Nmap, Nikto, SSLScan, and SQLMap."}
                    {tool === "nmap" && "Advanced port reconnaissance and OS fingerprinting engine."}
                    {tool === "nikto" && "Comprehensive web server scanner for 6700+ dangerous files/programs."}
                    {tool === "sqlmap" && "Automatic SQL injection detection and exploitation tool."}
                    {tool === "sslscan" && "SSL/TLS security auditor evaluating cipher suites."}
                  </p>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <label>Duration</label>
                      <strong>{tool === "auto" ? "10-15m" : tool === "nmap" ? "2-3m" : tool === "nikto" ? "3-5m" : tool === "sqlmap" ? "4-6m" : "1-2m"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {showSqlmapModal && (
        <div className="modal-overlay-premium" onClick={() => setShowSqlmapModal(false)}>
          <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: "var(--cyber-accent)" }}>
                <AlertCircle size={20} />
                <span>Confirm SQLMap</span>
              </div>
              <button className="close-modal-btn" onClick={() => setShowSqlmapModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body-premium">
              <p style={{ marginBottom: "16px" }}>
                SQLMap is a powerful tool for detecting SQL injection flaws.
              </p>
              <p style={{ color: "var(--cyber-text-dim)", marginBottom: "16px", fontSize: "0.95rem" }}>
                This can heavily load the target server and may impact database performance without proper authorization.
              </p>
            </div>
            <div className="modal-footer" style={{ display: "flex", gap: "16px" }}>
              <button className="action-btn secondary" onClick={() => setShowSqlmapModal(false)}>Cancel</button>
              <button className="action-btn primary" style={{ background: "var(--cyber-accent)" }} onClick={(e) => handleSubmit(e, true)}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default StartScan;
