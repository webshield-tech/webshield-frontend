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
              <span className="logo-text">WebShield</span>
            </div>
            <p className="footer-tagline">
              Cybersecurity made accessible for everyone
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#tools">Tools</a>
            </div>

            <div className="footer-column">
              <h4>Connect</h4>
              <a
                href="https://github.com/thehusnain"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 WebShield</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
