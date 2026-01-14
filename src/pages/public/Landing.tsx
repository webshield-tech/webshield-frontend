import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroSection from "../../components/landing/HeroSection";
import ToolCards from "../../components/landing/ToolCards";
import "../../styles/landing.css";
import Lottie from "lottie-react";
import shieldAnimation from "../../assets/icons/Shield.json";
const Landing = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav
        className="landing-nav"
        style={{
          background: scrollY > 50 ? "rgba(10, 25, 41, 0.95)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(10px)" : "none",
        }}
      >
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-lottie-wrap hero-logo">
              <Lottie
                animationData={shieldAnimation}
                loop
                className="logo-lottie"
              />
            </div>
            <span className="logo-text">WebShield</span>
          </div>

          <div className="nav-links">
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#tools" className="nav-link">
              Tools
            </a>
            <Link to="/login" className="nav-button">
              Sign In
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <HeroSection />

      {/* Tools Section */}
      <section id="tools" className="section-wrapper">
        <ToolCards />
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <h2 className="section-title">
            <span className="title-underline">Why Choose WebShield?</span>
          </h2>

          <div className="features-grid">
            <div className="feature-card">
           
              <h3>Fast Scanning</h3>
              <p>Complete vulnerability assessments in minutes, not hours</p>
            </div>

            <div className="feature-card">
              <h3>Accurate Results</h3>
              <p>Professional-grade tools with minimal false positives</p>
            </div>

            <div className="feature-card">
              <h3>Detailed Reports</h3>
              <p>Comprehensive PDF reports with actionable insights</p>
            </div>

            <div className="feature-card">
              <h3>Secure & Private</h3>
              <p>Your scans and data are encrypted and confidential</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Secure Your Websites?</h2>
          <Link to="/signup" className="cta-button large">
            <span className="button-text">Start Free Trial</span>
          </Link>
        </div>
      </section>
          <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-lottie-wrap">
                <Lottie
                  animationData={shieldAnimation}
                  loop
                  className="footer-lottie"
                />
              </div>
              <div>
                <span className="logo-text">WebShield</span>
                <p className="college-name">
                  Developed at <span className="highlight">Govt ANKS Degree College</span>
                </p>
              </div>
            </div>
            <p className="footer-tagline">
              Cybersecurity made accessible for everyone
            </p>
            <div className="social-links">
              <a 
                href="https://github.com/thehusnain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub Profile"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/husnain-fiaz-7a4761369" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn Profile"
              >
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#tools">Tools</a>
              <a href="#why-choose">Why Choose Us</a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <a href="/disclaimer">Disclaimer</a>
              <a href="/terms">Acceptable Use</a>
            </div>

            <div className="footer-column">
              <h4>Connect</h4>
              <a href="mailto:husnain@example.com">Contact</a>
              <a href="https://github.com/webshield-tech" target="_blank" rel="noopener noreferrer">Source Code</a>
              <a href="#cta">Get Started</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} WebShield. All rights reserved.</p>
            <p className="footer-note">
              Web Engineering Project  
              <span className="college-highlight"> Government ANKS Degree College,KTS,Haripur</span>
            </p>
          </div>
          <div className="footer-attribution">
            <p>
              Built by <span className="author-name">Husnain</span> • 
              For educational & ethical security testing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
