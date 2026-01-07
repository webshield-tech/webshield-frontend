import api from "./axios";

export const adminGetStats = () => api.get("/admin/stats");
export const adminGetAllScans = () => api.get("/admin/history");
export const adminGetUserHistory = (userId: string) => api.get(`/admin/users/${userId}/history`);
export const adminDeleteScan = (scanId: string) => api.delete(`/admin/scan/${scanId}`);
export const adminUpdateUserLimit = (userId: string, scanLimit: number) =>
  api.post("/admin/update-limit", { userId, scanLimit });