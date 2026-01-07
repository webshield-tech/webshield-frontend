/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { startScan } from "../../api/scan-api";
import type { ScanTool } from "../../utils/types";
import "../../styles/start-scan.css";
import Lottie from "lottie-react";
import checkAnimaton from "../../assets/icons/Success.json";
import startAnimation from "../../assets/icons/start.json";
import infoAnimation from "../../assets/icons/info.json";
import clipboardAnimation from "../../assets/icons/History.json";
import clockAnimation from "../../assets/icons/watch.json";
import nmapAnimation from "../../assets/icons/nmap.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import sqlmapAnimation from "../../assets/icons/sql.json";
import sslscanAnimation from "../../assets/icons/ssl.json";
const StartScan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [url, setUrl] = useState("");
  const [tool, setTool] = useState<ScanTool>("nmap");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tools = [
    {
      id: "nmap",
      name: "Nmap",
      desc: "Network discovery & port scanning",
      animation: nmapAnimation,
      color: "#00d4ff",
    },
    {
      id: "nikto",
      name: "Nikto",
      desc: "Web server vulnerability scanner",
      animation: niktoAnimation,
      color: "#ff6b6b",
    },
    {
      id: "sqlmap",
      name: "SQLMap",
      desc: "SQL injection detection",
      animation: sqlmapAnimation,
      color: "#ffd54f",
    },
    {
      id: "sslscan",
      name: "SSLScan",
      desc: "SSL/TLS configuration checker",
      animation: sslscanAnimation,
      color: "#69f0ae",
    },
  ] as const;

  const isValidUrl = (urlString: string) => {
    try {
      const u = new URL(urlString);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (user && user.usedScan >= user.scanLimit) {
      setError(
        `Scan limit reached. You've used ${user.usedScan} of ${user.scanLimit} scans.`
      );
      return;
    }

    if (!url.trim()) {
      setError("Please enter a target URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }

    try {
      setLoading(true);
      const mappedScanType = tool === "sslscan" ? "ssl" : tool;

      const scanData = {
        targetUrl: url.trim(),
        scanType: mappedScanType,
      };

      const response = await startScan(scanData);

      if (response.data.success) {
        const scanId = response.data.scanId || response.data.scan?._id;
        if (scanId) {
          navigate(`/scan-progress/${scanId}`);
        } else {
          setError(
            "Scan started but no scan ID returned. Please check scan history."
          );
        }
      } else {
        setError(response.data.error || "Failed to start scan");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.toLowerCase() || "";
      if (msg.includes("already scanning") || msg.includes("in progress")) {
        setError(
          "You already have a scan in progress. Please wait for it to complete."
        );
      } else if (msg.includes("limit") || msg.includes("exceeded")) {
        setError("Scan limit reached. Please try again later.");
      } else if (
        msg.includes("invalid url") ||
        msg.includes("invalid target")
      ) {
        setError("Invalid target URL. Please check the format.");
      } else if (msg.includes("timeout") || msg.includes("unreachable")) {
        setError("Target is unreachable. Please check the URL and try again.");
      } else if (err?.message?.includes("Network Error")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          err?.response?.data?.error ||
            "Failed to start scan. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const scanUsagePercent = user
    ? Math.round((user.usedScan / user.scanLimit) * 100)
    : 0;

  return (
    <div className="scan-container">
      <div className="scan-card">
        <div className="scan-header">
          <h2 className="text-gradient">Start Vulnerability Scan</h2>
          <p className="scan-subtitle">
            Scan websites for security vulnerabilities using professional tools
          </p>

          {user && (
            <div className="scan-usage">
              <div className="usage-label">
                Your Scan Usage:{" "}
                <span>
                  {user.usedScan}/{user.scanLimit}
                </span>
              </div>
              <div className="usage-bar">
                <div
                  className="usage-fill"
                  style={{
                    width: `${scanUsagePercent}%`,
                    background:
                      scanUsagePercent >= 90
                        ? "#ff6b6b"
                        : scanUsagePercent >= 70
                        ? "#ffd54f"
                        : "#00d4ff",
                  }}
                ></div>
              </div>
              <div className="usage-percent">{scanUsagePercent}% used</div>
            </div>
          )}
        </div>

        {error && (
          <div className="scan-error">
            <div className="error-text">{error}</div>
          </div>
        )}

        <form className="scan-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Target Website URL
              <span
                className="tooltip"
                data-tooltip="Enter the full URL of the website you want to scan"
              ></span>
            </label>
            <div className="input-with-icon">
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="scan-input"
                disabled={loading}
              />
            </div>
            <div className="input-hint">
              Enter full URL with protocol (http:// or https://)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Security Tool</label>
            <p className="form-description">
              Choose the appropriate tool for your security testing needs
            </p>

            <div className="tools-grid">
              {tools.map((t) => (
                <div
                  key={t.id}
                  className={`tool-card ${tool === t.id ? "selected" : ""}`}
                  onClick={() => !loading && setTool(t.id)}
                  style={{
                    borderColor:
                      tool === t.id ? t.color : "rgba(255, 255, 255, 0.08)",
                    background:
                      tool === t.id
                        ? `${t.color}15`
                        : "rgba(255, 255, 255, 0.03)",
                  }}
                >
                  <div className="tool-icon" style={{ color: t.color }}>
                    <Lottie
                      animationData={t.animation}
                      loop
                      className="tool-lottie-animation"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                  <div className="tool-content">
                    <div className="tool-header">
                      <h4>{t.name}</h4>
                      {tool === t.id && (
                        <span className="selected-badge">Selected</span>
                      )}
                    </div>
                    <p className="tool-desc">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tool-info">
            <h4>
              <div className="info-icon-container">
                <Lottie
                  animationData={infoAnimation}
                  loop
                  className="small-lottie"
                />
              </div>
              About {tools.find((t) => t.id === tool)?.name}
            </h4>
            <p>
              {tool === "nmap" &&
                "Nmap discovers hosts/services by sending packets and analyzing responses."}
              {tool === "nikto" &&
                "Nikto scans web servers for dangerous files and misconfigurations."}
              {tool === "sqlmap" &&
                "SQLMap automates detecting and exploiting SQL injection flaws."}
              {tool === "sslscan" &&
                "SSLScan checks SSL/TLS cipher suites and protocol support."}
            </p>
            <div className="info-tip">
              <div className="clock-icon-container">
                <Lottie
                  animationData={clockAnimation}
                  loop
                  className="small-lottie"
                />
              </div>
              Estimated scan time:{" "}
              {tool === "nmap"
                ? "2-3 minutes"
                : tool === "nikto"
                ? "3-5 minutes"
                : tool === "sqlmap"
                ? "4-6 minutes"
                : "1-2 minutes"}
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Back to Dashboard
            </button>

            <button
              type="submit"
              className="scan-button"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Initializing Scan...
                </>
              ) : (
                <>
                  <div className="button-icon-container">
                    <Lottie
                      animationData={startAnimation}
                      loop
                      className="small-lottie"
                    />
                  </div>
                  Start Security Scan
                </>
              )}
            </button>
          </div>
        </form>

        <div className="important-notes">
          <h4 className="notes-title">
            <div className="notes-icon-container">
              <Lottie
                animationData={clipboardAnimation}
                loop
                className="small-lottie"
              />
            </div>
            Important Legal & Ethical Notes
          </h4>
          <div className="notes-content">
            <div className="note-item">
              <div className="note-icon-container">
                <Lottie
                  animationData={checkAnimaton}
                  loop={false}
                  autoplay={true}
                  className="small-lottie checkmark"
                />
              </div>
              <span>
                Only scan websites you own or have explicit permission to test
              </span>
            </div>
            <div className="note-item">
              <div className="note-icon-container">
                <Lottie
                  animationData={checkAnimaton}
                  loop={false}
                  autoplay={true}
                  className="small-lottie checkmark"
                />
              </div>
              <span>
                This tool is for educational and authorized security testing
                only
              </span>
            </div>
            <div className="note-item">
              <Lottie
                animationData={checkAnimaton}
                loop={false}
                autoplay={true}
                className="small-lottie checkmark"
              />
              <span>Scans may be logged by target servers and your ISP</span>
            </div>
            <div className="note-item">
              <Lottie
                animationData={checkAnimaton}
                loop={false}
                autoplay={true}
                className="small-lottie checkmark"
              />
              <span>Respect rate limits and avoid aggressive scanning</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScan;
