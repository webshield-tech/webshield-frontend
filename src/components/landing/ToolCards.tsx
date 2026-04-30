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
      name: "Network Scout",
      animation: nmapAnimation,
      color: "#00f2ff",
      description: "Finds open 'doors' (ports) on your website's server.",
      features: ["Port Scanning", "Service Detection", "OS Fingerprinting"],
      delay: "0.1s",
      toolId: "nmap",
      tag: "RECON"
    },
    {
      name: "Web Auditor",
      animation: niktoAnimation,
      color: "#ff0055",
      description: "Inspects your server for outdated software and mistakes.",
      features: ["Dangerous Files", "Outdated Software", "Misconfigurations"],
      delay: "0.2s",
      toolId: "nikto",
      tag: "CONFIG"
    },
    {
      name: "Database Guard",
      animation: sqlAnimation,
      color: "#ffd54f",
      description: "Tests if your website's forms are leaking sensitive data.",
      features: ["Injection Detection", "Data Extraction", "Database ID"],
      delay: "0.3s",
      toolId: "sqlmap",
      tag: "DATABASE"
    },
    {
      name: "Lock Checker",
      animation: sslAnimation,
      color: "#00ff9d",
      description: "Verifies your website's security lock (HTTPS) strength.",
      features: ["Cipher Check", "Certificate Info", "Protocol Support"],
      delay: "0.4s",
      toolId: "sslscan",
      tag: "ENCRYPTION"
    },
    {
      name: "Path Finder",
      animation: nmapAnimation,
      color: "#ff8c00",
      description: "Searches for hidden pages and private folders on your site.",
      features: ["Hidden Paths", "Private Files", "Asset Discovery"],
      delay: "0.5s",
      toolId: "gobuster",
      tag: "HIDDEN"
    },
    {
      name: "Deep Fuzzer",
      animation: niktoAnimation,
      color: "#ff00ff",
      description: "Advanced tool for discovering technical settings & files.",
      features: ["Header Fuzzing", "Rapid Discovery", "Deep Search"],
      delay: "0.6s",
      toolId: "ffuf",
      tag: "EXPERT"
    },
    {
      name: "Vuln Matcher",
      animation: sqlAnimation,
      color: "#ffd54f",
      description: "Matches your site against 4,000+ known security bugs.",
      features: ["CVE Matching", "Cloud Exposure", "Zero-day Check"],
      delay: "0.7s",
      toolId: "nuclei",
      tag: "TEMPLATES"
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
                                   tool.color === "#ffd54f" ? "255, 213, 79" : 
                                   tool.color === "#ff8c00" ? "255, 140, 0" :
                                   tool.color === "#ff00ff" ? "255, 0, 255" : "0, 255, 157",
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

