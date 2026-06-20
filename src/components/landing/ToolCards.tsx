/* eslint-disable @typescript-eslint/no-unused-vars */
import "./ToolCards.css";
import Lottie from "lottie-react";
import nmapAnimation from "../../assets/icons/nmap.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import ffufAnimation from "../../assets/icons/ffuf.json";
import dnsAnimation from "../../assets/icons/dns-recon.json";
import whoisAnimation from "../../assets/icons/whois.json";

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
      name: "Nikto",
      animation: niktoAnimation,
      color: "#ff0055",
      description: "Checks for outdated server software and dangerous configuration issues.",
      features: ["Dangerous Files", "Outdated Software", "Misconfigurations"],
      delay: "0.2s",
      toolId: "nikto",
      tag: "CONFIG"
    },
    {
      name: "SQLMap",
      animation: sqlAnimation,
      color: "#ffd54f",
      description: "Validates SQL injection exposure on parameterized URLs and forms.",
      features: ["Injection Detection", "Data Extraction", "DB Fingerprint"],
      delay: "0.3s",
      toolId: "sqlmap",
      tag: "DATABASE"
    },
    {
      name: "SSLScan",
      animation: sslAnimation,
      color: "#00ff9d",
      description: "Audits TLS protocols, certificates, and cipher suite strength.",
      features: ["Cipher Check", "Certificate Info", "Protocol Support"],
      delay: "0.4s",
      toolId: "sslscan",
      tag: "ENCRYPTION"
    },
    {
      name: "FFUF",
      animation: ffufAnimation,
      color: "#ff00ff",
      description: "Fast fuzzing for hidden files, routes, and parameter space.",
      features: ["Header Fuzzing", "Rapid Discovery", "Deep Search"],
      delay: "0.5s",
      toolId: "ffuf",
      tag: "EXPERT"
    },
    {
      name: "DNS Recon",
      animation: dnsAnimation,
      color: "#69f0ae",
      description: "Inspects DNS records to map the target's infrastructure.",
      features: ["A/MX/NS Records", "Infrastructure Map", "Host Discovery"],
      delay: "0.6s",
      toolId: "dns",
      tag: "DOMAIN"
    },
    {
      name: "Whois",
      animation: whoisAnimation,
      color: "#ffffff",
      description: "Shows ownership, registrar, and expiry details for a domain.",
      features: ["Ownership Lookup", "Expiry Dates", "Registrar Data"],
      delay: "0.7s",
      toolId: "whois",
      tag: "IDENTITY"
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

