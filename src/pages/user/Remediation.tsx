import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Shield,
  Search,
  Copy,
  Check,
  Code,
  Sparkles,
  Database,
  Lock,
  Server,
  Cpu,
  AlertTriangle
} from "lucide-react";
import "../../styles/remediation.css";

interface CodeSnippet {
  language: string;
  code: string;
}

interface GuidelineItem {
  id: string;
  title: string;
  category: "injection" | "request" | "access" | "infrastructure";
  severity: "critical" | "high";
  color: string;
  colorRgb: string;
  icon: React.ReactNode;
  description: string;
  impact: string;
  remediation: string;
  snippets: CodeSnippet[];
  aiPrompt: string;
}

const GUIDELINES_DATA: GuidelineItem[] = [
  {
    id: "xss",
    title: "Cross-Site Scripting (XSS)",
    category: "injection",
    severity: "critical",
    color: "#ff6b6b",
    colorRgb: "255, 107, 107",
    icon: <Shield size={20} />,
    description: "XSS occurs when an application includes untrusted data in a web page without proper validation or escaping, allowing attackers to execute malicious scripts in the victim's browser.",
    impact: "Can lead to session hijacking, credential theft, redirection to malicious sites, and defacement of the website.",
    remediation: "Never trust raw user input. Context-aware output encoding (escaping) must be used. In modern frameworks like React, default rendering is safe, but avoid dangerouslySetInnerHTML unless sanitized with DOMPurify.",
    snippets: [
      {
        language: "React",
        code: `// SAFE: React escapes variables automatically
const UserProfile = ({ name }) => {
  return <div>Welcome, {name}</div>;
};

// UNSAFE: Raw HTML rendering without sanitization
const DangerousComment = ({ htmlContent }) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

// SAFE: Sanitized HTML using DOMPurify
import DOMPurify from 'dompurify';

const SafeComment = ({ htmlContent }) => {
  const cleanHtml = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
};`
      },
      {
        language: "Node/JS",
        code: `// SAFE: Output encoding / escaping function
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return m;
    }
  });
}

// Node/Express example using helmet for secure Content Security Policy (CSP)
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'trusted-cdn.com'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
}));`
      },
      {
        language: "Python",
        code: `# SAFE: HTML escaping in Flask / Python
from html import escape

def render_user_input(user_input):
    # Escape special characters to HTML entities
    safe_input = escape(user_input)
    return f"<div>User said: {safe_input}</div>"

# SAFE: HTML sanitization with bleach for rich text inputs
import bleach

def sanitize_rich_text(dirty_html):
    allowed_tags = ['p', 'b', 'i', 'strong', 'em', 'a']
    allowed_attrs = {'a': ['href', 'title']}
    clean_html = bleach.clean(dirty_html, tags=allowed_tags, attributes=allowed_attrs)
    return clean_html`
      },
      {
        language: "PHP",
        code: `<?php
// UNSAFE: Direct echo of user input
echo $_GET['name'];

// SAFE: htmlspecialchars context escaping
$safe_name = htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8');
echo "Welcome, " . $safe_name;

// SAFE: Contextual URL escaping
$safe_url = filter_var($_GET['url'], FILTER_SANITIZE_URL);
if (filter_var($safe_url, FILTER_VALIDATE_URL)) {
    echo '<a href="' . htmlspecialchars($safe_url, ENT_QUOTES, 'UTF-8') . '">Link</a>';
}
?>`
      }
    ],
    aiPrompt: "Rewrite this code to prevent Cross-Site Scripting (XSS). Ensure all user inputs rendered in the UI are properly escaped/encoded. If rich text or HTML parsing is absolutely necessary, integrate a robust sanitization library like DOMPurify (for JS/React) or Bleach (for Python). Also, write the response to include a secure Content Security Policy (CSP) header config."
  },
  {
    id: "ssrf",
    title: "Server-Side Request Forgery (SSRF)",
    category: "request",
    severity: "critical",
    color: "#ff00ff",
    colorRgb: "255, 0, 255",
    icon: <Server size={20} />,
    description: "SSRF occurs when a web application fetches a remote resource without validating the user-supplied URL, allowing attackers to coerce the application to send crafted requests to internal resources.",
    impact: "Allows attackers to scan internal networks, access cloud infrastructure metadata (e.g. AWS 169.254.169.254), read local files, and bypass firewalls.",
    remediation: "Avoid accepting direct URLs from users. If required, enforce a strict whitelist of allowed domains, parse target URLs, resolve them to IP addresses, and verify they do not fall within private/loopback CIDR ranges.",
    snippets: [
      {
        language: "Node/JS",
        code: `const axios = require('axios');
const ipaddr = require('ipaddr.js');
const dns = require('dns').promises;
const { URL } = require('url');

async function safeFetch(userUrlString) {
  const parsedUrl = new URL(userUrlString);
  
  // 1. Whitelist protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Invalid protocol');
  }

  // 2. Resolve hostname to IP
  const addresses = await dns.resolve4(parsedUrl.hostname);
  if (!addresses.length) throw new Error('Could not resolve host');
  const ipAddress = addresses[0];

  // 3. Block private / loopback IP addresses
  const addr = ipaddr.parse(ipAddress);
  const range = addr.range();
  
  if (range !== 'unicast') {
    throw new Error('SSRF Attempt Blocked: Access to private networks is forbidden');
  }

  // 4. Fetch using resolved IP but send Host header
  return await axios.get(\`\${parsedUrl.protocol}//\${ipAddress}\${parsedUrl.pathname}\`, {
    headers: { 'Host': parsedUrl.hostname }
  });
}`
      },
      {
        language: "Python",
        code: `import socket
import ipaddress
from urllib.parse import urlparse
import requests

def safe_fetch(user_url):
    parsed = urlparse(user_url)
    if parsed.scheme not in ('http', 'https'):
        raise ValueError("Invalid URL scheme")
        
    # Resolve hostname to IP
    try:
        ip_addr = socket.gethostbyname(parsed.hostname)
    except socket.gaierror:
        raise ValueError("Could not resolve host")
        
    ipObj = ipaddress.ip_address(ip_addr)
    
    # Check if IP address is private/loopback/reserved
    if ipObj.is_private or ipObj.is_loopback or ipObj.is_reserved or ipObj.is_link_local:
        raise ValueError("SSRF Blocked: Private destination address detected")
        
    # Fetch using the resolved IP to prevent DNS Rebinding
    fetch_url = f"{parsed.scheme}://{ip_addr}{parsed.path}"
    headers = {"Host": parsed.hostname}
    return requests.get(fetch_url, headers=headers, timeout=5)`
      },
      {
        language: "Go",
        code: `package main

import (
	"context"
	"errors"
	"net"
	"net/http"
	"time"
)

// SafeHTTPClient creates an HTTP client that blocks connection to loopback and private networks
func SafeHTTPClient() *http.Client {
	dialer := &net.Dialer{
		Timeout: 5 * time.Second,
	}

	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, err
			}

			ips, err := net.DefaultResolver.LookupIP(ctx, "ip4", host)
			if err != nil || len(ips) == 0 {
				return nil, errors.New("resolution failed")
			}
			ip := ips[0]

			// Block private & loopback ranges
			if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() {
				return nil, errors.New("SSRF Blocked: Access to private networks forbidden")
			}

			return dialer.DialContext(ctx, network, net.JoinHostPort(ip.String(), port))
		},
	}

	return &http.Client{
		Transport: transport,
		Timeout:   10 * time.Second,
	}
}`
      }
    ],
    aiPrompt: "Identify and fix Server-Side Request Forgery (SSRF) vulnerabilities in the provided function. Write a safe HTTP client wrapper that parses target URLs, resolves the domain name, blocks all private (RFC 1918), loopback, link-local (e.g. 169.254.169.254), and multicast IP ranges, and requests the resource securely with custom timeout constraints."
  },
  {
    id: "sqli",
    title: "SQL Injection (SQLi)",
    category: "injection",
    severity: "critical",
    color: "#ffd54f",
    colorRgb: "255, 213, 79",
    icon: <Database size={20} />,
    description: "SQL Injection occurs when user-supplied inputs are concatenated or interpolated directly into dynamic SQL queries instead of using safe parameterized boundaries.",
    impact: "Can allow attackers to bypass login screens, retrieve sensitive database records, execute administrative database functions, and modify or delete database tables.",
    remediation: "Always use parameterized queries (prepared statements) or safe Object Relational Mappers (ORMs). Never concatenate raw input strings directly into database command strings.",
    snippets: [
      {
        language: "Node/JS",
        code: `// UNSAFE: Vulnerable to SQL Injection via input string interpolation
const query = \`SELECT * FROM users WHERE email = '\${req.body.email}' AND password = '\${req.body.password}'\`;
const result = await db.query(query);

// SAFE: Parameterized Query usingpg/mysql2 placeholders
const safeQuery = 'SELECT * FROM users WHERE email = $1 AND password = $2';
const safeValues = [req.body.email, req.body.password];
const safeResult = await db.query(safeQuery, safeValues);

// SAFE: Using a trusted ORM (Sequelize example)
const user = await User.findOne({
  where: {
    email: req.body.email,
    password: req.body.password // Note: Passwords should be salted & hashed (e.g., bcrypt)
  }
});`
      },
      {
        language: "Python",
        code: `# UNSAFE: Dynamic SQL building
cursor.execute(f"SELECT info FROM accounts WHERE id = '{user_id}'")

# SAFE: Parameterized SQL (psycopg2 placeholder syntax)
cursor.execute("SELECT info FROM accounts WHERE id = %s", (user_id,))

# SAFE: Using SQLAlchemy ORM safely
account = session.query(Account).filter(Account.id == user_id).first()`
      },
      {
        language: "Go",
        code: `// UNSAFE: Direct interpolation
query := fmt.Sprintf("SELECT name, email FROM members WHERE id = '%s'", memberID)
rows, err := db.Query(query)

// SAFE: Prepared SQL parameters
querySafe := "SELECT name, email FROM members WHERE id = ?"
rowsSafe, err := db.Query(querySafe, memberID)`
      },
      {
        language: "PHP",
        code: `<?php
// UNSAFE: SQL concatenation
$query = "SELECT * FROM administrators WHERE user = '" . $_POST['user'] . "'";
$result = $conn->query($query);

// SAFE: PDO prepared statement
$stmt = $pdo->prepare('SELECT * FROM administrators WHERE user = :user');
$stmt->execute(['user' => $_POST['user']]);
$user = $stmt->fetch();
?>`
      }
    ],
    aiPrompt: "Ensure all database transactions in the following code block are safe against SQL injection. Replace all concatenated or string-interpolated query constructs with properly bound parameter placeholders (Prepared Statements) or show how to implement it securely using a modern ORM interface."
  },
  {
    id: "ratelimit",
    title: "Rate Limiting & Anti-Abuse",
    category: "infrastructure",
    severity: "high",
    color: "#69f0ae",
    colorRgb: "105, 240, 174",
    icon: <Lock size={20} />,
    description: "Rate limiting controls the rate of incoming requests to an API or webpage. Without protection, attackers can launch automated brute-force attacks or cause Denial of Service (DoS) conditions.",
    impact: "Uncontrolled traffic bursts can overwhelm server memory, trigger database connection timeouts, and leak credentials via rapid dictionary attacks.",
    remediation: "Deploy middleware to limit API calls by client IP or session tokens. Implement tighter thresholds on sensitive endpoints such as authentication (/login, /register) and password resets.",
    snippets: [
      {
        language: "Node/JS",
        code: `// Node/Express rate limiting middleware (express-rate-limit)
const rateLimit = require('express-rate-limit');

// General api rate limiter (e.g., max 100 requests per 15 mins)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Tight limiter for login/auth routes to block brute-force
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Max 5 logins per minute
  message: { error: 'Too many login attempts. Please try again in a minute.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);`
      },
      {
        language: "Python",
        code: `# Flask rate limiting example using Flask-Limiter
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://", # Or use redis://localhost:6379 for production/distributed setups
)

@app.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    return "Login endpoint"`
      },
      {
        language: "Go",
        code: `package main

import (
	"net/http"
	"golang.org/x/time/rate"
)

// Simple rate limiter middleware
func rateLimiterMiddleware(next http.Handler) http.Handler {
	// Allow 5 requests per second with a burst buffer of 10 requests
	limiter := rate.NewLimiter(5, 10)
	
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !limiter.Allow() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}`
      }
    ],
    aiPrompt: "Implement rate-limiting middleware for the provided backend code. Ensure there is a general API rate limiter (e.g., 100 requests per 15 minutes) and a much stricter rate limiter (e.g., 5 requests per minute) applied exclusively to sensitive business logic routes (such as authentication, login, registration, and password reset)."
  }
];

