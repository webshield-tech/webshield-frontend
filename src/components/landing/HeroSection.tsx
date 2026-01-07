import { Link } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <div className="hero-section">
      {/* Animated background elements */}
      <div className="hero-bg">
        <div className="bg-grid"></div>
        <div className="bg-orbits">
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="orbit orbit-3"></div>
        </div>
        <div className="bg-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="title-gradient">WebShield</span>
            <span className="title-sub">Website Vulnerability Scanner</span>
          </h1>
          
          <p className="hero-description">
            Advanced cybersecurity platform for automated vulnerability scanning, 
            penetration testing, and security auditing using professional tools.
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">4</div>
              <div className="stat-label">Security Tools</div>
            </div>
            <div className="stat">
              <div className="stat-number">100+</div>
              <div className="stat-label">Vulnerability Checks</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Scan Monitoring</div>
            </div>
          </div>
          
          <div className="hero-actions">
            <Link to="/signup" className="cta-button primary">
              <span className="button-text">Get Started Free</span>
              <span className="button-arrow">→</span>
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;