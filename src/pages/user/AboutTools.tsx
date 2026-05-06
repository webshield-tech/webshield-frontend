import React from "react";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  ChevronLeft, 
  Info, 
  AlertTriangle, 
  Cpu, 
  Globe, 
  Database, 
  Lock,
  Search,
  User
} from "lucide-react";
import "../../styles/about-tools.css";
import nmapAnimation from "../../assets/icons/nmap.json";
import niktoAnimation from "../../assets/icons/nikto.json";
import sqlAnimation from "../../assets/icons/sql.json";
import sslAnimation from "../../assets/icons/ssl.json";
import gobusterAnimation from "../../assets/icons/gobuster.json";
import ffufAnimation from "../../assets/icons/ffuf.json";
import wapitiAnimation from "../../assets/icons/wapiti.json";
import nucleiAnimation from "../../assets/icons/nuclie.json";
import dnsAnimation from "../../assets/icons/dns-recon.json";
import whoisAnimation from "../../assets/icons/whois.json";
import rateLimitAnimation from "../../assets/icons/rate-limit.json";

const toolData = [
  {
    id: "nmap",
    title: "Nmap",
    subtitle: "Network Scanner",
    animation: nmapAnimation,
    icon: <Globe size={20} />,
    color: "#00d4ff",
    badges: ["Finds Open Ports", "Server Check"],
    description:
      "Nmap scans your server to find which 'doors' (ports) are open. If a port is open that shouldn't be, it's a security risk.",
    whenToUse:
      "Use this to see what parts of your server are visible to the public.",
    features: ["Port Scanning", "Service Detection"],
    delay: "0.1s",
  },
  {
    id: "nikto",
    title: "Nikto",
    subtitle: "Web Server Scanner",
    animation: niktoAnimation,
    icon: <Cpu size={20} />,
    color: "#ff6b6b",
    badges: ["Old Software", "Server Errors"],
    description:
      "Nikto checks if your web server software is outdated or has common setup mistakes that could be exploited.",
    whenToUse:
      "Use this to find common server vulnerabilities and dangerous files.",
    features: ["Server Auditing", "Software Check"],
    delay: "0.3s",
  },
  {
    id: "sqlmap",
    title: "SQLMap",
    subtitle: "Database Security",
    animation: sqlAnimation,
    icon: <Database size={20} />,
    color: "#ffd54f",
    badges: ["Data Leak Check", "Auto Test"],
    description:
      "SQLMap tests your website's forms to see if a hacker can steal your database information, like passwords or user data.",
    whenToUse:
      "Use this to make sure your login and search forms are secure.",
    features: ["Injection Test", "Data Protection"],
    delay: "0.5s",
  },
  {
    id: "sslscan",
    title: "SSLScan",
    subtitle: "Encryption Checker",
    animation: sslAnimation,
    icon: <Lock size={20} />,
    color: "#69f0ae",
    badges: ["Green Lock Audit", "Privacy"],
    description:
      "SSLScan checks your website's 'green lock' (HTTPS) to make sure your users' data is encrypted and safe from hackers.",
    whenToUse:
      "Use this to ensure your website's encryption is strong and up-to-date.",
    features: ["SSL/TLS Audit", "Certificate Check"],
    delay: "0.7s",
  },
  {
    id: "gobuster",
    title: "Gobuster",
    subtitle: "Hidden File Search",
    animation: gobusterAnimation,
    icon: <Search size={20} />,
    color: "#ff8c00",
    badges: ["Hidden Folders", "Private Files"],
    description: "Gobuster searches for hidden pages, folders, or admin panels on your website that should not be public.",
    whenToUse: "To find forgotten admin pages or private folders.",
    features: ["Path Discovery", "Fast Search"],
    delay: "0.9s",
  },
  {
    id: "ratelimit",
    title: "RateLimit",
    subtitle: "Traffic Capacity",
    animation: rateLimitAnimation,
    icon: <Shield size={20} />,
    color: "#9d00ff",
    badges: ["DDoS Check", "Crash Test"],
    description: "This tool checks if your website can handle too much traffic at once without crashing.",
    whenToUse: "To see if your website can handle many requests or a DDoS attack.",
    features: ["Traffic Test", "Limit Check"],
    delay: "1.1s",
  },
  {
    id: "ffuf",
    title: "FFUF",
    subtitle: "Advanced File Search",
    animation: ffufAnimation,
    icon: <Search size={20} />,
    color: "#ff00ff",
    badges: ["Deep Discovery", "Fast Search"],
    description: "FFUF is a very fast tool used to find hidden parts and secret settings of a website.",
    whenToUse: "For a deeper and faster search of hidden technical parts of your site.",
    features: ["Fast Discovery", "Technical Audit"],
    delay: "1.3s",
  },
  {
    id: "wapiti",
    title: "Wapiti",
    subtitle: "Web Bug Scanner",
    animation: wapitiAnimation,
    icon: <Globe size={20} />,
    color: "#00d4ff",
    badges: ["Full Audit", "Bug Finder"],
    description: "Wapiti is like a general health checkup that looks for many common security bugs all in one go.",
    whenToUse: "When you want a comprehensive check for common website vulnerabilities.",
    features: ["General Audit", "Bug Detection"],
    delay: "1.5s",
  },
  {
    id: "nuclei",
    title: "Nuclei",
    subtitle: "Security Bug Check",
    animation: nucleiAnimation,
    icon: <Database size={20} />,
    color: "#ffd54f",
    badges: ["Known Bug Match", "Latest Threats"],
    description: "Nuclei checks your website against a huge list of known security bugs to see if you are at risk.",
    whenToUse: "To quickly check if your website has any famous security vulnerabilities.",
    features: ["Template Matching", "Vulnerability Check"],
    delay: "1.7s",
  },
  {
    id: "dns",
    title: "DNS Recon",
    subtitle: "Technical Settings",
    animation: dnsAnimation,
    icon: <Info size={20} />,
    color: "#69f0ae",
    badges: ["Domain Identity", "Server Connect"],
    description: "This tool checks if your website is correctly connected to the right servers and looks for domain issues.",
    whenToUse: "To verify that your website's domain settings are correct.",
    features: ["Record Check", "Technical Audit"],
    delay: "1.9s",
  },
  {
    id: "whois",
    title: "Whois",
    subtitle: "Domain Ownership",
    animation: whoisAnimation,
    icon: <User size={20} />,
    color: "#ffffff",
    badges: ["Ownership Check", "Expiry Date"],
    description: "Whois finds out who owns your domain and when it expires to help prevent your domain from being stolen.",
    whenToUse: "To check who owns a domain and when it needs to be renewed.",
    features: ["Ownership Verify", "Expiry Check"],
    delay: "2.1s",
  },
];

const AboutTools: React.FC = () => {

  return (
    <div className="about-page-premium">
      <div className="about-content-wrap">
        <header className="about-header-premium">
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
                  <Lottie animationData={tool.animation} loop={false} />
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
