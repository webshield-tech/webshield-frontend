import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Play, 
  Square, 
  RotateCw, 
  Terminal, 
  ExternalLink, 
  X, 
  Copy, 
  Check, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { getLabs, startLab, stopLab, restartLab, getLabLogs, type LabContainer } from "../../api/labs-api";
import { ToastContainer, useToast } from "../../components/Toast";
import "../../styles/labs.css";

const Labs = () => {
  const [labs, setLabs] = useState<LabContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // Tracks active actions in progress (containerId -> true)
  const [actionProgress, setActionProgress] = useState<Record<string, boolean>>({});
  
  // Logs modal state
  const [logsContainer, setLogsContainer] = useState<string | null>(null);
  const [logsContainerName, setLogsContainerName] = useState<string>("");
  const [logs, setLogs] = useState<string>("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Stop All modal state
  const [showStopAllWarning, setShowStopAllWarning] = useState(false);

  const { toasts, addToast, removeToast } = useToast();
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Check if any action is in progress anywhere
  const isAnyActionInProgress = Object.values(actionProgress).some(Boolean);

  const fetchLabs = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const response = await getLabs();
      if (response.data.success && response.data.labs) {
        setLabs(response.data.labs);
        setError(null);
        setErrorDetails(null);
      } else {
        setError(response.data.error || "Failed to load Docker labs.");
        setErrorDetails(response.data.details || null);
      }
    } catch (err: any) {
      console.error("Error fetching labs:", err);
      if (err.response?.status === 503 || err.response?.data?.error === "Docker is unavailable") {
        setError("Docker Daemon Unavailable");
        setErrorDetails(
          err.response?.data?.details || 
          "Docker is either not installed or the service is stopped. Ensure Docker is running on the host system."
        );
      } else {
        setError("Failed to communicate with Docker API");
        setErrorDetails(err.message || "An unexpected error occurred while communicating with the backend server.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Poll for status updates
  useEffect(() => {
    fetchLabs();

    const interval = setInterval(() => {
      // Don't auto-refresh while actions are actively mutating state
      if (!isAnyActionInProgress && !logsContainer) {
        fetchLabs(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchLabs, isAnyActionInProgress, logsContainer]);

  // Scroll to bottom of terminal when logs change
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleStart = async (containerName: string) => {
    setActionProgress(prev => ({ ...prev, [containerName]: true }));
    addToast("info", "Starting Lab", `Initiating startup sequence for ${containerName}...`);
    
    try {
      const response = await startLab(containerName);
      if (response.data.success) {
        addToast("success", "Lab Started", `${containerName} is now up and running!`);
        await fetchLabs(true);
      } else {
        addToast("error", "Failed to Start", response.data.error || `Could not start ${containerName}`);
      }
    } catch (err: any) {
      addToast("error", "Error", err.response?.data?.error || `An error occurred starting ${containerName}`);
    } finally {
      setActionProgress(prev => ({ ...prev, [containerName]: false }));
    }
  };

  const handleStop = async (containerName: string) => {
    setActionProgress(prev => ({ ...prev, [containerName]: true }));
    addToast("info", "Stopping Lab", `Stopping ${containerName} container...`);
    
    try {
      const response = await stopLab(containerName);
      if (response.data.success) {
        addToast("success", "Lab Stopped", `${containerName} has been shut down.`);
        await fetchLabs(true);
      } else {
        addToast("error", "Failed to Stop", response.data.error || `Could not stop ${containerName}`);
      }
    } catch (err: any) {
      addToast("error", "Error", err.response?.data?.error || `An error occurred stopping ${containerName}`);
    } finally {
      setActionProgress(prev => ({ ...prev, [containerName]: false }));
    }
  };

  const handleRestart = async (containerName: string) => {
    setActionProgress(prev => ({ ...prev, [containerName]: true }));
    addToast("info", "Restarting Lab", `Restarting ${containerName} container...`);
    
    try {
      const response = await restartLab(containerName);
      if (response.data.success) {
        addToast("success", "Lab Restarted", `${containerName} restarted successfully.`);
        await fetchLabs(true);
      } else {
        addToast("error", "Failed to Restart", response.data.error || `Could not restart ${containerName}`);
      }
    } catch (err: any) {
      addToast("error", "Error", err.response?.data?.error || `An error occurred restarting ${containerName}`);
    } finally {
      setActionProgress(prev => ({ ...prev, [containerName]: false }));
    }
  };

  const handleStartAll = async () => {
    setActionProgress(prev => ({ ...prev, all: true }));
    addToast("info", "Starting All Labs", "Initiating startup sequence for all vulnerable containers...");
    
    try {
      const response = await startLab("all");
      if (response.data.success) {
        addToast("success", "All Labs Started", "All Docker lab environments have been started.");
        await fetchLabs(true);
      } else {
        addToast("error", "Action Failed", response.data.error || "Could not start all lab containers");
      }
    } catch (err: any) {
      addToast("error", "Error", err.response?.data?.error || "An error occurred starting all containers.");
    } finally {
      setActionProgress(prev => ({ ...prev, all: false }));
    }
  };

  const handleStopAll = async () => {
    setShowStopAllWarning(false);
    setActionProgress(prev => ({ ...prev, all: true }));
    addToast("info", "Stopping All Labs", "Shutting down all vulnerable containers...");
    
    try {
      const response = await stopLab("all");
      if (response.data.success) {
        addToast("success", "All Labs Stopped", "All Docker lab environments have been stopped.");
        await fetchLabs(true);
      } else {
        addToast("error", "Action Failed", response.data.error || "Could not stop all lab containers");
      }
    } catch (err: any) {
      addToast("error", "Error", err.response?.data?.error || "An error occurred stopping all containers.");
    } finally {
      setActionProgress(prev => ({ ...prev, all: false }));
    }
  };

  const handleRestartAll = async () => {
    setActionProgress(prev => ({ ...prev, all: true }));
    addToast("info", "Restarting All Labs", "Rebooting all vulnerable containers...");
    
    try {
      const response = await restartLab("all");
      if (response.data.success) {
        addToast("success", "All Labs Restarted", "All Docker lab environments have been restarted.");
        await fetchLabs(true);
      } else {
        addToast("error", "Action Failed", response.data.error || "Could not restart all lab containers");
      }
    } catch (err: any) {
      addToast("error", "Error", err.response?.data?.error || "An error occurred restarting all containers.");
    } finally {
      setActionProgress(prev => ({ ...prev, all: false }));
    }
  };

  const handleViewLogs = async (containerName: string, displayName: string) => {
    setLogsContainer(containerName);
    setLogsContainerName(displayName);
    setLogs("");
    setLogsLoading(true);
    
    try {
      const response = await getLabLogs(containerName);
      if (response.data.success) {
        setLogs(response.data.logs || "No logs available for this container.");
      } else {
        setLogs(`Error retrieving logs: ${response.data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setLogs(`Error: ${err.response?.data?.error || err.message || "Failed to fetch logs"}`);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRefreshLogs = async () => {
    if (!logsContainer) return;
    setLogsLoading(true);
    try {
      const response = await getLabLogs(logsContainer);
      if (response.data.success) {
        setLogs(response.data.logs || "No logs available for this container.");
      }
    } catch (err: any) {
      setLogs(`Error: ${err.response?.data?.error || err.message || "Failed to fetch logs"}`);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPortLink = (lab: LabContainer) => {
    const portsStr = lab.ports;
    if (!portsStr) return null;
    
    // Parse the port mapping string
    // e.g. "0.0.0.0:8080->80/tcp" or "8080:80"
    const match = portsStr.match(/(?:0\.0\.0\.0:)?(\d+)->/);
    const hostPort = match ? match[1] : portsStr.split(':')[0].trim();
    if (!hostPort || isNaN(Number(hostPort))) return null;

    const hostname = window.location.hostname;
    
    if (lab.id === 'ftp-demo') {
      return `ftp://${hostname}:${hostPort}`;
    }
    if (['redis-demo', 'mysql-demo'].includes(lab.id)) {
      return null; // Not directly accessible via HTTP browser, keep port display plain
    }
    return `http://${hostname}:${hostPort}`;
  };

  const cleanDisplayPorts = (portsStr: string) => {
    if (!portsStr) return "None";
    // clean up long docker ports format into compact "HostPort:ContainerPort"
    // e.g. "0.0.0.0:8088->80/tcp, [::]:8088->80/tcp" => "8088:80"
    const mappings: string[] = [];
    const parts = portsStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      const match = trimmed.match(/(?:0\.0\.0\.0|\[::\]|127\.0\.0\.1):(\d+)->(\d+)\/tcp/);
      if (match) {
        const mapping = `${match[1]}:${match[2]}`;
        if (!mappings.includes(mapping)) {
          mappings.push(mapping);
        }
      } else {
        // Fallback for simple port formats or just keep host port
        const simple = trimmed.replace(/\/tcp|\/udp/, '').trim();
        if (simple && !mappings.includes(simple)) {
          mappings.push(simple);
        }
      }
    }
    return mappings.length > 0 ? mappings.join(', ') : portsStr;
  };

  if (loading) {
    return (
      <div className="labs-container">
        <div className="labs-loader">
          <div className="cyber-spinner"></div>
          <p>Scanning Docker Enclave Status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="labs-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="labs-header">
        <div className="labs-title-section">
          <div className="labs-title-row">
            <h1>Vuln Spectra Lab</h1>
            <span className="labs-badge">Docker Lab Enclave</span>
            {refreshing && <span className="labs-badge" style={{ borderColor: 'rgba(0,255,157,0.3)', color: '#00ff9d', background: 'rgba(0,255,157,0.05)' }}>Syncing...</span>}
          </div>
          <p className="labs-subtitle">
            Spin up, shut down, and inspect localized target sandbox environments to run safety validation scans and test exploits.
          </p>
        </div>

        {!error && (
          <div className="global-controls">
            <button 
              className="btn-cyber success"
              onClick={handleStartAll}
              disabled={isAnyActionInProgress}
            >
              <Play size={16} />
              <span>Start All Labs</span>
            </button>
            <button 
              className="btn-cyber warning"
              onClick={handleRestartAll}
              disabled={isAnyActionInProgress}
            >
              <RotateCw size={16} />
              <span>Restart All Labs</span>
            </button>
            <button 
              className="btn-cyber danger"
              onClick={() => setShowStopAllWarning(true)}
              disabled={isAnyActionInProgress}
            >
              <Square size={16} />
              <span>Stop All Labs</span>
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="docker-error-card">
          <div className="docker-error-icon">
            <AlertCircle size={32} />
          </div>
          <div className="docker-error-content">
            <h3>{error}</h3>
            <p>
              The WebShield core cannot establish a connection with the local Docker daemon. Please ensure that:
            </p>
            <ul>
              <li style={{ color: '#cbd5e1', marginBottom: '0.4rem', fontSize: '0.9rem' }}>The Docker service is installed and running (`sudo systemctl start docker`).</li>
              <li style={{ color: '#cbd5e1', marginBottom: '0.4rem', fontSize: '0.9rem' }}>The user account running the webshield-backend has permissions to access the docker socket.</li>
              <li style={{ color: '#cbd5e1', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Docker Compose command is properly configured.</li>
            </ul>
            {errorDetails && (
              <div className="docker-error-details">
                {errorDetails}
              </div>
            )}
            <button 
              className="btn-cyber warning"
              onClick={() => fetchLabs()}
              style={{ marginTop: '0.5rem' }}
            >
              <RefreshCw size={16} />
              <span>Retry Docker Query</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="labs-grid">
          {labs.map((lab) => {
            const portLink = getPortLink(lab);
            const isWorking = actionProgress[lab.containerName];

            return (
              <div 
                key={lab.id} 
                className={`lab-card ${lab.isRunning ? 'running' : 'stopped'}`}
              >
                <div>
                  <div className="lab-card-header">
                    <div className="lab-meta">
                      <h3 className="lab-name">{lab.name}</h3>
                      <span className="lab-container-name">{lab.containerName}</span>
                    </div>
                    <div className="lab-badges-row">
                      <span className={`badge-status ${lab.isRunning ? 'running' : 'stopped'}`}>
                        {lab.status}
                      </span>
                      <span className={`badge-health ${lab.health.toLowerCase()}`}>
                        {lab.health}
                      </span>
                    </div>
                  </div>

                  <p className="lab-description">{lab.description}</p>
                  
                  <div className="lab-details-panel">
                    <div className="detail-row">
                      <span className="detail-label">Exposed Mappings:</span>
                      {lab.isRunning && portLink ? (
                        <a 
                          href={portLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="detail-value link"
                        >
                          <span>{cleanDisplayPorts(lab.ports)}</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="detail-value">{cleanDisplayPorts(lab.ports)}</span>
                      )}
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Image Tag:</span>
                      <span className="detail-value" style={{ fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lab.image || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="lab-actions">
                    <button 
                      className="btn-action start"
                      onClick={() => handleStart(lab.containerName)}
                      disabled={lab.isRunning || isAnyActionInProgress || isWorking}
                    >
                      <Play size={12} />
                      <span>Start</span>
                    </button>
                    <button 
                      className="btn-action stop"
                      onClick={() => handleStop(lab.containerName)}
                      disabled={!lab.isRunning || isAnyActionInProgress || isWorking}
                    >
                      <Square size={12} />
                      <span>Stop</span>
                    </button>
                    <button 
                      className="btn-action restart"
                      onClick={() => handleRestart(lab.containerName)}
                      disabled={!lab.isRunning || isAnyActionInProgress || isWorking}
                    >
                      <RotateCw size={12} />
                      <span>Restart</span>
                    </button>
                    
                    <button 
                      className="btn-logs-trigger"
                      onClick={() => handleViewLogs(lab.containerName, lab.name)}
                      disabled={isAnyActionInProgress || isWorking}
                    >
                      <Terminal size={14} />
                      <span>View Terminal Logs</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stop All Labs Warning Modal */}
      {showStopAllWarning && (
        <div className="labs-modal-overlay">
          <div className="labs-modal">
            <div className="labs-modal-header">
              <h3>Confirm Shutdown Protocol</h3>
              <button className="btn-close-modal" onClick={() => setShowStopAllWarning(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="labs-modal-body">
              <p>
                <strong>Warning:</strong> You are about to initiate a global shutdown command. This will terminate all active local Docker lab environments:
              </p>
              <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                <li style={{ marginBottom: '0.3rem' }}>All open active scans against these labs will fail.</li>
                <li style={{ marginBottom: '0.3rem' }}>All active browser sandbox sessions targeting these environments will disconnect.</li>
                <li style={{ marginBottom: '0.3rem' }}>Unsaved database configurations and flags inside volatile containers will reset.</li>
              </ul>
              <p style={{ margin: 0 }}>Do you wish to proceed with stopping all labs?</p>
            </div>
            <div className="labs-modal-footer">
              <button className="btn-cyber" onClick={() => setShowStopAllWarning(false)}>
                Cancel
              </button>
              <button className="btn-cyber danger" onClick={handleStopAll}>
                Yes, Stop All Labs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Terminal Modal */}
      {logsContainer && (
        <div className="labs-modal-overlay">
          <div className="labs-modal logs-modal">
            <div className="labs-modal-header">
              <h3>Container Logs: {logsContainerName}</h3>
              <button className="btn-close-modal" onClick={() => setLogsContainer(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="labs-modal-body">
              <div className="logs-terminal-container">
                <div className="logs-terminal-controls">
                  <span className="logs-terminal-info">
                    Showing last 100 log lines from standard outputs (stdout/stderr).
                  </span>
                  <div className="logs-terminal-actions">
                    <button 
                      className="btn-cyber" 
                      onClick={handleCopyLogs}
                      disabled={logsLoading || !logs}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                    <button 
                      className="btn-cyber" 
                      onClick={handleRefreshLogs}
                      disabled={logsLoading}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      <RefreshCw size={14} className={logsLoading ? 'spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {logsLoading && !logs ? (
                  <div className="logs-terminal empty">
                    <div className="cyber-spinner" style={{ width: '30px', height: '30px' }}></div>
                  </div>
                ) : (
                  <div className="logs-terminal">
                    {logs}
                    <div ref={terminalEndRef} />
                  </div>
                )}
              </div>
            </div>
            <div className="labs-modal-footer">
              <button className="btn-cyber" onClick={() => setLogsContainer(null)}>
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Labs;
