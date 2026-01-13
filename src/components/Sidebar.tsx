import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Flag,
  Plus,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const FILE_BASE = API_URL.replace(/\/api$/, "");

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const navItems = [
    {
      to: "/dashboard",
      icon: Home,
      label: "Dashboard",
      roles: ["user", "admin"],
    },
    {
      to: "/red-flags",
      icon: Flag,
      label: "Red Flags",
      roles: ["user", "admin"],
    },
    {
      to: "/interventions",
      icon: Plus,
      label: "Interventions",
      roles: ["user", "admin"],
    },
    {
      to: "/notifications",
      icon: Bell,
      label: "Notifications",
      roles: ["user", "admin"],
    },
    {
      to: "/admin-dashboard",
      icon: BarChart3,
      label: "Admin Dashboard",
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "user")
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="mobile-overlay show" onClick={onClose}></div>
      )}

      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={onToggle}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`page-aside ${!isOpen ? "mobile-hidden" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <span>IR</span>
          </div>
          <h1 className="sidebar-title">iReporter</h1>
        </div>

        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive ? "nav-link-active" : ""}`}
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="nav-link"
            style={{ marginTop: "auto" }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>

        {/* User info at bottom */}
        {user && (
          <div
            style={{
              marginTop: "auto",
              padding: "1rem",
              borderTop: "1px solid hsl(var(--sidebar-border))",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              className="brand-icon"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                overflow: "hidden",
              }}
            >
              {user.profile_picture ? (
                <img
                  src={`${FILE_BASE}${user.profile_picture}`}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "hsl(var(--primary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "hsl(var(--primary-foreground))",
                    fontWeight: "bold",
                  }}
                >
                  {`${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "hsl(var(--sidebar-foreground))",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {`${user.first_name} ${user.last_name}`}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "hsl(var(--muted-foreground))",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <User size={12} />
                {user.role === "admin" ? "Administrator" : "Citizen Reporter"}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
