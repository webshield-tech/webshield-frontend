// Comprehensive Secure Coding Knowledge Hub Data
// Contains all 25 secure coding topics requested in Objective 6

export interface CodeExample {
  vuln: string;
  secure: string;
  explanation: string;
}

export interface Vulnerability {
  id: string;
  name: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  owasp: string;
  description: string;
  simpleExplanation: string;
  attackExplanation: string;
  impactAnalysis: string;
  detectionMethods: string[];
  preventionSummary: string;
  preventionTechniques: string[];
  bestPractices: string[];
  affectedTechnologies: string[];
  tags: string[];
  languages: Record<string, CodeExample>;
  frameworks: Record<string, string>;
}

export const VULNERABILITIES: Vulnerability[] = [
  {
    id: "sqli",
    name: "SQL Injection (SQLi)",
    category: "Injection",
    severity: "Critical",
    difficulty: "Beginner",
    owasp: "A03:2021-Injection",
    description: "SQL Injection occurs when untrusted user input is directly concatenated into database queries, allowing attackers to manipulate queries and gain unauthorized access.",
    simpleExplanation: "SQL Injection happens when a website takes what you type and inserts it straight into a database command. Attackers can type symbols like ' or OR to rewrite the command and steal everything.",
    attackExplanation: "An attacker injects SQL payloads into parameter values. If input is not sanitized, the database interpreter executes the injected string as code. For example, injecting `' OR '1'='1` in a login form bypasses authentication.",
    impactAnalysis: "Complete database takeover, sensitive data theft (passwords, PII), data deletion, and potentially Remote Code Execution (RCE) on the database server.",
    detectionMethods: [
      "Static code analysis (checking for string formatting in DB queries).",
      "Dynamic application testing (DAST) using sqlmap or manual fuzzing.",
      "Reviewing database query logs for unusual query structures."
    ],
    preventionSummary: "Use parameterized queries (prepared statements) and Object-Relational Mappers (ORMs). Never concatenate strings.",
    preventionTechniques: [
      "Parameterized queries: Binds parameters so the DB treats input strictly as data.",
      "Input validation: Enforce strict whitelist checks.",
      "Least privilege: Restrict DB user permissions to only required tables."
    ],
    bestPractices: [
      "Use prepared statements by default.",
      "Ensure the database client library handles parameter binding safely.",
      "Run regular vulnerability scans."
    ],
    affectedTechnologies: ["PostgreSQL", "MySQL", "MongoDB", "SQL Server", "Laravel", "Spring Boot", "Django", "Express"],
    tags: ["Database", "Backend", "OWASP #3"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Direct concatenation of user input
const query = "SELECT * FROM users WHERE username = '" + req.query.username + "' AND password = '" + req.query.password + "'";
db.query(query, (err, result) => { ... });`,
        secure: `// SECURE: Using parameterized query placeholders
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
db.query(query, [req.query.username, req.query.password], (err, result) => { ... });`,
        explanation: "Parameterized queries separate the query structure from the data parameters. The SQL engine compiles the query template first, then inserts parameters safely."
      },
      python: {
        vuln: `# VULNERABLE: Using format strings
query = "SELECT * FROM products WHERE name = '{}'".format(user_input)
cursor.execute(query)`,
        secure: `# SECURE: Using database parameter placeholders
query = "SELECT * FROM products WHERE name = %s"
cursor.execute(query, (user_input,))`,
        explanation: "Using `%s` placeholders with a tuple forces the driver to escape and bind parameter inputs securely."
      }
    },
    frameworks: {
      express: `// Express/Node with pg client
db.query('SELECT * FROM users WHERE id = $1', [userId]);`,
      django: `# Django ORM prevents SQLi by default
users = User.objects.filter(username=request.GET.get('username'))`,
      flask: `# Flask with SQL Alchemy
user = User.query.filter_by(username=user_input).first()`
    }
  },
  {
    id: "xss",
    name: "Cross-Site Scripting (XSS)",
    category: "Injection",
    severity: "High",
    difficulty: "Beginner",
    owasp: "A03:2021-Injection",
    description: "XSS allows attackers to inject malicious scripts into web pages viewed by other users, leading to session theft, site defacement, or malware delivery.",
    simpleExplanation: "Cross-Site Scripting is when an attacker puts an evil script into a website, and the website shows it to other users. Their browsers run the script thinking the website sent it safely.",
    attackExplanation: "XSS occurs in three forms: Stored (stored in DB and rendered), Reflected (reflected in HTTP response from input), and DOM-based (client-side JS processes unsafe source). Attacks trigger scripts using `<script>` tags or HTML attributes.",
    impactAnalysis: "Session hijacking via cookies, credential harvesting, redirection to phishing sites, and keylogging.",
    detectionMethods: [
      "Auditing JavaScript rendering code.",
      "Setting strict Content Security Policy (CSP) headers.",
      "Fuzzing input fields with basic XSS vectors like <script>alert(1)</script>."
    ],
    preventionSummary: "Escape context-specific output (HTML, Javascript, Attribute) and enforce a strict CSP.",
    preventionTechniques: [
      "HTML entity encoding: Convert characters like <, >, &, ' to safe entities.",
      "HTTPOnly cookie flag: Prevents scripts from reading session cookies.",
      "CSP: Enforce rules specifying where scripts can be loaded from."
    ],
    bestPractices: [
      "Use modern frameworks (React, Angular) that auto-escape strings.",
      "Never render raw HTML from user inputs unless explicitly sanitized.",
      "Sanitize using DOMPurify before inserting dynamic content."
    ],
    affectedTechnologies: ["React", "Next.js", "Angular", "Vue", "Express", "Django", "Flask", "Laravel"],
    tags: ["Frontend", "Client-Side", "OWASP #3"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Directly setting innerHTML with user input
document.getElementById('welcome').innerHTML = 'Hello ' + username;`,
        secure: `// SECURE: Using textContent to prevent script execution
document.getElementById('welcome').textContent = 'Hello ' + username;`,
        explanation: "textContent tells the browser to parse the value strictly as plain text, rendering script tags harmlessly as character text."
      }
    },
    frameworks: {
      react: `// React securely escapes content by default
const Welcome = ({ name }) => <h1>Hello {name}</h1>;`,
      nextjs: `// Safe dynamic rendering
export default function Page({ data }) {
  return <div>{data.userProvidedString}</div>
}`
    }
  },
  {
    id: "nosqli",
    name: "NoSQL Injection",
    category: "Injection",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A03:2021-Injection",
    description: "NoSQL Injection occurs when query parameters are passed directly to database engines like MongoDB as objects, letting attackers bypass credentials or extract records.",
    simpleExplanation: "NoSQL Injection happens when databases like MongoDB are tricked using search filters. An attacker can send an operator like {$ne: ''} (not equal to empty) to bypass logins.",
    attackExplanation: "In NoSQL (e.g. MongoDB), query parameters are often JSON objects. If an attacker inputs query objects instead of strings (like `{\"username\": {\"$ne\": \"\"}}`), the engine interprets this operator.",
    impactAnalysis: "Authentication bypass, extraction of entire collections, privilege escalation.",
    detectionMethods: [
      "Code analysis searching for raw object assignments from request inputs.",
      "Input typing validation checks (ensuring inputs are strictly strings)."
    ],
    preventionSummary: "Cast inputs to strings or use schema-based tools like Mongoose. Avoid raw object queries.",
    preventionTechniques: [
      "Input casting: Enforce input values to be string types.",
      "Use MongoDB sanitizers or Mongoose schemas.",
      "Avoid using $where operators."
    ],
    bestPractices: [
      "Validate query structure.",
      "Never pass req.body or req.query directly to DB functions."
    ],
    affectedTechnologies: ["MongoDB", "Express", "Next.js"],
    tags: ["Database", "NoSQL", "JSON"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Direct body queries
db.collection('users').find({ username: req.body.username });`,
        secure: `// SECURE: Enforcing input parameters are strings
db.collection('users').find({ username: String(req.body.username) });`,
        explanation: "By casting variables using String(), nested object parameters like {$ne: ''} are rendered harmless."
      }
    },
    frameworks: {
      express: `// Express with mongoose validation schema
const userSchema = new mongoose.Schema({ username: { type: String, required: true } });`
    }
  },
  {
    id: "ssrf",
    name: "Server-Side Request Forgery (SSRF)",
    category: "Security Misconfiguration",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A10:2021-Server-Side Request Forgery",
    description: "SSRF vulnerabilities let attackers abuse a server to make arbitrary HTTP requests to internal networks, cloud metadata engines, or third-party servers.",
    simpleExplanation: "SSRF is when you tell a server to load an image or webpage, and the server fetches it from a private address that only the server can access (like internal keys or local files).",
    attackExplanation: "An application accepts a user-provided URL parameter and fetches data from it. Attackers can input internal IP addresses (like `http://127.0.0.1:8500`) or cloud metadata endpoints (like `http://169.254.169.254/latest/meta-data/`).",
    impactAnalysis: "Accessing internal admin dashboards, stealing database credentials from cloud metadata services, port scanning internal systems.",
    detectionMethods: [
      "Static review of server networking/request client wrappers.",
      "Black-box tests pointing request features to localhost/internal IPs."
    ],
    preventionSummary: "Whitelist allowed domains, block internal IP spaces, and never call untrusted URLs directly from the server.",
    preventionTechniques: [
      "Whitelisting: Only connect to specified api domains.",
      "Network isolation: Block server access to metadata IPs.",
      "Validate address resolution: Ensure DNS does not resolve to private addresses."
    ],
    bestPractices: [
      "Use isolated microservices for fetching remote files.",
      "Disable HTTP redirects."
    ],
    affectedTechnologies: ["Express", "Flask", "Laravel", "Spring Boot", "Next.js", "Django"],
    tags: ["Network", "Cloud", "OWASP #10"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Directly fetching user URL
const response = await axios.get(req.query.url);`,
        secure: `// SECURE: Validating target against a strict domain whitelist
const whitelist = ["images.mysite.com"];
const targetUrl = new URL(req.query.url);
if (whitelist.includes(targetUrl.hostname)) {
  const response = await axios.get(targetUrl.toString());
}`,
        explanation: "Whitelisting hostnames prevents attackers from pointing fetching mechanisms to local endpoints or cloud configuration APIs."
      }
    },
    frameworks: {
      django: `# Secure URL resolution
from urllib.parse import urlparse
allowed_hosts = ['trusted-api.com']
def safe_fetch(request):
    url = request.GET.get('url')
    parsed = urlparse(url)
    if parsed.hostname in allowed_hosts:
        response = requests.get(url)`
    }
  },
  {
    id: "csrf",
    name: "Cross-Site Request Forgery (CSRF)",
    category: "Broken Access Control",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A01:2021-Broken Access Control",
    description: "CSRF tricks a victim's authenticated browser into executing unwanted actions (such as password changes or bank transfers) on a trusted web application.",
    simpleExplanation: "CSRF happens when an evil site forces your browser to send a command to a bank site where you are logged in. The bank site runs the command thinking you clicked it.",
    attackExplanation: "Browsers automatically send session cookies on cross-origin requests. An attacker builds an exploit form on an evil site pointing to the victim site. When the logged-in user visits, the form submits and executes with their credentials.",
    impactAnalysis: "Account modification, password changes, state changes, unauthorized data actions.",
    detectionMethods: [
      "Checking forms for security token verification.",
      "Reviewing cookie SameSite attributes."
    ],
    preventionSummary: "Implement unique CSRF tokens per session, or enforce SameSite=Strict cookies.",
    preventionTechniques: [
      "CSRF Tokens: Unique random tokens checked on state-changing requests.",
      "SameSite Cookies: Block sending cookies on cross-origin links."
    ],
    bestPractices: [
      "Use SameSite=Strict for session cookies.",
      "Avoid GET requests for state changes."
    ],
    affectedTechnologies: ["Express", "Django", "Flask", "Laravel", "Spring Boot", "ASP.NET"],
    tags: ["Cookies", "Sessions", "OWASP #1"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Direct POST execution without session token validation
app.post('/transfer', (req, res) => { transferFunds(req.body.to); });`,
        secure: `// SECURE: Enforcing CSRF token validation
const csurf = require('csurf');
app.post('/transfer', csurf({ cookie: true }), (req, res) => { transferFunds(req.body.to); });`,
        explanation: "CSRF protection requires a random, non-predictable token that must accompany POST payloads and match the active session."
      }
    },
    frameworks: {
      django: `# Django verifies CSRF tokens by default on POST views.
# Just include {% csrf_token %} in HTML templates.`
    }
  },
  {
    id: "cmd_injection",
    name: "Command Injection",
    category: "Injection",
    severity: "Critical",
    difficulty: "Intermediate",
    owasp: "A03:2021-Injection",
    description: "Command injection occurs when user input is passed directly to system shell commands, allowing attackers to execute commands on the host operating system.",
    simpleExplanation: "Command Injection is when an attacker types special characters like ; or | into a field, and the server runs their command line instructions directly on the machine.",
    attackExplanation: "Applications calling shell execution utilities (like `exec()` or `system()`) with unescaped inputs are prone to injection. Attackers add operators to append malicious payload strings.",
    impactAnalysis: "Full server compromise, malware execution, system sabotage, unauthorized file reading.",
    detectionMethods: [
      "Identifying language utilities that run shell commands (exec, spawn, system, popen).",
      "Testing tools to input shell characters in forms."
    ],
    preventionSummary: "Avoid passing inputs to system shells. Use language APIs that execute processes without shell interpretation.",
    preventionTechniques: [
      "Avoid system shell calls.",
      "Whitelist inputs using strict regex pattern checks.",
      "Pass parameters in array forms to execution environments."
    ],
    bestPractices: [
      "Avoid shell execution where possible.",
      "Use built-in language API functions."
    ],
    affectedTechnologies: ["PostgreSQL", "Docker", "Express", "Flask", "Django", "PHP"],
    tags: ["OS", "Shell", "Injection"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Passing concatenated user inputs to exec
exec('ping -c 3 ' + req.query.ip);`,
        secure: `// SECURE: Using execFile with argument arrays to prevent shell parsing
execFile('ping', ['-c', '3', req.query.ip]);`,
        explanation: "execFile passes arguments directly to the process array instead of spawning a command shell, preventing command concatenation."
      }
    },
    frameworks: {
      express: `// Secure child execution in Express
const { spawn } = require('child_process');
const ls = spawn('ls', ['-lh', '/usr']);`
    }
  },
  {
    id: "pathtraversal",
    name: "Path Traversal",
    category: "Broken Access Control",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A01:2021-Broken Access Control",
    description: "Path Traversal (or Directory Traversal) allows attackers to read arbitrary files on the web server by introducing directory escaping sequences like `../`.",
    simpleExplanation: "Path Traversal is when you tell a site to load an image, but the attacker types in `../../../../etc/passwd` to sneak out of the folders and steal private server configuration files.",
    attackExplanation: "Applications loading files dynamically based on parameter strings without checking directories are vulnerable. Attackers use traversal characters to jump levels.",
    impactAnalysis: "Source code, configuration files, secrets, database credentials, and system lists leakage.",
    detectionMethods: [
      "Auditing file system load commands.",
      "Fuzzing file parameters with traversal lists (dot-dot-slash)."
    ],
    preventionSummary: "Whitelist file paths, resolve canonical paths, or store references in databases rather than loading directly.",
    preventionTechniques: [
      "Use path resolution APIs to ensure path is inside base folders.",
      "Use safe file index keys."
    ],
    bestPractices: [
      "Do not take direct filenames as parameters.",
      "Limit file read permissions on the web user account."
    ],
    affectedTechnologies: ["Express", "Flask", "PHP", "Laravel"],
    tags: ["Filesystem", "Directories", "OWASP #1"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Direct file loading
res.sendFile(path.join(__dirname, 'public', req.query.file));`,
        secure: `// SECURE: Resolving and verifying target path location
const targetFile = path.resolve(safeDir, req.query.file);
if (!targetFile.startsWith(safeDir)) { return res.status(403).send("Access Denied"); }
res.sendFile(targetFile);`,
        explanation: "By verifying the resolved canonical path starts with the authorized directory, traversal operations outside are blocked."
      }
    },
    frameworks: {
      django: `# Django securely serves files.`
    }
  },
  {
    id: "fileupload",
    name: "File Upload Vulnerabilities",
    category: "Security Misconfiguration",
    severity: "Critical",
    difficulty: "Advanced",
    owasp: "A05:2021-Security Misconfiguration",
    description: "Allows attackers to upload executable scripts (e.g. PHP, ASPX) onto the web server and execute them, leading to Remote Code Execution.",
    simpleExplanation: "File Upload bug is when a site lets you upload an image but doesn't check if it's really an image. Attackers upload a script file and trigger it to take over the site.",
    attackExplanation: "Web application fails to validate extensions or MIME types of uploads, saving files into web-accessible directories where scripting engines are enabled.",
    impactAnalysis: "Full server compromise via Web Shell execution, defacement, storage abuse.",
    detectionMethods: [
      "Testing file upload features with script files (.php, .html).",
      "Analyzing folders where uploads are saved."
    ],
    preventionSummary: "Store uploads outside the web root, randomize filenames, validate file content type, and disable script execution in upload folders.",
    preventionTechniques: [
      "Disable execution: Block running scripts in uploads folders.",
      "Validate MIME: Verify file signatures (magic numbers).",
      "Whitelist extensions: Allow only safe extensions like .jpg, .png."
    ],
    bestPractices: [
      "Store uploads on separate object servers like AWS S3.",
      "Check file sizes."
    ],
    affectedTechnologies: ["PHP", "Laravel", "Express", "Nginx", "Apache"],
    tags: ["Uploads", "Files", "RCE"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Direct upload saving
file.mv('./uploads/' + file.name);`,
        secure: `// SECURE: Renaming and validating extension
const ext = path.extname(file.name).toLowerCase();
if (allowedExts.includes(ext)) { file.mv('./safe_uploads/' + randomName + ext); }`,
        explanation: "Validating extensions and renaming files prevents execution of uploaded web shells."
      }
    },
    frameworks: {
      laravel: `// Secure Laravel upload configuration
$path = $request->file('avatar')->storeAs('avatars', $userId . '.png');`
    }
  },
  {
    id: "authsec",
    name: "Authentication Security",
    category: "Identification and Authentication Failures",
    severity: "Critical",
    difficulty: "Intermediate",
    owasp: "A07:2021-Identification and Authentication Failures",
    description: "Failure to enforce password policies, rate-limiting on login forms, or safe password reset routes.",
    simpleExplanation: "Authentication failures are when a site makes it easy for attackers to guess passwords by not locking them out after multiple attempts, or by storing passwords in readable text.",
    attackExplanation: "Applications with weak authentication are vulnerable to credential stuffing, brute forcing, and account harvesting. Reset tokens are guessable.",
    impactAnalysis: "Unauthorized account logins, mass account takeover, leak of user data.",
    detectionMethods: [
      "Checking password storage (bcrypt vs md5).",
      "Testing login rate limits."
    ],
    preventionSummary: "Use bcrypt/argon2 hashing, enforce multi-factor authentication (MFA), and implement rate-limiting.",
    preventionTechniques: [
      "Bcrypt: Use strong hashing algorithms.",
      "Rate Limiting: Block IP/accounts after multiple failed logins.",
      "MFA: Require secondary authentication steps."
    ],
    bestPractices: [
      "Use robust auth libraries like Firebase Auth or Auth0.",
      "Enforce complexity rules."
    ],
    affectedTechnologies: ["PostgreSQL", "MySQL", "Redis", "Firebase", "Express", "Laravel"],
    tags: ["Passwords", "Auth", "OWASP #7"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Comparing plain text passwords
if (user.password === req.body.password) { login(); }`,
        secure: `// SECURE: Hashing and comparing using bcrypt
const match = await bcrypt.compare(req.body.password, user.password_hash);
if (match) { login(); }`,
        explanation: "Passwords should never be stored in plain text or reversible formats. Bcrypt applies secure slow-hashing."
      }
    },
    frameworks: {
      django: `# Django uses PBKDF2 secure hashing by default.`
    }
  },
  {
    id: "authorization",
    name: "Authorization Security",
    category: "Broken Access Control",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A01:2021-Broken Access Control",
    description: "Enforcing horizontal and vertical access boundaries to prevent users from accessing actions or objects belonging to others.",
    simpleExplanation: "Authorization is like a bouncer checking your invitation list. Just because you logged in doesn't mean you should be allowed to view someone else's admin page or invoices.",
    attackExplanation: "Missing role checks on backend endpoints allow low-privileged accounts or anonymous users to trigger administrative operations or read private database fields.",
    impactAnalysis: "Privilege escalation, unauthorized data modifications, full admin page compromise.",
    detectionMethods: ["Inspecting server router functions for authentication/authorization middleware."],
    preventionSummary: "Use Role-Based Access Control (RBAC) and verify ownership of objects prior to processing database commands.",
    preventionTechniques: ["RBAC validation on every request.", "Direct ownership mapping database validations."],
    bestPractices: ["Default deny policy.", "Log all unauthorized access attempts."],
    affectedTechnologies: ["Express", "Django", "Spring Boot", "Laravel"],
    tags: ["Authorization", "Access Control", "OWASP #1"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: No role check
app.delete('/api/users/:id', (req, res) => { deleteUser(req.params.id); });`,
        secure: `// SECURE: Role verification middleware
app.delete('/api/users/:id', checkRole('admin'), (req, res) => { deleteUser(req.params.id); });`,
        explanation: "Adding a role check middleware ensures that only users with the administrative role can proceed."
      }
    },
    frameworks: {
      django: `@permission_required('admin.delete_user')`
    }
  },
  {
    id: "session_mgmt",
    name: "Session Management",
    category: "Identification and Authentication Failures",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A07:2021-Identification and Authentication Failures",
    description: "Securing cookies and tokens that store user sessions from being hijacked, leaked, or forged.",
    simpleExplanation: "Session management is how a site remembers you are logged in. If these sessions are not protected with security settings, someone else can copy them and login as you.",
    attackExplanation: "Failing to set flags like HttpOnly, Secure, and SameSite on session cookies allows client-side scripts to read them, making the application vulnerable to XSS-based hijacking.",
    impactAnalysis: "Account hijacking, identity theft, session reuse.",
    detectionMethods: ["Reviewing HTTP response headers for Set-Cookie flags."],
    preventionSummary: "Set HttpOnly, Secure, and SameSite=Strict on all cookies, and expire sessions on the server.",
    preventionTechniques: ["Enforcing HttpOnly and Secure flags.", "Short-duration session timeouts."],
    bestPractices: ["Always invalidate sessions on logout.", "Regenerate session IDs after login."],
    affectedTechnologies: ["Express", "Flask", "Laravel", "React", "Next.js"],
    tags: ["Cookies", "Session Management", "Security Flags"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Storing sessions in plain, script-accessible cookies
res.cookie('sessionId', id);`,
        secure: `// SECURE: Using HttpOnly, Secure, and SameSite flags
res.cookie('sessionId', id, { httpOnly: true, secure: true, sameSite: 'strict' });`,
        explanation: "HttpOnly prevents frontend JS scripts from reading the cookie, Secure ensures it's only sent over HTTPS, and SameSite blocks cross-site leakage."
      }
    },
    frameworks: {
      express: `// Express Session Configuration
app.use(session({ cookie: { httpOnly: true, secure: true, sameSite: 'strict' } }));`
    }
  },
  {
    id: "jwtsec",
    name: "JWT Security",
    category: "Identification and Authentication Failures",
    severity: "High",
    difficulty: "Advanced",
    owasp: "A07:2021-Identification and Authentication Failures",
    description: "Insecure validation of JSON Web Tokens (e.g. accepting the 'none' algorithm, weak signing keys, or missing expirations).",
    simpleExplanation: "JWT is a key card details badge. If the server doesn't check the badge signature correctly, attackers can write their own badge details and become administrators.",
    attackExplanation: "JWT libraries configured incorrectly might allow attackers to change the signing algorithm header to `none`, bypassing signature validation.",
    impactAnalysis: "Full session hijacking, access bypass, administrator impersonation.",
    detectionMethods: ["Reviewing JWT verification library settings.", "Checking signature verification methods in endpoints."],
    preventionSummary: "Never allow 'none' algorithm, use strong secrets, and verify signatures and expirations on every request.",
    preventionTechniques: [
      "Explicit verification: Call verify() with specific keys.",
      "Reject none: Enforce algorithm lists.",
      "Short expiry: Keep expirations brief."
    ],
    bestPractices: ["Rotate keys.", "Keep tokens in HTTPOnly cookies."],
    affectedTechnologies: ["Express", "Next.js", "Django", "Spring Boot"],
    tags: ["Tokens", "JWT", "Cryptography"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Decoding token without verifying signature
const user = jwt.decode(req.headers.token);`,
        secure: `// SECURE: Verifying token with signature check and algorithm enforcement
const decoded = jwt.verify(req.headers.token, process.env.JWT_SECRET, { algorithms: ['HS256'] });`,
        explanation: "Decoding a token only reads the payload. Verification checks the signature to ensure contents were not altered."
      }
    },
    frameworks: {
      express: `// Secure Express Middleware
const jwt = require('express-jwt');
app.use(jwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }));`
    }
  },
  {
    id: "apisec",
    name: "API Security",
    category: "Broken Access Control",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A01:2021-Broken Access Control",
    description: "Securing API endpoints from mass assignment, BOLA/IDOR, rate-limiting failures, and information exposure.",
    simpleExplanation: "API Security is like lockboxes for your app. If you don't restrict who can query them, attackers can download your entire database record by record.",
    attackExplanation: "Failing to implement rate limits on public APIs allows scraping, while missing validation of user parameters leads to Broken Object Level Authorization.",
    impactAnalysis: "Data scraping, server resource exhaustion, data leaks.",
    detectionMethods: ["Checking for API gateway policies, rate limiters, and endpoint schemas."],
    preventionSummary: "Implement strict JSON schemas, enforce client rate limits, and use API tokens.",
    preventionTechniques: ["Rate limiting middleware.", "Input validation with AJV or Zod."],
    bestPractices: ["Use standard HTTP status codes.", "Never expose internal stack traces."],
    affectedTechnologies: ["Express", "Django", "Flask", "PostgreSQL"],
    tags: ["API", "Endpoints", "JSON"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Unlimited requests to public endpoint
app.get('/api/data', (req, res) => { res.json(db.getAll()); });`,
        secure: `// SECURE: Applying rate limiting and data filtering
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.get('/api/data', limiter, (req, res) => { res.json(db.getSafeData()); });`,
        explanation: "Rate limiting prevents automated bots from abusing backend execution pipelines."
      }
    },
    frameworks: {
      express: `// Zod schema validation
const UserInputSchema = z.object({ email: z.string().email() });`
    }
  },
  {
    id: "cors_sec",
    name: "CORS Security",
    category: "Security Misconfiguration",
    severity: "Medium",
    difficulty: "Intermediate",
    owasp: "A05:2021-Security Misconfiguration",
    description: "Preventing cross-origin resource sharing misconfigurations such as wildcards with credentials.",
    simpleExplanation: "CORS controls which outside sites can read data from your server. If set to a wildcard, any site can steal user info using their active session.",
    attackExplanation: "Setting Access-Control-Allow-Origin to '*' while permitting credentials enables attackers on any domain to query the backend from the victim's session.",
    impactAnalysis: "Sensitive data theft, session abuse from malicious external websites.",
    detectionMethods: ["Scanning response headers for Access-Control-Allow-Origin."],
    preventionSummary: "Explicitly list allowed origin domains. Never use wildcards with Access-Control-Allow-Credentials.",
    preventionTechniques: ["Strict allowed origin lists.", "Set CORS headers dynamically based on origin verification."],
    bestPractices: ["Do not allow arbitrary subdomains.", "Audit CORS configurations during reviews."],
    affectedTechnologies: ["Express", "Django", "Nginx", "Apache"],
    tags: ["CORS", "Headers", "Security Misconfiguration"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Allowing all origins with credentials
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});`,
        secure: `// SECURE: Restricting origins to trusted domains
