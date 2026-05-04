/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

// Start a new scan
export const startScan = (data: {
  targetUrl: string;
  scanType: string;
  scanMode?: "quick" | "full";
  sqlmapUrl?: string;
  options?: any;
}) => {
  return api.post("/scan/start", data);
};

// Ping target (check availability)
export const pingTarget = (url: string) => {
  return api.post("/scan/ping", { url });
};

/**
 * Website type detection — runs lightweight recon and returns
 * what kind of site it is + which tools will be used.
 * Used by the Auto Scan UI before initiating the scan.
 */
export const detectWebsite = (url: string) => {
  return api.post("/scan/detect", { url });
};

/**
 * Inline DNS Lookup — returns DNS records immediately, no scan pipeline.
 * Used by the Manual Scan DNS Lookup tool panel.
 */
export const dnsLookupInline = (hostname: string) => {
  return api.post("/scan/dns-lookup", { hostname });
};

/**
 * Inline WHOIS Lookup — returns WHOIS data immediately, no scan pipeline.
 * Used by the Manual Scan WHOIS tool panel.
 */
export const whoisLookupInline = (hostname: string) => {
  return api.post("/scan/whois-lookup", { hostname });
};

/**
 * Tool availability — checks which scanner binaries are installed on the server.
 */
export const getToolAvailability = () => {
  return api.get("/scan/tools/availability");
};

// Get scan history
export const getScanHistory = () => {
  return api.get("/scan/history");
};

export const getTodayStats = () => {
  return api.get("/scan/stats/today");
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
