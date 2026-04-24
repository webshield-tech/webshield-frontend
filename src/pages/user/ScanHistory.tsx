/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  History, 
  Search, 
  ChevronLeft, 
  Clock, 
  Shield, 
  ExternalLink,
  Filter,
  ArrowRight
} from "lucide-react";
import { getScanHistory } from "../../api/scan-api";
import "../../styles/scan-history.css";

const ScanHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scans, setScans] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  // Get search from URL query if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setFilterText(search);
    }
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getScanHistory();
        const arr = res.data?.scans || res.data?.history || [];
        setScans(Array.isArray(arr) ? arr : []);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load scan history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredScans = useMemo(() => {
    if (!filterText) return scans;
    const low = filterText.toLowerCase();
    return scans.filter(s => 
      (s.targetUrl || s.url || "").toLowerCase().includes(low) ||
      (s.scanType || s.tool || "").toLowerCase().includes(low)
    );
  }, [scans, filterText]);

  return (
    <div className="history-v2">
      <header className="history-header-v2">
        <div className="title-area">
          <Link to="/dashboard" className="back-link">
            <ChevronLeft size={20} />
            <span>Dashboard</span>
          </Link>
          <h1>Operation Logs</h1>
          <p>Total records detected: {filteredScans.length}</p>
        </div>

        <div className="search-area">
          <div className="search-bar-wrap">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Filter by target or tool..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <button className="filter-options-btn">
            <Filter size={18} />
          </button>
        </div>
      </header>

      {error && (
        <div className="history-alert error">
          <Shield size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="history-list-v2">
        {loading ? (
          <div className="loading-state">
            <div className="cyber-loader"></div>
            <span>Retrieving logs…</span>
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="empty-state">
            <History size={64} opacity={0.1} />
            <h3>No results found</h3>
            <p>Try adjusting your search filters or launch a new scan.</p>
            <button className="new-scan-btn" onClick={() => navigate("/start-scan")}>
              Initialize New Scan
            </button>
          </div>
        ) : (
          <div className="history-grid-v2">
            {filteredScans.map((s: any) => (
              <div 
                key={s._id} 
                className={`history-card-v2 ${s.status}`}
                onClick={() => navigate(s.status === "running" || s.status === "pending" ? `/scan-progress/${s._id}` : `/scan-result/${s._id}`)}
              >
                <div className="card-accent"></div>
                <div className="card-body">
                  <div className="target-info">
                    <span className="target-url">{s.targetUrl || s.url || "Unknown Target"}</span>
                    <div className="target-meta">
                      <span className="tool-name">{(s.scanType || s.tool || "unknown").toUpperCase()}</span>
                      <span className="dot">•</span>
                      <span className="timestamp">
                        <Clock size={12} />
                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="card-end">
                    <div className={`status-tag ${s.status}`}>
                      {s.status}
                    </div>
                    <div className="icon-arrow">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
