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
      color: "#00d4ff",
      description: "Network discovery & security auditing",
      features: ["Port Scanning", "Service Detection", "OS Fingerprinting"],
      delay: "0.1s",
      toolId: "nmap",
    },
    {
      name: "Nikto",
      animation: niktoAnimation,
      color: "#ff6b6b",
      description: "Web server vulnerability scanner",
      features: ["Dangerous Files", "Outdated Software", "Misconfigurations"],
      delay: "0.3s",
      toolId: "nikto",
    },
    {
      name: "SQLMap",
      animation: sqlAnimation,
      color: "#ffd54f",
      description: "SQL injection detection & exploitation",
      features: [
        "Database Fingerprint",
        "Data Extraction",
        "File System Access",
      ],
      delay: "0.5s",
      toolId: "sqlmap",
    },
    {
      name: "SSLScan",
      animation: sslAnimation,
      color: "#69f0ae",
      description: "SSL/TLS configuration analyzer",
      features: ["Cipher Check", "Certificate Info", "Protocol Support"],
      delay: "0.7s",
      toolId: "sslscan",
    },
  ];

  return (
    <div className="tools-section">
      <h2 className="section-title">
        <span className="title-underline">Professional Security Tools</span>
      </h2>
      <p className="section-subtitle">
        Powered by industry-standard cybersecurity tools used by professionals
        worldwide
      </p>

      <div className="tools-grid">
        {tools.map((tool, _index) => (
          <div
            key={tool.name}
            className="tool-card"
            data-tool={tool.toolId}
            style={
              {
                animationDelay: tool.delay,
                borderColor: `${tool.color}30`,
                "--hover-glow": tool.color.replace("#", ""),
              } as React.CSSProperties
            }
          >
            <div className="tool-card-inner">
              <div className="tool-header">
                <div
                  className="tool-icon-wrapper"
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)`,
                    borderColor: `${tool.color}40`,
                  }}
                >
                  <div className="tool-icon" style={{ color: tool.color }}>
                    <Lottie
                      animationData={tool.animation}
                      loop
                      className="tool-lottie-animation"
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>
                <h3
                  style={{
                    background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {tool.name}
                </h3>
              </div>

              <p
                className="tool-description"
                style={{ borderLeftColor: `${tool.color}40` }}
              >
                {tool.description}
              </p>

              <div className="tool-features">
                {tool.features.map((feature, i) => (
                  <div key={i} className="feature">
                    <span
                      className="feature-icon"
                      style={{
                        background: `linear-gradient(135deg, ${tool.color}30, ${tool.color}20)`,
                        color: tool.color,
                      }}
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div
                className="tool-glow"
                style={{
                  background: `radial-gradient(ellipse at center, ${tool.color}20 0%, transparent 70%)`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolCards;
