import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, AlertCircle, MinusCircle, Sparkles } from "lucide-react";
import Lottie from "lottie-react";
import "../styles/scan-progress.css";
import nmapIcon from "../assets/icons/nmap.json";
import niktoIcon from "../assets/icons/nikto.json";
import sslIcon from "../assets/icons/ssl.json";
import sqlIcon from "../assets/icons/sql.json";
import wapatiIcon from "../assets/icons/wapiti.json";
import gobusterIcon from "../assets/icons/gobuster.json";
import nucleiIcon from "../assets/icons/nuclie.json";
import dnsIcon from "../assets/icons/dns-recon.json";
import whoisIcon from "../assets/icons/whois.json";
import rateLimitIcon from "../assets/icons/rate-limit.json";
import aiSearchingIcon from "../assets/icons/aiSearching.json";
import xssIcon from "../assets/icons/Shield.json";

interface AutoScanProgressProps {
  status: string;
  percent: number;
  batchScans?: Array<{ createdAt?: string; status?: string; scanType?: string; tool?: string }>;
  scanPlan?: { run?: string[]; skip?: string[] } | null;
}

export const AutoScanProgress = ({ status, percent, batchScans = [], scanPlan }: AutoScanProgressProps) => {
  const normalizeTool = (value: string) => {
    const key = String(value || "").toLowerCase();
    if (key === "sslscan") return "ssl";
    if (key === "all") return "auto";
    return key;
  };

  const toolLottieMap: Record<string, unknown> = {
    nmap: nmapIcon,
    nuclei: nucleiIcon,
    nikto: niktoIcon,
    ssl: sslIcon,
    sqlmap: sqlIcon,
    wapiti: wapatiIcon,
    gobuster: gobusterIcon,
    ffuf: aiSearchingIcon,
    ratelimit: rateLimitIcon,
    dns: dnsIcon,
    whois: whoisIcon,
    xss: xssIcon,
  };

  const TOOL_LABELS: Record<string, string> = {
    platform: "Platform Detection",
    nmap: "Network Reconnaissance (Nmap)",
    nuclei: "Template Scan (Nuclei)",
    nikto: "Web Server Audit (Nikto)",
    ssl: "Encryption Analysis (SSLScan)",
    sqlmap: "Injection Testing (SQLMap)",
    wapiti: "Web App Audit (Wapiti)",
    gobuster: "Directory Discovery (Gobuster)",
    ffuf: "Fuzzing & Enumeration (FFUF)",
    ratelimit: "Rate Limiter Check",
    dns: "DNS Reconnaissance",
    whois: "WHOIS Lookup",
    xss: "XSS & CSRF (Injection)",
    auto: "Auto Scan",
  };

  const TOOL_DETAILS: Record<string, string> = {
    platform: "Identify stack, hosting, and framework signals before the scan branches.",
    nmap: "Map live ports and services to determine the target surface.",
    nuclei: "Run known exposure and CVE templates against the discovered stack.",
    nikto: "Check for web server misconfigurations and common file leaks.",
    ssl: "Audit TLS versions, certificate health, and cipher strength.",
    sqlmap: "Probe input points only when parameters or forms are detected.",
    wapiti: "Crawl the application and test for XSS, CSRF, and input flaws.",
    gobuster: "Brute-force hidden directories and files with a curated wordlist.",
    ffuf: "Fuzz parameters and routes to reveal hidden application behavior.",
    ratelimit: "Verify request throttling and API rate controls.",
    dns: "Inspect DNS records and domain infrastructure.",
    whois: "Collect registration and ownership metadata.",
    xss: "Crawl and test input forms for Reflected XSS and CSRF token flaws.",
  };

  const scansByType = new Map<
    string,
    { createdAt?: string; status?: string; scanType?: string; tool?: string }
  >();
  const sortedScans = [...batchScans].sort((a, b) => {
    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    return aTime - bTime;
  });
  const hasRunningScan = sortedScans.some((scan) => String(scan?.status || "") === "running");
  for (const scan of sortedScans) {
    const key = normalizeTool(scan?.scanType || scan?.tool || "");
    if (key && !scansByType.has(key)) scansByType.set(key, scan);
  }

  const planRun = Array.isArray(scanPlan?.run) ? scanPlan.run.map(normalizeTool) : [];
  const planSkip = Array.isArray(scanPlan?.skip) ? scanPlan.skip.map(normalizeTool) : [];
  const plannedOrder = planRun.length
    ? planRun
    : [
        "platform",
        "nmap",
        "nikto",
        "ssl",
        "sqlmap",
        "xss",
        "nuclei",
        "wapiti",
        "gobuster",
        "ffuf",
        "dns",
        "whois",
        "ratelimit",
      ];

  const baseOrder = plannedOrder;
  const extraScans = Array.from(scansByType.keys()).filter((toolId: string) => !baseOrder.includes(toolId));
  const skippedExtra = planSkip.filter((toolId: string) => !baseOrder.includes(toolId));
  const orderedTools = [...baseOrder, ...extraScans, ...skippedExtra].filter(Boolean);

  const steps = orderedTools.map((toolId) => {
    const scan = scansByType.get(toolId);
    const scanStatus = String(scan?.status || "");
    let stepStatus = "pending";

    if (planSkip.includes(toolId)) stepStatus = "skipped";
    if (scanStatus === "completed") stepStatus = "completed";
    if (scanStatus === "running") stepStatus = "running";
    if (["failed", "cancelled", "canceled"].includes(scanStatus)) stepStatus = "error";

    if (toolId === "platform" && status === "running" && !hasRunningScan && !scanStatus) {
      stepStatus = percent < 18 ? "running" : "completed";
    }

    return {
      id: toolId,
      name: TOOL_LABELS[toolId] || toolId.toUpperCase(),
      detail: TOOL_DETAILS[toolId] || "Security step in the auto-scan sequence.",
      status: stepStatus,
    };
  });

  const runningIndex = steps.findIndex((step) => step.status === "running");
  const activeIndexByPercent = Math.min(
    steps.length - 1,
    Math.max(0, Math.floor((percent / 100) * steps.length))
  );
  const nextIndex = steps.findIndex((step) => step.status === "pending");
  const activeIndex = runningIndex !== -1 ? runningIndex : nextIndex !== -1 ? nextIndex : activeIndexByPercent;
  const totalSteps = steps.length || 1;
  const currentStep = steps[activeIndex] || steps[steps.length - 1];

  const completedSteps = Math.min(
    steps.length,
    Math.max(0, Math.floor((percent / 100) * steps.length))
  );
  const activeStepProgress = Math.max(8, Math.min(100, (percent / 100) * 100));

  const headline = (() => {
    if (status === "completed") return "Auto-scan completed. Preparing results…";
    if (currentStep?.status === "running") {
      return `Step ${activeIndex + 1}/${totalSteps}: ${currentStep.name} in progress`;
    }
    if (currentStep?.status === "pending") {
      return `Queued: ${currentStep.name} will start next`;
    }
    return "Initializing auto-scan sequence…";
  })();

  const timelineLabel = (() => {
    if (status === "completed") return "Complete";
    if (status === "failed") return "Interrupted";
    if (status === "running") return `${Math.round(percent)}%`;
    return "Queued";
  })();

  return (
    <div className="auto-scan-progress">
      <div className="auto-scan-header">
        <div>
          <h3>AUTO-SCAN SEQUENCE</h3>
          <span className="auto-scan-status">{headline}</span>
        </div>
        <div className="auto-scan-badge">
          <Sparkles size={14} />
          <span>{timelineLabel}</span>
        </div>
      </div>

      <div className="auto-scan-current-step glass-panel">
        <div className="current-step-icon">
          {currentStep?.status === "running" && toolLottieMap[currentStep.id] ? (
            <Lottie animationData={toolLottieMap[currentStep.id]} loop autoplay style={{ width: "100%", height: "100%" }} />
          ) : currentStep?.status === "completed" ? (
            <CheckCircle2 size={24} />
          ) : currentStep?.status === "skipped" ? (
            <MinusCircle size={24} />
          ) : (
            <Loader2 size={24} className="animate-spin" />
          )}
        </div>
        <div className="current-step-copy">
          <span className="current-step-kicker">{currentStep?.status === "running" ? "Running now" : currentStep?.status === "completed" ? "Completed" : "Next in queue"}</span>
          <h4>{currentStep?.name || "Preparing auto-scan"}</h4>
          <p>{currentStep?.detail || "Auto-scan is selecting the next best tool based on target signals."}</p>
        </div>
        <div className="current-step-meter">
          <div className="current-step-meter-labels">
            <span>Overall progress</span>
            <strong>{Math.round(percent)}%</strong>
          </div>
          <div className="current-step-meter-bar">
            <div className="current-step-meter-fill" style={{ width: `${Math.max(8, percent)}%` }}>
              <span className="current-step-meter-pulse"></span>
            </div>
          </div>
          <div className="current-step-meter-meta">
            <span>{completedSteps} of {steps.length} stages</span>
            <span>{currentStep?.status === "running" ? "Live execution" : "Stage-based sequence"}</span>
          </div>
        </div>
      </div>

      <div className="auto-scan-timeline">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`auto-scan-step ${step.status}`}
          >
            <div className="step-index-wrap">
              <div className="step-index">
                {step.status === "completed" ? <CheckCircle2 size={14} /> : step.status === "running" ? <Loader2 size={14} className="animate-spin" /> : index + 1}
              </div>
              <div className="step-rail" />
            </div>

            <div className="step-icon">
              {step.status === "completed" && toolLottieMap[step.id] ? (
                <div className="step-lottie-icon" style={{ opacity: 0.6 }}>
                  <Lottie 
                    animationData={toolLottieMap[step.id]} 
                    loop={false} 
                    autoplay={false}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              ) : step.status === "completed" ? (
                <CheckCircle2 size={20} />
              ) : step.status === "running" && toolLottieMap[step.id] ? (
                <div className="step-lottie-icon animate-spin">
                  <Lottie 
                    animationData={toolLottieMap[step.id]} 
                    loop 
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              ) : step.status === "running" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : step.status === "pending" ? (
                <Circle size={20} />
              ) : step.status === "skipped" ? (
                <MinusCircle size={20} />
              ) : step.status === "error" ? (
                <AlertCircle size={20} />
              ) : null}
            </div>

            <div className="step-meta">
              <div className="step-head">
                <span className="step-title">{step.name}</span>
                <span className={`step-state ${step.status}`}>{step.status}</span>
              </div>
              <p className="step-detail">{step.detail}</p>
              <div className="step-bar">
                <div
                  className={`step-bar-fill ${step.status}`}
                  style={{
                    width:
                      step.status === "completed"
                        ? "100%"
                        : step.status === "running"
                        ? `${activeStepProgress}%`
                        : step.status === "skipped"
                        ? "100%"
                        : "0%",
                  }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