const allowedOrigins = ['https://my-app.com'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
});`,
        explanation: "Explicit validation of the incoming request origin prevents malicious domains from obtaining credentials."
      }
    },
    frameworks: {
      express: `const cors = require('cors'); app.use(cors({ origin: 'https://my-app.com' }));`
    }
  },
  {
    id: "security_headers",
    name: "Security Headers",
    category: "Security Misconfiguration",
    severity: "Medium",
    difficulty: "Beginner",
    owasp: "A05:2021-Security Misconfiguration",
    description: "Configuring response headers to guide browsers to enable secure isolation protections.",
    simpleExplanation: "Security headers are standard browser protection switches. Turning them on stops clickjacking, MIME-sniffing, and scripts from executing on unauthorized sites.",
    attackExplanation: "Lack of security headers leaves visitors vulnerable to clickjacking, cross-site leaks, and drive-by scripts.",
    impactAnalysis: "Client-side exploits, information leakage, content spoofing.",
    detectionMethods: ["Using tools like securityheaders.com or cURL to audit header properties."],
    preventionSummary: "Set HSTS, CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers.",
    preventionTechniques: ["Use Helmet package in Node apps.", "Configure proxy rules in Nginx/Apache."],
    bestPractices: ["Set a strict Content Security Policy (CSP).", "Enable HSTS with subdomains option."],
    affectedTechnologies: ["Nginx", "Express", "Apache", "Next.js"],
    tags: ["Headers", "Browser Security", "OWASP #5"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Serving responses without security headers
app.get('/', (req, res) => { res.send("Welcome"); });`,
        secure: `// SECURE: Enforcing standard security headers using Helmet
const helmet = require('helmet');
app.use(helmet());`,
        explanation: "Helmet sets sensible security headers, including Content-Security-Policy and X-Frame-Options."
      }
    },
    frameworks: {
      nextjs: `// next.config.js headers configuration
module.exports = {
  async headers() {
    return [
      { source: '/(.*)', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] }
    ]
  }
}`
    }
  },
  {
    id: "clickjacking",
    name: "Clickjacking",
    category: "Broken Access Control",
    severity: "Medium",
    difficulty: "Beginner",
    owasp: "A01:2021-Broken Access Control",
    description: "Preventing attackers from embedding your website inside invisible frames, tricking users into clicking buttons they didn't intend to.",
    simpleExplanation: "Clickjacking is like placing an invisible button over a clean game. You think you are playing, but you are actually clicking a hidden 'Delete Account' button on another site.",
    attackExplanation: "If an app permits framing, attackers embed it in an `iframe` with `opacity: 0` on top of a decoy page.",
    impactAnalysis: "Unauthorized state changes, page actions, account mutations.",
    detectionMethods: ["Verifying frame loading permissions on pages."],
    preventionSummary: "Set X-Frame-Options to DENY or SAMEORIGIN, or use CSP frame-ancestors directive.",
    preventionTechniques: ["X-Frame-Options headers.", "CSP frame-ancestors 'self';"],
    bestPractices: ["Enforce frame blockers.", "Check CSS layering safety."],
    affectedTechnologies: ["Express", "Nginx", "Apache", "Next.js"],
    tags: ["UI Safety", "Frames", "Browser Security"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Webpage can be loaded in any iframe
app.use((req, res, next) => { next(); });`,
        secure: `// SECURE: Denying iframe loads from external hosts
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
  next();
});`,
        explanation: "These headers instruct the browser not to render the site inside iframe elements owned by other origins."
      }
    },
    frameworks: {
      nginx: `add_header X-Frame-Options "DENY" always;`
    }
  },
  {
    id: "open_redirect",
    name: "Open Redirect",
    category: "Broken Access Control",
    severity: "Medium",
    difficulty: "Beginner",
    owasp: "A01:2021-Broken Access Control",
    description: "Preventing applications from redirecting users to arbitrary external URLs from parameters.",
    simpleExplanation: "Open Redirect happens when a site redirects you to a page based on a link parameter. Attackers edit this parameter to redirect you to an evil copy to steal passwords.",
    attackExplanation: "Accepting a user-controlled redirect URL parameters (e.g. `?next=http://evil.com`) without validation.",
    impactAnalysis: "Phishing delivery vector, security control evasion.",
    detectionMethods: ["Inspecting redirection functions for unvalidated URL inputs."],
    preventionSummary: "Only redirect to relative URLs, or check input against a domain whitelist.",
    preventionTechniques: ["Check if URLs start with '/' (local paths).", "Use strict domain validation."],
    bestPractices: ["Avoid parameters for full URLs.", "Prompt users before departing current domain."],
    affectedTechnologies: ["Express", "Laravel", "Django", "PHP"],
    tags: ["Redirection", "Phishing", "OWASP #1"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Direct redirecting to user URL
res.redirect(req.query.url);`,
        secure: `// SECURE: Validating redirection target is local
const target = req.query.url;
if (target.startsWith('/') && !target.startsWith('//')) {
  res.redirect(target);
} else {
  res.redirect('/');
}`,
        explanation: "Ensuring redirect URLs start with a single slash binds target paths to local routes."
      }
    },
    frameworks: {
      django: `# Django provides is_safe_url check functions`
    }
  },
  {
    id: "deserialization",
    name: "Deserialization Attacks",
    category: "Software and Data Integrity Failures",
    severity: "Critical",
    difficulty: "Advanced",
    owasp: "A08:2021-Software and Data Integrity Failures",
    description: "Preventing attackers from exploiting application parsers that process serialized payloads (such as JSON, Java objects, or Python pickles).",
    simpleExplanation: "Deserialization is converting saved data back into active program variables. If attackers can save malicious scripts inside the data, they can run commands when the program loads it.",
    attackExplanation: "Applications loading custom serialized objects allow payload execution when constructing class variables.",
    impactAnalysis: "Remote Code Execution, denial of service, full application host takeover.",
    detectionMethods: ["Searching for dangerous APIs like 'pickle.loads()' or 'unserialize()' in code."],
    preventionSummary: "Avoid serializing complex code structures. Use text-only schemas like JSON with structural validation.",
    preventionTechniques: ["Never use Python pickle on user input.", "Disable object references on parsers."],
    bestPractices: ["Use cryptography signatures if serialized objects must be loaded.", "Use pure JSON serialization."],
    affectedTechnologies: ["Python", "PHP", "Java", "Node.js"],
    tags: ["Serialization", "Objects", "OWASP #8"],
    languages: {
      python: {
        vuln: `# VULNERABLE: Loading pickled data directly
import pickle
data = pickle.loads(user_input_bytes)`,
        secure: `# SECURE: Using safe formats like json
import json
data = json.loads(user_input_string)`,
        explanation: "json.loads only reads plain data models (strings, numbers) and does not call arbitrary constructors."
      }
    },
    frameworks: {
      django: `# Always use JSON fields instead of pickle serializations.`
    }
  },
  {
    id: "race_conditions",
    name: "Race Conditions",
    category: "Concurrency Vulnerabilities",
    severity: "High",
    difficulty: "Advanced",
    owasp: "A01:2021-Broken Access Control",
    description: "Avoiding state conflicts in multi-threaded environments, where concurrent requests can bypass validation limits.",
    simpleExplanation: "Race condition is when an application processes multiple things so quickly that it loses count. For example, withdrawing money twice at the exact same millisecond can let you withdraw more than you have.",
    attackExplanation: "An application checks database state (e.g. balance) then updates it. By running requests concurrently, multiple checks complete before any updates apply.",
    impactAnalysis: "Financial theft, duplicate voucher redemption, security check bypass.",
    detectionMethods: ["Concurrency testing, code review of check-then-write code flows."],
    preventionSummary: "Use database transaction locks (e.g., SELECT FOR UPDATE) or atomic operations.",
    preventionTechniques: ["Atomic SQL queries.", "Distributed mutex locks in Redis."],
    bestPractices: ["Use database constraints.", "Keep transaction scopes small."],
    affectedTechnologies: ["PostgreSQL", "MySQL", "Redis", "Spring Boot", "Go"],
    tags: ["Concurrency", "Transactions", "Database Locks"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Fetch check and save separated
const user = await db.getUser(id);
if (user.points >= cost) {
  await db.updatePoints(id, user.points - cost);
}`,
        secure: `// SECURE: Performing update atomically or with database checks
await db.query("UPDATE users SET points = points - ? WHERE id = ? AND points >= ?", [cost, id, cost]);`,
        explanation: "Single SQL operations execute atomically, preventing multiple concurrent updates from exceeding boundaries."
      }
    },
    frameworks: {
      django: `# Use F expressions for database level atomic updates`
    }
  },
  {
    id: "secrets_mgmt",
    name: "Secrets Management",
    category: "Identification and Authentication Failures",
    severity: "Critical",
    difficulty: "Beginner",
    owasp: "A07:2021-Identification and Authentication Failures",
    description: "Preventing hardcoding of passwords, API keys, and certificates in source repositories.",
    simpleExplanation: "Secrets management is storing your passwords and API keys in secure lockers rather than writing them directly inside your code, where everyone on GitHub can see them.",
    attackExplanation: "Hardcoded credentials in repositories can be extracted by scanning git histories.",
    impactAnalysis: "Full third-party service compromises, database breaches.",
    detectionMethods: ["Using secret scanners (TruffleHog, GitGuardian) on code repositories."],
    preventionSummary: "Load secrets through environment variables or secure credential managers (Vault).",
    preventionTechniques: ["Environment variable configurations.", "Secrets managers (AWS Secrets Manager, HashiCorp Vault)."],
    bestPractices: ["Add config files to gitignore.", "Rotate secrets regularly."],
    affectedTechnologies: ["Docker", "Kubernetes", "PostgreSQL", "MySQL"],
    tags: ["Secrets", "Git", "Security Best Practices"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Hardcoding API key
const client = new Client({ apiKey: 'sk_live_51M2N8H9...' });`,
        secure: `// SECURE: Loading secret from environment variables
const client = new Client({ apiKey: process.env.API_KEY });`,
        explanation: "Loading secrets from the execution environment keeps sensitive assets out of source repositories."
      }
    },
    frameworks: {
      express: `require('dotenv').config(); // Load secrets from .env file`
    }
  },
  {
    id: "password_storage",
    name: "Password Storage",
    category: "Identification and Authentication Failures",
    severity: "Critical",
    difficulty: "Beginner",
    owasp: "A07:2021-Identification and Authentication Failures",
    description: "Encrypting credentials stored in databases using secure key-derivation hashing algorithms.",
    simpleExplanation: "Password storage is converting passwords into irreversible gibberish (hashes) before saving. If an attacker steals the database, they still won't know the actual passwords.",
    attackExplanation: "Storing passwords with weak hashes (MD5, SHA1) allows attackers to crack them using precomputed tables (rainbow tables).",
    impactAnalysis: "Mass user credential exposure, credential stuffing risks on other platforms.",
    detectionMethods: ["Auditing database schema definitions and hash formats."],
    preventionSummary: "Use Argon2 or Bcrypt with a high work factor.",
    preventionTechniques: ["Salt passwords dynamically to block precomputed cracking.", "Enforce slow hashing configurations."],
    bestPractices: ["Use work factor defaults.", "Never write custom hashing formulas."],
    affectedTechnologies: ["MySQL", "PostgreSQL", "Django", "Laravel"],
    tags: ["Cryptography", "Passwords", "Hashing"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Using MD5 hash
const hash = crypto.createHash('md5').update(password).digest('hex');`,
        secure: `// SECURE: Hashing using Argon2
const argon2 = require('argon2');
const hash = await argon2.hash(password);`,
        explanation: "Argon2 is the recommended password hashing standard, offering CPU and memory cost parameters."
      }
    },
    frameworks: {
      laravel: `// Secure password hashing
$hashed = Hash::make($request->password);`
    }
  },
  {
    id: "logging_monitoring",
    name: "Logging & Monitoring",
    category: "Security Logging and Monitoring Failures",
    severity: "Medium",
    difficulty: "Beginner",
    owasp: "A09:2021-Security Logging and Monitoring Failures",
    description: "Recording critical security events to audit files while scrubbing private details.",
    simpleExplanation: "Logging is like security cameras for your application. If someone is trying to guess passwords, logs alert developers before the breach happens.",
    attackExplanation: "Failing to log actions leaves teams blind during attacks, while writing passwords to logs leaks credentials to observers.",
    impactAnalysis: "Unnoticed breaches, credential exposure in log outputs.",
    detectionMethods: ["Reviewing logging scopes and file export patterns."],
    preventionSummary: "Log auth events, restrict access to files, and filter private parameters.",
    preventionTechniques: ["Write audit trails.", "Filter sensitive keys like 'password' from logs."],
    bestPractices: ["Centralize log servers.", "Alert on abnormal query errors."],
    affectedTechnologies: ["Express", "Django", "Flask", "Spring Boot"],
    tags: ["Logging", "Monitoring", "Auditing"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Logging plain credentials
logger.info("Login attempt: " + JSON.stringify(req.body));`,
        secure: `// SECURE: Scrubbing secrets before logging
const { username } = req.body;
logger.info({ event: 'auth_attempt', user: username });`,
        explanation: "Selectively choosing what to log keeps private parameters out of log files."
      }
    },
    frameworks: {
      django: `# Configure secure logging output settings in settings.py`
    }
  },
  {
    id: "error_handling",
    name: "Secure Error Handling",
    category: "Security Misconfiguration",
    severity: "Medium",
    difficulty: "Beginner",
    owasp: "A05:2021-Security Misconfiguration",
    description: "Preventing backend stack traces, database structure details, and file routes from printing to client browsers.",
    simpleExplanation: "Secure error handling is telling the user 'Something went wrong' instead of printing a giant block of technical code when an error occurs. That technical code shows attackers exactly how to hack you.",
    attackExplanation: "Exposing stack traces or SQL error syntax directly to users gives attackers precise information about the backend architecture.",
    impactAnalysis: "Architectural detail disclosure, path leaks, vulnerability confirmation.",
    detectionMethods: ["Testing endpoint responses with invalid parameters to force crashes."],
    preventionSummary: "Implement catch-all middleware, return generic messages to clients, and log details privately.",
    preventionTechniques: ["Catch exceptions cleanly.", "Use generic errors on interfaces."],
    bestPractices: ["Disable debug modes in production.", "Return safe status codes."],
    affectedTechnologies: ["Express", "Django", "Flask", "Spring Boot"],
    tags: ["Errors", "Information Leakage", "OWASP #5"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Returning raw error trace to caller
app.get('/data', (req, res) => {
  db.query(query, (err, rows) => {
    if (err) return res.status(500).send(err.stack);
  });
});`,
        secure: `// SECURE: Returning generic message and logging details
app.get('/data', (req, res) => {
  db.query(query, (err, rows) => {
    if (err) {
      logger.error(err);
      return res.status(500).send("Internal Server Error");
    }
  });
});`,
        explanation: "Hiding internal traces prevents attackers from understanding query mechanics or directory layouts."
      }
    },
    frameworks: {
      django: `# Ensure DEBUG = False in production settings.py`
    }
  },
  {
    id: "cloud_security",
    name: "Cloud Security Basics",
    category: "Security Misconfiguration",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A05:2021-Security Misconfiguration",
    description: "Securing resources deployed on AWS/GCP (such as S3 buckets) to block unauthorized anonymous operations.",
    simpleExplanation: "Cloud security is securing file storage buckets and virtual servers. If a storage bucket is marked public, anyone online can search and download all its documents.",
    attackExplanation: "Leaving cloud buckets (S3) open to the internet allows automated bots to scan and extract private document files.",
    impactAnalysis: "Sensitive data exposure, financial storage bills.",
    detectionMethods: ["Running access checkers on cloud assets."],
    preventionSummary: "Disable public access on buckets, use IAM roles, and sign temporary URLs.",
    preventionTechniques: ["Enable private bucket locks.", "Use IAM roles on containers."],
    bestPractices: ["Audit cloud policies periodically.", "Use signed links for private files."],
    affectedTechnologies: ["Docker", "Kubernetes", "Express", "Laravel"],
    tags: ["Cloud", "S3", "IAM"],
    languages: {
      javascript: {
        vuln: `// VULNERABLE: Direct access link to open storage bucket
const url = "https://mybucket.s3.amazonaws.com/private_invoice.pdf";`,
        secure: `// SECURE: Generating a short-lived presigned download URL
const url = s3.getSignedUrl('getObject', { Bucket: 'mybucket', Key: 'private_invoice.pdf', Expires: 300 });`,
        explanation: "Presigned URLs ensure users must authenticate with the app before loading the private object."
      }
    },
    frameworks: {
      laravel: `// Generating secure cloud URL
$url = Storage::disk('s3')->temporaryUrl('file.jpg', now()->addMinutes(5));`
    }
  },
  {
    id: "container_security",
    name: "Container Security Basics",
    category: "Security Misconfiguration",
    severity: "High",
    difficulty: "Intermediate",
    owasp: "A05:2021-Security Misconfiguration",
    description: "Configuring container templates (Dockerfiles) to restrict execution parameters and avoid running commands as root.",
    simpleExplanation: "Container security is packing your application inside a safe box (Docker). If you configure the box incorrectly, a hacker who breaches your app can take control of the host computer hosting the box.",
    attackExplanation: "Running Docker commands as the ROOT user inside containers allows attackers who exploit vulnerabilities to write host operating system settings.",
    impactAnalysis: "Host container breakout, full server takeover.",
    detectionMethods: ["Inspecting Dockerfiles for the USER directive."],
    preventionSummary: "Set non-root user execution, pin library versions, and scan images for flaws.",
    preventionTechniques: ["USER appuser in Dockerfile.", "Read-only container filesystem mountings."],
    bestPractices: ["Scan images before deployment.", "Use minimal base images (Alpine)."],
    affectedTechnologies: ["Docker", "Kubernetes"],
    tags: ["Containers", "Docker", "DevOps"],
    languages: {
      javascript: {
        vuln: `# VULNERABLE: Running container as default root user
FROM node:18
WORKDIR /app
COPY . .
CMD ["node", "index.js"]`,
        secure: `# SECURE: Creating and switching to a restricted user
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["node", "index.js"]`,
        explanation: "Switching to USER appuser blocks processes from running administrative commands on the host filesystem."
      }
    },
    frameworks: {
      express: `# Keep Docker dependencies pinned and scan with Trivy`
    }
  }
];
