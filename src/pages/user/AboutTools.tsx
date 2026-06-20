import React, { useState } from "react";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  Info,
  AlertTriangle,
  Cpu,
  Globe,
  Database,
  Lock,
  Search,
  User,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/about-tools.css";
import nmapAnimation from "../../assets/icons/nmap.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";
import ffufAnimation from "../../assets/icons/ffuf.json";
import dnsAnimation from "../../assets/icons/dns-recon.json";
import whoisAnimation from "../../assets/icons/whois.json";

const toolData = [
  {
    id: "nmap",
    title: "Nmap",
    subtitle: "Network & Port Scanner",
    animation: nmapAnimation,
    icon: <Globe size={18} />,
    color: "#00d4ff",
    colorRgb: "0, 212, 255",
    tag: "RECON",
    badges: ["Open Ports", "Service Detection"],
    description:
      "Nmap discovers which ports and services are exposed on your server. Open ports that shouldn't be public are a direct security risk.",
    whenToUse: "Run this first to get a complete picture of what your server is exposing to the internet.",
    features: ["Port Scanning", "Service & Version Detection"],
  },
  {
    id: "nikto",
    title: "Nikto",
    subtitle: "Web Server Auditor",
    animation: niktoAnimation,
    icon: <Cpu size={18} />,
    color: "#ff6b6b",
    colorRgb: "255, 107, 107",
    tag: "CONFIG",
    badges: ["Outdated Software", "Misconfigurations"],
    description:
      "Nikto audits your web server for outdated software, dangerous default files, and common configuration mistakes that attackers exploit.",
    whenToUse: "Use after Nmap to audit the web server layer for known misconfigurations and vulnerable software.",
    features: ["Software Identification", "Dangerous File Detection"],
  },
  {
    id: "sqlmap",
    title: "SQLMap",
    subtitle: "SQL Injection Tester",
    animation: sqlAnimation,
    icon: <Database size={18} />,
    color: "#ffd54f",
    colorRgb: "255, 213, 79",
    tag: "DATABASE",
    badges: ["Database Security", "Form Testing"],
    description:
      "SQLMap automatically tests your website's input forms for SQL injection vulnerabilities that could allow an attacker to steal or destroy your database.",
    whenToUse: "Use on any site with login forms, search boxes, or any user input that touches a database.",
    features: ["Injection Detection", "Form Crawling"],
  },
  {
    id: "sslscan",
    title: "SSLScan",
    subtitle: "TLS/SSL Auditor",
    animation: sslAnimation,
    icon: <Lock size={18} />,
    color: "#69f0ae",
    colorRgb: "105, 240, 174",
    tag: "ENCRYPTION",
    badges: ["Encryption Audit", "Certificate Check"],
    description:
      "SSLScan audits your HTTPS configuration — it checks for weak ciphers, outdated protocols (SSLv3, TLS 1.0), and certificate validity issues.",
    whenToUse: "Use on any HTTPS site to ensure data in transit is properly encrypted.",
    features: ["TLS Protocol Audit", "Certificate Expiry Check"],
  },
  {
    id: "ffuf",
    title: "FFUF",
    subtitle: "Directory & Endpoint Fuzzer",
    animation: ffufAnimation,
    icon: <Search size={18} />,
    color: "#ff00ff",
    colorRgb: "255, 0, 255",
    tag: "EXPERT",
    badges: ["Hidden Paths", "Fast Discovery"],
    description:
      "FFUF rapidly discovers hidden directories, admin panels, backup files, and API endpoints that are not publicly linked but still accessible.",
    whenToUse: "Use on backend/full-stack sites to uncover exposed paths that should not be publicly reachable.",
    features: ["Directory Discovery", "Multi-status Filtering"],
  },
  {
    id: "dns",
    title: "DNS Lookup",
    subtitle: "Domain Intelligence",
    animation: dnsAnimation,
    icon: <Info size={18} />,
    color: "#69f0ae",
    colorRgb: "105, 240, 174",
    tag: "DOMAIN",
    badges: ["A / MX / TXT Records", "Instant Results"],
    description:
      "Instantly retrieves DNS records for any domain — A, AAAA, MX, TXT, NS, CNAME and more. Useful for verifying domain configuration and spotting misconfigurations.",
    whenToUse: "Use to verify domain records, check email security (SPF/DKIM), or investigate a domain's infrastructure.",
    features: ["Full Record Lookup", "Instant Inline Results"],
  },
  {
    id: "whois",
    title: "WHOIS",
    subtitle: "Domain Ownership Lookup",
    animation: whoisAnimation,
    icon: <User size={18} />,
    color: "#c084fc",
    colorRgb: "192, 132, 252",
    tag: "IDENTITY",
    badges: ["Ownership Info", "Expiry Date"],
    description:
      "WHOIS retrieves registration details for any domain — owner info, registrar, creation and expiry dates. Helps verify legitimacy and avoid squatted domains.",
    whenToUse: "Use to check who owns a domain, when it expires, or to investigate a suspicious site.",
    features: ["Registrar Info", "Expiry & Creation Dates"],
  },
];

