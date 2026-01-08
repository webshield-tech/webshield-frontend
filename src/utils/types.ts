export type ScanTool = "nmap" | "nikto" | "sqlmap" | "sslscan";

export interface User {
  _id: string;
  userId: string;
  username: string;
  email: string;
  role: "user" | "admin";
  scanLimit: number;
  usedScan: number;
  agreedToTerms: boolean;
  createdAt: string;
}

export interface ScanItem {
  _id: string;
  targetUrl?: string;
  url?: string;
  scanType?: string;
  tool?: string;
  status: "pending" | "running" | "completed" | "failed" | "canceled" | "cancelled";
  createdAt: string;
  updatedAt?: string;
}

