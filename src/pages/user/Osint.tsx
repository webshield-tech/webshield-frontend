import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  User, 
  ChevronLeft, 
  Loader2,
  AlertCircle,
  Network,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../api/axios";

const Osint = () => {
  const [targetName, setTargetName] = useState("");
  const [targetIdentifier, setTargetIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName) return setError("Please provide a target name.");
    
    setError("");
    setLoading(true);
    setReport("");

    try {
      const response = await api.post("/api/osint", { targetName, targetIdentifier });
      const resData = response.data;
      if (resData.success) {
        setReport(resData.report);
      } else {
        setError(resData.error || "Failed to gather intelligence.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Connection Failure: Intelligence source is unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="osint-page-v2" style={{ padding: '40px' }}>
      <header className="osint-header-v2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div className="title-area">
          <Link to="/dashboard" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyber-primary)', textDecoration: 'none', marginBottom: '12px', fontSize: '0.9rem' }}>
            <ChevronLeft size={18} />
            <span>Dashboard</span>
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Orbitron', background: 'linear-gradient(to right, #fff, var(--cyber-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OSINT Profiler</h1>
          <p style={{ color: 'var(--cyber-text-dim)' }}>Automated Threat Intelligence & Information Gathering</p>
        </div>
        <div className="header-icon-wrap" style={{ padding: '16px', background: 'rgba(0, 242, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(0, 242, 255, 0.1)' }}>
          <Network size={36} className="text-primary" />
        </div>
      </header>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert-box error" style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', border: '1px solid var(--cyber-error)', background: 'rgba(255, 77, 77, 0.05)', color: 'var(--cyber-error)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      <div className="osint-grid" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        {/* Input Panel */}
        <div className="input-panel glass-panel" style={{ padding: '32px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Parameters</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="field">
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--cyber-text-dim)', marginBottom: '8px' }}>Target Full Name</label>
              <div className="input-wrap" style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyber-text-dim)' }} />
                <input 
                  type="text" 
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={loading}
                  required
                  style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }}
                />
              </div>
            </div>

            <div className="field">
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--cyber-text-dim)', marginBottom: '8px' }}>Identifiers (Email/Username)</label>
              <div className="input-wrap" style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--cyber-text-dim)' }} />
                <input 
                  type="text" 
                  value={targetIdentifier}
                  onChange={(e) => setTargetIdentifier(e.target.value)}
                  placeholder="e.g. jdoe@corp.com"
                  disabled={loading}
                  style={{ width: '100%', padding: '14px 16px 14px 48px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                marginTop: '12px', 
                padding: '16px', 
                background: 'var(--cyber-primary)', 
                border: 'none', 
                borderRadius: '12px', 
                color: '#000', 
                fontWeight: 700, 
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Gathering Intelligence...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Initiate Profiling</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="results-panel glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Intelligence Report</h3>
            {loading && <span style={{ fontSize: '0.8rem', color: 'var(--cyber-primary)' }}>Correlating Sources...</span>}
          </div>

          <div className="report-content" style={{ flex: 1, overflowY: 'auto', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px', color: 'var(--cyber-text-dim)' }}>
                <Network size={48} className="animate-pulse" />
                <div style={{ textAlign: 'center' }}>
                  <p>Searching public records...</p>
                  <p>Analyzing social media footprint...</p>
                  <p>Correlating metadata...</p>
                </div>
              </div>
            ) : report ? (
              <div className="markdown-report">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3, gap: '16px' }}>
                <Globe size={64} />
                <p style={{ fontSize: '1.2rem', fontFamily: 'Orbitron' }}>Awaiting Target Input</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Osint;
