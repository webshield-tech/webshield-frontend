import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Zap, FileText, Linkedin, Menu, X, ArrowRight, Globe, MessageSquare, Mail } from "lucide-react";
import HeroSection from "../../components/landing/HeroSection";
import ToolCards from "../../components/landing/ToolCards";
import "../../styles/landing.css";


const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <div className="noise-overlay"></div>
      
      {/* Navigation */}
      <nav
        className={`landing-nav ${scrollY > 50 ? "scrolled" : ""}`}
      >
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-wrap">
              <img src="/logo.png" alt="Vuln Spectra Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
            <span className="logo-text">Vuln<span className="text-primary">Spectra</span></span>
          </div>

          <div className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </div>

          <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Features
            </a>
            <a href="#tools" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Tools
            </a>
            <Link to="/login" className="nav-button-outline">
              Sign In
            </Link>
            <Link to="/signup" className="nav-button-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Tools Section */}
      <section id="tools" className="section-wrapper">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-tag">// Security Suite</span>
            Real Scanners, Real Coverage
          </h2>
        </div>
        <ToolCards />
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-tag">// Core Advantages</span>
              Why Choose Vuln Spectra?
            </h2>
          </div>

          <div className="features-grid">
            <div className="feature-card-premium">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <Zap size={32} />
              </div>
              <h3>Fast Scanning</h3>
              <p>Complete vulnerability assessments in minutes, not hours. Optimized for speed and accuracy.</p>
              <div className="feature-card-footer">
                <span className="status-online">● STABLE</span>
              </div>
            </div>

            <div className="feature-card-premium">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <Lock size={32} />
              </div>
              <h3>Accurate Results</h3>
              <p>Professional-grade tools with minimal false positives. Built on industry standards.</p>
              <div className="feature-card-footer">
                <span className="status-online">● STABLE</span>
              </div>
            </div>

            <div className="feature-card-premium">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <FileText size={32} />
              </div>
              <h3>Detailed Reports</h3>
              <p>Comprehensive PDF reports with actionable insights and remediation steps for developers.</p>
              <div className="feature-card-footer">
                <span className="status-online">● STABLE</span>
              </div>
            </div>

            <div className="feature-card-premium">
              <div className="feature-card-glow"></div>
              <div className="feature-icon-wrap">
                <Shield size={32} />
              </div>
              <h3>Secure & Private</h3>
              <p>Your scans and data are encrypted and strictly confidential. We prioritize your privacy.</p>
              <div className="feature-card-footer">
                <span className="status-online">● STABLE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-premium">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Secure Your Infrastructure?</h2>
            <p className="cta-subtitle">Join hundreds of developers securing their web applications with Vuln Spectra's automated tools.</p>
            <Link to="/signup" className="cta-button-main">
              <span className="button-glitch">Start Free Trial</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* FSociety PK Branding Section */}
      <section className="fsociety-section" style={{ padding: "80px 40px", background: "rgba(3, 5, 8, 0.85)", borderTop: "1px solid var(--cyber-border)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
          <div className="section-header" style={{ marginBottom: "40px", textAlign: "center" }}>
            <h2 className="section-title">
              <span className="title-tag">// The Team Behind</span>
              About FSociety PK
            </h2>
            <p style={{ color: "var(--cyber-text-dim)", marginTop: "16px", fontSize: "1.1rem" }}>Cybersecurity CTF Team & Platform Developers</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <a href="https://fsocietypk.tech" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "8px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
              <Globe size={28} color="var(--cyber-primary)" />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff" }}>Website</span>
            </a>
            <a href="https://discord.com/invite/YYpFYBzH" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "8px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
              <MessageSquare size={28} color="#5865F2" />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff" }}>Discord</span>
            </a>
            <a href="https://www.linkedin.com/company/fsociety-pk/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "8px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
              <Linkedin size={28} color="#0077b5" />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff" }}>LinkedIn</span>
            </a>
            <a href="mailto:pkfsociety@gmail.com" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "20px", background: "rgba(0, 255, 157, 0.05)", border: "1px solid var(--cyber-border)", borderRadius: "8px", textDecoration: "none", color: "var(--cyber-text)", transition: "all 0.3s ease" }}>
              <Mail size={28} color="var(--cyber-accent)" />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#fff" }}>Email Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-premium">
        <div className="footer-container">
          <div className="footer-brand-section">
            <div className="footer-logo">
              <div className="logo-wrap-small">
                <img src="/logo.png" alt="Vuln Spectra Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
              </div>
              <span className="logo-text">Vuln Spectra</span>
            </div>
            <p className="footer-desc">
              Next-generation cybersecurity platform designed for modern web developers and security researchers.
            </p>
            <div className="social-links-premium">
              <a href="https://www.linkedin.com/in/husnain-fiaz-7a4761369" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#tools">Tools</a>
              <a href="/pricing">Pricing</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
              <a href="/disclaimer">Disclaimer</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="/docs">Documentation</a>
              <a href="/blog">Blog</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-premium">
          <div className="footer-bottom-content">
            <p className="copyright">© {new Date().getFullYear()} Vuln Spectra Core. All rights reserved.</p>
            <div className="footer-tech-tag">
              <span className="tech-label">System Status:</span>
              <span className="tech-value">Online</span>
            </div>
            <p className="footer-credit">
              Designed & Built by <span className="author">Husnain Fiaz</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
