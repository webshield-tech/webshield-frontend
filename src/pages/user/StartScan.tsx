/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Shield, Globe, Info, AlertCircle, ArrowRight, Loader2,
  X, Rocket, Search, CheckCircle2, Database, Zap
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
import ffufAnimation    from "../../assets/icons/ffuf.json";
import dnsAnimation     from "../../assets/icons/dns-recon.json";
import whoisAnimation   from "../../assets/icons/whois.json";
import nucleiAnimation  from "../../assets/icons/nuclie.json";
import rateLimitAnimation from "../../assets/icons/rate-limit.json";


import { useToast, ToastContainer } from "../../components/Toast";

/* ── Per-tool scan mode descriptions ─────────────────────────────────────── */
const SCAN_MODE_DESCRIPTIONS: Record<string, any> = {
  nmap:    { color: "#00f2ff", medium: { title: "Standard Scan",    detail: "Scans top 1,024 TCP ports with service detection.",    bullets: ["Ports 1–1024", "Service & version detection", "~1–2 mins"] }, full: { title: "Full Scan",   detail: "Scans 10,000 ports with vuln scripts.",            bullets: ["Ports 1–10000", "Vulnerability NSE scripts", "~5–6 mins"] } },
  nikto:   { color: "#ff0055", medium: { title: "Standard Scan",    detail: "Web server misconfiguration and software audit.",      bullets: ["Software identification", "Interesting files", "~2 mins"] }, full: { title: "Full Scan",   detail: "Comprehensive web vulnerability audit.",           bullets: ["Outdated software", "Dangerous files", "Injection points", "~4 mins"] } },
  sqlmap:  { color: "#ffd54f", medium: { title: "Standard Scan",    detail: "SQL injection probe — Level 2 / Risk 1.",            bullets: ["Boolean & error-based", "Form auto-detection", "~2–4 mins"] }, full: { title: "Full Scan",   detail: "Advanced SQL injection — Level 3 / Risk 2.",      bullets: ["Union & blind queries", "Form crawling", "~5–8 mins"] } },
  sslscan: { color: "#00ff9d", medium: { title: "Standard Scan",    detail: "Audits TLS protocols and certificate validity.",     bullets: ["Protocol versions", "Weak ciphers", "Certificate expiry", "~30 secs"] }, full: { title: "Full Scan",   detail: "Full TLS audit with Heartbleed check.",          bullets: ["All cipher suites", "Certificate chain", "Heartbleed", "~30 secs"] } },
  ffuf:    { color: "#ff00ff", medium: { title: "Directory Fuzzing", detail: "Fast hidden directory and endpoint discovery.",     bullets: ["200/204/301/302/403 codes", "5 threads", "~2 mins"] }, full: { title: "Full Fuzzing", detail: "Broader discovery with extended status codes.", bullets: ["All common status codes", "JSON output", "~3 mins"] } },
  whatweb: { color: "#7dd3fc", medium: { title: "Technology Detection", detail: "Fingerprints frameworks, servers, and plugins.", bullets: ["Normal detection", "No payloads", "~30 secs"] }, full: { title: "Aggressive Detection", detail: "Runs stronger fingerprinting checks.", bullets: ["Plugin fingerprinting", "Version hints", "~1 min"] } },
  nuclei:  { color: "#a78bfa", medium: { title: "Template Scan", detail: "Runs automatic low-to-critical templates.", bullets: ["Verified templates", "JSON evidence", "~2–4 mins"] }, full: { title: "Full Template Scan", detail: "Includes informational templates.", bullets: ["More coverage", "More noise", "~5–8 mins"] } },
  "rate-limit": { color: "#fb7185", medium: { title: "Rate Limit Check", detail: "Checks if APIs throttle request bursts.", bullets: ["Safe request burst", "429/403 detection", "~30 secs"] }, full: { title: "Rate Limit Check", detail: "Same safe localhost-first check.", bullets: ["Safe request burst", "429/403 detection", "~30 secs"] } },
};

// DNS/WHOIS are inline tools only (not scan pipeline tools)
const RECON_TOOLS = ["dns", "whois"];

const TOOL_DAILY_LIMITS = [
  { id: "nmap",    label: "Nmap",    limit: 10, color: "#00f2ff" },
  { id: "nikto",   label: "Nikto",   limit: 10, color: "#ff0055" },
  { id: "sqlmap",  label: "SQLMap",  limit: 10, color: "#ffd54f" },
  { id: "sslscan", label: "SSLScan", limit: 10, color: "#00ff9d" },
  { id: "ffuf",    label: "FFUF",    limit: 10, color: "#ff00ff" },
  { id: "whatweb", label: "WhatWeb", limit: 10, color: "#7dd3fc" },
  { id: "nuclei", label: "Nuclei", limit: 10, color: "#a78bfa" },
  { id: "rate-limit", label: "Rate Limit", limit: 10, color: "#fb7185" },
];

const StartScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading, authChecked } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [url, setUrl] = useState("");
  const [scanFlow, setScanFlow] = useState<"auto" | "manual" | "domain-intel">(searchParams.get("mode") === "manual" ? "manual" : searchParams.get("mode") === "domain-intel" ? "domain-intel" : "auto");
  const [tool, setTool] = useState<ScanTool>("nmap");
  const [scanLoading, setScanLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);
  const [reconLoading, setReconLoading] = useState(false);

  const [detectionData, setDetectionData] = useState<any>(null);
  const [reconResult, setReconResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [toolStats, setToolStats] = useState<Record<string, number>>({});
  const [scanQuota, setScanQuota] = useState<any>(null);
  const [toolAvailability, setToolAvailability] = useState<{ byTool: Record<string, boolean>; available: string[]; missing: string[] } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [domainIntelDomain, setDomainIntelDomain] = useState("");

  const formatReconData = (value: any) => {
    if (value == null) return "No data returned.";
    if (typeof value === "string") return value;
    if (typeof value.data === "string") return value.data;
    if (typeof value.rawOutput === "string") return value.rawOutput;
    if (typeof value.summary === "string") return value.summary;
    return JSON.stringify(value, null, 2);
  };

  useEffect(() => {
    const requestedTool = searchParams.get("tool");
    if (requestedTool) {
      const normalizedTool = requestedTool === "ssl" ? "sslscan" : requestedTool;
      setTool(normalizedTool as ScanTool);
      setScanFlow("manual");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { getTodayStats } = await import("../../api/scan-api");
        const res = await getTodayStats();
        if (res.data?.success) {
          setToolStats({ ...res.data.stats.byTool, auto: res.data.stats.autoUsed });
          setScanQuota(res.data.stats);
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

  // Essential scanner tools — 5 tools matched to backend ALLOWED_SCANS
  const tools = [
    { id: "nmap",    name: "Nmap",    desc: "Port & Service Scanner",  anim: nmapAnimation,    color: "#00f2ff", tag: "RECON"    },
    { id: "nikto",   name: "Nikto",   desc: "Web Server Auditor",       anim: niktoAnimation,   color: "#ff0055", tag: "WEB"      },
    { id: "sqlmap",  name: "SQLMap",  desc: "SQL Injection Tester",     anim: sqlmapAnimation,  color: "#ffd54f", tag: "DATABASE" },
    { id: "sslscan", name: "SSLScan", desc: "TLS/SSL Auditor",          anim: sslscanAnimation, color: "#00ff9d", tag: "HTTPS"    },
    { id: "ffuf",    name: "FFUF",    desc: "Directory Fuzzer",         anim: ffufAnimation,    color: "#ff00ff", tag: "HIDDEN"   },
    { id: "whatweb", name: "WhatWeb", desc: "Technology Fingerprinter", anim: nmapAnimation,    color: "#7dd3fc", tag: "TECH"     },
    { id: "nuclei",  name: "Nuclei",  desc: "Template Vulnerability Scan", anim: nucleiAnimation, color: "#a78bfa", tag: "CVE"      },
    { id: "rate-limit", name: "Rate Limit", desc: "Request Throttling Check", anim: rateLimitAnimation, color: "#fb7185", tag: "LOGIC" },
    { id: "dns",     name: "DNS",     desc: "DNS Record Lookup",        anim: dnsAnimation,     color: "#00d4ff", tag: "RECON"    },
    { id: "whois",   name: "WHOIS",   desc: "Domain Ownership Lookup",  anim: whoisAnimation,   color: "#9d00ff", tag: "INTEL"    },
  ] as const;

  const availabilityMap = toolAvailability?.byTool || {};
  const isToolAvailable = (toolId: string) => availabilityMap[toolId] !== false;
  const missingTools = toolAvailability?.missing || [];
  const missingToolNames = Array.from(new Set(missingTools
    .map((id) => tools.find(t => t.id === id)?.name || (id === "ssl" ? "SSLScan" : id.toUpperCase()))));
  const showAvailabilityWarning = missingToolNames.length > 0;
  const showAvailabilityLoading = availabilityLoading && !toolAvailability;

  const formatResetCountdown = (resetInMs?: number | null) => {
    if (!resetInMs || resetInMs <= 0) return "Resets soon";
    const totalMinutes = Math.ceil(resetInMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `Resets in ${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
  };

  const autoLimit = 5;
  const manualLimit = 10;
  const autoUsed = Number(toolStats.auto || 0);
  const manualUsed = Number(toolStats[tool] || 0);
  const autoLimitReached = autoUsed >= autoLimit;
  const manualLimitReached = manualUsed >= manualLimit || (user?.scanLimit ? Number(scanQuota?.totalUsed || 0) >= Number(user.scanLimit) : false);
  const limitTooltip = formatResetCountdown(scanQuota?.resetInMs);

  // ✅ UPDATED: Separated recon tools (DNS/WHOIS) from scanner tools
  const scannerTools = tools.filter(t => !RECON_TOOLS.includes(t.id));
  // Auto scan runs sequentially: Nmap → WhatWeb → FFUF → Nikto → SSLScan → SQLMap → Nuclei → Rate Limit
  const autoTools = tools.filter(t => ["nmap", "whatweb", "ffuf", "nikto", "sslscan", "sqlmap", "nuclei", "rate-limit"].includes(t.id));

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
      if (tool === "dns") res = await dnsLookupInline(normalizedUrl);
      else if (tool === "whois") res = await whoisLookupInline(normalizedUrl);

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
      // For manual launches, do not show a mode selector. Launch a medium-intensity scan directly.
      launchScan();
    }
  };

  const launchScan = async (chosenMode?: "medium" | "full", autoDetection?: any) => {
    const mode = chosenMode || "medium";

    try {
      setScanLoading(true);
      const scanData: any = {
        targetUrl: url.trim().replace(/\/+$/, ""),
        scanType:  scanFlow === "auto" ? "all" : (tool === "sslscan" ? "ssl" : tool),
        scanMode:  mode,
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
              onClick={() => { setScanFlow("auto"); setError(""); }}
            >
              Auto Scan (Smart)
            </button>
            <button
              className={`flow-toggle-btn ${scanFlow === "manual" ? "active" : ""}`}
              onClick={() => { setScanFlow("manual"); setTool("nmap"); setError(""); }}
            >
              Manual Tool Scan
            </button>
            <button
              className={`flow-toggle-btn ${scanFlow === "domain-intel" ? "active" : ""}`}
              onClick={() => { setScanFlow("domain-intel"); setError(""); }}
            >
              Domain Intelligence
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
              <button
                onClick={handleInitialize}
                className="launch-btn"
                style={{ padding: "18px 48px", fontSize: "1.1rem", borderRadius: 24 }}
                disabled={scanLoading || !url.trim() || autoLimitReached}
                title={autoLimitReached ? limitTooltip : undefined}
              >
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
                  <label>Target URL</label>
                  <div className="url-input-wrap">
                    <Globe className="input-icon" size={20} />
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); }}
                      disabled={scanLoading}
                    />
                    <button type="button" className="ping-verify-btn" onClick={handlePingCheck} disabled={pingLoading || !url.trim()}>
                      {pingLoading ? <Loader2 className="animate-spin" size={16} /> : <span>Check Availability</span>}
                    </button>
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
                <p className="module-helper-text">Quick scans run one scanner at a time and show progress.</p>
                <div className={`module-selector ${isMobile ? "mobile-grid" : ""}`}>
                  {scannerTools.map((t) => {
                    const available = isToolAvailable(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`module-card ${tool === t.id ? "selected" : ""} ${!available ? "unavailable" : ""}`}
                        onClick={() => { if (!available) return; setTool(t.id as ScanTool); }}
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

              <button
                onClick={handleInitialize}
                className="launch-btn"
                style={{ marginTop: 30 }}
                disabled={scanLoading || !url.trim() || manualLimitReached || (scanFlow === "manual" && !isToolAvailable(tool))}
                title={manualLimitReached ? limitTooltip : undefined}
              >
                {scanLoading ? <Loader2 className="animate-spin" size={22} /> : <Shield size={22} />}
                <span>Initialize Tool Scan</span>
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
                        : "A medium-intensity scan will be launched when you click Initialize."
                    }
                  </p>

                  {!RECON_TOOLS.includes(tool) && SCAN_MODE_DESCRIPTIONS[tool] && (
                    <div className="stat-grid">
                      <div className="stat-item" style={{ border: `1px solid ${SCAN_MODE_DESCRIPTIONS[tool].color}` }}>
                        <label>Standard Scan</label>
                        <strong style={{ fontSize: "0.85rem" }}>{SCAN_MODE_DESCRIPTIONS[tool].medium.title}</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--cyber-text-dim)" }}>{SCAN_MODE_DESCRIPTIONS[tool].medium.bullets[2]}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── DOMAIN INTELLIGENCE SECTION ── */}
        {scanFlow === "domain-intel" && (
          <div className="domain-intel-container glass-panel">
            <div className="domain-intel-header">
              <div>
                <h2>Domain Intelligence & OSINT</h2>
                <p>Gather intelligence on any domain without running a full security scan.</p>
              </div>
              <Database size={32} style={{ color: "#00f2ff", opacity: 0.7 }} />
            </div>

            <div className="domain-intel-input-group">
              <label>Domain or Hostname</label>
              <div className="domain-intel-input-wrap">
                <Globe className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="example.com or api.example.com"
                  value={domainIntelDomain}
                  onChange={(e) => setDomainIntelDomain(e.target.value)}
                  disabled={reconLoading}
                />
              </div>
            </div>

            <div className="domain-intel-tools">
              <button
                onClick={async () => {
                  if (!domainIntelDomain.trim()) {
                    addToast("warning", "Input Required", "Please enter a domain", 3000);
                    return;
                  }
                  setReconLoading(true);
                  try {
                    const res = await dnsLookupInline(domainIntelDomain);
                    setReconResult({ type: "dns", data: res.data, domain: domainIntelDomain });
                    addToast("success", "DNS Lookup Complete", `Retrieved DNS records for ${domainIntelDomain}`, 4000);
                  } catch (e: any) {
                    addToast("error", "DNS Lookup Failed", e?.response?.data?.error || "Failed to retrieve DNS records", 4000);
                  } finally {
                    setReconLoading(false);
                  }
                }}
                className="domain-intel-btn dns-btn"
                disabled={reconLoading || !domainIntelDomain.trim()}
              >
                {reconLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                DNS Lookup
              </button>
              <button
                onClick={async () => {
                  if (!domainIntelDomain.trim()) {
                    addToast("warning", "Input Required", "Please enter a domain", 3000);
                    return;
                  }
                  setReconLoading(true);
                  try {
                    const res = await whoisLookupInline(domainIntelDomain);
                    setReconResult({
                      type: "whois",
                      data: res.data?.data || res.data?.rawOutput || res.data?.summary || res.data,
                      domain: domainIntelDomain,
                    });
                    addToast("success", "WHOIS Lookup Complete", `Retrieved WHOIS data for ${domainIntelDomain}`, 4000);
                  } catch (e: any) {
                    addToast("error", "WHOIS Lookup Failed", e?.response?.data?.error || "Failed to retrieve WHOIS data", 4000);
                  } finally {
                    setReconLoading(false);
                  }
                }}
                className="domain-intel-btn whois-btn"
                disabled={reconLoading || !domainIntelDomain.trim()}
              >
                {reconLoading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
                WHOIS Lookup
              </button>
            </div>

            {reconResult && (
              <div className="domain-intel-results">
                <div className="results-header">
                  <h3>{reconResult.type === "dns" ? "DNS Records" : "WHOIS Information"} — {reconResult.domain}</h3>
                  <button
                    onClick={() => {
                      const text = reconResult.type === "dns"
                        ? JSON.stringify(reconResult.data, null, 2)
                        : formatReconData(reconResult.data);
                      navigator.clipboard.writeText(text);
                      addToast("success", "Copied", "Results copied to clipboard", 2000);
                    }}
                    className="copy-btn"
                  >
                    📋 Copy Results
                  </button>
                </div>
                <pre className="results-content">
                  {reconResult.type === "dns"
                    ? JSON.stringify(reconResult.data, null, 2)
                    : formatReconData(reconResult.data)}
                </pre>
              </div>
            )}

            {error && (
              <div className="domain-intel-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

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

              {/* New: WhatWeb / Technology signals */}
              <div className="detection-item detection-tech">
                <div className="detection-item-icon">
                  <Info size={24} />
                </div>
                <div className="detection-item-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Technology Signals</h3>
                    {/* DB indicator badge */}
                    { (detectionData.hasDatabase || (detectionData.dbIndicators && detectionData.dbIndicators.length>0)) && (
                      <div className="db-indicator-badge">DB indicators detected — SQLMap likely</div>
                    )}
                  </div>

                  <p style={{ marginBottom: 8 }}>
                    {Array.isArray(detectionData.technologies) && detectionData.technologies.length > 0
                      ? detectionData.technologies.join(', ')
                      : (typeof detectionData.technologies === 'string' ? detectionData.technologies : 'No technologies detected')}
                  </p>

                  {detectionData.evidence?.htmlIndicators && detectionData.evidence.htmlIndicators.length > 0 && (
                    <div className="detection-evidence">
                      <strong>Evidence:</strong>
                      <ul>
                        {detectionData.evidence.htmlIndicators.slice(0,5).map((line: any, idx: number) => (
                          <li key={idx}>{String(line)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                  // Auto-scan should be conservative on low-memory hosts — use medium profile
                  launchScan(undefined, detectionData);
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
