import React from "react";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
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

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="about-container">
      <div className="cyber-grid" aria-hidden="true"></div>
      <button
        className="back-to-dashboard-btn"
        onClick={handleBackToDashboard}
        aria-label="Return to dashboard"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>
      <div className="about-hero">
        <div>
          <h1 className="text-gradient">About Security Tools</h1>
          <p className="about-sub">
            Professional security scanning tools explained. Understand what each
            scanner does and when to use them responsibly in your security
            assessments.
          </p>
        </div>
      </div>
      <div className="about-grid">
        {toolData.map((tool) => (
          <article
            className="about-card"
            key={tool.id}
            aria-labelledby={tool.id}
            tabIndex={0}
            role="button"
            aria-describedby={`${tool.id}-desc`}
            style={
              {
                animationDelay: tool.delay,
                borderColor: `${tool.color}30`,
                "--tool-color": tool.color,
                "--tool-color-20": `${tool.color}20`,
                "--tool-color-40": `${tool.color}40`,
              } as React.CSSProperties
            }
          >
            <div
              className="tool-glow"
              style={{
                background: `radial-gradient(ellipse at center, ${tool.color}15 0%, transparent 70%)`,
              }}
            ></div>
            <header className="about-head">
              <div
                className="about-icon"
                style={{
                  background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)`,
                  border: `2px solid ${tool.color}40`,
                }}
              >
                <div className="tool-lottie-container">
                  <Lottie
                    animationData={tool.animation}
                    loop={true}
                    autoplay={true}
                    className="tool-lottie-animation"
                  />
                </div>
              </div>
              <div className="about-title-wrapper">
                <h3
                  id={tool.id}
                  className="about-title"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {tool.title}
                </h3>
                <p className="about-subtitle">{tool.subtitle}</p>
              </div>
            </header>

            <p id={`${tool.id}-desc`} className="about-desc">
              {tool.description}
            </p>

            <div className="about-badges">
              {tool.features.map((feature, index) => (
                <span
                  key={index}
                  className="badge"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)`,
                    color: tool.color,
                    border: `1px solid ${tool.color}40`,
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>

            <div
              className="about-more"
              style={{
                borderLeft: `4px solid ${tool.color}`,
                background: `linear-gradient(90deg, ${tool.color}08, ${tool.color}02)`,
              }}
            >
              <div className="more-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: tool.color, marginRight: "8px" }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                When to use
              </div>
              <div className="more-text">{tool.whenToUse}</div>
            </div>

            <div
              className="tool-hover-border"
              style={{
                background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
              }}
            ></div>
          </article>
        ))}
      </div>

      <div className="legal-note">
        <div className="warning-icon" aria-hidden="true">
          ⚠️
        </div>
        <div className="warning-content">
          <strong>Security Notice:</strong> Use these tools only on websites or
          servers you own or where you have explicit written permission to test.
          Unauthorized scanning may violate laws and terms of service. Always
          conduct security testing in a controlled, legal environment.
        </div>
      </div>
    </div>
  );
};

export default AboutTools;
