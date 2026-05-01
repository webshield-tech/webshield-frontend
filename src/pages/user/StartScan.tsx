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
import { startScan, pingTarget } from "../../api/scan-api";
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
        "Level 2 / Risk 1 payloads",
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
  gobuster: {
    color: "#ff8c00",
    quick: {
      title: "Quick Enumeration",
      detail: "Rapid directory sweep using a optimized common wordlist.",
      bullets: [
        "Common 50 directories sweep",
        "Fast response detection (-z)",
        "Estimated time: ~1–2 minutes",
      ],
    },
    full: {
      title: "Deep Discovery",
      detail: "Exhaustive directory and file brute-forcing.",
      bullets: [
        "Full wordlist enumeration",
        "Hidden file detection (.env, .git)",
        "Estimated time: ~5–10 minutes",
      ],
    },
  },
  ratelimit: {
    color: "#9d00ff",
    quick: {
      title: "Rate Limit Probe",
      detail: "Checks if the website has active rate and request limiters for APIs.",
      bullets: [
        "100 concurrent request burst",
        "API endpoint activity check",
        "Estimated time: ~30 seconds",
      ],
    },
    full: {
      title: "DDoS Resistance Audit",
      detail: "Intense stress test to verify WAF/Firewall request limiting and API stability.",
      bullets: [
        "Sustained 200+ request sequence",
        "API health & response consistency",
        "Estimated time: ~2 minutes",
      ],
    },
  },
  ffuf: {
    color: "#ff00ff",
    quick: {
      title: "Fast Fuzz",
      detail: "High-speed directory discovery with standard wordlist.",
      bullets: ["200/301 status filtering", "Multi-threaded execution", "Estimated time: ~1 min"],
    },
    full: {
      title: "Recursive Audit",
      detail: "Exhaustive recursive fuzzing for deep path discovery.",
      bullets: ["Full status code analysis", "Recursive depth discovery", "Estimated time: ~5 mins"],
    },
  },
  wapiti: {
    color: "#00d4ff",
    quick: {
      title: "Baseline Audit",
      detail: "Quick web application vulnerability assessment.",
      bullets: ["Common script vulnerabilities", "Misconfiguration check", "Estimated time: ~3 mins"],
    },
    full: {
      title: "Deep Crawler",
      detail: "Complete web application security audit with deep crawling.",
      bullets: ["Level 1 exhaustive crawling", "Injection & XSS audits", "Estimated time: ~10 mins"],
    },
  },
  nuclei: {
    color: "#ffd54f",
    quick: {
      title: "CVE Exposure",
      detail: "Fast scan for known CVEs and information exposures.",
      bullets: ["CVE template matching", "Exposure detection", "Estimated time: ~2 mins"],
    },
    full: {
      title: "Full Tech Audit",
      detail: "Complete Nuclei template suite execution.",
      bullets: ["Thousands of security templates", "Critical vulnerability check", "Estimated time: ~15 mins"],
    },
  },
  dns: {
    color: "#69f0ae",
    quick: {
      title: "Essential Check",
      detail: "Fast look up of your main website records.",
      bullets: ["A/MX/NS records", "Host verification", "Estimated time: ~30 secs"],
    },
    full: {
      title: "Full Audit",
      detail: "Deep dive into all technical domain settings.",
      bullets: ["All DNS records", "Infrastructure check", "Estimated time: ~1 min"],
    },
  },
  whois: {
    color: "#ffffff",
    quick: {
      title: "Owner Lookup",
      detail: "Quickly find out who owns this domain.",
      bullets: ["Registrar info", "Expiry date", "Estimated time: ~20 secs"],
    },
    full: {
      title: "Full Identity",
      detail: "Complete registration and server information.",
      bullets: ["Contact details", "Full name servers", "Estimated time: ~40 secs"],
    },
  },
  auto: {
    color: "#ffffff",
    quick: {
      title: "Quick Health Check",
      detail: "Runs 4 main tools in fast mode to find major bugs quickly.",
      bullets: [
        "Network Scout — checks top 100 doors",
        "Web Auditor — quick server check",
        "Lock Checker — basic encryption audit",
        "Database Guard — simple form probe",
        "Estimated time: ~5–8 minutes",
      ],
    },
    full: {
      title: "Full Security Audit",
      detail: "Runs all main tools in deep mode for maximum protection.",
      bullets: [
        "Network Scout — checks all 65,535 doors",
        "Web Auditor — 6,700+ deep server checks",
        "Lock Checker — full certificate chain audit",
        "Database Guard — deep database injection test",
        "Estimated time: ~15–25 minutes",
      ],
    },
  },
};