const AboutTools: React.FC = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="about-page-premium">
      <div className="about-content-wrap">
        <header className="about-header-premium">
          <Link to="/dashboard" className="back-btn-v2">
            <ChevronLeft size={18} />
            <span>Dashboard</span>
          </Link>
          <div className="about-title-group">
            <h1 className="text-gradient">Security Toolkit</h1>
            <p>Professional-grade assessment engines. Tap any tool to learn more.</p>
          </div>
        </header>

        {/* Accordion Tool List */}
        <div className="tools-accordion">
          {toolData.map((tool) => {
            const isOpen = openId === tool.id;
            return (
              <div
                key={tool.id}
                className={`accordion-item ${isOpen ? "open" : ""}`}
                style={{ "--tool-accent": tool.color, "--tool-accent-rgb": tool.colorRgb } as React.CSSProperties}
              >
                {/* Collapsed Header Row — always visible */}
                <button
                  className="accordion-trigger"
                  onClick={() => toggle(tool.id)}
                  aria-expanded={isOpen}
                >
                  <div className="accordion-left">
                    <div className="accordion-lottie">
                      <Lottie
                        animationData={tool.animation}
                        loop
                        autoplay
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                    <div className="accordion-name">
                      <span className="tool-acc-title">{tool.title}</span>
                      <span className="tool-acc-sub">{tool.subtitle}</span>
                    </div>
                  </div>

                  <div className="accordion-right">
                    <span className="tool-acc-tag">{tool.tag}</span>
                    <div className={`accordion-chevron ${isOpen ? "rotated" : ""}`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </button>

                {/* Expandable Body */}
                <div className={`accordion-body ${isOpen ? "expanded" : ""}`}>
                  <div className="accordion-body-inner">
                    <div className="acc-detail-grid">
                      {/* Large Lottie Preview */}
                      <div className="acc-lottie-large">
                        <Lottie
                          animationData={tool.animation}
                          loop
                          autoplay
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>

                      {/* Details */}
                      <div className="acc-details">
                        <p className="acc-description">{tool.description}</p>

                        <div className="acc-features">
                          {tool.features.map((f, i) => (
                            <span key={i} className="f-tag">{f}</span>
                          ))}
                        </div>

                        <div className="acc-usage">
                          <div className="usage-label">
                            <Info size={14} />
                            <span>When to use</span>
                          </div>
                          <p>{tool.whenToUse}</p>
                        </div>

                        <button
                          className="acc-scan-btn"
                          onClick={() => navigate(`/start-scan?tool=${tool.id}`)}
                        >
                          <Play size={14} fill="currentColor" />
                          <span>Scan with {tool.title}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <section className="about-notice-panel glass-panel">
          <div className="notice-header">
            <AlertTriangle className="text-accent" size={22} />
            <h3>Legal & Ethical Compliance</h3>
          </div>
          <p>
            The tools provided in this suite are powerful security assessment instruments. Unauthorized use against
            systems without explicit, documented permission is strictly prohibited. Operators must ensure full compliance
            with regional laws and responsible disclosure practices.{" "}
            <strong>Vuln Spectra enforces a strict policy against any malicious or unauthorized activity.</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutTools;
