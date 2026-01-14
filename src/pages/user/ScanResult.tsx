 
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
import {
  getScanResultsById,
  generateAIReportForScan,
  viewReport,
  downloadReport,
} from "../../api/scan-api";
import "../../styles/scan-result.css";
import aiAnimation from "../../assets/icons/aiSearching.json";
import eyeAnimation from "../../assets/icons/found.json";
import downloadAnimation from "../../assets/icons/Downloading.json";
import saveTextAsPdf from "../../utils/saveAsPdf";

type ToastType = "success" | "error" | "";

const ScanResult = () => {
  const { scanId } = useParams<{ scanId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({
    type: "",
    message: "",
  });
  const [generating, setGenerating] = useState(false);
  const [reportModal, setReportModal] = useState<{ open: boolean; content: string }>({ open: false, content: "" });

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 2500);
  };

  useEffect(() => {
    const fetchResult = async () => {
      if (!scanId) return;
      try {
        const res = await getScanResultsById(scanId);
        setData(res.data?.scan || res.data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load scan result");
      }
    };
    fetchResult();
  }, [scanId]);

  const handleGenerate = async () => {
    if (!scanId) return;
    setGenerating(true);
    try {
      const res = await generateAIReportForScan(scanId);
      showToast(
        "success",
        res.data?.message || "AI report generation started."
      );
    } catch (e: any) {
      showToast(
        "error",
        e?.response?.data?.error || "Failed to generate report"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleView = async () => {
    if (!scanId) return;
    try {
      const res = await viewReport(scanId);
      const ct = res.headers["content-type"] || "";
      if (ct.includes("application/pdf")) {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        showToast("success", "PDF opened in new tab.");
        return;
      }
      // Assume text report
      const text =
        typeof res.data === "string"
          ? res.data
          : new TextDecoder().decode(res.data);

      // Try extract a message if this is an error-y JSON, otherwise show the text
      let errorJson: null | { message?: string; error?: string } = null;
      try {
        errorJson = JSON.parse(text);
      } catch {}
      if (
        errorJson &&
        (errorJson?.error?.toLowerCase().includes("not generated") ||
          errorJson?.message?.toLowerCase().includes("generate"))
      ) {
        setToast({
          type: "error",
          message:
            "Report not generated yet. Please generate the report first.",
        });
        setReportModal({ open: false, content: "" });
      } else {
        setToast({ type: "", message: "" }); 
        setReportModal({ open: true, content: text });
      }
    } catch (e: any) {
      setToast({
        type: "error",
        message:
          e?.response?.data?.error ||
          "Failed to view report please generate report first",
      });
      setReportModal({ open: false, content: "" });
    }
  };

const handleDownload = async () => {
  if (!scanId) return;
  try {
    const res = await downloadReport(scanId);
    const ct = res.headers["content-type"] || "";
    const dispo = res.headers["content-disposition"] || "";
    const match = dispo.match(/filename="?(.+)"?/i);
    const filename = match
      ? match[1]
      : `report-${scanId}.${ct.includes("pdf") ? "pdf" : "txt"}`;

    if (ct.includes("text/plain") || filename.endsWith(".txt")) {
      const text =
        typeof res.data === "string"
          ? res.data
          : new TextDecoder().decode(res.data);
      saveTextAsPdf(filename.replace(/\.txt$/i, ".pdf"), text);
      showToast("success", "Downloaded PDF");
      return;
    }
    const blob = new Blob([res.data], { type: ct || "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    showToast("success", `Downloaded ${filename}`);
  } catch (e: any) {
    const msg = e?.response?.data
      ? typeof e.response.data === "string"
        ? e.response.data
        : new TextDecoder().decode(e.response.data)
      : e?.response?.data?.error;
    setToast({
      type: "error",
      message: msg || "Failed to download report",
    });
  }
};
  return (
    <div className="scan-container">
      <div className="scan-card">
        <h2 className="text-gradient">Scan Result</h2>
        <p className="scan-subtitle">Scan ID: {scanId}</p>

        {error && (
          <div className="scan-error">
            <div className="error-text">{error}</div>
          </div>
        )}

        {data ? (
          <div className="result-card">
            <div className="result-header">
              <div>
                <h3>{data.targetUrl}</h3>
                <p className="result-meta">
                  Tool: {data.scanType} • Started:{" "}
                  {data.startedAt
                    ? new Date(data.startedAt).toLocaleString()
                    : data.createdAt
                    ? new Date(data.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <span className={`scan-status status-${data.status}`}>
                {data.status}
              </span>
            </div>

            <div className="result-body">
              <h4>Raw Results</h4>
              <pre className="result-pre">
                {typeof data.results === "object"
                  ? JSON.stringify(data.results, null, 2)
                  : data.results || "No results yet."}
              </pre>
            </div>

            <div className="result-actions">
              <button
                className="tool-button ai-button"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <div className="ai-icon-container">
                      <Lottie
                        animationData={aiAnimation}
                        loop
                        className="ai-lottie"
                      />
                    </div>
                    Generate AI Report
                  </>
                )}
              </button>

              <button className="tool-button view-button" onClick={handleView}>
                <div className="view-icon-container">
                  <Lottie
                    animationData={eyeAnimation}
                    loop
                    className="ai-lottie"
                  />
                </div>
                View Report
              </button>

              <button
                className="tool-button download-button"
                onClick={handleDownload}
              >
                <div className="download-icon-container">
                  <Lottie
                    animationData={downloadAnimation}
                    loop
                    className="ai-lottie"
                  />
                </div>
                Download Report
              </button>
            </div>

            {/* Show error/success toast directly below action buttons for visibility */}
            {toast.message && (
              <div className={`toast toast-${toast.type}`}>{toast.message}</div>
            )}

            {/* Modal for viewing text reports */}
            {reportModal.open && (
              <div className="report-modal-overlay">
                <div className="report-modal">
                  <button
                    className="modal-close"
                    onClick={() =>
                      setReportModal({ open: false, content: "" })
                    }
                  >
                    Close
                  </button>
                  <pre className="modal-report-content">
                    {reportModal.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="loading-text">Loading...</p>
        )}

        <div className="form-actions">
          <button
            className="btn-secondary"
            onClick={() => navigate("/scan-history")}
          >
            ← Back to History
          </button>
          <button className="scan-button" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
          <button className="scan-button" onClick={() => navigate("/start-scan")}>
            Start a New Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;