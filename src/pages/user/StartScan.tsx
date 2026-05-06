/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Shield, Globe, Info, AlertCircle, ArrowRight, Loader2,
  X, Rocket, Clock, Search, CheckCircle2, Database, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { startScan, pingTarget, detectWebsite, dnsLookupInline, whoisLookupInline, getToolAvailability } from "../../api/scan-api";
import type { ScanTool } from "../../utils/types";
import "../../styles/start-scan.css";
import Lottie from "lottie-react";

import nmapAnimation    from "../../assets/icons/nmap.json";
import niktoAnimation   from "../../assets/icons/nikto.json";
import sqlmapAnimation  from "../../assets/icons/sql.json";
import sslscanAnimation from "../../assets/icons/ssl.json";

import gobusterAnimation from "../../assets/icons/gobuster.json";
import ffufAnimation from "../../assets/icons/ffuf.json";
import wapitiAnimation from "../../assets/icons/wapiti.json";
import nucleiAnimation from "../../assets/icons/nuclie.json";
import dnsAnimation from "../../assets/icons/dns-recon.json";
import whoisAnimation from "../../assets/icons/whois.json";
import rateLimitAnimation from "../../assets/icons/rate-limit.json";


import { useToast, ToastContainer } from "../../components/Toast";

/* ── Per-tool scan mode descriptions ─────────────────────────────────────── */
const SCAN_MODE_DESCRIPTIONS: Record<string, any> = {
  nmap: { color: "#00f2ff", quick: { title: "Quick Scan", detail: "Fast sweep of the 100 most common TCP ports.", bullets: ["Top 100 ports only", "Service & version detection", "~1–2 mins"] }, full: { title: "Deep Scan", detail: "Exhaustive scan covering every port.", bullets: ["All 65,535 TCP ports", "OS fingerprinting + NSE scripts", "CVE & vulnerability checks", "~5–15 mins"] } },
  nikto: { color: "#ff0055", quick: { title: "Quick Scan", detail: "Targets the most dangerous web misconfigurations.", bullets: ["Outdated server headers", "Common dangerous files", "~1–2 mins"] }, full: { title: "Deep Scan", detail: "Comprehensive web vulnerability audit.", bullets: ["All 6,700+ Nikto checks", "Directory traversal, XSS", "Injection point discovery", "~3–5 mins"] } },
  sqlmap: { color: "#ffd54f", quick: { title: "Quick Scan", detail: "Rapid SQL injection probe.", bullets: ["Level 2 / Risk 1 payloads", "HTML form auto-detection", "~2–4 mins"] }, full: { title: "Deep Scan", detail: "Advanced multi-technique SQLi probe.", bullets: ["Level 5 / Risk 3", "Time-based blind queries", "Site crawl up to 3 levels", "~5–10 mins"] } },
  sslscan: { color: "#00ff9d", quick: { title: "Quick Scan", detail: "Audits SSL/TLS protocols.", bullets: ["Deprecated protocols", "Weak ciphers", "Certificate expiry", "~30 secs"] }, full: { title: "Deep Scan", detail: "Same thorough audit.", bullets: ["All cipher suites", "Full certificate chain", "Heartbleed check", "~30 secs"] } },
  gobuster: { color: "#ff8c00", quick: { title: "Quick Enumeration", detail: "Rapid directory sweep.", bullets: ["Common 50 directories", "Fast response detection", "~1–2 mins"] }, full: { title: "Deep Discovery", detail: "Exhaustive directory and file brute-forcing.", bullets: ["Full wordlist enumeration", "Hidden file detection", "~5–10 mins"] } },
  ratelimit: { color: "#9d00ff", quick: { title: "Rate Limit Probe", detail: "Checks if the website has active rate limiters.", bullets: ["100 concurrent request burst", "API endpoint activity", "~30 secs"] }, full: { title: "DDoS Resistance Audit", detail: "Intense stress test for WAF/Firewall.", bullets: ["Sustained 200+ requests", "API health check", "~2 mins"] } },
  ffuf: { color: "#ff00ff", quick: { title: "Fast Fuzz", detail: "High-speed directory discovery.", bullets: ["200/301 status filtering", "Multi-threaded", "~1 min"] }, full: { title: "Recursive Audit", detail: "Exhaustive recursive fuzzing.", bullets: ["Full status code analysis", "Recursive depth", "~5 mins"] } },
  wapiti: { color: "#00d4ff", quick: { title: "Baseline Audit", detail: "Quick web vulnerability assessment (XSS, SSRF, Injection).", bullets: ["XSS and SSRF detection", "SQL injection checks", "Misconfiguration audit", "~3 mins"] }, full: { title: "Deep Crawler", detail: "Complete web app security audit with XSS and SSRF coverage.", bullets: ["Level 1 exhaustive crawling", "Cross-Site Scripting detection", "Server-Side Request Forgery (SSRF) detection", "All injection types", "~10 mins"] } },
  nuclei: { color: "#ffd54f", quick: { title: "CVE Exposure", detail: "Fast scan for known CVEs.", bullets: ["CVE template matching", "Exposure detection", "~2 mins"] }, full: { title: "Full Tech Audit", detail: "Complete Nuclei template suite.", bullets: ["Thousands of templates", "Critical vulnerability check", "~15 mins"] } },
};

