/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, 
  Activity, 
  Clock, 
  AlertTriangle, 
  Play, 
  ArrowUpRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
  TrendingUp,
  FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getLabStatus, getScanHistory, getToolAvailability } from "../../api/scan-api";
import { useToast, ToastContainer } from "../../components/Toast";
import nmapAnimation from "../../assets/icons/nmap.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import ffufAnimation from "../../assets/icons/ffuf.json";
import nucleiAnimation from "../../assets/icons/nuclie.json";
import rateLimitAnimation from "../../assets/icons/rate-limit.json";
import Lottie from "lottie-react";
import "../../styles/dashboard.css";

interface Scan {
  _id: string;
  targetUrl?: string;
  url?: string;
  scanType?: string;
  tool?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  results?: any;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, authChecked } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [scans, setScans] = useState<Scan[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState("");
  const [toolStatus, setToolStatus] = useState<any[]>([]);
  const [futureTools, setFutureTools] = useState<any[]>([]);
  const [labStatus, setLabStatus] = useState<any>(null);

  useEffect(() => {
    if (!authChecked || loading || !user?.agreedToTerms) return;

    const pendingWelcome = sessionStorage.getItem("dashboard_welcome_pending");
    const userKey = String(user?._id || user?.userId || "");
    if (user && userKey && pendingWelcome && pendingWelcome === userKey) {
      addToast("success", "Access Granted", `Welcome back, ${user.username}. System status is nominal.`, 5000);
      sessionStorage.removeItem("dashboard_welcome_pending");
    }

    const load = async () => {
      try {
        const [historyRes, toolsRes, labRes] = await Promise.allSettled([
          getScanHistory(),
          getToolAvailability(),
          getLabStatus(),
        ]);
        const res: any = historyRes.status === "fulfilled" ? historyRes.value : { data: {} };
        const arr = res.data?.scans || res.data?.history || [];
        setScans(Array.isArray(arr) ? arr : []);
        if (toolsRes.status === "fulfilled") {
          setToolStatus(toolsRes.value.data?.availability?.tools || []);
          setFutureTools(toolsRes.value.data?.availability?.futureTools || []);
        }
        if (labRes.status === "fulfilled") {
          setLabStatus(labRes.value.data?.lab || null);
        }
      } catch (e: any) {
        console.error("[Dashboard] Load failed:", e);
        if (e?.status === 401 || e?.isAuthError || e?.response?.status === 401) {
          setError("Session expired. Please log in again.");
          addToast("info", "Session Expired", "Your session has expired. Please log in again to continue.", 6000);
          setTimeout(() => navigate("/login?session=expired"), 800);
        } else {
          setError(e?.response?.data?.error || "Connection error. Please refresh the page.");
        }
      } finally {
        setDashboardLoading(false);
      }
    };

    load();
  }, [authChecked, loading, user, addToast, navigate]);

  // Comprehensive Metric Aggregation & Score Calculation
  const calculatedMetrics = useMemo(() => {
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    
    // Track unique targets
    const targets = new Set<string>();

    scans.forEach(s => {
      const urlStr = s.targetUrl || s.url || "";
      if (urlStr) targets.add(urlStr);

      if (s.status !== "completed") return;
      const res = s.results;
      if (!res) return;
      const tool = String(s.scanType || s.tool || "").toLowerCase();
      
      if (tool === "nmap") {
        const ports = res.openPorts || res.open_ports || [];
        ports.forEach((p: any) => {
          const portStr = String(p);
          const portNumMatch = portStr.match(/^(\d+)/);
          const portNum = portNumMatch ? parseInt(portNumMatch[1], 10) : 0;
          const isStandardWeb = portNum === 80 || portNum === 443;
          const hasVersionInfo = /\d+\.\d+/.test(portStr);
          if (isStandardWeb && !hasVersionInfo) {
            lowCount++;
          } else {
            mediumCount++;
          }
        });
        const vulns = res.vulnerabilities || [];
        vulns.forEach(() => { highCount++; });
      }
      else if (tool === "nikto") {
        const findings = res.findings || [];
        const criticalSet = new Set(res.criticalFindings || []);
        const highSet = new Set(res.highFindings || []);
        const mediumSet = new Set(res.mediumFindings || []);
        findings.forEach((f: any) => {
          const fStr = String(f);
          if (criticalSet.has(fStr)) criticalCount++;
          else if (highSet.has(fStr)) highCount++;
          else if (mediumSet.has(fStr)) mediumCount++;
          else lowCount++;
        });
      }
      else if (tool === "sqlmap") {
        if (res.vulnerable) {
          criticalCount++;
        }
      }
      else if (tool === "sslscan" || tool === "ssl") {
        const certIssues = res.certificateIssues || [];
        const weakCiphers = res.weakCiphers || [];
        const protoIssues = res.deprecatedProtocols || [];
        criticalCount += (protoIssues.length + (res.heartbleedVulnerable ? 1 : 0));
        highCount += (weakCiphers.length + certIssues.length);
      }
      else if (tool === "ffuf" || tool === "gobuster") {
        const dirs = res.directories || res.directories_found || [];
        dirs.forEach((d: any) => {
          const dStr = String(d).toLowerCase();
          if (dStr.includes(".git") || dStr.includes(".env")) criticalCount++;
          else if (dStr.includes("backup") || dStr.includes("private")) highCount++;
          else if (dStr.includes("admin")) mediumCount++;
          else lowCount++;
        });
      }
      else {
        const vulns = res.vulnerabilities || res.vulns || [];
        vulns.forEach((v: any) => {
          const sev = String(v.severity || "medium").toLowerCase();
          if (sev === "critical") criticalCount++;
          else if (sev === "high") highCount++;
          else if (sev === "medium") mediumCount++;
          else lowCount++;
        });
      }
    });

    // 0-100 score: start with 100, deduct based on severities
    const totalDeductions = (criticalCount * 20) + (highCount * 12) + (mediumCount * 6) + (lowCount * 2);
    const score = Math.max(0, Math.min(100, 100 - totalDeductions));

    // Success Rate
    const completed = scans.filter((s) => s.status === "completed").length;
    const pending = scans.filter((s) => s.status === "pending" || s.status === "running").length;
    const successRate = scans.length ? Math.round((completed / scans.length) * 100) : 0;

    return {
      total: scans.length,
      completed,
      pending,
      successRate,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      score,
      targetCount: targets.size
    };
  }, [scans]);

  const recent = useMemo(() => {
    return [...scans]
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
      .slice(0, 5);
  }, [scans]);

  const dashboardTools = useMemo(() => {
    const animationByTool: Record<string, any> = {
      nmap: nmapAnimation,
      nikto: niktoAnimation,
      sqlmap: sqlAnimation,
      ssl: sslAnimation,
      ffuf: ffufAnimation,
      whatweb: nmapAnimation,
      nuclei: nucleiAnimation,
      "rate-limit": rateLimitAnimation,
    };
    const fallback = [
      { id: "nmap", displayName: "Nmap", category: "Port Scanner", available: true },
      { id: "whatweb", displayName: "WhatWeb", category: "Technology Fingerprinting", available: true },
      { id: "ffuf", displayName: "FFUF", category: "Content Discovery", available: true },
      { id: "nikto", displayName: "Nikto", category: "Web Server Scanner", available: true },
      { id: "ssl", displayName: "SSLScan", category: "TLS Analyzer", available: true },
      { id: "sqlmap", displayName: "SQLMap", category: "Injection Testing", available: true },
      { id: "nuclei", displayName: "Nuclei", category: "Template Scanner", available: true },
      { id: "rate-limit", displayName: "Rate Limit Checker", category: "Application Logic", available: true },
    ];
    return (toolStatus.length ? toolStatus : fallback).map((item: any) => ({
      ...item,
      animation: animationByTool[item.id] || nmapAnimation,
      routeTool: item.id === "ssl" ? "sslscan" : item.id,
    }));
  }, [toolStatus]);

  // Calculated AI recommendations
  const aiRecommendations = useMemo(() => {
    const list = [];
    if (calculatedMetrics.critical > 0) {
      list.push({
        title: "Critical Exposure Detected",
        advice: "Disable highly vulnerable services, patch critical endpoints, and restrict remote database connections immediately.",
        severity: "critical"
      });
    }
    if (calculatedMetrics.high > 0) {
      list.push({
        title: "Harden SSL/TLS Configuration",
        advice: "Disable obsolete TLS versions (1.0/1.1), switch to modern strong cipher suites, and enforce Strict-Transport-Security.",
        severity: "high"
      });
    }
    if (calculatedMetrics.medium > 0) {
      list.push({
        title: "Mitigate Directory Listing",
        advice: "Configure webserver options to disable Indexes, prevent directory indexing, and verify custom login routing.",
        severity: "medium"
      });
    }
    // Fallbacks if clean
    if (list.length === 0) {
      list.push({
        title: "Perform Periodic Scans",
        advice: "No active findings. Keep schedules up to date and verify any code updates by scanning local stagings.",
        severity: "safe"
      });
      list.push({
        title: "Implement Security Headers",
        advice: "Ensure Content-Security-Policy (CSP) and X-Frame-Options are deployed to block iframe hijacking/XSS.",
        severity: "safe"
      });
    }
    return list;
  }, [calculatedMetrics]);

  // Calculated SVG sparkline points
  const sparklinePoints = useMemo(() => {
    if (scans.length < 2) return "10,90 50,50 90,10";
    const sortedScans = [...scans]
      .sort((a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime())
      .slice(-10); // last 10 scans
    
    return sortedScans.map((s, idx) => {
      const x = 10 + (idx * 28);
      // Map status or dummy score values to y (0 - 100 scale, SVG height is 100)
      const res = s.results;
      let scoreVal = 100;
      if (res) {
        const tc = (res.criticalFindings?.length || 0) * 20;
        const th = (res.highFindings?.length || 0) * 12;
        const tm = (res.mediumFindings?.length || 0) * 6;
        scoreVal = Math.max(10, 100 - (tc + th + tm));
      }
      const y = 90 - (scoreVal * 0.8);
      return `${x},${y}`;
    }).join(" ");
  }, [scans]);

  return (
    <div className="dashboard-v2">
      {/* HUD Header */}
      <div className="dashboard-header-section">
        <div className="welcome-text">
          <h1>Welcome, <span className="highlight">{user?.username || "Operator"}</span></h1>
          <p>System status is nominal. Security protocols active.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="initialize-btn" onClick={() => navigate("/remediation")}>
            <Shield size={20} />
            <span>Secure Coding</span>
          </button>
          <button className="initialize-btn" onClick={() => navigate("/learn")}>
            <BookOpen size={20} />
            <span>Vulnerability Intelligence</span>
          </button>
          <button className="initialize-btn" onClick={() => navigate("/start-scan")}>
            <Play size={20} fill="currentColor" />
            <span>Launch New Scan</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-alert error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <section className="metrics-grid">
        <div className="metric-card total">
          <div className="metric-icon">
            <Activity size={24} />
          </div>
          <div className="metric-info">
            <label>Total Operations</label>
            <h3>{dashboardLoading ? "..." : calculatedMetrics.total}</h3>
          </div>
          <div className="metric-sub">Targets Scanned: {calculatedMetrics.targetCount}</div>
        </div>

        <div className="metric-card pending">
          <div className="metric-icon">
            <Clock size={24} />
          </div>
          <div className="metric-info">
            <label>Active Tasks</label>
            <h3>{dashboardLoading ? "..." : calculatedMetrics.pending}</h3>
          </div>
          <div className="metric-sub">Queue Depth: {calculatedMetrics.pending}</div>
        </div>

        <div className="metric-card success-rate">
          <div className="metric-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="metric-info">
            <label>Scan Success Rate</label>
            <h3>{dashboardLoading ? "..." : `${calculatedMetrics.successRate}%`}</h3>
          </div>
          <div className="progress-mini">
            <div className="progress-fill" style={{ width: `${calculatedMetrics.successRate}%` }}></div>
          </div>
        </div>

        <div className="metric-card security">
          <div className="metric-icon">
            <Shield size={24} />
          </div>
          <div className="metric-info">
            <label>Overall Security Score</label>
            <h3 style={{ color: calculatedMetrics.score < 50 ? "#ff4d4d" : calculatedMetrics.score < 80 ? "#fb923c" : "#00ff9d" }}>
              {dashboardLoading ? "..." : calculatedMetrics.score}
            </h3>
          </div>
          <div className="metric-sub">Grade: {calculatedMetrics.score >= 90 ? "A" : calculatedMetrics.score >= 75 ? "B" : calculatedMetrics.score >= 60 ? "C" : "F"}</div>
        </div>
      </section>

      {/* Core Layout Grid */}
      <div className="main-grid">
        {/* Left Hand: Operations & Statistics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Security Posture Operations Center */}
          <section className="glass-panel" style={{ padding: "30px" }}>
            <div className="section-header">
              <h3>Security Operations Center</h3>
            </div>
            
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center" }}>
              
              {/* Donut Chart (SVG) */}
              <div style={{ flex: "1 1 200px", display: "flex", justifyContent: "center", position: "relative" }}>
                <svg width="180" height="180" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#161b22" strokeWidth="12" />
                  {/* Critical */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ff4d4d" strokeWidth="12" 
                    strokeDasharray={`${calculatedMetrics.critical ? (calculatedMetrics.critical / (calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low + 0.001)) * 251.2 : 0} 251.2`} 
                    strokeDashoffset="0" transform="rotate(-90 50 50)" />
                  {/* High */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fb923c" strokeWidth="12" 
                    strokeDasharray={`${calculatedMetrics.high ? (calculatedMetrics.high / (calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low + 0.001)) * 251.2 : 0} 251.2`} 
                    strokeDashoffset={`-${calculatedMetrics.critical ? (calculatedMetrics.critical / (calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low + 0.001)) * 251.2 : 0}`} transform="rotate(-90 50 50)" />
                  {/* Medium */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e0ca3c" strokeWidth="12" 
                    strokeDasharray={`${calculatedMetrics.medium ? (calculatedMetrics.medium / (calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low + 0.001)) * 251.2 : 0} 251.2`} 
                    strokeDashoffset={`-${((calculatedMetrics.critical + calculatedMetrics.high) / (calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low + 0.001)) * 251.2}`} transform="rotate(-90 50 50)" />
                  {/* Low */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#38bdf8" strokeWidth="12" 
                    strokeDasharray={`${calculatedMetrics.low ? (calculatedMetrics.low / (calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low + 0.001)) * 251.2 : 0} 251.2`} 
                    strokeDashoffset={`-${((calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium) / (calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low + 0.001)) * 251.2}`} transform="rotate(-90 50 50)" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <span style={{ fontFamily: "Orbitron", fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                    {calculatedMetrics.critical + calculatedMetrics.high + calculatedMetrics.medium + calculatedMetrics.low}
                  </span>
                  <span style={{ display: "block", fontSize: "0.6rem", color: "#8b949e", textTransform: "uppercase" }}>Findings</span>
                </div>
              </div>

              {/* Severity Breakdown Legend */}
              <div style={{ flex: "1 1 250px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ fontFamily: "Orbitron", fontSize: "0.75rem", color: "#8b949e", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                  Finding Distribution
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,77,77,0.06)", borderLeft: "3px solid #ff4d4d", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.85rem", color: "#e6edf3", fontWeight: 600 }}>Critical</span>
                  <span style={{ fontFamily: "Orbitron", color: "#ff4d4d", fontWeight: 700 }}>{calculatedMetrics.critical}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(251,146,60,0.06)", borderLeft: "3px solid #fb923c", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.85rem", color: "#e6edf3", fontWeight: 600 }}>High</span>
                  <span style={{ fontFamily: "Orbitron", color: "#fb923c", fontWeight: 700 }}>{calculatedMetrics.high}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(224,202,60,0.06)", borderLeft: "3px solid #e0ca3c", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.85rem", color: "#e6edf3", fontWeight: 600 }}>Medium</span>
                  <span style={{ fontFamily: "Orbitron", color: "#e0ca3c", fontWeight: 700 }}>{calculatedMetrics.medium}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(56,189,248,0.06)", borderLeft: "3px solid #38bdf8", borderRadius: "4px" }}>
                  <span style={{ fontSize: "0.85rem", color: "#e6edf3", fontWeight: 600 }}>Low</span>
                  <span style={{ fontFamily: "Orbitron", color: "#38bdf8", fontWeight: 700 }}>{calculatedMetrics.low}</span>
                </div>
              </div>

              {/* Sparkline History / Trend SVG */}
              <div style={{ flex: "1 1 200px", padding: "16px", background: "rgba(10, 15, 25, 0.4)", borderRadius: "6px", border: "1px solid rgba(0, 242, 255, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "Orbitron", color: "#8b949e", textTransform: "uppercase" }}>Security Trend</span>
                  <TrendingUp size={14} color="#00f2ff" />
                </div>
                <svg width="100%" height="80" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#00f2ff" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polyline fill="none" stroke="#00f2ff" strokeWidth="2" points={sparklinePoints} />
                  <path d={`M 10,90 L ${sparklinePoints} L 262,90 Z`} fill="url(#sparklineGrad)" />
                </svg>
              </div>

            </div>
          </section>

          {/* AI Security Recommendations */}
          <section className="glass-panel" style={{ padding: "30px" }}>
            <div className="section-header">
              <h3 style={{ gap: "8px" }}>
                <Sparkles size={18} style={{ color: "#00ff9d" }} />
                AI Security Guidance
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {aiRecommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: "16px", 
                    background: rec.severity === "critical" ? "rgba(255,77,77,0.05)" : rec.severity === "high" ? "rgba(251,146,60,0.05)" : "rgba(13,20,32,0.6)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderLeft: `4px solid ${rec.severity === "critical" ? "#ff4d4d" : rec.severity === "high" ? "#fb923c" : "#00ff9d"}`,
                    borderRadius: "6px"
                  }}
                >
                  <h4 style={{ fontFamily: "Orbitron", fontSize: "0.85rem", color: "#fff", marginBottom: "6px", textTransform: "uppercase" }}>{rec.title}</h4>
                  <p style={{ fontFamily: "Rajdhani", fontSize: "0.95rem", color: "rgba(224, 250, 255, 0.7)", margin: 0, lineHeight: 1.5 }}>{rec.advice}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Security Tools Section */}
          <section className="tools-section glass-panel">
            <div className="section-header">
              <h3>Security Test Suites</h3>
              <Link to="/about-tools" className="view-all">Tool Details <ArrowUpRight size={14} /></Link>
            </div>
            <div className="tools-grid-v2">
              {dashboardTools.map((t) => (
                <div key={t.id} className={`tool-card-v2 ${t.available ? "cyan" : "violet"}`} onClick={() => navigate(`/start-scan?mode=manual&tool=${t.routeTool}`)}>
                  <div className="tool-animation">
                    <Lottie animationData={t.animation} loop autoplay />
                  </div>
                  <div className="tool-info">
                    <h4>{t.displayName}</h4>
                    <p>{t.available ? "Available" : "Missing"} · {t.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Hand Side: Operations Log & Intelligence Shortcuts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Recent Operations Log */}
          <section className="activity-section glass-panel">
            <div className="section-header">
              <h3>Operation History</h3>
              <Link to="/scan-history" className="view-all">Full Log <ArrowUpRight size={14} /></Link>
            </div>
            <div className="activity-list">
              {recent.length === 0 && !dashboardLoading && (
                <div className="empty-activity">
                  <Shield size={40} opacity={0.1} />
                  <p>No recent operations logged</p>
                </div>
              )}
              {recent.map((s) => (
                <div
                  className="activity-item"
                  key={s._id}
                  onClick={() =>
                    navigate(
                      s.status === "running" || s.status === "pending"
                        ? `/scan-progress/${s._id}`
                        : `/scan-result/${s._id}`
                    )
                  }
                >
                  <div className="activity-target">
                    <span className="target-host">{s.targetUrl ?? s.url ?? "Unknown"}</span>
                    <div className="target-meta">
                      <span className="tool-tag">{(s.scanType ?? s.tool ?? "").toUpperCase()}</span>
                      <span className="dot">•</span>
                      <span className="time-ago">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                  <div className={`status-pill ${s.status}`}>
                    {s.status}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vulnerability Intelligence Center feed */}
          <section className="glass-panel" style={{ padding: "26px" }}>
            <div className="section-header">
              <h3>Local Lab Status</h3>
              <Link to="/start-scan" className="view-all">Scan Lab <ArrowUpRight size={14} /></Link>
            </div>
            <div style={{ padding: "14px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, background: "rgba(13,20,32,0.45)" }}>
              <h4 style={{ margin: "0 0 8px", color: "#fff" }}>Vuln Spectra Lab</h4>
              <p style={{ margin: 0, color: labStatus?.running ? "#00ff9d" : "#fb923c", fontWeight: 700 }}>
                {labStatus?.status || "unknown"}
              </p>
              <p style={{ margin: "8px 0 0", color: "#8b949e", fontSize: "0.86rem" }}>
                {labStatus?.message || "Docker lab status has not been checked yet."}
              </p>
              <p style={{ margin: "8px 0 0", color: "#38bdf8", fontSize: "0.82rem" }}>{labStatus?.url || "http://localhost:8088"}</p>
            </div>
          </section>

          <section className="glass-panel" style={{ padding: "26px" }}>
            <div className="section-header">
              <h3>Future Tools</h3>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(futureTools.length ? futureTools : [
                { displayName: "OWASP ZAP" },
                { displayName: "Subfinder" },
                { displayName: "HTTPX" },
                { displayName: "Amass" },
              ]).map((item: any) => (
                <span key={item.displayName} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, padding: "6px 8px", color: "#8b949e", fontSize: "0.82rem" }}>
                  {item.displayName}
                </span>
              ))}
            </div>
          </section>

          <section className="glass-panel" style={{ padding: "26px" }}>
            <div className="section-header">
              <h3>Vulnerability Feeds</h3>
              <Link to="/learn" className="view-all">All CVEs <ArrowUpRight size={14} /></Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { id: "CVE-2026-0625", title: "Obsolete SSL/TLS Protocols", score: "9.8 Critical", desc: "Allows cipher downgrades." },
                { id: "CVE-2025-2245", title: "Remote SQL Injection Vulnerability", score: "9.2 High", desc: "Input forms fail parameter checks." },
                { id: "CVE-2025-1748", title: "Information Disclosure via .git Directory", score: "7.5 High", desc: "Web server hosts unconfigured git repos." }
              ].map((cve, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/learn?search=${cve.id}`)}
                  style={{ 
                    padding: "12px", 
                    background: "rgba(13,20,32,0.4)", 
                    borderRadius: "6px", 
                    border: "1px solid rgba(255,255,255,0.03)", 
                    cursor: "pointer",
                    transition: "border-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(0, 242, 255, 0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.03)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.82rem", fontFamily: "Fira Code", color: "#38bdf8", fontWeight: 700 }}>{cve.id}</span>
                    <span style={{ fontSize: "0.72rem", background: "rgba(255,77,77,0.12)", color: "#ff4d4d", padding: "1px 6px", borderRadius: "3px", fontWeight: 700 }}>{cve.score}</span>
                  </div>
                  <h5 style={{ fontSize: "0.85rem", color: "#fff", margin: "2px 0", fontWeight: 600 }}>{cve.title}</h5>
                  <p style={{ fontSize: "0.78rem", color: "#8b949e", margin: 0 }}>{cve.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Secure Development Shortcuts */}
          <section className="glass-panel" style={{ padding: "26px" }}>
            <div className="section-header">
              <h3>Secure Coding Library</h3>
              <Link to="/remediation" className="view-all">All Guides <ArrowUpRight size={14} /></Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { title: "Mitigating SQL Injection", lang: "Node.js / Express" },
                { title: "Securing JWT Auth Sessions", lang: "TypeScript / JWT" },
                { title: "Deploying Security Headers", lang: "Nginx / Apache" }
              ].map((lib, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/remediation?search=${lib.title}`)}
                  style={{ 
                    padding: "10px 14px", 
                    background: "rgba(13,20,32,0.4)", 
                    borderRadius: "6px", 
                    border: "1px solid rgba(255,255,255,0.03)", 
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(0, 255, 157, 0.2)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.03)"}
                >
                  <div>
                    <h5 style={{ fontSize: "0.85rem", color: "#fff", margin: 0, fontWeight: 600 }}>{lib.title}</h5>
                    <span style={{ fontSize: "0.75rem", color: "#8b949e" }}>{lib.lang}</span>
                  </div>
                  <FileText size={16} style={{ color: "#00ff9d" }} />
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Dashboard;
