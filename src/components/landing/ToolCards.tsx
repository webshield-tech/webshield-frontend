import "./ToolCards.css";
import Lottie from "lottie-react";
import nmapAnimation from "../../assets/icons/nmap.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import ffufAnimation from "../../assets/icons/ffuf.json";
import nucleiAnimation from "../../assets/icons/nuclie.json";
import rateLimitAnimation from "../../assets/icons/rate-limit.json";
import dnsAnimation from "../../assets/icons/dns-recon.json";
import whoisAnimation from "../../assets/icons/whois.json";
import whatwebAnimation from "../../assets/icons/info.json";

const colorToRgb: Record<string, string> = {
  "#00f2ff": "0, 242, 255",
  "#7dd3fc": "125, 211, 252",
  "#ff00ff": "255, 0, 255",
  "#ff0055": "255, 0, 85",
  "#00ff9d": "0, 255, 157",
  "#ffd54f": "255, 213, 79",
  "#a78bfa": "167, 139, 250",
  "#fb7185": "251, 113, 133",
  "#69f0ae": "105, 240, 174",
  "#ffffff": "255, 255, 255",
};

const ToolCards = () => {
  const tools = [
    {
      name: "Nmap",
      animation: nmapAnimation,
      color: "#00f2ff",
      description: "Maps exposed ports, services, and host fingerprints.",
      features: ["Port Scanning", "Service Detection", "Host Fingerprints"],
      delay: "0.1s",
      toolId: "nmap",
      tag: "RECON"
    },
    {
      name: "WhatWeb",
      animation: whatwebAnimation,
      color: "#7dd3fc",
      description: "Fingerprints web servers, frameworks, plugins, and exposed technology signals.",
      features: ["Tech Detection", "Server Headers", "Framework Hints"],
      delay: "0.2s",
      toolId: "whatweb",
      tag: "TECH"
    },
    {
      name: "FFUF",
      animation: ffufAnimation,
      color: "#ff00ff",
      description: "Fast fuzzing for hidden files, directories, routes, and endpoints.",
      features: ["Path Discovery", "Status Matching", "Rapid Fuzzing"],
      delay: "0.3s",
      toolId: "ffuf",
      tag: "CONTENT"
    },
    {
      name: "Nikto",
      animation: niktoAnimation,
      color: "#ff0055",
      description: "Checks for outdated server software and dangerous configuration issues.",
      features: ["Dangerous Files", "Outdated Software", "Misconfigurations"],
      delay: "0.4s",
      toolId: "nikto",
      tag: "CONFIG"
    },
    {
      name: "SSLScan",
      animation: sslAnimation,
      color: "#00ff9d",
      description: "Audits TLS protocols, certificates, and cipher suite strength.",
      features: ["Cipher Check", "Certificate Info", "Protocol Support"],
      delay: "0.5s",
      toolId: "sslscan",
      tag: "ENCRYPTION"
    },
    {
      name: "SQLMap",
      animation: sqlAnimation,
      color: "#ffd54f",
      description: "Validates SQL injection exposure on parameterized URLs and forms.",
      features: ["Injection Detection", "Data Extraction", "DB Fingerprint"],
      delay: "0.6s",
      toolId: "sqlmap",
      tag: "DATABASE"
    },
    {
      name: "Nuclei",
      animation: nucleiAnimation,
      color: "#a78bfa",
      description: "Runs template-based checks for verified exposures, CVEs, and misconfigurations.",
      features: ["Template Scans", "CVE Signals", "JSON Evidence"],
      delay: "0.7s",
      toolId: "nuclei",
      tag: "TEMPLATES"
    },
    {
      name: "Rate Limit Checker",
      animation: rateLimitAnimation,
      color: "#fb7185",
      description: "Checks whether public endpoints throttle bursts and abusive request patterns.",
      features: ["Burst Checks", "429 Detection", "API Controls"],
      delay: "0.8s",
      toolId: "rate-limit",
      tag: "LOGIC"
    },
    {
      name: "DNS Recon",
      animation: dnsAnimation,
      color: "#69f0ae",
      description: "Inspects DNS records to map the target's infrastructure.",
      features: ["A/MX/NS Records", "Infrastructure Map", "Host Discovery"],
      delay: "0.9s",
      toolId: "dns",
      tag: "DOMAIN"
    },
    {
      name: "WHOIS",
      animation: whoisAnimation,
      color: "#ffffff",
      description: "Shows ownership, registrar, and expiry details for a domain.",
      features: ["Ownership Lookup", "Expiry Dates", "Registrar Data"],
      delay: "1s",
      toolId: "whois",
      tag: "IDENTITY"
    },
  ];

  return (
    <div className="tools-container-premium">
      <div className="tools-grid-premium">
        {tools.map((tool) => (
          <div
            key={tool.toolId}
            className="tool-card-premium"
            style={
              {
                "--tool-color": tool.color,
                "--tool-color-rgb": colorToRgb[tool.color] || "0, 255, 157",
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
