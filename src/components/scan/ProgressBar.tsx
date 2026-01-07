import React from "react";
import "../../styles/progress.css";

interface Props {
  percent: number;
  status: string;
}
const ProgressBar: React.FC<Props> = ({ percent, status }) => {
  return (
    <div className="progress-wrapper">
      <div className="progress-label">
        Status: <strong>{status}</strong>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill status-${status}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
};
export default ProgressBar;
