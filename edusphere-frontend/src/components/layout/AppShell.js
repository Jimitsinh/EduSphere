import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Folder,
  Video,
  FileText,
  CheckSquare,
  BarChart2,
  Settings,
  Search,
  Bell,
  Mail,
  HelpCircle,
  LogOut,
  MoreVertical
} from "lucide-react";
import "../../index.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/courses", label: "Course Library", icon: <Folder size={18} /> },
  { to: "/live", label: "Live Classes", icon: <Video size={18} /> },
  { to: "/assignments", label: "Assignments", icon: <FileText size={18} /> },
  { to: "/exams", label: "Exam Center", icon: <CheckSquare size={18} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const roleBadgeColors = {
    admin: { bg: '#fff0f0', color: '#cc3333', label: 'Admin' },
    faculty: { bg: '#f0f4ff', color: '#3366cc', label: 'Faculty' },
    student: { bg: '#f0fff4', color: '#22863a', label: 'Student' },
  };
  const badge = roleBadgeColors[user?.role] || roleBadgeColors.student;

  // Dynamically set search placeholder based on active path
  const searchPlaceholder = useMemo(() => {
    const path = location.pathname;
    if (path.includes("dashboard")) return "Search courses, resources...";
    if (path.includes("analytics")) return "Search analytics...";
    if (path.includes("exams")) return "Search assessments...";
    if (path.includes("live")) return "Search sessions...";
    if (path.includes("settings")) return "Search resources...";
    if (path.includes("assignments")) return "Search assignments...";
    return "Search courses...";
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-text">EduSphere</span>
            <span className="brand-subtitle">Academic Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-red new-request-btn">
            New Request
          </button>
          <a href="#support" className="support-link">
            <HelpCircle size={18} />
            <span>Support</span>
          </a>
          <button
            onClick={handleLogout}
            className="support-link"
            style={{ width: '100%', cursor: 'pointer', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', color: 'var(--text-muted)', fontSize: '13px' }}
            id="logout-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        <header className="topbar">
          {/* Left Area: Toggle & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Clickable Mini Brand Logo (functions as brand logo + sidebar toggle) */}
            <div 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "8px", 
                backgroundColor: "var(--primary-red)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(232, 99, 88, 0.2)"
              }}>
                <span style={{ fontSize: "16px", fontWeight: "800", fontFamily: "var(--font-display)" }}>E</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ 
                  fontFamily: "var(--font-display)", 
                  fontWeight: "700", 
                  fontSize: "14px", 
                  color: "var(--text-primary)",
                  lineHeight: "1.1" 
                }}>
                  EduSphere
                </span>
                <span style={{ 
                  fontSize: "8px", 
                  fontWeight: "700", 
                  letterSpacing: "0.05em", 
                  color: "var(--text-muted)", 
                  textTransform: "uppercase",
                  lineHeight: "1" 
                }}>
                  Academic Portal
                </span>
              </div>
            </div>
            
            <div className="topbar-search">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder={searchPlaceholder} />
            </div>
          </div>

          {/* Central-Right Links */}
          <div className="topbar-links">
            <a href="#resources" className="topbar-link">Resource Hub</a>
            <a href="#faculty" className="topbar-link">Faculty Dir</a>
          </div>

          {/* Right Actions */}
          <div className="topbar-actions">
            {/* Bell Icon with Red Dot */}
            <button className="topbar-btn">
              <Bell size={20} />
              <span className="red-dot"></span>
            </button>

            {/* Envelope Icon */}
            <button className="topbar-btn">
              <Mail size={20} />
            </button>

            {/* Go Live Outline Button */}
            <button className="btn btn-outline-red" style={{ padding: "6px 16px", borderRadius: "4px" }}>
              Go Live
            </button>

            {/* Role Badge */}
            <span style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor: badge.bg,
              color: badge.color,
            }}>{badge.label}</span>

            {/* User Profile */}
            <div className="user-avatar-container" style={{ position: 'relative', cursor: 'pointer' }} title={user?.email || ''}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'var(--font-body)',
              }}>
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer', background: 'none', border: 'none', padding: '4px' }}
              title="Logout"
              id="topbar-logout-btn"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="page-content page-transition">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
