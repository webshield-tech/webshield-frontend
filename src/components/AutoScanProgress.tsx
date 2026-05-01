import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, AlertCircle, MinusCircle } from "lucide-react";
import "../styles/scan-progress.css";

interface AutoScanProgressProps {
  status: string;
  percent: number;
  batchScans?: any[];
  scanPlan?: any;
}

export const AutoScanProgress = ({ status, percent, batchScans = [], scanPlan }: AutoScanProgressProps) => {
  const normalizeTool = (value: string) => {
    const key = String(value || "").toLowerCase();
    if (key === "sslscan") return "ssl";
    return key;
  };

  const TOOL_LABELS: Record<string, string> = {
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
  };

  const FALLBACK_ORDER = [
    "nmap",
    "nuclei",
    "nikto",
    "ssl",
    "sqlmap",
    "wapiti",
    "gobuster",
    "ffuf",
    "ratelimit",
    "dns",
    "whois",
  ];

  const scansByType = new Map<string, any>();
  const sortedScans = [...batchScans].sort((a, b) => {
    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    return aTime - bTime;
  });
  for (const scan of sortedScans) {
    const key = normalizeTool(scan?.scanType || scan?.tool);
    if (key && !scansByType.has(key)) scansByType.set(key, scan);
  }

  const planRun = Array.isArray(scanPlan?.run) ? scanPlan.run.map(normalizeTool) : [];
  const planSkip = Array.isArray(scanPlan?.skip) ? scanPlan.skip.map(normalizeTool) : [];

  const baseOrder = planRun.length
    ? planRun
    : scansByType.size > 0
    ? Array.from(scansByType.keys())
    : FALLBACK_ORDER;
  const skippedExtra = planSkip.filter((toolId) => !baseOrder.includes(toolId));
  const orderedTools = [...baseOrder, ...skippedExtra];

  const steps = orderedTools.map((toolId) => {
    const scan = scansByType.get(toolId);
    const scanStatus = String(scan?.status || "");
    let stepStatus = "pending";

    if (planSkip.includes(toolId)) stepStatus = "skipped";
    if (scanStatus === "completed") stepStatus = "completed";
    if (scanStatus === "running") stepStatus = "running";
    if (["failed", "cancelled", "canceled"].includes(scanStatus)) stepStatus = "error";

    return {
      id: toolId,
      name: TOOL_LABELS[toolId] || toolId.toUpperCase(),
      status: stepStatus,
    };
  });

  const runningIndex = steps.findIndex((step) => step.status === "running");
  const nextIndex = steps.findIndex((step) => step.status === "pending");
  const activeIndex = runningIndex !== -1 ? runningIndex : nextIndex !== -1 ? nextIndex : steps.length - 1;
  const totalSteps = steps.length || 1;
  const currentStep = steps[activeIndex];

  const stepSize = 100 / totalSteps;
  const activeStepProgress = Math.min(
    95,
    Math.max(8, ((percent - stepSize * activeIndex) / stepSize) * 100)
  );

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

  return (
    <div className="auto-scan-progress">
      <div className="auto-scan-header">
        <h3>AUTO-SCAN SEQUENCE</h3>
        <span className="auto-scan-status">{headline}</span>
      </div>

      <div className="auto-scan-steps">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`auto-scan-step ${step.status}`}
          >
            <div className="step-icon">
              {step.status === "completed" && <CheckCircle2 size={20} />}
              {step.status === "running" && <Loader2 size={20} className="animate-spin" />}
              {step.status === "pending" && <Circle size={20} />}
              {step.status === "skipped" && <MinusCircle size={20} />}
              {step.status === "error" && <AlertCircle size={20} />}
            </div>

            <div className="step-meta">
              <div className="step-head">
                <span className="step-title">{step.name}</span>
                <span className={`step-state ${step.status}`}>#{index + 1}</span>
              </div>
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
