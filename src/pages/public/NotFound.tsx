import { Link } from "react-router-dom";
import { ShieldAlert, Home, Zap } from "lucide-react";
import "../../styles/notfound.css"; 

export default function NotFound() {
  return (
    <div className="notfound-wrapper">
      <div className="notfound-content">

        <div className="notfound-404">404</div>

        <div className="notfound-title">Page Not Found</div>

        <p className="notfound-text">
          This route does not exist or has been restricted by
          <strong> WebShield Security</strong>.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="notfound-link">
            <Home size={18} />
            Home
          </Link>

          <Link to="/start-scan" className="notfound-link">
            <Zap size={18} />
            Run Scan
          </Link>
        </div>

        <div className="notfound-footer">
          <ShieldAlert size={16} />
          WebShield • Real-time Protection Enabled
        </div>

      </div>
    </div>
  );
}
