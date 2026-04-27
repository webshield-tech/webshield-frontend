/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Shield,
  Globe,
  Zap,
  Info,
  AlertCircle,
  ArrowRight,
  Loader2,
  ChevronLeft,
  X,
  Smartphone,
  Rocket,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { startScan } from "../../api/scan-api";
import type { ScanTool } from "../../utils/types";
import "../../styles/start-scan.css";
import Lottie from "lottie-react";
import nmapAnimation    from "../../assets/icons/nmap.json";
import niktoAnimation   from "../../assets/icons/nikto.json";
import sqlmapAnimation  from "../../assets/icons/sql.json";
import sslscanAnimation from "../../assets/icons/ssl.json";
import autoAnimation    from "../../assets/icons/Success.json";
import { useToast, ToastContainer } from "../../components/Toast";

/* ── Per-tool scan mode descriptions ─────────────────────────────────────── */
const SCAN_MODE_DESCRIPTIONS: Record<
  string,
  {
    color: string;
    quick: { title: string; detail: string; bullets: string[] };
    full:  { title: string; detail: string; bullets: string[] };
  }
> = {
  nmap: {
    color: "#00f2ff",
    quick: {
      title: "Quick Scan",
      detail: "Fast sweep of the 100 most common TCP ports.",
      bullets: [
        "Top 100 ports only (-F flag)",
        "Service & version detection (-sV)",
        "Estimated time: ~1–2 minutes",
      ],
    },
    full: {
      title: "Deep Scan",
      detail: "Exhaustive scan covering every port with OS fingerprinting and CVE probing.",
      bullets: [
        "All 65,535 TCP ports (-p-)",
        "OS fingerprinting + NSE scripts (-sC)",
        "CVE & vulnerability script checks",
        "Estimated time: ~5–15 minutes",
      ],
    },
  },
  nikto: {
    color: "#ff0055",
    quick: {
      title: "Quick Scan",
      detail: "Targets the most dangerous web misconfigurations.",
      bullets: [
        "Outdated server headers & versions",
        "Common dangerous files & directories",
        "Estimated time: ~1–2 minutes",
      ],
    },
    full: {
      title: "Deep Scan",
      detail: "Comprehensive web vulnerability audit against 6,700+ known issues.",
      bullets: [
        "All 6,700+ Nikto vulnerability checks",
        "Directory traversal, XSS, CGI abuse",
        "Injection point discovery",
        "Estimated time: ~3–5 minutes",
      ],
    },
  },
  sqlmap: {
    color: "#ffd54f",
    quick: {
      title: "Quick Scan",
      detail: "Rapid SQL injection probe on URL parameters and forms.",
      bullets: [
        "Level 1 / Risk 1 payloads",
        "Boolean-based, error-based & union injection",
        "HTML form auto-detection",
        "Estimated time: ~2–4 minutes",
      ],
    },
    full: {
      title: "Deep Scan",
      detail: "Advanced multi-technique SQLi probe with database enumeration.",
      bullets: [
        "Level 5 / Risk 3 — maximum coverage",
        "Time-based blind & stacked queries",
        "Site crawl up to 3 levels + form testing",
        "Database dump (--dump-all)",
        "Estimated time: ~5–10 minutes",
      ],
    },
  },
  sslscan: {
    color: "#00ff9d",
    quick: {
      title: "Quick Scan",
      detail: "Audits SSL/TLS protocols, cipher suites and certificate validity.",
      bullets: [
        "Deprecated protocols: SSLv2/v3, TLS 1.0/1.1",
        "Weak ciphers: RC4, NULL, EXPORT, DES",
        "Certificate expiry & mismatch check",
        "Estimated time: ~30 seconds",
      ],
    },
    full: {
      title: "Deep Scan",
      detail: "Same thorough audit — sslscan always runs a complete check.",
      bullets: [
        "All cipher suites + key exchange details",
        "Full certificate chain inspection",
        "Heartbleed vulnerability check",
        "Estimated time: ~30 seconds",
      ],
    },
  },
  auto: {
    color: "#ffffff",
    quick: {
      title: "Quick Scan",
      detail: "Sequentially runs all four tools in quick mode.",
      bullets: [
        "Nmap — top 100 ports",
        "Nikto — critical web checks",
        "SSLScan — TLS audit",
        "SQLMap — Level 1 injection probe",
        "Estimated time: ~5–8 minutes",
      ],
    },
    full: {
      title: "Deep Scan",
      detail: "All four tools in deep mode for a full-spectrum assessment.",
      bullets: [
        "Nmap — all 65,535 ports + OS + CVEs",
        "Nikto — 6,700+ vulnerability checks",
        "SSLScan — full cipher & cert chain",
        "SQLMap — Level 5 + crawl + dump",
        "Estimated time: ~15–25 minutes",
      ],
    },
  },
};

/* ── Tool accent colors ───────────────────────────────────────────────────── */
const TOOL_COLOR: Record<string, string> = {
  auto:    "#ffffff",
  nmap:    "#00f2ff",
  nikto:   "#ff0055",
  sqlmap:  "#ffd54f",
  sslscan: "#00ff9d",
};

