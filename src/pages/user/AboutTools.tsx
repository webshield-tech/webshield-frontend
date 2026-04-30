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

const toolData = [
  {
    id: "nmap",
    title: "Network Scout",
    subtitle: "Door Finder (Nmap)",
    animation: nmapAnimation,
    icon: <Globe size={20} />,
    color: "#00d4ff",
    badges: ["Finds Open Doors", "Server ID", "System Check"],
    description:
      "Nmap acts like a scout. It scans your website's server to find which 'doors' (ports) are open to the internet. If a door is open that shouldn't be, hackers can use it to enter.",
    whenToUse:
      "Use this to see exactly what services your server is exposing to the world.",
    features: ["Open Port Detection", "Service Identification", "OS Guessing"],
    delay: "0.1s",
  },
  {
    id: "nikto",
    title: "Web Auditor",
    subtitle: "Server Inspector (Nikto)",
    animation: niktoAnimation,
    icon: <Cpu size={20} />,
    color: "#ff6b6b",
    badges: ["Old Software", "Server Mistakes", "Risky Files"],
    description:
      "Nikto is an inspector for your web server. It checks if your software is outdated or if you've made common setup mistakes that make it easy for hackers to break in.",
    whenToUse:
      "Use this to find common server-level vulnerabilities and dangerous files.",
    features: ["Outdated Software Check", "Config Audit", "Hidden File Search"],
    delay: "0.3s",
  },
  {
    id: "sqlmap",
    title: "Database Guard",
    subtitle: "Data Protection (SQLMap)",
    animation: sqlAnimation,
    icon: <Database size={20} />,
    color: "#ffd54f",
    badges: ["Login Security", "Data Leak Check", "Auto Test"],
    description:
      "SQLMap tests your website's forms (like login or search bars). It checks if a hacker can trick your website into leaking your entire database, including passwords and user info.",
    whenToUse:
      "Use this to make sure your website's forms are not vulnerable to database theft.",
    features: ["Injection Detection", "Data Access Test", "Database ID"],
    delay: "0.5s",
  },
  {
    id: "sslscan",
    title: "Lock Checker",
    subtitle: "Security Lock (SSLScan)",
    animation: sslAnimation,
    icon: <Lock size={20} />,
    color: "#69f0ae",
    badges: ["Encryption Check", "Green Lock Audit", "Privacy"],
    description:
      "SSLScan checks the 'green lock' (HTTPS) on your website. It makes sure the encryption used to protect your users' data is strong and follows the latest security standards.",
    whenToUse:
      "Use this to ensure your website's encryption cannot be cracked by modern attacks.",
    features: ["Encryption Strength", "Certificate Check", "Protocol Audit"],
    delay: "0.7s",
  },
  {
    id: "gobuster",
    title: "Path Finder",
    subtitle: "Hidden File Search (Gobuster)",
    animation: nmapAnimation,
    icon: <Search size={20} />,
    color: "#ff8c00",
    badges: ["Hidden Folders", "Private Files", "Fast Search"],
    description: "Gobuster searches for hidden pages, folders, or admin panels on your website that you didn't mean to make public. It helps find things that shouldn't be found.",
    whenToUse: "To find forgotten admin pages, backup files, or private folders.",
    features: ["Hidden Path Discovery", "Fast Brute-force", "Secret Asset Find"],
    delay: "0.9s",
  },
  {
    id: "ratelimit",
    title: "Stress Tester",
    subtitle: "Traffic Capacity (RateLimit)",
    animation: sslAnimation,
    icon: <Shield size={20} />,
    color: "#9d00ff",
    badges: ["DDoS Check", "Speed Limit", "Crash Test"],
    description: "This tool checks if your website can handle too much traffic at once. It helps prevent 'DDoS' attacks where hackers try to crash your site by sending too many requests.",
    whenToUse: "When you want to know if your website will crash under heavy traffic or attacks.",
    features: ["High Traffic Test", "Crash Resistance", "Limit Verification"],
    delay: "1.1s",
  },
  {
    id: "ffuf",
    title: "Deep Fuzzer",
    subtitle: "Advanced Search (FFUF)",
    animation: niktoAnimation,
    icon: <Search size={20} />,
    color: "#ff00ff",
    badges: ["Expert Search", "Deep Discovery", "Fast Fuzzing"],
    description: "FFUF is a very fast tool for experts to find hidden parts of a website. It can find secret settings and hidden files that other tools might miss.",
    whenToUse: "For a deeper, faster search of hidden technical parts of your website.",
    features: ["Header Search", "Fast Discovery", "Technical Audit"],
    delay: "1.3s",
  },
  {
    id: "wapiti",
    title: "All-in-One",
    subtitle: "Web Bug Scanner (Wapiti)",
    animation: nmapAnimation,
    icon: <Globe size={20} />,
    color: "#00d4ff",
    badges: ["Full Audit", "Common Bug Find", "Easy Scan"],
    description: "Wapiti is like a general health checkup for your website. It looks for many common security bugs like XSS (malicious scripts) and SQL injection all in one go.",
    whenToUse: "When you want a quick but comprehensive check for common website bugs.",
    features: ["Deep Crawling", "XSS Detection", "General Security Audit"],
    delay: "1.5s",
  },
  {
    id: "nuclei",
    title: "Vuln Matcher",
    subtitle: "Security Bug Check (Nuclei)",
    animation: sqlAnimation,
    icon: <Database size={20} />,
    color: "#ffd54f",
    badges: ["4000+ Bug List", "Latest Threats", "Auto Check"],
    description: "Nuclei matches your website against a huge library of over 4,000 known security bugs. It's the best way to find out if your site has a famous vulnerability.",
    whenToUse: "To quickly check if your website is affected by any well-known security threats.",
    features: ["Community Templates", "Latest Bug Detection", "Infrastructure Audit"],
    delay: "1.7s",
  },
  {
    id: "dns",
    title: "ID Checker",
    subtitle: "Technical Settings (DNS)",
    animation: sslAnimation,
    icon: <Info size={20} />,
    color: "#69f0ae",
    badges: ["Domain Identity", "Email Setup", "Server Connect"],
    description: "This tool checks the 'identity' settings of your domain. It makes sure your website is connected to the right servers and your email settings are secure.",
    whenToUse: "To verify that your website's technical domain configuration is correct.",
    features: ["Domain Record Check", "Identity Verify", "Technical Audit"],
    delay: "1.9s",
  },
  {
    id: "whois",
    title: "Owner Verifier",
    subtitle: "Domain Ownership (Whois)",
    animation: sslAnimation,
    icon: <User size={20} />,
    color: "#ffffff",
    badges: ["Identity Verification", "Expiry Date", "Owner Info"],
    description: "Whois finds out who officially owns your domain and when it expires. This helps you prevent 'domain theft' and makes sure your identity is protected.",
    whenToUse: "To verify domain registration details and prevent expiration issues.",
    features: ["Ownership Check", "Registration Data", "Expiry Alert"],
    delay: "2.1s",
  },
];

const AboutTools: React.FC = () => {

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
