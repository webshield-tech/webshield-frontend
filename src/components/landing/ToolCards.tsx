/* eslint-disable @typescript-eslint/no-unused-vars */
import "./ToolCards.css";
import Lottie from "lottie-react";
import nmapAnimation from "../../assets/icons/nmap.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";
import niktoAnimation from "../../assets/icons/nikto.json";

const ToolCards = () => {
  const tools = [
    {
      name: "Nmap",
      animation: nmapAnimation,
      color: "#00f2ff",
      description: "Network discovery & security auditing suite",
      features: ["Port Scanning", "Service Detection", "OS Fingerprinting"],
      delay: "0.1s",
      toolId: "nmap",
      tag: "NETWORK"
    },
    {
      name: "Nikto",
      animation: niktoAnimation,
      color: "#ff0055",
      description: "Comprehensive web server vulnerability scanner",
      features: ["Dangerous Files", "Outdated Software", "Misconfigurations"],
      delay: "0.2s",
      toolId: "nikto",
      tag: "WEB_SERVER"
    },
    {
      name: "SQLMap",
      animation: sqlAnimation,
      color: "#ffd54f",
      description: "Automated SQL injection and database takeover",
      features: [
        "Database Fingerprint",
        "Data Extraction",
        "File System Access",
      ],
      delay: "0.3s",
      toolId: "sqlmap",
      tag: "DATABASE"
    },
    {
      name: "SSLScan",
      animation: sslAnimation,
      color: "#00ff9d",
      description: "SSL/TLS configuration and cipher analyzer",
      features: ["Cipher Check", "Certificate Info", "Protocol Support"],
      delay: "0.4s",
      toolId: "sslscan",
      tag: "ENCRYPTION"
    },
  ];

  return (
    <div className="tools-container-premium">
      <div className="tools-grid-premium">
        {tools.map((tool, _index) => (
          <div
            key={tool.name}
            className="tool-card-premium"
            style={
              {
                "--tool-color": tool.color,
                "--tool-color-rgb": tool.color === "#00f2ff" ? "0, 242, 255" : 
                                   tool.color === "#ff0055" ? "255, 0, 85" :
                                   tool.color === "#ffd54f" ? "255, 213, 79" : "0, 255, 157",
                animationDelay: tool.delay
              } as React.CSSProperties
            }
          >
            <div className="card-accent-line"></div>
            <div className="card-tag">{tool.tag}</div>
            
            <div className="tool-card-content">
              <div className="tool-icon-section">
                <div className="tool-icon-glow"></div>
                <div className="tool-lottie-container">
                  <Lottie
                    animationData={tool.animation}
                    loop
                    className="tool-lottie"
                  />
                </div>
              </div>

              <h3 className="tool-name-premium">{tool.name}</h3>
              <p className="tool-desc-premium">{tool.description}</p>

              <div className="tool-features-premium">
                {tool.features.map((feature, i) => (
                  <div key={i} className="feature-pill">
                    <span className="pill-dot"></span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="card-corner-top"></div>
            <div className="card-corner-bottom"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolCards;

