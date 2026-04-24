import { Link } from "react-router-dom";
import { ShieldAlert, Home, Zap, Terminal, ChevronRight } from "lucide-react";
import "../../styles/notfound.css"; 

export default function NotFound() {
  return (
    <div className="notfound-page-premium">
      <div className="noise-overlay"></div>
      
      <div className="notfound-content-wrap">
        <div className="glitch-container">
          <div className="error-code">404</div>
          <div className="error-code-shadow">404</div>
        </div>

        <div className="status-header">
          <Terminal size={20} className="text-primary" />
          <span>SYSTEM_ERROR: ROUTE_NOT_FOUND</span>
        </div>

        <h1 className="notfound-headline">NODE_DISCONNECTED</h1>
        
        <p className="notfound-message">
          The requested operational node does not exist in the current network architecture. 
          The connection has been terminated by <span>VULN_SPECTRA_CORE</span> to prevent unauthorized memory leaks.
        </p>

        <div className="notfound-grid-actions">
          <Link to="/" className="action-card glass-panel">
            <Home size={32} />
            <div className="card-txt">
              <strong>RETURN_TO_HQ</strong>
              <span>Back to home base</span>
            </div>
            <ChevronRight size={18} className="arrow" />
          </Link>

          <Link to="/start-scan" className="action-card glass-panel">
            <Zap size={32} />
            <div className="card-txt">
              <strong>INITIALIZE_SCAN</strong>
              <span>Launch a new mission</span>
            </div>
            <ChevronRight size={18} className="arrow" />
          </Link>
        </div>

        <footer className="notfound-footer-premium">
          <div className="footer-line"></div>
          <div className="footer-content">
            <ShieldAlert size={14} />
            <span>PROTECTION_ACTIVE // SECURE_SHELL_ENABLED</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

