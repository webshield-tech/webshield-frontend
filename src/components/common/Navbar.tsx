import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Play, 
  Clock, 
  Search, 
  Info, 
  User as UserIcon, 
  Settings,
  Menu,
  X,
  BookOpen,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Bell,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import {
  loadNotifications,
  markAllNotificationsRead,
  type AppNotification,
} from "../../utils/notifications";

export const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications());
  const [unreadCount, setUnreadCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const hasUnread = notifications.some((notification) => !notification.read);

  // Update unread count
  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);

    // Trigger shake animation on new unread notification
    if (count > prevCountRef.current) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
    prevCountRef.current = count;
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const syncNotifications = () => setNotifications(loadNotifications());

    syncNotifications();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === "webshield.notifications") {
        syncNotifications();
      }
    };

    const handleCustomUpdate = () => syncNotifications();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("webshield-notifications-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("webshield-notifications-updated", handleCustomUpdate);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications(markAllNotificationsRead());
  };

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} />;
      case "warning":
        return <AlertTriangle size={16} />;
      case "error":
        return <AlertCircle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const getNotificationAccent = (type: AppNotification["type"]) => {
    switch (type) {
      case "success":
        return { color: "#00ff9d", background: "rgba(0, 255, 157, 0.12)" };
      case "warning":
        return { color: "#ffd54f", background: "rgba(255, 213, 79, 0.12)" };
      case "error":
        return { color: "#ff5d5d", background: "rgba(255, 93, 93, 0.12)" };
      default:
        return { color: "#00f2ff", background: "rgba(0, 242, 255, 0.12)" };
    }
  };

  const isAdmin = !!user && user.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
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
          <img src="/logo.png" alt="Vuln Spectra Logo" style={{ width: '32px', height: '32px', filter: 'drop-shadow(0 0 5px var(--color-cyber-green))', borderRadius: '8px' }} />
          <span className="navbar-logo-text">Vuln Spectra</span>
        </Link>

        {/* Desktop Search Bar */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" color="var(--accent-green)" />
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
          <Link to="/about-tools" className="nav-link">
            <Info size={18} />
            <span>About Tools</span>
          </Link>
          <Link to="/learn" className="nav-link">
            <BookOpen size={18} />
            <span>Learn</span>
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              <Settings size={18} />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Right Section: Notifications, Profile, Logout */}
        <div className="navbar-actions-group">
          
          <div className="navbar-notifications" ref={notificationRef}>
            <button 
              className={`navbar-icon-btn ${isShaking ? 'shake-notification' : ''}`}
              onClick={() => {
                setNotificationsOpen((previous) => {
                  const next = !previous;
                  if (next) markAllAsRead();
                  return next;
                });
              }}
              title="Notifications"
            >
              <span className="navbar-icon-wrapper">
                <Bell size={20} color="#ffffff" />
              </span>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            {notificationsOpen && (
              <div className="notifications-dropdown">
                <div className="dropdown-header">
                  <h4>Notifications</h4>
                  <button className="mark-read-btn" onClick={markAllAsRead}>Mark as read</button>
                </div>
                <div className="dropdown-content">
                  {notifications.length === 0 ? (
                    <div className="notification-item">
                      <span className="dot"></span>
                      <div className="text">
                        <p>No notifications yet.</p>
                        <small>Updates will appear here.</small>
                      </div>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const accent = getNotificationAccent(notification.type);
                      return (
                        <div className="notification-item" key={notification.id}>
                          <span
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: accent.color,
                              background: accent.background,
                              flexShrink: 0,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="text">
                            <p>{notification.title}</p>
                            <small>{notification.message}</small>
                          </div>
                          <span className={`dot ${notification.read ? "" : "unread"}`}></span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="navbar-divider"></div>

          {/* User Profile */}
          <div 
            className="user-profile-nav-btn premium-profile" 
            onClick={() => navigate("/profile")}
            title="View Security Profile"
          >
            <div className="avatar-circle">
              <UserIcon size={18} />
            </div>
            <div className="user-info-text">
              <span className="display-name">{user?.username || "Guest"}</span>
              <span className="role-label">{isAdmin ? "Admin" : "Operator"}</span>
            </div>
          </div>
          
          <div className="navbar-divider"></div>

          {/* Logout */}
          <button className="navbar-logout-btn" onClick={handleLogout} title="Terminate Session">
            <span className="navbar-icon-wrapper">
              <LogOut size={18} color="#ffffff" />
            </span>
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
          <Link to="/about-tools" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
            <Info size={20} />
            <span>About Tools</span>
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
