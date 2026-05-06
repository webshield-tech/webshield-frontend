/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { 
  Terminal, 
  Download, 
  Eye, 
  Sparkles, 
  ChevronLeft, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Search,
  FileText,
  Loader2,
  X,
  Rocket,
  Globe,
  Shield,
  Wand2
} from "lucide-react";
import { VulnerabilityRemediation } from "../../components/VulnerabilityRemediation";
import { getRemediationForVulnerability } from "../../utils/vulnerabilityPatches";
import {
  getScanResultsById,
  getBatchResults,
  generateAIReportForScan,
  viewReport,
  downloadReport,
  generateBatchAIReport,
  viewBatchReport,
  downloadBatchReport,
  startScan,
} from "../../api/scan-api";
import "../../styles/scan-result.css";
import saveTextAsPdf from "../../utils/saveAsPdf";

type ToastType = "success" | "error" | "";

// ─── Structured Report Viewer ─────────────────────────────────────────────────
function parseReportSections(content: string) {
  const sections: { title: string; body: string }[] = [];
  const lines = content.split("\n");
  let current: { title: string; body: string } | null = null;

  const headingRe = /^##?\s+(.+)$/;

  for (const line of lines) {
    const m = line.match(headingRe);
    if (m) {
      if (current) sections.push(current);
      current = { title: m[1].trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    } else {
      // preamble before first heading — attach as intro
      if (!sections.length) {
        if (!current) current = { title: "Overview", body: "" };
        current.body += line + "\n";
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

function sectionIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("finding") || t.includes("vulnerabilit")) return "🔍";
  if (t.includes("analysis") || t.includes("detail")) return "📊";
  if (t.includes("recommend") || t.includes("remediat")) return "✅";
  if (t.includes("overview") || t.includes("summary")) return "📋";
  return "📌";
}

function sectionColor(title: string) {
  const t = title.toLowerCase();
  if (t.includes("finding") || t.includes("vulnerabilit")) return "#ff4f4f";
  if (t.includes("analysis")) return "#00d4ff";
  if (t.includes("recommend") || t.includes("remediat")) return "#00ff9d";
  return "var(--cyber-primary)";
}

function ReportViewer({ content }: { content: string }) {
  const sections = parseReportSections(content);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {sections.map((sec, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid rgba(255,255,255,0.07)`,
            borderLeft: `3px solid ${sectionColor(sec.title)}`,
            borderRadius: "6px",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <span style={{ fontSize: "1.2rem" }}>{sectionIcon(sec.title)}</span>
            <h3
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 800,
                color: sectionColor(sec.title),
                letterSpacing: "2px",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {sec.title}
            </h3>
          </div>
          <div
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {sec.body.trim()}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Severity helpers ─────────────────────────────────────────────────────────
const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#ff2d55",
  High:     "#ff6b35",
  Medium:   "#f5a623",
  Low:      "#4cd964",
};

function riskColor(score: number) {
  if (score >= 75) return "#ff2d55";
  if (score >= 50) return "#ff6b35";
  if (score >= 25) return "#f5a623";
  return "#4cd964";
}

function getSuggestionItems(analysis: any) {
  const suggestions = [] as Array<{ title: string; reason: string }>;
  const attackSurface = analysis?.attack_surface || {};
  const findings = Array.isArray(analysis?.findings) ? analysis.findings : [];
  const info = Array.isArray(analysis?.informational_findings) ? analysis.informational_findings : [];

  const hasForms = findings.some((f: any) => String(f.title || "").toLowerCase().includes("sql")) ||
    info.some((f: any) => String(f.title || "").toLowerCase().includes("form"));
  const hasDirs = Array.isArray(attackSurface.directories_found) && attackSurface.directories_found.length > 0;
  const hasTls = findings.some((f: any) => /tls|ssl|certificate|cipher/i.test(String(f.title || "")));
  const hasAuth = findings.some((f: any) => /login|auth|session|cookie/i.test(String(f.title || "")));

  if (hasForms) {
    suggestions.push({ title: "SQLMap", reason: "Forms or input fields detected. SQLMap can validate SQL injection risk." });
  }
  if (hasDirs) {
    suggestions.push({ title: "Gobuster", reason: "Directories were found. Gobuster can probe hidden endpoints." });
  }
  if (hasTls) {
    suggestions.push({ title: "SSLScan", reason: "TLS/SSL findings detected. SSLScan verifies protocol and cipher safety." });
  }
  if (hasAuth) {
    suggestions.push({ title: "Wapiti", reason: "Auth-related patterns detected. Wapiti can check input validation and session controls." });
  }

  if (suggestions.length === 0) {
    suggestions.push({ title: "Nuclei", reason: "No specific tool match. Nuclei provides broad template-based checks." });
  }

  return suggestions.slice(0, 4);
}

function simplifyTitle(title: string) {
  const t = String(title || "");
  if (/sql injection/i.test(t)) return "Database input risk";
  if (/xss/i.test(t)) return "Unsafe input display";
  if (/tls|ssl|certificate|cipher/i.test(t)) return "Weak encryption settings";
  if (/open port/i.test(t)) return "Open network access";
  if (/directory|gobuster/i.test(t)) return "Exposed paths";
  return t;
}

function getPlatformFix(platform: string, title: string, tool: string) {
  const p = String(platform || "").toLowerCase();
  const t = String(title || "").toLowerCase();
  const toolName = String(tool || "").toLowerCase();

  if (t.includes("open network access") || t.includes("open port") || toolName === "nmap") {
    if (p.includes("vercel") || p.includes("netlify") || p.includes("cloudflare")) {
      return "This is normal for hosted web apps. Keep only HTTP/HTTPS exposed and review platform firewall settings.";
    }
    if (p.includes("aws") || p.includes("digitalocean") || p.includes("render") || p.includes("heroku")) {
      return "Use your cloud dashboard or security groups to allow only the needed public ports.";
    }
    if (p.includes("nginx") || p.includes("apache") || p.includes("litespeed")) {
      return "Keep only the public web ports open and close anything not needed in the server firewall or host config.";
    }
  }

  if (toolName === "sqlmap" || t.includes("database input risk")) {
    if (p.includes("wordpress")) return "Use prepared statements in custom code and keep plugins/themes updated.";
    if (p.includes("django")) return "Use Django ORM queries and avoid raw SQL unless absolutely required.";
    if (p.includes("laravel")) return "Use Eloquent or parameterized queries and validate request input before database access.";
    if (p.includes("express") || p.includes("node")) return "Use parameterized queries, input validation, and avoid string-built SQL in routes.";
    return "Use parameterized queries and validate user input before it reaches the database.";
  }

  if (toolName === "sslscan" || t.includes("weak encryption")) {
    if (p.includes("nginx")) return "Set ssl_protocols to TLSv1.2 TLSv1.3 and reload Nginx after the change.";
    if (p.includes("apache")) return "Disable old TLS versions in Apache and restart the service after updating the config.";
    if (p.includes("cloudflare")) return "Check the origin certificate and TLS mode in the Cloudflare dashboard.";
    return "Disable old TLS versions and keep only modern cipher suites enabled.";
  }

  if (toolName === "nikto" || t.includes("exposed paths") || t.includes("misconfiguration")) {
    if (p.includes("wordpress")) return "Update plugins, themes, and WordPress core, then remove any public debug files.";
    if (p.includes("nginx")) return "Review server headers, block directory listing, and remove test or backup files.";
    if (p.includes("apache")) return "Hide version headers, disable directory listing, and remove sample files.";
    return "Remove test files, hide version details, and patch the exposed service.";
  }

  if (toolName === "gobuster" || toolName === "ffuf") {
    return "Review the discovered paths, remove unused admin areas, and protect sensitive endpoints with authentication.";
  }

  if (toolName === "wapiti") {
    return "Protect forms with validation, CSRF tokens, and output encoding in the application layer.";
  }

  if (toolName === "dns") {
    return "Review DNS records, remove stale entries, and avoid publishing internal hostnames publicly.";
  }

  if (toolName === "whois") {
    return "Keep registrar details current and enable domain lock and privacy protection if available.";
  }

  return "Review the finding, patch the affected component, and re-scan to confirm the fix.";
}

// ─── BatchAnalysisPanel ───────────────────────────────────────────────────────
function BatchAnalysisPanel({ analysis, scanPlan }: { analysis: any, scanPlan?: any }) {
  const { summary, attack_surface, findings, informational_findings, prioritized_actions, final_recommendation } = analysis;
  const score  = summary?.risk_score ?? 0;
  const color  = riskColor(score);
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const dash   = circ - (score / 100) * circ;

  const panelStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "22px 26px",
    marginBottom: "20px",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "12px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Executive Summary ── */}
      <div style={{ ...panelStyle, borderLeft: `3px solid ${color}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
          {/* Risk Gauge */}
          <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={dash}
                strokeLinecap="round" transform="rotate(-90 65 65)"
                style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "1.8rem", fontWeight: 800, color }}>{score}</span>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>RISK SCORE</span>
            </div>
          </div>

          {/* Summary text */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ background: color, color: "#000", padding: "3px 10px", borderRadius: 4, fontFamily: "'Orbitron',sans-serif", fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1 }}>
                {summary?.overall_status}
              </span>
              <span style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", padding: "3px 10px", borderRadius: 4, fontSize: "0.72rem" }}>
                {summary?.scan_quality}
              </span>
              <span style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", padding: "3px 10px", borderRadius: 4, fontSize: "0.72rem" }}>
                Confidence {Math.round((summary?.confidence_score ?? 0) * 100)}%
              </span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.65, fontSize: "0.95rem", margin: 0 }}>
              {summary?.key_message}
            </p>
          </div>
        </div>
      </div>

      {/* ── Attack Surface ── */}
      {attack_surface && (
        <div style={panelStyle}>
          <p style={labelStyle}>Attack Surface</p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Open Ports",    items: attack_surface.open_ports },
              { label: "Directories",   items: attack_surface.directories_found },
              { label: "Technologies",  items: attack_surface.technologies_detected },
            ].map(({ label, items }) => (
              <div key={label} style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{label}</p>
                {items?.length ? items.map((it: string, i: number) => (
                  <span key={i} style={{ display: "inline-block", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--cyber-primary,#00d4ff)", borderRadius: 4, padding: "2px 8px", fontSize: "0.78rem", marginRight: 6, marginBottom: 6 }}>{it}</span>
                )) : <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.82rem" }}>None detected</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tool Suggestions ── */}
      <div style={panelStyle}>
        <p style={labelStyle}>Suggested Next Tools</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {getSuggestionItems(analysis).map((s, idx) => (
            <div key={idx} style={{ border: "1px solid rgba(0,212,255,0.2)", background: "rgba(0,212,255,0.08)", padding: "10px 14px", borderRadius: 6, minWidth: 180 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wand2 size={14} color="#00d4ff" />
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.78rem", fontWeight: 700 }}>{s.title}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", margin: "8px 0 0 0" }}>{s.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scan Plan Transparency ── */}
      {scanPlan?.details && (
        <div style={panelStyle}>
          <p style={labelStyle}>Smart Scan Plan (AI Orchestrator)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(scanPlan.details).map(([tool, info]: [string, any], i: number) => {
              const isRun = info.decision === "run";
              const color = isRun ? "#00ff9d" : "#ff6b35";
              const bgColor = isRun ? "rgba(0,255,157,0.1)" : "rgba(255,107,53,0.1)";
              const borderColor = isRun ? "rgba(0,255,157,0.3)" : "rgba(255,107,53,0.3)";

              return (
                <div key={i} style={{ border: `1px solid ${borderColor}`, background: bgColor, borderRadius: 6, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "#fff", textTransform: "uppercase" }}>{tool}</span>
                    <span style={{ background: color, color: "#000", padding: "2px 8px", borderRadius: 3, fontSize: "0.7rem", fontWeight: 700 }}>
                      {isRun ? "✔ EXECUTED" : "⏭ SKIPPED"}
                    </span>
                    <span style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: 3, fontSize: "0.7rem" }}>
                      Confidence {Math.round((info.confidence || 1) * 100)}%
                    </span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", margin: "0 0 6px 0" }}><strong>Reason:</strong> {info.reason}</p>
                  
                  {info.evidence && info.evidence.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: "0 0 4px 0", textTransform: "uppercase" }}>Evidence</p>
                      <ul style={{ margin: 0, paddingLeft: 16, color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", listStyleType: "square" }}>
                        {info.evidence.map((ev: string, idx: number) => (
                          <li key={idx}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Correlated Findings ── */}
      {findings?.length > 0 && (
        <div style={panelStyle}>
          <p style={labelStyle}>Vulnerability Findings ({findings.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {findings.map((f: any, i: number) => {
              const fc = SEVERITY_COLORS[f.severity] || "#888";
              const friendlyTitle = simplifyTitle(f.title);
              return (
                <div key={i} style={{ borderLeft: `3px solid ${fc}`, paddingLeft: 16, paddingBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>{friendlyTitle || f.title}</span>
                    <span style={{ background: fc, color: "#000", padding: "2px 8px", borderRadius: 3, fontSize: "0.7rem", fontWeight: 700 }}>{f.severity}</span>
                    <span style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", padding: "2px 8px", borderRadius: 3, fontSize: "0.7rem" }}>
                      Fix: {f.fix_priority}
                    </span>
                    <span style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", padding: "2px 8px", borderRadius: 3, fontSize: "0.7rem" }}>
                      Confidence {Math.round((f.confidence ?? 0) * 100)}%
                    </span>
                    {f.exploitability && (
                      <span style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", color: "#ff6b35", padding: "2px 8px", borderRadius: 3, fontSize: "0.7rem" }}>
                        Exploitability: {f.exploitability}
                      </span>
                    )}
                    {f.detection_sources?.length > 0 && (
                      <span style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", padding: "2px 8px", borderRadius: 3, fontSize: "0.7rem" }}>
                        Sources: {f.detection_sources.join(", ")}
                      </span>
                    )}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.88rem", margin: "0 0 6px 0", lineHeight: 1.6 }}>{f.description}</p>
                  {f.confidence_reason && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", margin: "0 0 6px 0", fontStyle: "italic" }}>Why: {f.confidence_reason}</p>}
                  {f.impact && <p style={{ color: "rgba(255,100,100,0.85)", fontSize: "0.83rem", margin: "0 0 4px 0" }}><strong>Impact:</strong> {f.impact}</p>}
                  {f.evidence && <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.78rem", fontFamily: "monospace", margin: "0 0 6px 0" }}>{f.evidence}</p>}
                  {f.recommendation && <p style={{ color: "rgba(0,212,255,0.85)", fontSize: "0.83rem", margin: "0 0 4px 0" }}><strong>Fix:</strong> {f.recommendation}</p>}
                  {f.patch_steps && f.patch_steps.length > 0 && (
                    <div style={{ marginTop: 8, marginBottom: 8, background: "rgba(0, 255, 157, 0.05)", padding: 10, borderRadius: 6, border: "1px solid rgba(0, 255, 157, 0.2)" }}>
                      <p style={{ color: "#00ff9d", fontSize: "0.8rem", margin: "0 0 6px 0", fontWeight: 700, textTransform: "uppercase" }}>Recommended Patch Steps:</p>
                      <ol style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        {f.patch_steps.map((step: string, si: number) => (
                          <li key={si} style={{ marginBottom: 4 }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {f.patchTitle && (
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem", margin: "0 0 4px 0" }}><strong>Patch focus:</strong> {f.patchTitle} - {f.patchAdvice}</p>
                  )}
                  {f.platform_specific_fix && f.platform_specific_fix !== "N/A" && (
                    <p style={{ color: "rgba(0,255,157,0.8)", fontSize: "0.82rem", margin: "0 0 4px 0" }}><strong>Platform:</strong> {f.platform_specific_fix}</p>
                  )}
                  {f.references?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {f.references.map((ref: string, ri: number) => (
                        <span key={ri} style={{ background: "rgba(255,45,85,0.12)", border: "1px solid rgba(255,45,85,0.25)", color: "#ff2d55", padding: "1px 7px", borderRadius: 3, fontSize: "0.72rem" }}>{ref}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Informational Findings ── */}
      {informational_findings?.length > 0 && (
        <div style={panelStyle}>
          <p style={labelStyle}>Informational Observations ({informational_findings.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {informational_findings.map((f: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "rgba(255,255,255,0.25)", marginTop: 2 }}>&#9675;</span>
                <div>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 600 }}>{f.title}: </span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.83rem" }}>{f.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Prioritized Actions ── */}
      {prioritized_actions?.length > 0 && (
        <div style={{ ...panelStyle, borderLeft: "3px solid #00ff9d" }}>
          <p style={labelStyle}>Prioritized Remediation Steps</p>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {prioritized_actions.map((action: string, i: number) => (
              <li key={i} style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem", lineHeight: 1.6 }}>{action}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Final Recommendation ── */}
      {final_recommendation && (
        <div style={{ ...panelStyle, borderLeft: "3px solid rgba(0,212,255,0.5)" }}>
          <p style={labelStyle}>Final Recommendation</p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.92rem", lineHeight: 1.7, margin: 0 }}>{final_recommendation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const ScanResult = () => {

  const { scanId } = useParams<{ scanId: string }>();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batchId") || "";
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [batchScans, setBatchScans] = useState<any[]>([]);
  const [batchAnalysis, setBatchAnalysis] = useState<any>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({ type: "", message: "" });
  const [generating, setGenerating] = useState(false);
  const [reportModal, setReportModal] = useState<{ open: boolean; content: string }>({ open: false, content: "" });

  // reportGeneratedAt is always returned by the API and is more reliable than
  // checking reportContent (which is a large string that may be trimmed)
  const hasReport = !!(
    data?.reportGeneratedAt ||
    data?.reportContent ||
    batchScans.some((s: any) => s?.reportGeneratedAt || s?.reportContent)
  );

  const whoisInfo = useMemo(() => {
    if (!batchId) return null;
    const whoisScan = batchScans.find((s: any) => String(s.scanType).toLowerCase() === "whois");
    const raw = whoisScan?.results?.whois?.data || whoisScan?.results?.rawOutput || "";
    return raw ? String(raw).slice(0, 1200) : "";
  }, [batchId, batchScans]);

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  useEffect(() => {
    const fetchResult = async () => {
      if (!scanId) return;
      try {
        if (batchId) {
          const batchRes = await getBatchResults(batchId);
          const scans = Array.isArray(batchRes.data?.scans) ? batchRes.data.scans : [];
          setBatchScans(scans);
          setData(scans[0] || null);
          // Try loading existing batch analysis if already generated
          try {
            const viewRes = await viewBatchReport(batchId, "english");
            if (viewRes.data?.report?.analysis) setBatchAnalysis(viewRes.data.report.analysis);
          } catch { /* not yet generated — that's fine */ }
          return;
        }
        const singleRes = await getScanResultsById(scanId);
        setData(singleRes.data?.scan || singleRes.data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load scan result.");
      }
    };
    fetchResult();
  }, [scanId, batchId]);

  const extractVulnerabilities = useCallback((res: any, tool?: string) => {
    if (!res) return [];

    const normalizedTool = tool ? tool.toLowerCase() : "";
    const platform = String(data?.platform || data?.results?.platformDetection?.platform || "");

    // ── SQLMap results ──────────────────────────────────────────────────────────
    if (normalizedTool === "sqlmap" && Array.isArray(res.vulnerabilities) && res.vulnerabilities.length > 0) {
      if (typeof res.vulnerabilities[0] === "string") {
        return res.vulnerabilities.map((vuln: string) => ({
          title: "Database input risk",
          severity: "Critical",
          description: vuln,
          recommendation: "Use parameterized queries and validate input before it reaches the database.",
          platform_specific_fix: getPlatformFix(platform, "Database input risk", normalizedTool),
        }));
      }
      return res.vulnerabilities.map((v: any) => ({
        ...v,
        title: v.title || v.name || "Database input risk",
        recommendation: v.recommendation || "Use parameterized queries and validate input before it reaches the database.",
        platform_specific_fix: v.platform_specific_fix || getPlatformFix(platform, v.title || v.name || "Database input risk", normalizedTool),
      }));
    }

    // ── Nmap vulnerabilities and CVEs ──────────────────────────────────────────
    if (normalizedTool === "nmap" && Array.isArray(res.vulnerabilities) && res.vulnerabilities.length > 0) {
      if (typeof res.vulnerabilities[0] === "string") {
        return res.vulnerabilities.map((vuln: string) => {
          const cveMatch = vuln.match(/(CVE-\d{4}-\d{4,7})/i);
          const title = cveMatch ? `Service issue: ${cveMatch[1].toUpperCase()}` : "Service issue detected";
          return {
            title: title,
            severity: "High",
            description: vuln,
            recommendation: "Patch the affected service and restrict access to only what is needed.",
            platform_specific_fix: getPlatformFix(platform, title, normalizedTool),
          };
        });
      }
      return res.vulnerabilities.map((v: any) => ({
        ...v,
        title: v.title || v.name || "Service issue detected",
        recommendation: v.recommendation || "Patch the affected service and restrict access to only what is needed.",
        platform_specific_fix: v.platform_specific_fix || getPlatformFix(platform, v.title || v.name || "Service issue detected", normalizedTool),
      }));
    }

    // ── Rate-limit checks ─────────────────────────────────────────────────────
    if (normalizedTool === "ratelimit") {
      const findings = Array.isArray(res.findings) ? res.findings : [];
      return findings.map((finding: string) => {
        const lower = finding.toLowerCase();
        const isWeak = lower.includes("no rate or request limiting") || lower.includes("vulnerability");
        return {
          title: isWeak ? "Request throttling gap" : "Rate limiting check",
          severity: isWeak ? "High" : "Low",
          description: finding,
          recommendation: isWeak
            ? "Add request throttling, burst protection, and account-aware limits on public endpoints."
            : "Keep the current throttling controls enabled and review them after application changes.",
          platform_specific_fix: getPlatformFix(platform, isWeak ? "Request throttling gap" : "Rate limiting check", normalizedTool),
        };
      });
    }

    // ── DNS lookups ───────────────────────────────────────────────────────────
    if (normalizedTool === "dns" && res.records) {
      const dnsFindings: Array<any> = [];
      const recordTypes = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SOA"];

      for (const type of recordTypes) {
        const value = res.records[type] || res.records[type.toLowerCase()];
        if (!value) continue;
        const text = Array.isArray(value) ? value.join(", ") : String(value);
        dnsFindings.push({
          title: `${type} record`,
          severity: "Low",
          description: text,
          recommendation: type === "TXT"
            ? "Review public TXT records and remove anything that should stay internal."
            : "Review the DNS record and keep only the entries that are still needed.",
          platform_specific_fix: getPlatformFix(platform, `${type} record`, normalizedTool),
        });
      }

      if (!dnsFindings.length) {
        dnsFindings.push({
          title: "DNS lookup result",
          severity: "Low",
          description: JSON.stringify(res.records, null, 2),
          recommendation: "Review the DNS output and keep only the records that are required.",
          platform_specific_fix: getPlatformFix(platform, "DNS lookup result", normalizedTool),
        });
      }

      return dnsFindings;
    }

    // ── WHOIS lookups ─────────────────────────────────────────────────────────
    if (normalizedTool === "whois") {
      const rawWhois = String(res.data || res.rawOutput || res.summary || "").trim();
      if (!rawWhois) return [];

      return [{
        title: "Domain ownership details",
        severity: "Low",
        description: rawWhois.slice(0, 1200),
        recommendation: "Check registrar details, expiry date, and privacy settings for this domain.",
        platform_specific_fix: getPlatformFix(platform, "Domain ownership details", normalizedTool),
      }];
    }


    // ── Generic fallback for other vulnerabilities array ─────────────────────────
    if (Array.isArray(res.vulnerabilities) && res.vulnerabilities.length > 0 && normalizedTool !== "sqlmap" && normalizedTool !== "nmap") {
      if (typeof res.vulnerabilities[0] === "string") {
        return res.vulnerabilities.map((vuln: string) => ({
          title: "Security issue detected",
          severity: "High",
          description: vuln,
          recommendation: "Review the issue and apply the recommended patch or configuration change.",
          platform_specific_fix: getPlatformFix(platform, "Security issue detected", normalizedTool),
        }));
      }
      return res.vulnerabilities.map((v: any) => ({
        ...v,
        title: v.title || v.name || "Security issue detected",
        recommendation: v.recommendation || "Review the issue and apply the recommended patch or configuration change.",
        platform_specific_fix: v.platform_specific_fix || getPlatformFix(platform, v.title || v.name || "Security issue detected", normalizedTool),
      }));
    }

    // ── Nikto findings ──────────────────────────────────────────────────────────
    if (Array.isArray(res.findings) && res.findings.length > 0) {
      const critical = new Set((res.criticalFindings || []).map((x: string) => String(x)));
      const high = new Set((res.highFindings || []).map((x: string) => String(x)));
      const medium = new Set((res.mediumFindings || []).map((x: string) => String(x)));
      return res.findings.map((finding: string) => ({
        title: simplifyTitle(finding),
        severity: critical.has(finding) ? "Critical" : high.has(finding) ? "High" : medium.has(finding) ? "Medium" : "Low",
        description: finding,
        recommendation: "Review this finding and harden the related service or setting.",
        platform_specific_fix: getPlatformFix(platform, simplifyTitle(finding), normalizedTool),
      }));
    }

    // ── Nmap open ports ─────────────────────────────────────────────────────────
    if (Array.isArray(res.openPorts) && res.openPorts.length > 0) {
      return res.openPorts.map((port: string) => {
        const portNumMatch = port.match(/^(\d+)/);
        const portNum = portNumMatch ? parseInt(portNumMatch[1], 10) : 0;
        const isStandardWeb = portNum === 80 || portNum === 443;
        
        const isCloudflare = port.toLowerCase().includes("cloudflare");
        const isProxy = port.toLowerCase().includes("proxy");
        const hasVersionInfo = /\d+\.\d+/.test(port); // e.g., 2.4.7
        
        let severity = "Medium";
        // It's only truly LOW if it's a security proxy or a standard port WITHOUT exposed version info
        if (isStandardWeb && !hasVersionInfo) {
          severity = "Low";
        }
        if (isCloudflare || isProxy) severity = "Low";

        return {
          title: isStandardWeb && !hasVersionInfo ? "Normal web port" : `Open service: ${port}`,
          severity: severity,
          description: (isCloudflare || isProxy)
            ? `Security Proxy detected on ${port}. Your website is protected by a secondary layer (like Cloudflare or a Load Balancer).`
            : (isStandardWeb && hasVersionInfo)
            ? `Service version details are visible on ${port}. This can help attackers match known issues.`
            : isStandardWeb 
            ? `This is a normal web port and is expected for a public website.`
            : `Network service exposed on ${port}.`,
          recommendation: (isCloudflare || isProxy)
            ? "No action required. Your protective layer is active."
            : (isStandardWeb && hasVersionInfo)
            ? "Hide version details and patch the service to the latest release."
            : isStandardWeb
            ? "Keep the site on HTTPS and review the service only if it should not be public."
            : "Close the port if it is not needed or restrict it with firewall rules.",
          platform_specific_fix: getPlatformFix(platform, isStandardWeb ? "Normal web port" : "Open service", normalizedTool),
        };
      });
    }

    // ── SSLScan issues ───────────────────────────────────────────────────────────
    const sslIssues: any[] = [];
    if (Array.isArray(res.deprecatedProtocols) && res.deprecatedProtocols.length > 0) {
      res.deprecatedProtocols.forEach((proto: string) => {
        sslIssues.push({
          title: `Deprecated Protocol Enabled: ${proto.trim()}`,
          severity: "Critical",
          description: `The server accepts connections using the deprecated/insecure protocol: ${proto.trim()}`,
          recommendation: "Disable SSLv2, SSLv3, TLS 1.0, and TLS 1.1. Only allow TLS 1.2 and TLS 1.3.",
        });
      });
    }
    if (Array.isArray(res.weakCiphers) && res.weakCiphers.length > 0) {
      res.weakCiphers.forEach((cipher: string) => {
        sslIssues.push({
          title: `Weak Cipher Suite: ${cipher.trim()}`,
          severity: "High",
          description: `The server offers a weak cipher suite: ${cipher.trim()}`,
          recommendation: "Remove RC4, NULL, EXPORT, DES, 3DES and ANON ciphers from the server configuration.",
        });
      });
    }
    if (Array.isArray(res.certificateIssues) && res.certificateIssues.length > 0) {
      res.certificateIssues.forEach((issue: string) => {
        sslIssues.push({
          title: `Certificate Issue: ${issue.trim()}`,
          severity: "High",
          description: issue.trim(),
          recommendation: "Renew the SSL certificate and ensure it matches the domain name. Use a trusted Certificate Authority.",
        });
      });
    }
    if (Array.isArray(res.heartbleedVulnerable) && res.heartbleedVulnerable.length > 0) {
      sslIssues.push({
        title: "Heartbleed Vulnerability (CVE-2014-0160)",
        severity: "Critical",
        description: "The server is vulnerable to the Heartbleed bug which allows attackers to read memory.",
        recommendation: "Update OpenSSL to a patched version (1.0.1g or later) immediately.",
      });
    }
    if (sslIssues.length > 0) return sslIssues;

    // ── SQLMap results ──────────────────────────────────────────────────────────
    if (res.vulnerable && Array.isArray(res.vulnerabilities)) return res.vulnerabilities;
    if (Array.isArray(res.vulns)) return res.vulns;
    return [];
  }, [data]);

  const vulnerabilities = useMemo(() => {
    if (batchId && batchScans.length > 0) {
      return batchScans.flatMap((scan: any) => extractVulnerabilities(scan?.results || {}, scan?.scanType || scan?.tool));
    }
    if (!data?.results) return [];
    return extractVulnerabilities(data.results, data?.scanType || data?.tool);
  }, [data, batchId, batchScans, extractVulnerabilities]);

  const simpleFindings = useMemo(() => {
    return vulnerabilities.map((v: any) => ({
      ...v,
      simpleTitle: simplifyTitle(v.title || v.name || "Detected Vulnerability"),
      patchTitle: getRemediationForVulnerability(v.title || v.name || "Detected Vulnerability")?.name || "General patch guidance",
      patchAdvice:
        getRemediationForVulnerability(v.title || v.name || "Detected Vulnerability")?.steps?.[0]?.description ||
        "Review the issue and apply the recommended patch.",
    }));
  }, [vulnerabilities]);


  const handleGenerate = async () => {
    if (!scanId) return;
    setGenerating(true);
    try {
      const res = batchId
        ? await generateBatchAIReport(batchId, "english")
        : await generateAIReportForScan(scanId, "english");
      if (res.data?.success) {
        showToast("success", "AI Report generated successfully!");
        if (batchId) {
          if (res.data?.analysis) setBatchAnalysis(res.data.analysis);
          const refreshBatch = await getBatchResults(batchId);
          const scans = Array.isArray(refreshBatch.data?.scans) ? refreshBatch.data.scans : [];
          setBatchScans(scans);
          setData(scans[0] || null);
        } else {
          const refreshRes = await getScanResultsById(scanId);
          setData(refreshRes.data?.scan || refreshRes.data);
        }
      } else {
        showToast("error", res.data?.message || "Failed to generate AI report.");
      }
    } catch (e: any) {
      showToast("error", e?.response?.data?.message || e?.response?.data?.error || "Error generating report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleView = async () => {
    if (!scanId) return;
    if (!hasReport) {
      showToast("error", "Please click 'Generate AI Report' first to see the analysis.");
      return;
    }
    try {
      const res = batchId
        ? await viewBatchReport(batchId, "english")
        : await viewReport(scanId, "english");
      const reportData = res.data;

      if (reportData?.success && reportData?.report?.analysis) {
        setBatchAnalysis(reportData.report.analysis);
      }
      if (reportData?.success && reportData?.report?.content) {
        setReportModal({ open: true, content: reportData.report.content });
      } else {
        showToast("error", reportData?.message || "Report not ready yet. Please generate it first.");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Report not found. Please generate it first.";
      showToast("error", msg);
    }
  };

  const handleDownload = async () => {
    if (!scanId) return;
    if (!hasReport) {
      showToast("error", "Please click 'Generate AI Report' first to analyze the findings.");
      return;
    }
    setGenerating(true);
    try {
      const res = batchId
        ? await downloadBatchReport(batchId, "english")
        : await downloadReport(scanId, "english");
      const reportData = res.data;
      if (reportData?.success && reportData?.report?.content) {
        const target = data?.targetUrl || data?.url || "unknown";
        const suffix = batchId ? `batch-${batchId.slice(-6)}` : scanId?.slice(-6);
        const filename = `Vuln-Spectra-Report-${target.replace(/https?:\/\//, "").replace(/[^a-z0-9]/gi, "-")}-${suffix}`;
        saveTextAsPdf(filename, reportData.report.content);
        showToast("success", "PDF downloaded successfully.");
        if (batchId) {
          const refreshBatch = await getBatchResults(batchId);
          const scans = Array.isArray(refreshBatch.data?.scans) ? refreshBatch.data.scans : [];
          setBatchScans(scans);
          setData(scans[0] || null);
        } else {
          const refreshRes = await getScanResultsById(scanId);
          setData(refreshRes.data?.scan || refreshRes.data);
        }
      } else {
        showToast("error", "Could not retrieve report content.");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Download failed. Please try again.";
      showToast("error", msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!data?.results) {
      showToast("error", "No scan data to download.");
      return;
    }
    const content = typeof data.results === "object"
      ? JSON.stringify(data.results, null, 2)
      : String(data.results);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const target = data?.targetUrl || data?.url || "unknown";
    a.href = url;
    a.download = `Vuln-Spectra-Raw-${target.replace(/https?:\/\//, "").replace(/[^a-z0-9]/gi, "-")}-${scanId?.slice(-6) || "scan"}.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    // Revoke after a short delay to ensure download starts
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    showToast("success", "Raw data downloaded successfully.");
  };


  const handleRetryFailedScan = async () => {
    if (!data?.targetUrl) {
      showToast("error", "Cannot retry this scan.");
      return;
    }
    try {
      const normalizedTool = batchId ? "auto" : String(data.scanType).toLowerCase();
      const retryScanType =
        normalizedTool === "sslscan"
          ? "ssl"
          : normalizedTool === "auto"
          ? "all"
          : normalizedTool;
      const response = await startScan({
        targetUrl: data.targetUrl,
        scanType: retryScanType,
      });
      const newScanId =
        response.data?.scanId ||
        response.data?.scan?._id ||
        response.data?.scans?.[0]?._id;
      if (!newScanId) {
        showToast("error", "Retry started but scan id not received.");
        return;
      }
      const newBatchId = response.data?.batchId;
      if (newBatchId) {
        navigate(`/scan-progress/${newScanId}?batchId=${encodeURIComponent(newBatchId)}`);
      } else {
        navigate(`/scan-progress/${newScanId}`);
      }
    } catch (e: any) {
      showToast("error", e?.response?.data?.error || "Retry failed.");
    }
  };

  if (error) return (
    <div className="result-page-premium">
      <div className="error-state">
        <AlertTriangle size={48} className="text-accent" />
        <h2>Failed to Load Results</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/dashboard")} className="primary-action-btn">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="result-page-premium">
      <div className="noise-overlay"></div>

      <div className="result-content-wrap">
        <header className="result-header-premium">
          <div className="header-left">
            <Link to="/scan-history" className="back-link">
              <ChevronLeft size={18} />
              <span>Scan History</span>
            </Link>
              <h1 className="header-title">Scan Report</h1>
              <div className="header-badges">
                <span className={`status-badge ${data?.status}`}>{data?.status?.toUpperCase() || "…"}</span>
                <span className="tool-badge">{batchId ? "AUTO" : (data?.scanType || data?.tool || "N/A").toUpperCase()}</span>
              </div>
            </div>
          <div className="header-right">
            <button className="action-btn secondary" onClick={handleDownloadTxt}>
              <FileText size={18} />
              <span>Raw TXT</span>
            </button>
            <button className="action-btn secondary" onClick={handleDownload} disabled={generating || !hasReport} title={!hasReport ? "Generate AI Report first" : "Download PDF"}>
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button
              className={`action-btn primary${!hasReport ? " report-pulse" : ""}`}
              onClick={handleGenerate}
              disabled={generating}
              title={hasReport ? "Regenerate AI Report" : "Generate AI Report"}
            >
              {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{generating ? "Generating…" : hasReport ? "Regenerate Report" : "Generate AI Report"}</span>
            </button>
          </div>
        </header>

        {!data ? (
          <div className="loading-state-premium">
            <Loader2 className="animate-spin" size={48} />
            <p>Loading scan results…</p>
          </div>
        ) : (
          <div className="result-grid-layout">
            <aside className="result-sidebar">
              {data?.results?.platformDetection && (
                <div className="platform-highlight">
                  <div className="platform-title">Platform Detected</div>
                  <div className="platform-value">{data.platform || "Unknown"}</div>
                  <div className="platform-meta">
                    Confidence {Math.round((data.results.platformDetection.confidence || 0) * 100)}%
                  </div>
                </div>
              )}
              <div className="summary-panel glass-panel">
                <div className="panel-section">
                  <label>Target URL</label>
                  <a href={data.targetUrl || data.url} target="_blank" rel="noopener noreferrer" className="target-link" style={{ textDecoration: 'none' }}>
                    <span className="truncate">{data.targetUrl || data.url}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
                <div className="panel-divider"></div>
                <div className="panel-section">
                  <label>Scan Metrics</label>
                  <div className="metric-row">
                    <div className="m-item">
                      <Clock size={14} />
                      <span>{data.createdAt ? new Date(data.createdAt).toLocaleTimeString() : data.startedAt ? new Date(data.startedAt).toLocaleTimeString() : "N/A"}</span>
                    </div>
                    <div className="m-item">
                      <AlertTriangle size={14} />
                      <span className="text-accent">
                        {vulnerabilities.length} {vulnerabilities.some((v: any) => ["Critical", "High"].includes(v.severity)) ? "vulnerabilities" : "findings"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="panel-divider"></div>
                <div className="panel-section">
                  <label>Infrastructure</label>
                  <div className="infra-stats">
                    <div className="infra-item" title="Detected Operating System">
                      <Rocket size={14} />
                      <span className="truncate">{data.platform || "Detection in progress..."}</span>
                    </div>
                    {data.results?.serverInfo && (
                      <div className="infra-item" title="Web Server Info">
                        <Globe size={14} />
                        <span className="truncate">{data.results.serverInfo}</span>
                      </div>
                    )}
                    {data.results?.techStack && (
                      <div className="infra-item" title="Technology Stack">
                        <Shield size={14} />
                        <span className="truncate">{data.results.techStack}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="actions-panel glass-panel">
                <button className="sidebar-action-btn" onClick={handleView} disabled={generating || !hasReport} title={!hasReport ? "Generate AI Report first" : "View AI Report"}>
                  <Eye size={18} />
                  <span>View AI Report</span>
                </button>
                <button className="sidebar-action-btn" onClick={() => navigate("/start-scan")}>
                  <Search size={18} />
                  <span>New Scan</span>
                </button>
                {data?.status === "completed" && vulnerabilities.length > 0 && (
                  <button className="sidebar-action-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }} title="Auto PoC feature coming soon and under process">
                    <Sparkles size={18} />
                    <span>⏰ Auto PoC (Coming soon and under process)</span>
                  </button>
                )}
                {data?.status === "failed" && (
                  <button className="sidebar-action-btn" onClick={handleRetryFailedScan}>
                    <Loader2 size={18} />
                    <span>Retry Failed Scan</span>
                  </button>
                )}
              </div>
            </aside>

            <main className="result-main-area">
              {/* ── Batch mode: Structured AI Analysis Panel ─────────────────── */}
              {batchId && batchAnalysis ? (
                <>
                  <BatchAnalysisPanel analysis={batchAnalysis} scanPlan={batchScans?.[0]?.scanPlan} />
                  {whoisInfo && (
                    <div className="whois-panel glass-panel">
                      <div className="whois-title">WHOIS (Informational)</div>
                      <pre className="whois-content">{whoisInfo}</pre>
                    </div>
                  )}
                </>
              ) : (
              <div className="findings-container">
                <div className="findings-header">
                  <h3>Findings</h3>
                  <div className="finding-stats">
                    <span className="critical">{simpleFindings.filter((v: any) => v.severity === "Critical").length} Critical</span>
                    <span className="high">{vulnerabilities.filter((v: any) => v.severity === "High").length} High</span>
                    <span className="med">{vulnerabilities.filter((v: any) => v.severity === "Medium").length} Medium</span>
                    <span className="low">{vulnerabilities.filter((v: any) => v.severity === "Low").length} Low</span>
                  </div>
                </div>
                <div className="findings-list">
                  {simpleFindings.length > 0 ? (
                    simpleFindings.map((v: any, i: number) => (
                      <div className={`finding-card severity-${v.severity?.toLowerCase()}`} key={i}>
                        <div className="finding-icon"><AlertTriangle size={24} /></div>
                        <div className="finding-content">
                          <div className="f-header">
                            <h4>{v.simpleTitle || v.title || v.name || "Unnamed Vulnerability"}</h4>
                            <span className="severity-tag">{v.severity || "Unknown"}</span>
                          </div>
                          <p>{v.description || "We found a security issue that should be reviewed."}</p>
                          {v.recommendation && (
                            <div className="recommendation">
                              <CheckCircle size={14} />
                              <span>Fix: {v.recommendation}</span>
                            </div>
                          )}
                          <VulnerabilityRemediation vulnerabilityTitle={v.title || v.name || "Unknown"} severity={v.severity} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="raw-results-panel glass-panel">
                      <div className="panel-header-mini"><Terminal size={16} /><span>Scan Analysis Results</span></div>
                      <div style={{ padding: "24px", textAlign: "center" }}>
                        {data?.status === "completed" ? (
                          <><CheckCircle size={48} style={{ color: "var(--cyber-primary)", margin: "0 auto 16px auto", display: "block" }} />
                          <h3 style={{ color: "var(--cyber-text)", marginBottom: "8px" }}>No Vulnerabilities Found!</h3>
                          <p style={{ color: "var(--cyber-text-dim)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "500px", margin: "0 auto" }}>
                            The scanning engine did not detect any high-severity issues. Generate an AI Report for a full correlated analysis.
                          </p></>
                        ) : data?.status === "failed" ? (
                          <><AlertTriangle size={48} style={{ color: "var(--cyber-accent)", margin: "0 auto 16px auto", display: "block" }} />
                          <h3 style={{ color: "var(--cyber-text)", marginBottom: "8px" }}>Scan Failed / Host Unreachable</h3>
                          <pre className="raw-terminal" style={{ marginTop: "20px", textAlign: "left" }}>
                            {typeof data.results === "object" ? JSON.stringify(data.results, null, 2) : data.results || "No error details."}
                          </pre></>
                        ) : (
                          <pre className="raw-terminal" style={{ textAlign: "left" }}>
                            {typeof data.results === "object" ? JSON.stringify(data.results, null, 2) : data.results || "No output data available."}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              )}
            </main>
          </div>
        )}

        {toast.message && (
          <div className={`toast-premium ${toast.type}`}>
            {toast.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {reportModal.open && (
          <div className="modal-overlay-premium" onClick={() => setReportModal({ open: false, content: "" })}>
            <div className="modal-content-premium" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <FileText size={20} />
                  <span>AI Security Report</span>
                </div>
                <button className="close-modal-btn" onClick={() => setReportModal({ open: false, content: "" })}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body-premium">
                <ReportViewer content={reportModal.content} />
              </div>
              <div className="modal-footer">
                <button className="primary-action-btn" onClick={handleDownload}>Export PDF</button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default ScanResult;
