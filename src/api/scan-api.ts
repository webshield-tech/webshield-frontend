/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

// Start a new scan
export const startScan = (data: {
  targetUrl: string;
  scanType: string;
  scanMode?: "quick" | "full";
  options?: any;
}) => {
  return api.post("/scan/start", data);
};

// Ping target
export const pingTarget = (url: string) => {
  return api.post("/scan/ping", { url });
};
// Get scan history
export const getScanHistory = () => {
  return api.get("/scan/history");
};

// Get scan results by ID
export const getScanResultsById = (scanId: string) => {
  return api.get(`/scan/${scanId}`);
};

// Get all scans in a batch (auto-scan mode)
export const getBatchResults = (batchId: string) => {
  return api.get(`/scan/batch/${batchId}`);
};

// Cancel a scan
export const cancelScan = (scanId: string) => {
  return api.post(`/scan/${scanId}/cancel`);
};

// Generate AI report
export const generateAIReportForScan = (
  scanId: string,
  language: string = "english"
) => {
  return api.post(`/scan/${scanId}/report/generate`, { language });
};

// Download report (returns JSON with text content - PDF generated client-side)
export const downloadReport = (scanId: string, language: string = "english") =>
  api.get(`/scan/${scanId}/report/download`, { params: { language } });
// View report (returns JSON with content)
export const viewReport = (scanId: string, language: string = "english") =>
  api.get(`/scan/${scanId}/report/view`, { params: { language } });

export const generateBatchAIReport = (
  batchId: string,
  language: string = "english"
) => {
  return api.post(`/scan/batch/${batchId}/report/generate`, { language });
};

export const downloadBatchReport = (
  batchId: string,
  language: string = "english"
) => {
  return api.get(`/scan/batch/${batchId}/report/download`, { params: { language } });
};

export const viewBatchReport = (
  batchId: string,
  language: string = "english"
) => {
  return api.get(`/scan/batch/${batchId}/report/view`, { params: { language } });
};
