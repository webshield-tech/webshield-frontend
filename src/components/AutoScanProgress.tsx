import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import "../styles/scan-progress.css";

interface AutoScanProgressProps {
  status: string;
  percent: number;
}

export const AutoScanProgress = ({ status, percent }: AutoScanProgressProps) => {
  // Determine which phase we are in based on overall percentage
  const phases = [
    { id: "nmap", name: "Network Reconnaissance (Nmap)", threshold: 0, endThreshold: 25 },
    { id: "nikto", name: "Web Server Audit (Nikto)", threshold: 25, endThreshold: 50 },
    { id: "sslscan", name: "Encryption Analysis (SSLScan)", threshold: 50, endThreshold: 75 },
    { id: "sqlmap", name: "Injection Testing (SQLMap)", threshold: 75, endThreshold: 100 },
  ];

  const getPhaseStatus = (phase: any) => {
    if (status === "failed" || status === "canceled") return "error";
    if (percent >= phase.endThreshold || status === "completed") return "completed";
    if (percent >= phase.threshold && percent < phase.endThreshold && status === "running") return "running";
    return "pending";
  };

  return (
    <div className="auto-scan-progress-wrapper" style={{ marginTop: '20px' }}>
      <h3 style={{ marginBottom: '16px', fontFamily: 'Orbitron', color: 'var(--cyber-primary)' }}>AUTO-SCAN SEQUENCE</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {phases.map((phase, index) => {
          const phaseStatus = getPhaseStatus(phase);
          
          return (
            <motion.div 
              key={phase.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: phaseStatus === "running" ? 'rgba(var(--cyber-primary-rgb), 0.1)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${phaseStatus === "running" ? 'var(--cyber-primary)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {phaseStatus === "completed" && <CheckCircle2 size={24} className="text-success" />}
                {phaseStatus === "running" && <Loader2 size={24} className="text-primary animate-spin" />}
                {phaseStatus === "pending" && <Circle size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                {phaseStatus === "error" && <AlertCircle size={24} className="text-error" />}
              </div>
              
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Rajdhani', fontWeight: 600, color: phaseStatus === "running" ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                    {phase.name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cyber-primary)' }}>
                    {phaseStatus === "running" ? "IN_PROGRESS" : phaseStatus === "completed" ? "DONE" : phaseStatus.toUpperCase()}
                  </span>
                </div>
                
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: phaseStatus === "completed" ? '100%' : phaseStatus === "running" ? `${((percent - phase.threshold) / 25) * 100}%` : '0%' 
                    }}
                    style={{ height: '100%', background: 'var(--cyber-primary)' }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
