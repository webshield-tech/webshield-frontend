import React from "react";
import Lottie from "lottie-react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Shield, 
  ChevronLeft, 
  Info, 
  AlertTriangle, 
  Cpu, 
  Globe, 
  Database, 
  Lock 
} from "lucide-react";
import "../../styles/about-tools.css";
import nmapAnimation from "../../assets/icons/nmap.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";

const toolData = [
  {
    id: "nmap",
    title: "Nmap",
    subtitle: "Network discovery & security auditing",
    animation: nmapAnimation,
    icon: <Globe size={20} />,
    color: "#00d4ff",
    badges: ["Port Scanning", "Service Detection", "OS Fingerprinting"],
    description:
      "Scans a website or server to find which network ports are open and what services run on them. Essential for understanding your network exposure.",
    whenToUse:
      "When you need to discover what services are exposed to the internet on a network.",
    features: ["Port Scanning", "Service Detection", "OS Fingerprinting"],
    delay: "0.1s",
  },
  {
    id: "nikto",
    title: "Nikto",
    subtitle: "Web server vulnerability scanner",
    animation: niktoAnimation,
    icon: <Cpu size={20} />,
    color: "#ff6b6b",
    badges: ["Dangerous Files", "Outdated Software", "Misconfigurations"],
    description:
      "Checks a web server for outdated software, common misconfigurations, and dangerous files. Fast way to find basic web security issues.",
    whenToUse:
      "When you want a comprehensive web server vulnerability assessment.",
    features: ["Dangerous Files", "Outdated Software", "Misconfigurations"],
    delay: "0.3s",
  },
  {
    id: "sqlmap",
    title: "SQLMap",
    subtitle: "SQL injection detection & exploitation",
    animation: sqlAnimation,
    icon: <Database size={20} />,
    color: "#ffd54f",
    badges: ["Database Fingerprint", "Data Extraction", "Automated Testing"],
    description:
      "Detects and exploits SQL injection vulnerabilities that allow attackers to read or manipulate database data. Use responsibly and with permission.",
    whenToUse:
      "When you suspect user input may be vulnerable to SQL injection attacks.",
    features: ["Database Fingerprint", "Data Extraction", "File System Access"],
    delay: "0.5s",
  },
  {
    id: "sslscan",
    title: "SSLScan",
    subtitle: "SSL/TLS configuration analyzer",
    animation: sslAnimation,
    icon: <Lock size={20} />,
    color: "#69f0ae",
    badges: ["Cipher Check", "Certificate Info", "Protocol Support"],
    description:
      "Tests the website's TLS/SSL settings to show supported versions, weak ciphers, and certificate information. Ensures secure encryption is used.",
    whenToUse:
      "When you need to verify a site's TLS/SSL configuration and encryption strength.",
    features: ["Cipher Check", "Certificate Info", "Protocol Support"],
    delay: "0.7s",
  },
];

const AboutTools: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page-v2">
      <div className="about-content-wrap">
        <header className="about-header-v2">
          <Link to="/dashboard" className="back-btn-v2">
            <ChevronLeft size={20} />
            <span>Dashboard</span>
          </Link>
          <div className="about-title-group">
            <h1 className="text-gradient">Security Toolkit</h1>
            <p>Professional-grade assessment engines integrated into the Vuln Spectra platform.</p>
          </div>
        </header>

        <div className="about-tools-grid">
          {toolData.map((tool) => (
            <article 
              className="tool-info-card glass-panel" 
              key={tool.id}
              style={{ "--tool-accent": tool.color } as React.CSSProperties}
            >
              <div className="card-accent-line"></div>
              <div className="tool-visual">
                <div className="lottie-wrap">
                  <Lottie animationData={tool.animation} loop />
                </div>
                <div className="tool-id-tag">
                  {tool.icon}
                  <span>{tool.id}</span>
                </div>
              </div>
              
              <div className="tool-details">
                <div className="tool-head">
                  <h2>{tool.title}</h2>
                  <span className="tool-subtitle">{tool.subtitle}</span>
                </div>
                
                <p className="tool-desc-text">{tool.description}</p>
                
                <div className="tool-features-row">
                  {tool.features.map((f, i) => (
                    <span key={i} className="f-tag">{f}</span>
                  ))}
                </div>

                <div className="tool-usage-box">
                  <div className="usage-label">
                    <Info size={16} className="text-primary" />
                    <span>Operational Context</span>
                  </div>
                  <p>{tool.whenToUse}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="about-notice-panel glass-panel">
          <div className="notice-header">
            <AlertTriangle className="text-accent" size={24} />
            <h3>Legal & Ethical Compliance</h3>
          </div>
          <p>
            The tools provided in this suite are powerful security assessment instruments. Unauthorized use against systems without explicit, 
            documented permission is strictly prohibited. Operators must ensure full compliance with regional laws and 
            responsible disclosure practices. <strong>Vuln Spectra enforces a strict policy against any malicious or unauthorized activity.</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutTools;
