import api from "./axios";

export interface LabContainer {
  id: string;
  name: string;
  containerName: string;
  status: 'Running' | 'Stopped';
  isRunning: boolean;
  ports: string;
  health: 'Healthy' | 'Unhealthy' | 'Starting' | 'Offline';
  description: string;
  image: string;
  created: string;
}

export interface LabsResponse {
  success: boolean;
  labs?: LabContainer[];
  error?: string;
  details?: string;
}

export const getLabs = () => {
  return api.get<LabsResponse>("/labs");
};

export const startLab = (containerName: string) => {
  return api.post<{ success: boolean; message: string; error?: string }>("/labs/start", { containerName });
};

export const stopLab = (containerName: string) => {
  return api.post<{ success: boolean; message: string; error?: string }>("/labs/stop", { containerName });
};

export const restartLab = (containerName: string) => {
  return api.post<{ success: boolean; message: string; error?: string }>("/labs/restart", { containerName });
};

export const getLabLogs = (containerName: string, tail: number = 100) => {
  return api.get<{ success: boolean; logs: string; error?: string }>(`/labs/logs/${containerName}`, {
    params: { tail }
  });
};
