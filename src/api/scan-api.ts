/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

// Start a new scan
export const startScan = (data: {
  targetUrl: string;
  scanType: string;
  options?: any;
}) => {
  return api.post("/scan/start", data);
};
// Get scan history
export const getScanHistory = () => {
  return api.get("/scan/history");
};

// Get scan results by ID
export const getScanResultsById = (scanId: string) => {
  return api.get(`/scan/${scanId}`);
};

// Cancel a scan
export const cancelScan = (scanId: string) => {
  return api.post(`/scan/${scanId}/cancel`);
};

// Generate AI report
export const generateAIReportForScan = (scanId: string) => {
  return api.post(`/scan/${scanId}/report/generate`);
};

// Download report
export const downloadReport = (scanId: string) => {
  return api.get(`/scan/${scanId}/report/download`, {
    responseType: "arraybuffer",
  });
};
// View report
export const viewReport = (scanId: string) => {
  return api.get(`/scan/${scanId}/report/view`, {
    responseType: "arraybuffer",
  });
};
