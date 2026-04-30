/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
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
  X
} from "lucide-react";
import { VulnerabilityRemediation } from "../../components/VulnerabilityRemediation";
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
import api from "../../api/axios";

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

const ScanResult = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batchId") || "";
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [batchScans, setBatchScans] = useState<any[]>([]);
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

  const extractVulnerabilities = (res: any, tool?: string) => {
    if (!res) return [];

    const normalizedTool = tool ? tool.toLowerCase() : "";

    // ── SQLMap results ──────────────────────────────────────────────────────────
    if (normalizedTool === "sqlmap" && Array.isArray(res.vulnerabilities) && res.vulnerabilities.length > 0) {
      if (typeof res.vulnerabilities[0] === "string") {
        return res.vulnerabilities.map((vuln: string) => ({
          title: "SQL Injection Vulnerability",
          severity: "Critical",
          description: vuln,
          recommendation: "Ensure all user inputs are properly sanitized and use parameterized queries or prepared statements.",
        }));
      }
      return res.vulnerabilities.map((v: any) => ({
        ...v,
        title: v.title || v.name || "SQL Injection Vulnerability",
      }));
    }

    // ── Nmap vulnerabilities and CVEs ──────────────────────────────────────────
    if (normalizedTool === "nmap" && Array.isArray(res.vulnerabilities) && res.vulnerabilities.length > 0) {
      if (typeof res.vulnerabilities[0] === "string") {
        return res.vulnerabilities.map((vuln: string) => {
          const cveMatch = vuln.match(/(CVE-\d{4}-\d{4,7})/i);
          const title = cveMatch ? `Vulnerability: ${cveMatch[1].toUpperCase()}` : "Service Vulnerability Detected";
          return {
            title: title,
            severity: "High",
            description: vuln,
            recommendation: "Apply patches or updates to the affected service. Consider restricting access via firewall.",
          };
        });
      }
      return res.vulnerabilities.map((v: any) => ({
        ...v,
        title: v.title || v.name || "Service Vulnerability Detected",
      }));
    }

    // ── Generic fallback for other vulnerabilities array ─────────────────────────
    if (Array.isArray(res.vulnerabilities) && res.vulnerabilities.length > 0 && normalizedTool !== "sqlmap" && normalizedTool !== "nmap") {
      if (typeof res.vulnerabilities[0] === "string") {
        return res.vulnerabilities.map((vuln: string) => ({
          title: "Detected Vulnerability",
          severity: "High",
          description: vuln,
          recommendation: "Review the vulnerability details and apply necessary security patches.",
        }));
      }
      return res.vulnerabilities.map((v: any) => ({
        ...v,
        title: v.title || v.name || "Detected Vulnerability",
      }));
    }

    // ── Nikto findings ──────────────────────────────────────────────────────────
    if (Array.isArray(res.findings) && res.findings.length > 0) {
      const critical = new Set((res.criticalFindings || []).map((x: string) => String(x)));
      const high = new Set((res.highFindings || []).map((x: string) => String(x)));
      const medium = new Set((res.mediumFindings || []).map((x: string) => String(x)));
      return res.findings.map((finding: string) => ({
        title: finding,
        severity: critical.has(finding) ? "Critical" : high.has(finding) ? "High" : medium.has(finding) ? "Medium" : "Low",
        description: finding,
        recommendation: "Review this finding and harden configuration before production.",
      }));
    }

    // ── Nmap open ports ─────────────────────────────────────────────────────────
    if (Array.isArray(res.openPorts) && res.openPorts.length > 0) {
      return res.openPorts.map((port: string) => ({
        title: `Open Port: ${port}`,
        severity: "Medium",
        description: `Network service exposed on ${port}.`,
        recommendation: "Close unnecessary ports or restrict access using firewall rules.",
      }));
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
  };

  const vulnerabilities = useMemo(() => {
    if (batchId && batchScans.length > 0) {
      return batchScans.flatMap((scan: any) => extractVulnerabilities(scan?.results || {}, scan?.scanType || scan?.tool));
    }
    if (!data?.results) return [];
    return extractVulnerabilities(data.results, data?.scanType || data?.tool);
  }, [data, batchId, batchScans]);


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
                      <span>{data.startedAt ? new Date(data.startedAt).toLocaleTimeString() : "N/A"}</span>
                    </div>
                    <div className="m-item">
                      <AlertTriangle size={14} />
                      <span className="text-accent">{vulnerabilities.length} vulnerabilities</span>
                    </div>
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
              <div className="findings-container">
                <div className="findings-header">
                  <h3>Findings</h3>
                  <div className="finding-stats">
                    <span className="high">{vulnerabilities.filter((v: any) => v.severity === "High").length} High</span>
                    <span className="med">{vulnerabilities.filter((v: any) => v.severity === "Medium").length} Medium</span>
                    <span className="low">{vulnerabilities.filter((v: any) => v.severity === "Low").length} Low</span>
                  </div>
                </div>

                <div className="findings-list">
                  {vulnerabilities.length > 0 ? (
                    vulnerabilities.map((v: any, i: number) => (
                      <div className={`finding-card severity-${v.severity?.toLowerCase()}`} key={i}>
                        <div className="finding-icon">
                          <AlertTriangle size={24} />
                        </div>
                        <div className="finding-content">
                          <div className="f-header">
                            <h4>{v.title || v.name || "Unnamed Vulnerability"}</h4>
                            <span className="severity-tag">{v.severity || "Unknown"}</span>
                          </div>
                          <p>{v.description || "No description provided by the scanning engine."}</p>
                          {v.recommendation && (
                            <div className="recommendation">
                              <CheckCircle size={14} />
                              <span>Recommendation: {v.recommendation}</span>
                            </div>
                          )}
                            <VulnerabilityRemediation 
                              vulnerabilityTitle={v.title || v.name || "Unknown"}
                              severity={v.severity}
                            />

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="raw-results-panel glass-panel">
                      <div className="panel-header-mini">
                        <Terminal size={16} />
                        <span>Scan Analysis Results</span>
                      </div>
                      <div style={{ padding: "24px", textAlign: "center" }}>
                        {data?.status === "completed" && vulnerabilities.length === 0 ? (
                          <>
                            <CheckCircle size={48} style={{ color: "var(--cyber-primary)", margin: "0 auto 16px auto", display: "block" }} />
                            <h3 style={{ color: "var(--cyber-text)", marginBottom: "8px" }}>No Vulnerabilities Found!</h3>
                            <p style={{ color: "var(--cyber-text-dim)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "500px", margin: "0 auto" }}>
                              Great news! The scanning engine did not detect any high-severity issues on this target during this specific scan. However, security is an ongoing process. We recommend running deep scans regularly and combining automated tools with manual testing.
                            </p>
                          </>
                        ) : data?.status === "failed" ? (
                           <>
                             <AlertTriangle size={48} style={{ color: "var(--cyber-accent)", margin: "0 auto 16px auto", display: "block" }} />
                             <h3 style={{ color: "var(--cyber-text)", marginBottom: "8px" }}>Scan Failed / Host Unreachable</h3>
                             <p style={{ color: "var(--cyber-text-dim)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: "500px", margin: "0 auto" }}>
                               The scanning engine could not reach the target or encountered an error. Please ensure the target is online, your URL is correct, and that firewalls are not blocking the scan.
                             </p>
                             <pre className="raw-terminal" style={{ marginTop: "20px", textAlign: "left" }}>
                               {typeof data.results === "object" ? JSON.stringify(data.results, null, 2) : data.results || "No error details provided."}
                             </pre>
                           </>
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
