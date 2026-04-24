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
  ChevronLeft
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

const StartScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, authChecked, refreshUser } = useAuth();

  const [url, setUrl] = useState("");
  const [tool, setTool] = useState<ScanTool>("nmap");
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const toolParam = searchParams.get("tool");
    if (toolParam) {
      const toolMap: Record<string, ScanTool> = {
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
    { id: "auto", name: "Auto-Scan", desc: "Full Security Audit", anim: autoAnimation, color: "#fff", tag: "ALL-IN-ONE" },
    { id: "nmap", name: "Nmap", desc: "Network Reconnaissance", anim: nmapAnimation, color: "#00f2ff", tag: "RECON" },
    { id: "nikto", name: "Nikto", desc: "Web Server Scanner", anim: niktoAnimation, color: "#ff0055", tag: "WEB VULN" },
    { id: "sqlmap", name: "SQLMap", desc: "SQL Injection Probe", anim: sqlmapAnimation, color: "#ffd54f", tag: "DB AUDIT" },
    { id: "sslscan", name: "SSLScan", desc: "TLS Configuration", anim: sslscanAnimation, color: "#00ff9d", tag: "ENCRYPTION" },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (user && user.usedScan >= user.scanLimit) {
      setError("Quota Exceeded: You have reached your daily scan limit.");
      return;
    }

    if (!url.trim() || !url.startsWith("http")) {
      setError("Invalid Target: Please provide a valid URL (starting with http:// or https://).");
      return;
    }

    try {
      setScanLoading(true);
      const scanData = { targetUrl: url.trim().replace(/\/+$/, ""), scanType: tool === "sslscan" ? "ssl" : tool };
      const response = await startScan(scanData);

      if (response?.data?.success) {
        await refreshUser();
        const scanId = response.data.scanId || response.data.scan?._id;
        if (scanId) navigate(`/scan-progress/${scanId}`);
        else setError("System Error: Scan initiation successful but ID not received.");
      } else {
        setError(response?.data?.error || "Initialization Failed: The scan could not be started.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Target Unreachable: Please check the URL and try again.");
    } finally {
      setScanLoading(false);
    }
  };

  const scanLimit = user?.scanLimit || 0;
  const usedScans = user ? Math.min(user.usedScan, scanLimit) : 0;
  const usagePercent = scanLimit > 0 ? (usedScans / scanLimit) * 100 : 0;

  return (
    <div className="scan-page-premium">
      <div className="noise-overlay"></div>
      
      <div className="scan-content-wrap">
        <header className="scan-header-v2">
          <Link to="/dashboard" className="back-btn-v2">
            <ChevronLeft size={20} />
            <span>Dashboard</span>
          </Link>
          <div className="header-text">
            <h1>Initialize Security Scan</h1>
            <p>Target Audit Protocol v3.0 // Select your module and target URL</p>
          </div>
        </header>

        <div className="scan-main-grid-v2">
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
                  <label>Target Identifier (URL)</label>
                  <div className="usage-indicator">
                    Quota: <strong>{usedScans} / {scanLimit}</strong>
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
                <label>Security Module Selection</label>
                <div className="module-selector">
                  {tools.map((t) => (
                    <div
                      key={t.id}
                      className={`module-card ${tool === t.id ? "selected" : ""}`}
                      onClick={() => !scanLoading && setTool(t.id)}
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

              <button type="submit" className="launch-btn" disabled={scanLoading || !url.trim()}>
                {scanLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Launching Engine...</span>
                  </>
                ) : (
                  <>
                    <Shield size={22} />
                    <span>Execute Scan Sequence</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <aside className="info-panel-v2">
            <div className="info-card glass-panel">
              <div className="card-header">
                <Info size={18} className="text-primary" />
                <span>Module Specifications</span>
              </div>
              <div className="module-details">
                <h2 style={{ color: tools.find(t => t.id === tool)?.color }}>
                  {tools.find(t => t.id === tool)?.name} Active
                </h2>
                <p className="desc-text">
                  {tool === "auto" && "Automated orchestration. Sequentially executes Nmap, Nikto, SSLScan, and SQLMap for a comprehensive vulnerability report."}
                  {tool === "nmap" && "Advanced port reconnaissance and OS fingerprinting engine. Scans all common TCP ports and identifies running services."}
                  {tool === "nikto" && "Comprehensive web server scanner. Identifies 6700+ dangerous files/programs, outdated versions, and server configuration issues."}
                  {tool === "sqlmap" && "Automatic SQL injection detection and database takeover tool. Probes for various injection types including boolean, error, and time-based."}
                  {tool === "sslscan" && "SSL/TLS security auditor. Evaluates cipher suites, certificate validity, and identifies weak encryption protocols."}
                </p>
                <div className="stat-grid">
                  <div className="stat-item">
                    <label>Est. Duration</label>
                    <strong>{tool === "auto" ? "10-15m" : tool === "nmap" ? "2-3m" : tool === "nikto" ? "3-5m" : tool === "sqlmap" ? "4-6m" : "1-2m"}</strong>
                  </div>
                  <div className="stat-item">
                    <label>Intensity</label>
                    <strong>{tool === "auto" || tool === "nmap" || tool === "sqlmap" ? "High" : "Medium"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card warning glass-panel">
              <div className="card-header">
                <AlertCircle size={18} className="text-accent" />
                <span>Engagement Rules</span>
              </div>
              <ul className="rules-list">
                <li>Explicit authorization is required for target.</li>
                <li>All scan operations are logged to your identity.</li>
                <li>Avoid aggressive scanning on production systems.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StartScan;
