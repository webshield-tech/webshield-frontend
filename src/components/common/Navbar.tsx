import { Link, useNavigate } from "react-router-dom";
import { 
  Shield, 
  LayoutDashboard, 
  Play, 
  Clock, 
  Search, 
  Info, 
  User as UserIcon, 
  LogOut, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import "./Navbar.css";

export const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = !!user && user.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/scan-history?search=${searchQuery}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="top-navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <Shield className="text-primary" size={28} />
          <span className="logo-text">Vuln Spectra</span>
        </Link>

        {/* Desktop Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search scans..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/start-scan" className="nav-link">
            <Play size={18} />
            <span>New Scan</span>
          </Link>
          <Link to="/scan-history" className="nav-link">
            <Clock size={18} />
            <span>History</span>
          </Link>
          <Link to="/osint" className="nav-link">
            <Search size={18} />
            <span>OSINT</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              <Settings size={18} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* User Profile / Logout */}
        <div className="navbar-user">
          <div 
            className="user-profile-nav-btn" 
            onClick={() => navigate("/profile")}
            title="View Security Profile"
          >
            <div className="avatar-shield">
              <UserIcon size={20} />
              <div className="shield-glow"></div>
            </div>
            <div className="user-info-text">
              <span className="operator-label">Operator</span>
              <span className="display-name">{user?.username || "Guest"}</span>
            </div>
          </div>
          
          <div className="navbar-divider"></div>

          <button className="navbar-logout-btn" onClick={handleLogout} title="Terminate Session">
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Link to="/dashboard" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/start-scan" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <Play size={20} />
            <span>New Scan</span>
          </Link>
          <Link to="/scan-history" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <Clock size={20} />
            <span>History</span>
          </Link>
          <Link to="/osint" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <Search size={20} />
            <span>OSINT</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <Settings size={20} />
              <span>Admin Panel</span>
            </Link>
          )}
          <div className="mobile-footer">
            <button className="mobile-logout" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
