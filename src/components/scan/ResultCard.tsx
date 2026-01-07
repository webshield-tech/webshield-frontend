import React from "react";
import "../../styles/scan.css";

interface Props {
  url: string;
  tool: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  onViewReport?: () => void;
  onDownloadReport?: () => void;
  onGenerateReport?: () => void;
}
const ResultCard: React.FC<Props> = ({
  url,
  tool,
  status,
  startedAt,
  finishedAt,
  onViewReport,
  onDownloadReport,
  onGenerateReport,
}) => {
  return (
    <div className="scan-card result-card">
      <div className="result-header">
        <h3>{url}</h3>
        <span className={`scan-status status-${status}`}>{status}</span>
      </div>
      <p>Tool: {tool}</p>
      <p>Started: {startedAt ? new Date(startedAt).toLocaleString() : "N/A"}</p>
      <p>
        Finished: {finishedAt ? new Date(finishedAt).toLocaleString() : "N/A"}
      </p>
      <div className="result-actions">
        {onGenerateReport && (
          <button className="tool-button" onClick={onGenerateReport}>
            Generate AI Report
          </button>
        )}
        {onViewReport && (
          <button className="tool-button" onClick={onViewReport}>
            View Report
          </button>
        )}
        {onDownloadReport && (
          <button className="tool-button" onClick={onDownloadReport}>
            Download Report
          </button>
        )}
      </div>
    </div>
  );
};
export default ResultCard;