/* ═══════════════════════════════════════════════════════════════════════════ */
const StartScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, authChecked, refreshUser } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [url,         setUrl]         = useState("");
  const [tool,        setTool]        = useState<ScanTool>("nmap");
  const [scanMode,    setScanMode]    = useState<"quick" | "full">("quick");
  const [scanLoading, setScanLoading] = useState(false);
  const [error,       setError]       = useState("");
  const [showModeModal, setShowModeModal] = useState(false);   // ← NEW
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const toolParam = searchParams.get("tool");
    if (toolParam) {
      const toolMap: Record<string, ScanTool> = {
        auto: "auto", all: "auto",
        nmap: "nmap", nikto: "nikto", sqlmap: "sqlmap",
        ssl: "sslscan", sslscan: "sslscan",
      };
      const mapped = toolMap[toolParam];
      if (mapped) setTool(mapped);
    }
  }, [searchParams]);

  if (!authChecked || authLoading) return null;

  const tools = [
    { id: "auto",    name: "Auto-Scan", desc: "Full Security Audit",    anim: autoAnimation,    color: "#fff",    tag: "ALL-IN-ONE",  tooltip: "Automated orchestration. Sequentially executes Nmap, Nikto, SSLScan, and SQLMap." },
    { id: "nmap",    name: "Nmap",      desc: "Network Reconnaissance", anim: nmapAnimation,    color: "#00f2ff", tag: "RECON",       tooltip: "Advanced port reconnaissance and OS fingerprinting engine." },
    { id: "nikto",   name: "Nikto",     desc: "Web Server Scanner",     anim: niktoAnimation,   color: "#ff0055", tag: "WEB VULN",   tooltip: "Comprehensive web server scanner. Identifies 6700+ dangerous files/programs." },
    { id: "sqlmap",  name: "SQLMap",    desc: "SQL Injection Probe",    anim: sqlmapAnimation,  color: "#ffd54f", tag: "DB AUDIT",   tooltip: "Automatic SQL injection detection. Boolean, error, union, time-based & stacked." },
    { id: "sslscan", name: "SSLScan",   desc: "TLS Configuration",      anim: sslscanAnimation, color: "#00ff9d", tag: "ENCRYPTION", tooltip: "SSL/TLS security auditor. Cipher suites, certificate validity, Heartbleed." },
  ] as const;

  const handleToolSelect = (toolId: string) => {
    if (scanLoading) return;
    setTool(toolId as ScanTool);
    const t = tools.find(t => t.id === toolId);
    if (t) addToast("info", `${t.name} Selected`, t.tooltip, 4000);
  };

  /* Clicking "Initialize Scan" validates then opens the mode modal */
  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (user && user.usedScan >= user.scanLimit) {
      const msg = `Daily limit reached (${user.scanLimit}). Buy Premium to run more scans.`;
      setError(msg);
      addToast("error", "Scan Limit Reached", msg, 4000);
      return;
    }
    if (!url.trim() || !url.startsWith("http")) {
      setError("Invalid Target: Please provide a valid URL (starting with http:// or https://).");
      addToast("error", "Invalid URL", "Please provide a valid target URL.", 4000);
      return;
    }

    // Reset to quick before showing modal
    setScanMode("quick");
    setShowModeModal(true);
  };

  /* Called after user selects a mode inside the modal */
  const launchScan = async (chosenMode: "quick" | "full") => {
    setScanMode(chosenMode);
    setShowModeModal(false);

    try {
      setScanLoading(true);
      const scanData = {
        targetUrl: url.trim().replace(/\/+$/, ""),
        scanType:  tool === "sslscan" ? "ssl" : tool === "auto" ? "all" : tool,
        scanMode:  chosenMode,
      };

      addToast("info", "Pinging Target", "Checking if the host is alive…", 2000);
      
      const response = await startScan(scanData);

      if (response?.data?.success) {
        await refreshUser();
        const scanId  = response.data.scanId || response.data.scan?._id || response.data.scans?.[0]?._id;
        const batchId = response.data.batchId;
        if (scanId) {
          addToast("success", "Scan Started", "Redirecting to scan progress…", 3000);
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
      const errMsg = err?.response?.data?.error || "Target Unreachable: Host seems offline or blocking connection.";
      setError(errMsg);
      addToast("error", "Connection Error", errMsg, 5000);
    } finally {
      setScanLoading(false);
    }
  };

  const scanLimit    = user?.scanLimit || 0;
  const usedScans    = user ? Math.min(user.usedScan, scanLimit) : 0;
  const usagePercent = scanLimit > 0 ? (usedScans / scanLimit) * 100 : 0;
  const accentColor  = TOOL_COLOR[tool] || "var(--cyber-primary)";
  const modeInfo     = SCAN_MODE_DESCRIPTIONS[tool];

  /* ── JSX ────────────────────────────────────────────────────────────────── */
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
            <p>Select tool &amp; target {isMobile && <Smartphone size={14} className="inline" />}</p>
          </div>
        </header>

        <div className={`scan-main-grid-v2 ${isMobile ? "mobile-layout" : ""}`}>
          {/* ── Form panel ── */}
          <div className="form-panel glass-panel">
            {error && (
              <div className="alert-box error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form className="scan-form-v2" onSubmit={handleInitialize}>
              {/* URL input */}
              <div className="input-group">
                <div className="label-row">
                  <label>Target URL</label>
                  <div className="usage-indicator">{usedScans} / {scanLimit}</div>
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

              {/* Tool selector */}
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

              {/* Initialize Scan button */}
              <button type="submit" className="launch-btn" disabled={scanLoading || !url.trim()}>
                {scanLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Launching…</span>
                  </>
                ) : (
                  <>
                    <Shield size={22} />
                    <span>{isMobile ? "Scan" : "Initialize Scan"}</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Sidebar (desktop only) ── */}
          {!isMobile && (
            <aside className="info-panel-v2">
              <div className="info-card glass-panel">
                <div className="card-header">
                  <Info size={18} className="text-primary" />
                  <span>Module Info</span>
                </div>
                <div className="module-details">
                  <h2 style={{ color: accentColor }}>{tools.find(t => t.id === tool)?.name}</h2>
                  <p className="desc-text">{tools.find(t => t.id === tool)?.tooltip}</p>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <label>Quick</label>
                      <strong>{modeInfo?.quick.title}</strong>
                    </div>
                    <div className="stat-item">
                      <label>Deep</label>
                      <strong>{modeInfo?.full.title}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SCAN MODE SELECTION MODAL — shows for ALL tools after clicking Initialize
      ══════════════════════════════════════════════════════════════════════ */}
      {showModeModal && modeInfo && (
        <div className="modal-overlay-premium scan-mode-overlay" onClick={() => setShowModeModal(false)}>
          <div className="scan-mode-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="scan-mode-modal-header">
              <div className="scan-mode-modal-title">
                <div className="scan-mode-tool-dot" style={{ background: accentColor, boxShadow: `0 0 12px ${accentColor}` }} />
                <div>
                  <p className="scan-mode-label">SCAN MODE — {tools.find(t => t.id === tool)?.name?.toUpperCase()}</p>
                  <h2 className="scan-mode-heading">Choose your scan intensity</h2>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setShowModeModal(false)}>
                <X size={22} />
              </button>
            </div>

            {/* Target info strip */}
            <div className="scan-mode-target-strip">
              <Globe size={14} />
              <span className="scan-mode-target-url">{url}</span>
            </div>

            {/* Mode cards */}
            <div className="scan-mode-cards">
              {/* ─── Quick Scan card ─── */}
              <div
                className={`scan-mode-card quick-card ${scanMode === "quick" ? "active" : ""}`}
                onClick={() => setScanMode("quick")}
              >
                <div className="smc-badge quick-badge">QUICK</div>
                <div className="smc-icon-wrap">
                  <Rocket size={28} />
                </div>
                <h3 className="smc-title">{modeInfo.quick.title}</h3>
                <p className="smc-detail">{modeInfo.quick.detail}</p>
                <ul className="smc-bullets">
                  {modeInfo.quick.bullets.map((b, i) => (
                    <li key={i}>
                      <span className="bullet-dot quick-dot" />
                      {b}
                    </li>
                  ))}
                </ul>
                {scanMode === "quick" && (
                  <div className="smc-selected-indicator">
                    <Zap size={16} fill="currentColor" />
                    <span>Selected</span>
                  </div>
                )}
              </div>

              {/* ─── Deep Scan card ─── */}
              <div
                className={`scan-mode-card deep-card ${scanMode === "full" ? "active" : ""}`}
                onClick={() => setScanMode("full")}
              >
                <div className="smc-badge deep-badge">DEEP</div>
                <div className="smc-icon-wrap">
                  <Clock size={28} />
                </div>
                <h3 className="smc-title">{modeInfo.full.title}</h3>
                <p className="smc-detail">{modeInfo.full.detail}</p>
                <ul className="smc-bullets">
                  {modeInfo.full.bullets.map((b, i) => (
                    <li key={i}>
                      <span className="bullet-dot deep-dot" />
                      {b}
                    </li>
                  ))}
                </ul>
                {scanMode === "full" && (
                  <div className="smc-selected-indicator deep-indicator">
                    <Zap size={16} fill="currentColor" />
                    <span>Selected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="scan-mode-footer">
              <button className="action-btn secondary" onClick={() => setShowModeModal(false)}>
                Cancel
              </button>
              <button
                className="launch-scan-confirm-btn"
                style={{ background: accentColor, color: accentColor === "#ffffff" || accentColor === "#ffd54f" ? "#000" : "#000" }}
                onClick={() => launchScan(scanMode)}
              >
                <Rocket size={18} />
                <span>Launch {scanMode === "quick" ? "Quick" : "Deep"} Scan</span>
                <ArrowRight size={18} />
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