// ✅ UPDATED: Separated DNS/WHOIS into their own category for Domain Reconnaissance
const RECON_TOOLS = ["dns", "whois"];
const INLINE_TOOLS: string[] = []; // Keep for backward compat but empty

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
];

const StartScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, authChecked } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [url, setUrl] = useState("");
  const [scanFlow, setScanFlow] = useState<"auto" | "manual">(searchParams.get("mode") === "manual" ? "manual" : "auto");
  const [tool, setTool] = useState<ScanTool>("nmap");
  const [reconTool, setReconTool] = useState<"dns" | "whois">("dns");
  const [scanMode, setScanMode] = useState<"quick" | "full">("quick");

  const [scanLoading, setScanLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);
  const [reconLoading, setReconLoading] = useState(false);

  const [detectionData, setDetectionData] = useState<any>(null);
  const [reconResult, setReconResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [showModeModal, setShowModeModal] = useState(false);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [toolStats, setToolStats] = useState<Record<string, number>>({});
  const [toolAvailability, setToolAvailability] = useState<{ byTool: Record<string, boolean>; available: string[]; missing: string[] } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { getTodayStats } = await import("../../api/scan-api");
        const res = await getTodayStats();
        if (res.data?.success) {
          setToolStats({ ...res.data.stats.byTool, auto: res.data.stats.autoUsed });
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
    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        const res = await getToolAvailability();
        if (res.data?.success) {
          setToolAvailability(res.data.availability);
        }
      } catch (e) {
        console.warn("Failed to fetch tool availability", e);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    if (user) fetchAvailability();
  }, [user]);

  const tools = [
    { id: "nmap",     name: "Nmap",          desc: "Network Mapper",              anim: nmapAnimation,     color: "#00f2ff", tag: "RECON" },
    { id: "nikto",    name: "Nikto",         desc: "Web Server Scanner",          anim: niktoAnimation,    color: "#ff0055", tag: "CONFIG" },
    { id: "sqlmap",   name: "SQLMap",        desc: "SQL Injection Tool",          anim: sqlmapAnimation,   color: "#ffd54f", tag: "DATABASE" },
    { id: "sslscan",  name: "SSLScan",       desc: "TLS/SSL Auditor",             anim: sslscanAnimation,  color: "#00ff9d", tag: "HTTPS" },
    { id: "gobuster", name: "Gobuster",      desc: "Directory Discovery",         anim: gobusterAnimation, color: "#ff8c00", tag: "HIDDEN" },
    { id: "ratelimit",name: "RateLimit",     desc: "Request Throttle Check",      anim: rateLimitAnimation,color: "#9d00ff", tag: "DDoS" },
    { id: "ffuf",     name: "FFUF",          desc: "Fast Web Fuzzer",             anim: ffufAnimation,     color: "#ff00ff", tag: "EXPERT" },
    { id: "wapiti",   name: "Wapiti",        desc: "Web App Auditor (XSS, SSRF)", anim: wapitiAnimation,   color: "#00d4ff", tag: "SCANNER" },
    { id: "nuclei",   name: "Nuclei",        desc: "Template Scanner",            anim: nucleiAnimation,   color: "#ffd54f", tag: "TEMPLATES" },
    { id: "dns",      name: "DNS Lookup",    desc: "Domain Inspector (Inline)",   anim: dnsAnimation,      color: "#69f0ae", tag: "INFO" },
    { id: "whois",    name: "Whois Lookup",  desc: "Domain Owner (Inline)",       anim: whoisAnimation,    color: "#ffffff", tag: "INFO" },
  ] as const;

  const availabilityMap = toolAvailability?.byTool || {};
  const isToolAvailable = (toolId: string) => availabilityMap[toolId] !== false;
  const missingTools = toolAvailability?.missing || [];
  const missingToolNames = Array.from(new Set(missingTools
    .map((id) => tools.find(t => t.id === id)?.name || (id === "ssl" ? "SSLScan" : id.toUpperCase()))));
  const showAvailabilityWarning = missingToolNames.length > 0;
  const showAvailabilityLoading = availabilityLoading && !toolAvailability;

  // ✅ UPDATED: Separated recon tools (DNS/WHOIS) from scanner tools
  const scannerTools = tools.filter(t => !RECON_TOOLS.includes(t.id));
  const reconTools = tools.filter(t => RECON_TOOLS.includes(t.id));
  const autoTools = tools.filter(t => ["nmap", "nikto", "sslscan", "sqlmap", "wapiti", "nuclei"].includes(t.id));

  if (!authChecked || authLoading) return null;

  const handleDetectWebsite = async () => {
    const normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      setError("Please enter a valid target URL starting with http:// or https://");
      addToast("error", "Invalid URL", "Invalid target format.", 3000);
      return;
    }
    try {
      setDetectLoading(true);
      setError("");
      setDetectionData(null);
      const res = await detectWebsite(normalizedUrl);
      if (res.data.success) {
        setDetectionData(res.data.detection);
        addToast("success", "Detection Complete", `Website detected as: ${res.data.detection.siteType}`, 4000);
      } else {
        setError(res.data.error || "Detection failed.");
        addToast("error", "Detection Failed", res.data.error || "Could not detect website.", 4000);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Connection Error.";
      setError(errMsg);
      addToast("error", "Detection Error", errMsg, 4000);
    } finally {
      setDetectLoading(false);
    }
  };

  const handlePingCheck = async () => {
    const normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      setError("Please enter a valid target URL starting with http:// or https://");
      return;
    }
    try {
      setPingLoading(true);
      setError("");
      const response = await pingTarget(normalizedUrl);
      if (response.data.success) {
        addToast("success", "Host Reachable", "Target is online.", 3000);
      } else {
        setError(response.data.error || "Host is offline.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Target Unreachable.");
    } finally {
      setPingLoading(false);
    }
  };

  const handleReconLookup = async () => {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) {
      setError("Please enter a domain or URL.");
      return;
    }
    try {
      setReconLoading(true);
      setError("");
      setReconResult(null);
      let res;
      if (reconTool === "dns") res = await dnsLookupInline(normalizedUrl);
      else if (reconTool === "whois") res = await whoisLookupInline(normalizedUrl);

      if (res && res.data.success) {
        setReconResult(res.data);
        addToast("success", "Lookup Complete", "Data retrieved successfully.", 3000);
      } else {
        setError(res?.data?.error || "Lookup failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Connection Error.");
    } finally {
      setReconLoading(false);
    }
  };

  const ensureAutoDetection = async () => {
    const normalizedUrl = url.trim();
    if (detectionData) return detectionData;

    const res = await detectWebsite(normalizedUrl);
    if (!res.data.success) {
      throw new Error(res.data.error || "Website detection failed.");
    }

    setDetectionData(res.data.detection);
    return res.data.detection;
  };

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ UPDATED: Separated recon tools handling
    if (scanFlow === "manual" && RECON_TOOLS.includes(tool)) {
      handleReconLookup();
      return;
    }

    if (scanFlow === "manual" && !isToolAvailable(tool)) {
      const msg = "Selected tool is not available on the server.";
      setError(msg);
      addToast("error", "Tool Unavailable", msg, 4000);
      return;
    }

    const limitId = scanFlow === "auto" ? "auto" : tool;
    const limitObj = scanFlow === "auto" ? { limit: 5, label: "Auto Scan" } : TOOL_DAILY_LIMITS.find(t => t.id === tool);
    const used = toolStats[limitId] || 0;

    if (limitObj && used >= limitObj.limit) {
      setError(`Daily limit for ${limitObj.label} reached (${used}/${limitObj.limit}). Try again tomorrow.`);
      return;
    }

    const normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      setError("Please enter a valid target URL starting with http:// or https://");
      return;
    }

    if (scanFlow === "auto") {
      try {
        const autoDetection = await ensureAutoDetection();
        if (!autoDetection?.isAlive) {
          setError("The target is not reachable, so auto scan cannot start.");
          return;
        }

        if (missingToolNames.length > 0) {
          addToast("info", "Limited Tooling", `Some scanners are missing: ${missingToolNames.join(", ")}`, 5000);
        }

        // Show detection modal before launching scan
        setShowDetectionModal(true);
      } catch (autoDetectError: any) {
        const msg = autoDetectError?.response?.data?.error || autoDetectError?.message || "Website detection failed.";
        setError(msg);
        addToast("error", "Detection Failed", msg, 4000);
      }
    } else {
      setScanMode("quick");
      setShowModeModal(true);
    }
  };

  const launchScan = async (chosenMode: "quick" | "full", autoDetection?: any) => {
    setScanMode(chosenMode);
    setShowModeModal(false);

    try {
      setScanLoading(true);
      const scanData: any = {
        targetUrl: url.trim().replace(/\/+$/, ""),
        scanType:  scanFlow === "auto" ? "all" : (tool === "sslscan" ? "ssl" : tool),
        scanMode:  chosenMode,
        ...(scanFlow === "auto" && autoDetection ? { options: { detectionData: autoDetection } } : {}),
      };

      addToast("info", "Scan Initiated", `Launching ${scanFlow === "auto" ? "Auto Scan" : tool.toUpperCase()}…`, 3000);
      const response = await startScan(scanData);

      if (response?.data?.success) {
        const scanId = response.data.scanId || response.data.scan?._id || response.data.scans?.[0]?._id;
        const batchId = response.data.batchId;
        if (scanId) {
          addToast("success", "Audit Started", "Redirecting…", 3000);
          if (scanFlow === "auto" && batchId) {
            navigate(`/scan-progress/${scanId}?batchId=${encodeURIComponent(batchId)}`);
          } else if (batchId) {
            navigate(`/scan-progress/${scanId}?batchId=${batchId}`);
          } else {
            navigate(`/scan-progress/${scanId}`);
          }
        }
      } else {
        setError(response?.data?.error || "Initialization Failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Connection Error: Failed to start scan.");
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className={`scan-page-premium ${isMobile ? "mobile" : ""}`}>
      <div className="noise-overlay"></div>
      <div className="scan-content-wrap">
        <header className="scan-header-v2">
          <div className="header-text">
            <h1>Security Audit Hub</h1>
            <p>Deploy scanners and assess infrastructure</p>
          </div>
          <div className="scan-flow-toggle">
            <button
              className={`flow-toggle-btn ${scanFlow === "auto" ? "active" : ""}`}
              onClick={() => { setScanFlow("auto"); setError(""); setInlineResult(null); }}
            >
              Auto Scan (Smart)
            </button>
            <button
              className={`flow-toggle-btn ${scanFlow === "manual" ? "active" : ""}`}
              onClick={() => { setScanFlow("manual"); setTool("nmap"); setError(""); }}
            >
              Manual Tool Scan
            </button>
          </div>
        </header>

        {error && (
          <div className="alert-box error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {showAvailabilityLoading && (
          <div className="alert-box warning">
            <Loader2 className="animate-spin" size={18} />
            <span>Checking tool availability on the server…</span>
          </div>
        )}

        {showAvailabilityWarning && (
          <div className="alert-box warning">
            <AlertCircle size={20} />
            <span>Some scanner tools are missing on the server: {missingToolNames.join(", ")}. Scans that rely on them may be limited.</span>
          </div>
        )}

        {/* ── AUTO SCAN SECTION ── */}
        {scanFlow === "auto" && (
          <div className="auto-scan-section">
            <div className="target-panel glass-panel">
              <div className="input-group">
                <label>Target URL to Assess</label>
                <div className="url-input-wrap">
                  <Globe className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setDetectionData(null); }}
                    disabled={scanLoading || detectLoading}
                  />
                  <button type="button" className="ping-verify-btn" onClick={handleDetectWebsite} disabled={detectLoading || !url.trim()}>
                    {detectLoading ? <Loader2 className="animate-spin" size={16} /> : <><Search size={16} /> Check & Detect</>}
                  </button>
                </div>
              </div>

              {/* Colorful Limit Info */}
              <div className="quota-summary" style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                <span className="quota-pill" style={{ color: "#00ff9d", fontSize: "1rem", padding: "12px 24px", background: "rgba(0, 255, 157, 0.1)", border: "1px solid rgba(0, 255, 157, 0.3)" }}>
                  <strong>Auto Scans Remaining Today:</strong>
                  <span style={{ marginLeft: 8, fontSize: "1.2rem", fontWeight: "bold" }}>{Math.max(0, 5 - (toolStats.auto || 0))} / 5</span>
                </span>
              </div>
            </div>

            {/* Detection Results Panel */}
            {detectionData && (
              <div className="smart-sequence-panel glass-panel" style={{ marginTop: 24, border: "1px solid #00f2ff", background: "rgba(0,242,255,0.03)" }}>
                <div className="card-header" style={{ color: "#00f2ff" }}>
                  <Shield size={18} />
                  <span>Website Detection Results</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                  <div>
                    <p style={{ margin: "4px 0", color: "#fff" }}><strong>Type:</strong> <span style={{ color: "var(--cyber-text-dim)" }}>{detectionData.siteType}</span></p>
                    <p style={{ margin: "4px 0", color: "#fff" }}><strong>Status:</strong> <span style={{ color: "#00ff9d" }}>Online & Reachable</span></p>
                    <p style={{ margin: "4px 0", color: "#fff" }}><strong>TLS/SSL:</strong> <span style={{ color: detectionData.hasSSL ? "#00ff9d" : "#ff4d4d" }}>{detectionData.hasSSL ? "Enabled" : "Not Detected"}</span></p>
                  </div>
                  <div>
                    <p style={{ margin: "4px 0", color: "#fff" }}><strong>Forms/Inputs:</strong> <span style={{ color: detectionData.hasInputForms ? "#00f2ff" : "var(--cyber-text-dim)" }}>{detectionData.hasInputForms ? "Detected" : "None"}</span></p>
                    <p style={{ margin: "4px 0", color: "#fff" }}><strong>Static Framework:</strong> <span style={{ color: detectionData.isStaticFrontend ? "#ff8c00" : "var(--cyber-text-dim)" }}>{detectionData.isStaticFrontend ? "Yes" : "No"}</span></p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", margin: "32px 0 16px 0", gap: 12, flexWrap: "wrap" }}>
              <button onClick={handleInitialize} className="launch-btn" style={{ padding: "18px 48px", fontSize: "1.1rem", borderRadius: 24 }} disabled={scanLoading || !url.trim()}>
                {scanLoading ? <Loader2 className="animate-spin" size={20} /> : <Rocket size={20} />}
                <span>Start Auto Scan</span>
              </button>
              {!isMobile && (
                <p style={{ fontSize: "0.85rem", color: "#88f", margin: "auto 0", maxWidth: "300px" }}>
                  ✓ Smart detection runs optimal tools based on website type
                </p>
              )}
            </div>

            <div className="auto-tools-info glass-panel">
              <div className="auto-tools-header">
                <Info size={18} className="text-primary" />
                <span>Included Tools</span>
              </div>
              <p className="auto-tools-copy">
                Auto scan intelligently detects whether your target is a static frontend or full-stack backend, then runs the optimal security tools for that type.
              </p>
              <div className="auto-tools-grid" style={{ gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12 }}>
                {autoTools.map((t) => (
                  <div key={t.id} className="auto-tool-card" style={{ "--accent-color": t.color } as any}>
                    <Lottie animationData={t.anim} loop={false} className="auto-tool-icon" />
                    <div>
                      <h3>{t.name}</h3>
                      <p>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MANUAL SCAN SECTION ── */}
        {scanFlow === "manual" && (
          <div className={`scan-main-grid-v2 ${isMobile ? "mobile-layout" : ""}`}>
            <div className="form-panel glass-panel">
              <div className="target-panel glass-panel" style={{ marginBottom: 24 }}>
                <div className="input-group">
                  <label>{INLINE_TOOLS.includes(tool) ? "Target Domain" : "Target URL"}</label>
                  <div className="url-input-wrap">
                    <Globe className="input-icon" size={20} />
                    <input
                      type="text"
                      placeholder={INLINE_TOOLS.includes(tool) ? "example.com" : "https://example.com"}
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); }}
                      disabled={scanLoading || inlineLoading}
                    />
                    {!INLINE_TOOLS.includes(tool) && (
                      <button type="button" className="ping-verify-btn" onClick={handlePingCheck} disabled={pingLoading || !url.trim()}>
                        {pingLoading ? <Loader2 className="animate-spin" size={16} /> : <span>Check Availability</span>}
                      </button>
                    )}
                  </div>
                </div>

                <div className="quota-summary" style={{ marginTop: 16 }}>
                  {TOOL_DAILY_LIMITS.map((item) => (
                    <span key={item.id} className="quota-pill" style={{ color: item.color, opacity: tool === item.id ? 1 : 0.5, borderColor: tool === item.id ? item.color : "transparent" }}>
                      <strong>{item.label}</strong>
                      <small>{toolStats[item.id] || 0}/{item.limit}</small>
                    </span>
                  ))}
                </div>
              </div>

              <div className="module-group">
                <label>Scanner Tools (One at a time)</label>
                <p className="module-helper-text">Deep and quick scans run one scanner at a time and show progress.</p>
                <div className={`module-selector ${isMobile ? "mobile-grid" : ""}`}>
                  {scannerTools.map((t) => {
                    const available = isToolAvailable(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`module-card ${tool === t.id ? "selected" : ""} ${!available ? "unavailable" : ""}`}
                        onClick={() => { if (!available) return; setTool(t.id as ScanTool); setInlineResult(null); }}
                        style={{ "--accent-color": t.color } as any}
                      >
                        <div className="module-tag">{t.tag}</div>
                        {!available && <div className="module-unavailable">Unavailable</div>}
                        <div className="module-icon">
                          <Lottie animationData={t.anim} loop={false} className="lottie-mini" />
                        </div>
                        <div className="module-info">
                          <h3>{t.name}</h3>
                          <p>{t.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="module-group recon-group">
                <label>Domain Reconnaissance</label>
                <p className="module-helper-text">Quick DNS & WHOIS lookups that return results instantly on this page.</p>
                <div className={`module-selector recon-selector ${isMobile ? "mobile-grid" : ""}`}>
                  {reconTools.map((t) => {
                    const available = isToolAvailable(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`module-card ${reconTool === t.id ? "selected" : ""} ${!available ? "unavailable" : ""}`}
                        onClick={() => { if (!available) return; setReconTool(t.id as "dns" | "whois"); setReconResult(null); }}
                        style={{ "--accent-color": t.color } as any}
                      >
                        <div className="module-tag">{t.tag}</div>
                        {!available && <div className="module-unavailable">Unavailable</div>}
                        <div className="module-icon">
                          <Lottie animationData={t.anim} loop={false} className="lottie-mini" />
                        </div>
                        <div className="module-info">
                          <h3>{t.name}</h3>
                          <p>{t.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="recon-results-card glass-panel">
                <div className="card-header">
                  <Info size={18} className="text-primary" />
                  <span>Domain Reconnaissance Results</span>
                </div>
                {reconResult ? (
                  <div className="recon-results-body">
                    <div className="recon-results-meta">
                      <strong>{tools.find(t => t.id === reconTool)?.name}</strong>
                      <span>{reconResult.hostname}</span>
                    </div>
                    <pre className="recon-results-pre">
                      {reconTool === "whois" ? reconResult.data : JSON.stringify(reconResult.records, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="recon-results-empty">
                    Click "Run Reconnaissance" below to fetch DNS or WHOIS data.
                  </div>
                )}
              </div>

              <button
                onClick={handleInitialize}
                className="launch-btn"
                style={{ marginTop: 30 }}
                disabled={scanLoading || reconLoading || !url.trim() || (scanFlow === "manual" && !RECON_TOOLS.includes(tool) && !isToolAvailable(tool))}
              >
                {scanLoading || reconLoading ? <Loader2 className="animate-spin" size={22} /> : <Shield size={22} />}
                <span>{RECON_TOOLS.includes(tool) ? "Run Reconnaissance" : "Initialize Tool Scan"}</span>
                <ArrowRight size={22} />
              </button>
            </div>

            <aside className="info-panel-v2">
              <div className="info-card glass-panel" style={{ position: "sticky", top: 24 }}>
                <div className="card-header">
                  <Info size={18} className="text-primary" />
                  <span>Module Information</span>
                </div>
                <div className="module-details">
                  <h2 style={{ color: tools.find(t => t.id === tool)?.color || "#fff" }}>
                    {tools.find(t => t.id === tool)?.name}
                  </h2>
                  <p className="desc-text" style={{ marginBottom: 20 }}>
                    {tools.find(t => t.id === tool)?.desc} — {
                      RECON_TOOLS.includes(tool)
                        ? "This tool runs instantly on this page without initiating a full scan sequence."
                        : "Select Quick or Deep mode after clicking Initialize."
                    }
                  </p>

                  {!RECON_TOOLS.includes(tool) && SCAN_MODE_DESCRIPTIONS[tool] && (
                    <div className="stat-grid">
                      <div className="stat-item" style={{ border: `1px solid ${SCAN_MODE_DESCRIPTIONS[tool].color}` }}>
                        <label>Quick Mode</label>
                        <strong style={{ fontSize: "0.85rem" }}>{SCAN_MODE_DESCRIPTIONS[tool].quick.title}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--cyber-text-dim)" }}>{SCAN_MODE_DESCRIPTIONS[tool].quick.bullets[2]}</span>
                      </div>
                      <div className="stat-item" style={{ border: "1px solid #ff4d4d" }}>
                        <label>Deep Mode</label>
                        <strong style={{ fontSize: "0.85rem" }}>{SCAN_MODE_DESCRIPTIONS[tool].full.title}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--cyber-text-dim)" }}>{SCAN_MODE_DESCRIPTIONS[tool].full.bullets[3] || SCAN_MODE_DESCRIPTIONS[tool].full.bullets[2]}</span>
                      </div>
                    </div>
                  )}

                  {INLINE_TOOLS.includes(tool) && (
                    <div className="inline-hint">
                      Inline results appear below in the Inline Intelligence panel.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* ── MANUAL SCAN MODE MODAL ── */}
      {showModeModal && SCAN_MODE_DESCRIPTIONS[tool] && (
        <div className="modal-overlay-premium scan-mode-overlay" onClick={() => setShowModeModal(false)}>
          <div className="scan-mode-modal" onClick={(e) => e.stopPropagation()}>
            <div className="scan-mode-modal-header">
              <div className="scan-mode-modal-title">
                <div className="scan-mode-tool-dot" style={{ background: SCAN_MODE_DESCRIPTIONS[tool].color, boxShadow: `0 0 12px ${SCAN_MODE_DESCRIPTIONS[tool].color}` }} />
                <div>
                  <p className="scan-mode-label">SCAN MODE — {tools.find(t => t.id === tool)?.name?.toUpperCase()}</p>
                  <h2 className="scan-mode-heading">Choose scan intensity</h2>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setShowModeModal(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="scan-mode-cards">
              <div className={`scan-mode-card quick-card ${scanMode === "quick" ? "active" : ""}`} onClick={() => setScanMode("quick")}>
                <div className="smc-badge quick-badge">QUICK</div>
                <div className="smc-icon-wrap"><Rocket size={28} /></div>
                <h3 className="smc-title">{SCAN_MODE_DESCRIPTIONS[tool].quick.title}</h3>
                <p className="smc-detail">{SCAN_MODE_DESCRIPTIONS[tool].quick.detail}</p>
                <ul className="smc-bullets">
                  {SCAN_MODE_DESCRIPTIONS[tool].quick.bullets.map((b: string, i: number) => (
                    <li key={i}><span className="bullet-dot quick-dot" />{b}</li>
                  ))}
                </ul>
              </div>

              <div className={`scan-mode-card deep-card ${scanMode === "full" ? "active" : ""}`} onClick={() => setScanMode("full")}>
                <div className="smc-badge deep-badge">DEEP</div>
                <div className="smc-icon-wrap"><Clock size={28} /></div>
                <h3 className="smc-title">{SCAN_MODE_DESCRIPTIONS[tool].full.title}</h3>
                <p className="smc-detail">{SCAN_MODE_DESCRIPTIONS[tool].full.detail}</p>
                <ul className="smc-bullets">
                  {SCAN_MODE_DESCRIPTIONS[tool].full.bullets.map((b: string, i: number) => (
                    <li key={i}><span className="bullet-dot deep-dot" />{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="scan-mode-footer">
              <button className="action-btn secondary" onClick={() => setShowModeModal(false)}>Cancel</button>
              <button className="launch-scan-confirm-btn" style={{ background: SCAN_MODE_DESCRIPTIONS[tool].color, color: "#000" }} onClick={() => launchScan(scanMode)}>
                <Rocket size={18} />
                <span>Launch {scanMode === "quick" ? "Quick" : "Deep"} Scan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detection Modal */}
      {showDetectionModal && detectionData && (
        <motion.div 
          className="detection-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDetectionModal(false)}
        >
          <motion.div 
            className="detection-modal-content"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="detection-modal-header">
              <div className="detection-modal-icon">
                <Zap size={40} />
              </div>
              <h2>Website Analysis Complete</h2>
              <p>Preparing optimal scan tools for your target</p>
            </div>

            <div className="detection-modal-body">
              <div className="detection-item">
                <div className="detection-item-icon">
                  {detectionData.siteType === "Frontend Only" ? (
                    <Globe size={24} />
                  ) : (
                    <Database size={24} />
                  )}
                </div>
                <div className="detection-item-content">
                  <h3>Website Type</h3>
                  <p>{detectionData.siteType}</p>
                </div>
              </div>

              <div className="detection-item">
                <div className="detection-item-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div className="detection-item-content">
                  <h3>Server Status</h3>
                  <p>{detectionData.isAlive ? "✓ Online & Reachable" : "✗ Unreachable"}</p>
                </div>
              </div>

              <div className="detection-item">
                <div className="detection-item-icon" style={{ background: detectionData.hasSSL ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: detectionData.hasSSL ? "var(--uber-success)" : "var(--uber-danger)" }}>
                  <Shield size={24} />
                </div>
                <div className="detection-item-content">
                  <h3>HTTPS/TLS</h3>
                  <p>{detectionData.hasSSL ? "✓ Enabled" : "✗ Not Detected"}</p>
                </div>
              </div>
            </div>

            <div className="detection-modal-footer">
              <button 
                className="detection-modal-btn secondary"
                onClick={() => setShowDetectionModal(false)}
              >
                <X size={18} />
                Cancel
              </button>
              <button 
                className="detection-modal-btn primary"
                onClick={() => {
                  setShowDetectionModal(false);
                  launchScan("full", detectionData);
                }}
              >
                <Rocket size={18} />
                Start Auto Scan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default StartScan;
