/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { 
  Shield, 
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
import {
  getScanResultsById,
  generateAIReportForScan,
  viewReport,
  downloadReport,
  startScan,
} from "../../api/scan-api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../styles/scan-result.css";
import saveTextAsPdf from "../../utils/saveAsPdf";
import api from "../../api/axios";

type ToastType = "success" | "error" | "";

const ScanResult = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({ type: "", message: "" });
  const [generating, setGenerating] = useState(false);
  const [exploiting, setExploiting] = useState(false);
  const [reportModal, setReportModal] = useState<{ open: boolean; content: string }>({ open: false, content: "" });
  const [reportLanguage, setReportLanguage] = useState("english");

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  useEffect(() => {
    const fetchResult = async () => {
      if (!scanId) return;
      try {
        const res = await getScanResultsById(scanId);
        setData(res.data?.scan || res.data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load scan result.");
      }
    };
    fetchResult();
  }, [scanId]);

  const vulnerabilities = useMemo(() => {
    if (!data?.results) return [];
    const res = data.results;
    if (Array.isArray(res.vulnerabilities) && res.vulnerabilities.length > 0) {
      return res.vulnerabilities;
    }
    if (Array.isArray(res.findings) && res.findings.length > 0) {
      const critical = new Set((res.criticalFindings || []).map((x: string) => String(x)));
      const high = new Set((res.highFindings || []).map((x: string) => String(x)));
      const medium = new Set((res.mediumFindings || []).map((x: string) => String(x)));
      return res.findings.map((finding: string) => ({
        title: finding,
        severity: critical.has(finding)
          ? "Critical"
          : high.has(finding)
          ? "High"
          : medium.has(finding)
          ? "Medium"
          : "Low",
        description: finding,
        recommendation: "Review this finding and harden configuration before production.",
      }));
    }
    if (Array.isArray(res.openPorts) && res.openPorts.length > 0) {
      return res.openPorts.map((port: string) => ({
        title: `Open Port: ${port}`,
        severity: "Medium",
        description: `Network service exposed on ${port}.`,
        recommendation: "Close unnecessary ports or restrict access using firewall rules.",
      }));
    }
    if (Array.isArray(res.vulns)) return res.vulns;
    return [];
  }, [data]);

  const handleGenerate = async () => {
    if (!scanId) return;
    setGenerating(true);
    try {
      const res = await generateAIReportForScan(scanId, reportLanguage);
      if (res.data?.success) {
        showToast("success", "AI Report generated successfully!");
        // Refresh data so local state knows report exists
        const refreshRes = await getScanResultsById(scanId);
        setData(refreshRes.data?.scan || refreshRes.data);
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
    try {
      const res = await viewReport(scanId, reportLanguage);
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
    try {
      const res = await downloadReport(scanId, reportLanguage);
      const reportData = res.data;

      if (reportData?.success && reportData?.report?.content) {
        const target = data?.targetUrl || data?.url || "unknown";
        const filename = `Vuln-Spectra-Report-${target.replace(/https?:\/\//, "").replace(/[^a-z0-9]/gi, "-")}-${scanId.slice(-6)}`;
        saveTextAsPdf(filename, reportData.report.content);
        showToast("success", "PDF downloaded successfully.");
      } else {
        showToast("error", reportData?.message || "Report not ready. Please generate it first.");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "Download failed. Please generate the report first.";
      showToast("error", msg);
    }
  };

  const handleExploit = async (vulnTitle: string) => {
    const confirmExploit = window.confirm(
      `Warning: You are about to run an automated exploit simulation for "${vulnTitle}".\n\nOnly proceed if you have explicit authorization for this target.`
    );
    if (!confirmExploit) return;

    setExploiting(true);
    showToast("error", "Initiating exploit simulation…");

    try {
      const baseUrl = String(api.defaults.baseURL || "").replace(/\/+$/, "");
      const exploitPath = baseUrl.endsWith("/api") ? "/exploit" : "/api/exploit";
      const response = await api.post(exploitPath, {
        scanId,
        targetUrl: data?.targetUrl || data?.url,
        vulnTitle,
      });
      const resData = response.data;
      if (resData.success) {
        showToast("success", "Exploit simulation completed. Check logs for details.");
      } else {
        showToast("error", "Exploit blocked: " + (resData.error || "Payload rejected by WAF."));
      }
    } catch (e: any) {
      showToast("error", e?.response?.data?.error || "Connection error during exploit simulation.");
    } finally {
      setExploiting(false);
    }
  };

  const handleAutoExploit = async () => {
    if (!vulnerabilities.length) {
      showToast("error", "No finding available for simulation.");
      return;
    }
    const prioritized =
      vulnerabilities.find((v: any) =>
        ["critical", "high"].includes(String(v?.severity || "").toLowerCase())
      ) || vulnerabilities[0];
    await handleExploit(prioritized.title || prioritized.name || "Top Finding");
  };

  const handleRetryFailedScan = async () => {
    if (!data?.targetUrl || !data?.scanType) {
      showToast("error", "Cannot retry this scan.");
      return;
    }
    try {
      const normalizedTool = String(data.scanType).toLowerCase();
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
      navigate(`/scan-progress/${newScanId}`);
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
              <span className="tool-badge">{(data?.scanType || data?.tool || "N/A").toUpperCase()}</span>
            </div>
          </div>
          <div className="header-right">
            <select
              className="action-btn secondary"
              value={reportLanguage}
              onChange={(e) => setReportLanguage(e.target.value)}
              disabled={generating}
              style={{ paddingRight: "2.2rem" }}
              title="Report language"
            >
              <option value="english">English</option>
              <option value="urdu">Urdu</option>
              <option value="hindi">Hindi</option>
              <option value="arabic">Arabic</option>
            </select>
            <button className="action-btn secondary" onClick={handleDownload} disabled={generating}>
              <Download size={18} />
              <span>Download PDF</span>
            </button>
            <button className="action-btn primary" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              <span>{generating ? "Generating…" : "Generate AI Report"}</span>
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
                  <div className="target-link">
                    <span className="truncate">{data.targetUrl || data.url}</span>
                    <ExternalLink size={14} />
                  </div>
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
                <button className="sidebar-action-btn" onClick={handleView}>
                  <Eye size={18} />
                  <span>View AI Report</span>
                </button>
                <button className="sidebar-action-btn" onClick={() => navigate("/start-scan")}>
                  <Search size={18} />
                  <span>New Scan</span>
                </button>
                {data?.status === "completed" && vulnerabilities.length > 0 && (
                  <button className="sidebar-action-btn" onClick={handleAutoExploit} disabled={exploiting}>
                    <Sparkles size={18} />
                    <span>{exploiting ? "Simulating…" : "AI Auto Exploit (Safe Demo)"}</span>
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
                          {(v.severity === "High" || v.severity === "Critical") && (
                            <button
                              className="action-btn error"
                              style={{ marginTop: "12px", fontSize: "0.8rem", padding: "6px 14px" }}
                              onClick={() => handleExploit(v.title || v.name)}
                              disabled={exploiting}
                            >
                              <Sparkles size={14} />
                              <span>{exploiting ? "Running simulation…" : "Verify & Simulate Exploit"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="raw-results-panel glass-panel">
                      <div className="panel-header-mini">
                        <Terminal size={16} />
                        <span>Raw Engine Output</span>
                      </div>
                      <pre className="raw-terminal">
                        {typeof data.results === "object"
                          ? JSON.stringify(data.results, null, 2)
                          : data.results || "No output data available."}
                      </pre>
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
              <div className="modal-body-premium markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {reportModal.content}
                </ReactMarkdown>
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
