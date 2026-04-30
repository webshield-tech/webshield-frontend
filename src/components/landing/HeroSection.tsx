import { Link } from "react-router-dom";
import { Terminal, ShieldCheck, Activity, Cpu, ArrowRight } from "lucide-react";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <div className="hero-section">
      {/* Animated background elements */}
      <div className="hero-bg">
        <div className="bg-perspective-grid"></div>
        <div className="bg-data-streams">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="data-stream"></div>
          ))}
        </div>
        <div className="bg-glow-orb"></div>
        <div className="bg-particles">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-top-badge">
          <span className="badge-dot"></span>
          <span className="badge-text">System Online // Secure Protocol</span>
        </div>
        
        <div className="hero-text">
          <h1 className="hero-title" data-text="VULN SPECTRA">
            <span className="title-glitch-wrap">
              <span className="title-main">VULN SPECTRA</span>
              <span className="title-glitch title-glitch-1">VULN SPECTRA</span>
              <span className="title-glitch title-glitch-2">VULN SPECTRA</span>
            </span>
            <span className="title-sub">Next-Gen Vulnerability Scanner</span>
          </h1>
          
          <p className="hero-description">
            Enterprise-grade security infrastructure for the modern web. 
            Automated scanning, real-time threat intelligence, and comprehensive security audits.
          </p>
          
          <div className="hero-stats-premium">
            <div className="stat-card">
              <div className="stat-icon"><Activity size={20} /></div>
              <div className="stat-info">
                <div className="stat-value">4000+</div>
                <div className="stat-label">VULNS</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Cpu size={20} /></div>
              <div className="stat-info">
                <div className="stat-value">9+</div>
                <div className="stat-label">TOOLS</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><ShieldCheck size={20} /></div>
              <div className="stat-info">
                <div className="stat-value">AES-256</div>
                <div className="stat-label">ENCRYPTION</div>
              </div>
            </div>
          </div>
          
          <div className="hero-actions-premium">
            <Link to="/signup" className="hero-btn-primary">
              <Terminal size={18} />
              <span className="btn-text">INITIALIZE_SCAN</span>
              <ArrowRight size={18} className="btn-arrow" />
            </Link>
            <Link to="/login" className="hero-btn-secondary">
              <span className="btn-text">ACCESS_DASHBOARD</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="scroll-indicator-premium">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <div className="arrows">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;