/* ── Tool accent colors ───────────────────────────────────────────────────── */
const TOOL_COLOR: Record<string, string> = {
  auto:      "#ffffff",
  nmap:      "#00f2ff",
  nikto:     "#ff0055",
  sqlmap:    "#ffd54f",
  sslscan:   "#00ff9d",
  gobuster:  "#ff8c00",
  ratelimit: "#9d00ff",
  ffuf:      "#ff00ff",
  wapiti:    "#00d4ff",
  nuclei:    "#ffd54f",
  dns:       "#69f0ae",
};

const TOOL_DAILY_LIMITS = [
  { id: "nmap", label: "Nmap", limit: 10, color: "#00f2ff" },
  { id: "nikto", label: "Nikto", limit: 10, color: "#ff0055" },
  { id: "sqlmap", label: "SQLMap", limit: 10, color: "#ffd54f" },
  { id: "sslscan", label: "SSLScan", limit: 10, color: "#00ff9d" },
  { id: "gobuster", label: "Gobuster", limit: 10, color: "#ff8c00" },
  { id: "ratelimit", label: "RateLimit", limit: 10, color: "#9d00ff" },
  { id: "ffuf", label: "FFUF", limit: 10, color: "#ff00ff" },
  { id: "wapiti", label: "Wapiti", limit: 10, color: "#00d4ff" },
  { id: "nuclei", label: "Nuclei", limit: 10, color: "#ffd54f" },
  { id: "dns", label: "DNS", limit: 10, color: "#69f0ae" },
  { id: "auto", label: "Auto", limit: 5, color: "#ffffff" },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════ */
const StartScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, authChecked, refreshUser } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [url,         setUrl]         = useState("");
  const [sqlmapUrl,   setSqlmapUrl]   = useState("");
  const [tool,        setTool]        = useState<ScanTool>("nmap");
  const [scanMode,    setScanMode]    = useState<"quick" | "full">("quick");
  const [scanLoading, setScanLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [hostVerified, setHostVerified] = useState(false);
  const [error,       setError]       = useState("");
  const [showModeModal, setShowModeModal] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);
  const [toolStats, setToolStats]     = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { getTodayStats } = await import("../../api/scan-api");
        const res = await getTodayStats();
        if (res.data?.success) {
          setToolStats({
            ...res.data.stats.byTool,
            auto: res.data.stats.autoUsed
          });
        }
      } catch (e) {
        console.warn("Failed to fetch tool stats", e);
      }
    };
    if (user) fetchStats();
  }, [user]);

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
    { id: "auto",    name: "Full Audit",   desc: "Smart Auto Scan (Multi-Tool)",   anim: autoAnimation,    color: "#fff",    tag: "ALL-IN-ONE",  tooltip: "Runs a smart multi-tool sequence (Nmap, Nuclei, Nikto, SSLScan, SQLMap, Wapiti, Gobuster, FFUF, RateLimit, DNS, WHOIS) based on live recon." },
    { id: "nmap",    name: "Nmap",         desc: "Network Mapper",          anim: nmapAnimation,    color: "#00f2ff", tag: "RECON",       tooltip: "Discovers open ports and services running on the target server." },
    { id: "nikto",   name: "Nikto",        desc: "Web Server Scanner",      anim: niktoAnimation,   color: "#ff0055", tag: "CONFIG",     tooltip: "Scans for outdated server software and dangerous files/configurations." },
    { id: "sqlmap",  name: "SQLMap",       desc: "SQL Injection Tool",      anim: sqlmapAnimation,  color: "#ffd54f", tag: "DATABASE",   tooltip: "Automatic SQL injection and database takeover tool." },
    { id: "sslscan", name: "SSLScan",      desc: "TLS/SSL Auditor",         anim: sslscanAnimation, color: "#00ff9d", tag: "HTTPS",       tooltip: "Tests SSL/TLS protocols and cipher suites for vulnerabilities." },
    { id: "gobuster", name: "Gobuster",     desc: "Directory Brute-force",   anim: nmapAnimation,    color: "#ff8c00", tag: "HIDDEN",      tooltip: "Discovers hidden directories and files on the web server." },
    { id: "ratelimit",name: "RateLimit",    desc: "API & Request Limiter",   anim: autoAnimation,    color: "#9d00ff", tag: "DDoS",        tooltip: "Checks if your website rate limiter and request limiter are active, and verifies if APIs are reachable." },
    { id: "ffuf",    name: "FFUF",         desc: "Fast Web Fuzzer",         anim: niktoAnimation,   color: "#ff00ff", tag: "EXPERT",      tooltip: "A fast web fuzzer written in Go, used for directory discovery." },
    { id: "wapiti",  name: "Wapiti",       desc: "Web App Auditor",         anim: nmapAnimation,    color: "#00d4ff", tag: "SCANNER",     tooltip: "Audits the security of your web applications by crawling them." },
    { id: "nuclei",  name: "Nuclei",       desc: "Template-based Scanner",  anim: sqlmapAnimation,  color: "#ffd54f", tag: "LIBRARY",     tooltip: "Fast and customizable vulnerability scanner based on simple YAML templates." },
    { id: "dns",     name: "DNS Recon",    desc: "Domain Inspector",        anim: autoAnimation,    color: "#69f0ae", tag: "DNS",         tooltip: "Enumerates DNS records and infrastructure details." },
    { id: "whois",   name: "Whois",        desc: "Domain Lookup",           anim: autoAnimation,    color: "#ffffff", tag: "IDENTITY",    tooltip: "Retrieves registration information for the target domain." },
  ] as const;

  const handlePingCheck = async () => {
    const normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      setError("Please enter a valid target URL starting with http:// or https://");
      addToast("error", "Invalid URL", "Invalid target format.", 3000);
      return;
    }

    try {
      setPingLoading(true);
      setError("");
      const response = await pingTarget(normalizedUrl);
      if (response.data.success) {
        setHostVerified(true);
        addToast("success", "Host Reachable", "Target is online. You can now select a tool and begin the scan.", 5000);
      } else {
        const offlineMessage = response.data.error || "Host is offline.";
        setError(offlineMessage);
        addToast("error", "Host Offline", offlineMessage, 4000);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Target Unreachable: Please check the URL.";
      setError(errMsg);
      addToast("error", "Host Offline", errMsg, 4000);
    } finally {
      setPingLoading(false);
    }
  };

  const handleToolSelect = (toolId: string) => {
    if (scanLoading) return;
    setTool(toolId as ScanTool);
    setSqlmapUrl(""); // Reset SQLMap URL when tool changes
    const t = tools.find(t => t.id === toolId);
    if (t) addToast("info", `${t.name} Selected`, t.tooltip, 4000);
  };

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const selectedToolLimit = TOOL_DAILY_LIMITS.find(t => t.id === tool);
    const usedForThisTool = toolStats[tool] || 0;

    if (selectedToolLimit && usedForThisTool >= selectedToolLimit.limit) {
      const msg = `Daily limit for ${selectedToolLimit.label} reached (${selectedToolLimit.limit}/${selectedToolLimit.limit}). Please try again tomorrow.`;
      setError(msg);
      addToast("error", "Tool Limit Reached", msg, 4000);
      return;
    }

    const normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      setError("Please enter a valid target URL starting with http:// or https://");
      addToast("error", "Invalid URL", "Invalid target format.", 3000);
      return;
    }

    // Only show modal for tools that support multiple modes
    const toolsWithModes = ["auto", "nmap", "nikto", "sqlmap", "sslscan"];
    if (toolsWithModes.includes(tool)) {
      setScanMode("quick");
      setShowModeModal(true);
    } else {
      // Launch directly for other tools
      launchScan("quick");
    }
  };

  const launchScan = async (chosenMode: "quick" | "full") => {
    setScanMode(chosenMode);
    setShowModeModal(false);

    try {
      setScanLoading(true);
      const scanData: any = {
        targetUrl: url.trim().replace(/\/+$/, ""),
        scanType:  tool === "sslscan" ? "ssl" : tool === "auto" ? "all" : tool,
        scanMode:  chosenMode,
      };

      // Include sqlmapUrl if SQLMap is involved
      if (tool === "sqlmap" && sqlmapUrl.trim()) {
        scanData.sqlmapUrl = sqlmapUrl.trim().replace(/\/+$/, "");
      }
      if (tool === "auto" && sqlmapUrl.trim()) {
        scanData.sqlmapUrl = sqlmapUrl.trim().replace(/\/+$/, "");
      }

      addToast("info", "Scan Initiated", `Launching ${tool.toUpperCase()} assessment…`, 3000);
      
      const response = await startScan(scanData);

      if (response?.data?.success) {
        // We navigate immediately; the next page will handle its own state/auth checks.
        // Removing refreshUser() here prevents accidental logouts if this call fails due to server load.
        const scanId  = response.data.scanId || response.data.scan?._id || response.data.scans?.[0]?._id;
        const batchId = response.data.batchId;
        if (scanId) {
          addToast("success", "Audit Started", "Redirecting to mission control…", 3000);
          if (batchId) {
            navigate(`/scan-progress/${scanId}?batchId=${encodeURIComponent(batchId)}`);
          } else {
            navigate(`/scan-progress/${scanId}`);
          }
        }
      } else {
        const err = response?.data?.error || "Initialization Failed.";
        setError(err);
        addToast("error", "Scan Failed", err, 4000);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Connection Error: Failed to start scan.";
      setError(errMsg);
      addToast("error", "Error", errMsg, 5000);
    } finally {
      setScanLoading(false);
    }
  };

  const scanLimit    = user?.scanLimit || 0;
  const usedScans    = user ? Math.min(user.usedScan, scanLimit) : 0;
  const usagePercent = scanLimit > 0 ? (usedScans / scanLimit) * 100 : 0;
  const accentColor  = TOOL_COLOR[tool] || "var(--cyber-primary)";
  const modeInfo     = SCAN_MODE_DESCRIPTIONS[tool];

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
            <h1>Security Audit Hub</h1>
            <p>Deploy scanners and assess infrastructure {isMobile && <Smartphone size={14} className="inline" />}</p>
          </div>
        </header>

        <div className={`scan-main-grid-v2 ${isMobile ? "mobile-layout" : ""}`}>
          <div className="form-panel glass-panel">
            {error && (
              <div className="alert-box error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form className="scan-form-v2" onSubmit={handleInitialize}>
              {/* --- TARGET INPUT --- */}
              <div className="input-group">
                <div className="label-row">
                  <label>
                    {tool === "auto" 
                      ? "Base URL (for Nmap, Nikto, SSLScan)" 
                      : tool === "sqlmap" 
                      ? "Target URL with Parameters"
                      : "Target Infrastructure URL"}
                  </label>
                </div>
                <div className="url-input-wrap">
                  <Globe className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder={
                      tool === "auto" 
                        ? "http://localhost:8080 or https://example.com" 
                        : tool === "sqlmap"
                        ? "http://localhost:8080/vulnerabilities/sqli/?id=1"
                        : "https://example.com"
                    }
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setHostVerified(false); }}
                    disabled={scanLoading}
                    required
                  />
                  {!hostVerified && tool !== "sqlmap" ? (
                    <button 
                      type="button" 
                      className="ping-verify-btn" 
                      onClick={handlePingCheck}
                      disabled={pingLoading || !url.trim()}
                      title="Verify if the host is alive (Optional)"
                    >
                      {pingLoading ? <Loader2 className="animate-spin" size={16} /> : <span>Check Availability</span>}
                    </button>
                  ) : hostVerified && tool !== "sqlmap" ? (
                    <div className="verified-tag">
                      <Rocket size={14} />
                      <span>ALIVE</span>
                    </div>
                  ) : null}
                </div>
                
                {/* SQLMap URL field for Auto Scan */}
                {tool === "auto" && (
                  <div className="url-input-wrap" style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "0.85rem", marginBottom: "8px", color: "rgba(0,242,255,0.7)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>⚠️ SQLMap URL (with parameters)</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          placeholder="http://localhost:8080/vulnerabilities/sqli/?id=1"
                          value={sqlmapUrl}
                          onChange={(e) => setSqlmapUrl(e.target.value)}
                          disabled={scanLoading}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(0,242,255,0.2)",
                            borderRadius: "6px",
                            color: "#fff",
                            fontFamily: "'Rajdhani', monospace",
                            fontSize: "0.9rem",
                          }}
                        />
                        <div style={{ fontSize: "0.75rem", marginTop: "6px", color: "rgba(0,242,255,0.6)" }}>
                          If left blank, will auto-detect for DVWA: /vulnerabilities/sqli/?id=1&Submit=Submit
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SQLMap guidance for single SQLMap mode */}
                {tool === "sqlmap" && (
                  <div style={{
                    background: "rgba(255,213,79,0.12)",
                    border: "1px solid rgba(255,213,79,0.3)",
                    borderRadius: "6px",
                    padding: "12px",
                    marginTop: "12px",
                    fontSize: "0.85rem",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: "#ffd54f" }}>💡 Parameter Required:</strong>
                    <div style={{ marginTop: "8px" }}>SQLMap needs an injection parameter in the URL:</div>
                    <div style={{ fontFamily: "'Rajdhani', monospace", fontSize: "0.8rem", marginTop: "8px", padding: "8px", background: "rgba(0,0,0,0.3)", borderRadius: "4px" }}>
                      <div>✓ ?id=1</div>
                      <div>✓ ?search=test</div>
                      <div>✓ ?user=admin&password=admin</div>
                      <div style={{ marginTop: "8px" }}>DVWA Example:</div>
                      <div>http://localhost:8080/vulnerabilities/sqli/?id=1&Submit=Submit</div>
                    </div>
                  </div>
                )}
                

                <div className="quota-summary">
                  {TOOL_DAILY_LIMITS.map((item) => (
                    <span key={item.id} className="quota-pill" style={{ color: item.color }}>
                      <strong>{item.label}</strong>
                      <small>{toolStats[item.id] || 0}/{item.limit}</small>
                    </span>
                  ))}
                </div>
              </div>

              {/* --- SCANNERS --- */}
              <div className="module-group" style={{ marginTop: '10px' }}>
                <label>Select Deployment Module</label>
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

              <button type="submit" className="launch-btn" disabled={scanLoading || !url.trim()} style={{ marginTop: '10px' }}>
                {scanLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Deploying…</span>
                  </>
                ) : (
                  <>
                    <Shield size={22} />
                    <span>{isMobile ? "Audit" : "Initialize Security Scan"}</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>
          </div>

          {!isMobile && (
            <aside className="info-panel-v2">
              <div className="info-card glass-panel">
                <div className="card-header">
                  <Info size={18} className="text-primary" />
                  <span>Scanner Configuration</span>
                </div>
                <div className="module-details">
                  <h2 style={{ color: accentColor }}>
                    {tools.find(t => t.id === tool)?.name}
                  </h2>
                  <p className="desc-text">
                    {tools.find(t => t.id === tool)?.tooltip}
                  </p>
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