const Remediation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [activeLangTab, setActiveLangTab] = useState<Record<string, string>>(() => {
    // Default to the first available snippet language
    const defaults: Record<string, string> = {};
    GUIDELINES_DATA.forEach(g => {
      if (g.snippets.length > 0) {
        defaults[g.id] = g.snippets[0].language;
      }
    });
    return defaults;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    });
  };

  const filteredGuidelines = useMemo(() => {
    return GUIDELINES_DATA.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.remediation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="remediation-page">
      <div className="remediation-container">
        
        <header className="remediation-header">
          <Link to="/dashboard" className="back-btn-v2">
            <ChevronLeft size={20} />
            <span>Dashboard</span>
          </Link>
          <div className="about-title-group">
            <h1 className="text-gradient">Secure Coding Guidelines</h1>
            <p>Implement core security remediations across multiple programming languages to protect your applications.</p>
          </div>
        </header>

        {/* Global AI Prompt Banner */}
        <section className="ai-prompt-banner">
          <div className="ai-banner-badge">
            <Sparkles size={12} />
            <span>AI Code Copilot</span>
          </div>
          <div className="ai-banner-content">
            <h2>
              <Cpu size={20} color="#00f2ff" />
              <span>Ask AI to Write Secure Code</span>
            </h2>
            <p>
              If you are generating web applications using an AI model (like Gemini, Claude, or ChatGPT), copy this global context instructions block to ensure your code is generated with industry-standard security defaults.
            </p>
            <div className="ai-prompt-box">
              <div className="ai-prompt-text">
                {`System Instruction for Secure Coding:
- Write defensive, clean, and highly secure code adhering to the OWASP Top Ten security standard.
- Enforce strict parameter validation, type checks, and input escaping for all public interfaces.
- Use parameterized SQL queries (Prepared Statements) exclusively. Never concatenate strings for query building.
- Sanitize HTML fields with proven libraries (like DOMPurify) and configure custom secure headers including strict Content Security Policy (CSP).
- Enforce secure cookies (HttpOnly, Secure, SameSite=Strict) and run strict API rate limiters on auth routes.`}
              </div>
              <button 
                className="copy-btn-floating"
                onClick={() => handleCopy("global-ai", `System Instruction for Secure Coding:
- Write defensive, clean, and highly secure code adhering to the OWASP Top Ten security standard.
- Enforce strict parameter validation, type checks, and input escaping for all public interfaces.
- Use parameterized SQL queries (Prepared Statements) exclusively. Never concatenate strings for query building.
- Sanitize HTML fields with proven libraries (like DOMPurify) and configure custom secure headers including strict Content Security Policy (CSP).
- Enforce secure cookies (HttpOnly, Secure, SameSite=Strict) and run strict API rate limiters on auth routes.`)}
                title="Copy secure prompt template"
              >
                {copiedStates["global-ai"] ? <Check size={18} color="#00ff9d" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="search-filter-wrapper">
          <div className="search-input-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search security guidelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="category-tabs">
            <button
              className={`category-tab ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Types
            </button>
            <button
              className={`category-tab ${selectedCategory === "injection" ? "active" : ""}`}
              onClick={() => setSelectedCategory("injection")}
            >
              Injection
            </button>
            <button
              className={`category-tab ${selectedCategory === "request" ? "active" : ""}`}
              onClick={() => setSelectedCategory("request")}
            >
              Request Security
            </button>
            <button
              className={`category-tab ${selectedCategory === "access" ? "active" : ""}`}
              onClick={() => setSelectedCategory("access")}
            >
              Access Controls
            </button>
            <button
              className={`category-tab ${selectedCategory === "infrastructure" ? "active" : ""}`}
              onClick={() => setSelectedCategory("infrastructure")}
            >
              Infrastructure
            </button>
          </div>
        </div>

        {/* Remediation Cards */}
        <div className="remediation-list">
          {filteredGuidelines.length === 0 ? (
            <div className="glass-panel text-center" style={{ padding: "60px 20px" }}>
              <AlertTriangle size={48} color="var(--cyber-accent)" style={{ margin: "0 auto 16px" }} />
              <h3>No Guidelines Found</h3>
              <p style={{ color: "var(--cyber-text-dim)", marginTop: "8px" }}>Try tweaking your search parameters or query keywords.</p>
            </div>
          ) : (
            filteredGuidelines.map((item) => {
              const activeLang = activeLangTab[item.id] || item.snippets[0]?.language;
              const activeSnippet = item.snippets.find(s => s.language === activeLang);

              return (
                <article
                  key={item.id}
                  className="remediation-card glass-panel"
                  style={{ "--tool-accent": item.color } as React.CSSProperties}
                >
                  <div className="card-accent-line"></div>
                  
                  <div className="remediation-head">
                    <div className="remediation-title-area">
                      <h2>{item.title}</h2>
                      <span className={`severity-indicator ${item.severity}`}>{item.severity.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="remediation-info-row">
                    <div className="info-block">
                      <h3>Threat Context</h3>
                      <p>{item.description}</p>
                      <p style={{ marginTop: "12px", fontStyle: "italic", fontSize: "0.92rem", color: "rgba(255,255,255,0.7)" }}>
                        <strong>Impact:</strong> {item.impact}
                      </p>
                    </div>
                    <div className="info-block">
                      <h3>Remediation Logic</h3>
                      <p>{item.remediation}</p>
                    </div>
                  </div>

                  {/* Code Snippets Section */}
                  {item.snippets.length > 0 && (
                    <div className="code-section">
                      <div className="code-section-header">
                        <span className="code-title">
                          <Code size={16} color="var(--cyber-primary)" />
                          <span>Implementation Templates</span>
                        </span>
                        
                        <div className="language-tabs">
                          {item.snippets.map((snip) => (
                            <button
                              key={snip.language}
                              className={`lang-tab ${activeLang === snip.language ? "active" : ""}`}
                              onClick={() => setActiveLangTab(prev => ({ ...prev, [item.id]: snip.language }))}
                            >
                              {snip.language}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="code-block-wrapper">
                        <pre>
                          <code>{activeSnippet?.code}</code>
                        </pre>
                        <button
                          className="copy-btn-floating"
                          onClick={() => handleCopy(`${item.id}-code`, activeSnippet?.code || "")}
                          title={`Copy ${activeLang} Code Snippet`}
                        >
                          {copiedStates[`${item.id}-code`] ? <Check size={18} color="#00ff9d" /> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Prompt Box per Guideline */}
                  <div className="code-section" style={{ marginTop: "24px", borderTop: "1px dashed var(--cyber-border)" }}>
                    <div className="code-section-header">
                      <span className="code-title" style={{ color: "#a5f3fc" }}>
                        <Sparkles size={16} color="#00f2ff" />
                        <span>AI Prompt context for this threat</span>
                      </span>
                    </div>
                    <div className="ai-prompt-box" style={{ background: "rgba(0, 242, 255, 0.02)", borderStyle: "dashed" }}>
                      <p className="ai-prompt-text" style={{ fontSize: "0.85rem", color: "#67e8f9" }}>
                        {item.aiPrompt}
                      </p>
                      <button
                        className="copy-btn-floating"
                        onClick={() => handleCopy(`${item.id}-prompt`, item.aiPrompt)}
                        title="Copy vulnerability resolution prompt"
                      >
                        {copiedStates[`${item.id}-prompt`] ? <Check size={18} color="#00ff9d" /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

export default Remediation;
