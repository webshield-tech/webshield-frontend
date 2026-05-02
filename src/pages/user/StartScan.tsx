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
import gobusterAnimation from "../../assets/icons/gobuster.json";
import ffufAnimation from "../../assets/icons/ffuf.json";
import wapitiAnimation from "../../assets/icons/wapiti.json";
import nucleiAnimation from "../../assets/icons/nuclie.json";
import dnsAnimation from "../../assets/icons/dns-recon.json";
import whoisAnimation from "../../assets/icons/whois.json";
import rateLimitAnimation from "../../assets/icons/rate-limit.json";
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
        "Traffic Guard — request throttling and API resistance check",
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

function buildSqlmapTarget(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (!parsed.searchParams.has("id")) {
      parsed.searchParams.set("id", parsed.search ? parsed.searchParams.get("id") || "1" : "1");
    }
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    if (trimmed.includes("?")) {
      return trimmed.includes("id=") ? trimmed : `${trimmed}&id=1`;
    }
    return `${trimmed}?id=1`;
  }
}

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
  const [tool,        setTool]        = useState<ScanTool>("nmap");
  const [scanMode,    setScanMode]    = useState<"quick" | "full">("quick");
  const [scanLoading, setScanLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [hostVerified, setHostVerified] = useState(false);
  const [error,       setError]       = useState("");
  const [showModeModal, setShowModeModal] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);
  const [toolStats, setToolStats]     = useState<Record<string, number>>({});
  const [scanFlow, setScanFlow]       = useState<"auto" | "manual">(
    searchParams.get("mode") === "manual" ? "manual" : "auto"
  );

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
        gobuster: "gobuster", ffuf: "ffuf", wapiti: "wapiti",
        nuclei: "nuclei", dns: "dns", whois: "whois", ratelimit: "ratelimit",
      };
      const mapped = toolMap[toolParam];
      if (mapped) {
        setTool(mapped);
        if (mapped !== "auto") setScanFlow("manual");
      }
    }
  }, [searchParams]);

  if (!authChecked || authLoading) return null;

  const tools = [
    { id: "auto",     name: "Auto Scan",     desc: "Recon-driven smart sequence", anim: autoAnimation,     color: "#fff",    tag: "SMART",    tooltip: "Runs a smart sequence based on live reconnaissance: platform detection first, then only the tools the target actually needs." },
    { id: "nmap",     name: "Nmap",          desc: "Network Mapper",              anim: nmapAnimation,     color: "#00f2ff", tag: "RECON",    tooltip: "Discovers open ports and exposed services." },
    { id: "nikto",    name: "Nikto",         desc: "Web Server Scanner",          anim: niktoAnimation,    color: "#ff0055", tag: "CONFIG",   tooltip: "Scans for outdated server software and common misconfigurations." },
    { id: "sqlmap",   name: "SQLMap",        desc: "SQL Injection Tool",          anim: sqlmapAnimation,   color: "#ffd54f", tag: "DATABASE", tooltip: "Checks parameterized URLs and forms for SQL injection." },
    { id: "sslscan",  name: "SSLScan",       desc: "TLS/SSL Auditor",             anim: sslscanAnimation,  color: "#00ff9d", tag: "HTTPS",    tooltip: "Tests TLS protocols, certificates, and cipher strength." },
    { id: "gobuster", name: "Gobuster",      desc: "Directory Discovery",         anim: gobusterAnimation, color: "#ff8c00", tag: "HIDDEN",   tooltip: "Finds hidden directories, files, and admin paths." },
    { id: "ratelimit",name: "RateLimit",     desc: "Request Throttle Check",      anim: rateLimitAnimation,color: "#9d00ff", tag: "DDoS",     tooltip: "Checks rate limiting and request throttling behavior." },
    { id: "ffuf",     name: "FFUF",          desc: "Fast Web Fuzzer",             anim: ffufAnimation,     color: "#ff00ff", tag: "EXPERT",   tooltip: "Fuzzes for hidden routes and parameter space quickly." },
    { id: "wapiti",   name: "Wapiti",        desc: "Web App Auditor",             anim: wapitiAnimation,   color: "#00d4ff", tag: "SCANNER",  tooltip: "Crawls the app to find XSS, CSRF, and input flaws." },
    { id: "nuclei",   name: "Nuclei",        desc: "Template Scanner",            anim: nucleiAnimation,   color: "#ffd54f", tag: "TEMPLATES",tooltip: "Runs template-based checks for common exposures and CVEs." },
    { id: "dns",      name: "DNS Recon",     desc: "Domain Inspector",            anim: dnsAnimation,      color: "#69f0ae", tag: "DOMAIN",   tooltip: "Enumerates DNS records and infrastructure details." },
    { id: "whois",    name: "Whois",         desc: "Domain Lookup",               anim: whoisAnimation,    color: "#ffffff", tag: "IDENTITY", tooltip: "Retrieves registration information for the target domain." },
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

      if (tool === "sqlmap") {
        scanData.sqlmapUrl = buildSqlmapTarget(scanData.targetUrl);
      }
      if (tool === "auto") {
        scanData.sqlmapUrl = buildSqlmapTarget(scanData.targetUrl);
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
  const autoTools = tools.filter((t) => ["nmap", "nikto", "sslscan", "sqlmap", "nuclei", "ratelimit"].includes(t.id));
  const smartSequence = [
    { title: "1. Platform detection", detail: "Identify hosting, stack, and CMS signals first." },
    { title: "2. Network scan", detail: "Run Nmap to map live services and ports." },
    { title: "3. Web validation", detail: "Use Nikto and SSLScan to review web and TLS hardening." },
    { title: "4. Input checks", detail: "Run SQLMap or Wapiti only when forms or backend signals exist." },
    { title: "5. Deep discovery", detail: "Gobuster, FFUF, DNS, Whois, and RateLimit run only on deeper targets." },
  ];

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
              <div className="target-panel glass-panel">
                <div className="input-group">
                <div className="label-row">
                  <label>
                    Target URL
                  </label>
                </div>
                <div className="url-input-wrap">
                  <Globe className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder={
                      scanFlow === "auto"
                        ? "http://localhost:8080 or https://example.com" 
                        : "https://example.com"
                    }
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setHostVerified(false); }}
                    disabled={scanLoading}
                    required
                  />
                  {!hostVerified ? (
                    <button 
                      type="button" 
                      className="ping-verify-btn" 
                      onClick={handlePingCheck}
                      disabled={pingLoading || !url.trim()}
                      title="Verify if the host is alive (Optional)"
                    >
                      {pingLoading ? <Loader2 className="animate-spin" size={16} /> : <span>Check Availability</span>}
                    </button>
                  ) : (
                    <div className="verified-tag">
                      <Rocket size={14} />
                      <span>ALIVE</span>
                    </div>
                  )}
                </div>

                <div className="url-hint-row">
                  <div className="url-hint-pill">
                    <Info size={14} />
                    <span>Check availability first, then choose Auto Scan or Manual Tool Scan.</span>
                  </div>
                  {(tool === "sqlmap" || scanFlow === "auto") && (
                    <div className="sqlmap-hint-pill">
                      <Info size={14} />
                      <span>SQLMap auto-adds a safe parameter like <strong>?id=1</strong> when needed.</span>
                    </div>
                  )}
                </div>

                <div className="quota-summary">
                  {TOOL_DAILY_LIMITS.map((item) => (
                    <span key={item.id} className="quota-pill" style={{ color: item.color }}>
                      <strong>{item.label}</strong>
                      <small>{toolStats[item.id] || 0}/{item.limit}</small>
                    </span>
                  ))}
                </div>
              </div>

              <div className="scan-flow-toggle">
                <button
                  type="button"
                  className={`flow-toggle-btn ${scanFlow === "auto" ? "active" : ""}`}
                  onClick={() => { setScanFlow("auto"); setTool("auto"); }}
                >
                  Auto Scan
                </button>
                <button
                  type="button"
                  className={`flow-toggle-btn ${scanFlow === "manual" ? "active" : ""}`}
                  onClick={() => { setScanFlow("manual"); if (tool === "auto") setTool("nmap"); }}
                >
                  Manual Tool Scan
                </button>
              </div>

              {scanFlow === "auto" && (
                <div className="smart-sequence-panel glass-panel">
                  <div className="card-header">
                    <Info size={18} className="text-primary" />
                    <span>What Auto Scan Does</span>
                  </div>
                  <p className="smart-sequence-copy">
                    Auto scan checks the platform first and then runs only the tools that make sense for the target.
                    It is the recommended option when you want a guided scan without choosing tools one by one.
                  </p>
                  <div className="smart-sequence-grid">
                    {smartSequence.map((step) => (
                      <div key={step.title} className="smart-sequence-step">
                        <strong>{step.title}</strong>
                        <span>{step.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              </div>

              {/* --- SCANNERS --- */}
              <div className="module-group" style={{ marginTop: '10px' }}>
                <label>{scanFlow === "auto" ? "Auto Scan Plan" : "Select Deployment Module"}</label>
                {scanFlow === "auto" && (
                  <p className="module-helper-text">
                    Auto scan starts with the smallest safe checks and expands only when the target shows backend, input, or TLS signals.
                  </p>
                )}
                {scanFlow === "auto" ? (
                  <div className="auto-tools-info">
                    <div className="auto-tools-header">
                      <Shield size={18} className="text-primary" />
                      <span>Tools used in Auto Scan</span>
                    </div>
                    <p className="auto-tools-copy">
                      These tools are run automatically by the backend depending on the target. You do not select them here.
                    </p>
                    <div className="auto-tools-grid">
                      {autoTools.map((t) => (
                        <div key={t.id} className="auto-tool-card" style={{ "--accent-color": t.color } as any}>
                          <Lottie animationData={t.anim} loop className="auto-tool-icon" />
                          <div>
                            <h3>{t.name}</h3>
                            <p>{t.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              <button type="submit" className="launch-btn" disabled={scanLoading || !url.trim()} style={{ marginTop: '10px' }}>
                {scanLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>{scanFlow === "auto" ? "Running Smart Sequence…" : "Deploying…"}</span>
                  </>
                ) : (
                  <>
                    <Shield size={22} />
                    <span>{scanFlow === "auto" ? (isMobile ? "Auto Audit" : "Initialize Auto Scan") : (isMobile ? "Audit" : "Initialize Security Scan")}</span>
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
