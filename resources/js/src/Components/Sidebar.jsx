import { NavLink, useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

import adminIcon from "../assets/icons/icons8-admin-50.png";
import billingIcon from "../assets/icons/Billing2.png";
import customerIcon from "../assets/icons/Customers.png";
import dashboardIcon from "../assets/icons/Dashboard.png";
import graveIcon from "../assets/icons/Graves.png";
import settingsIcon from "../assets/icons/Settings.png";
import messageIcon from "../assets/icons/icons8-message-50.png";
import menuIcon from "../assets/icons/icons8-hamburger-menu-50.png";
import productsIcon from "../assets/icons/icons8-services-50.png";
import maintenanceIcon from "../assets/icons/Maintenance.png";
import requirementIcon from "../assets/icons/Requirements.png";
import activityIcon from "../assets/icons/icons8-invoice-50.png";

const appLogo = "/Sanctuario_Logo_Good.png";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setMounted(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = user.permissions || {};

  const allMenuItems = [
    { label: "Dashboard", icon: dashboardIcon, path: "/admin/dashboard", key: 'dashboard' },
    { label: "Customers", icon: customerIcon, path: "/customers", key: 'customers' },
    { label: "Billing", icon: billingIcon, path: "/billing", key: 'billing' },
    { label: "Graves", icon: graveIcon, path: "/graves", key: 'graves' },
    { label: "Requirements", icon: requirementIcon, path: "/requirements", key: 'requirements' },
    { label: "Products", icon: productsIcon, path: "/products", key: 'graves' },
    { label: "Services", icon: maintenanceIcon, path: "/services", key: 'graves' },
    { label: "Messages", icon: messageIcon, path: "/messages", key: 'messages' },
    { label: "Activity Logs", icon: activityIcon, path: "/activity-logs", key: 'activity_logs' },
    { label: "Admin", icon: adminIcon, path: "/admin", key: 'admin' },
  ];

  const menuItems = useMemo(() => {
    return allMenuItems.map(item => {
      // Simplified RBAC: if permission is false, component is disabled (view-only)
      const isDisabled = permissions[item.key] === false;
      
      return {
        ...item,
        isDisabled
      };
    });
  }, [permissions]);

  // Mobile bottom navigation with scrollable menu
  if (isMobile) {
    return (
      <nav className="mobile-nav">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            end={item.path === "/admin/dashboard"}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <img src={item.icon} alt={item.label} />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <img src={settingsIcon} alt="Settings" />
          <span>Settings</span>
        </NavLink>
      </nav>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${mounted ? "no-transition" : ""}`}
    >
      {/* Header with hamburger */}
      <div className="sidebar-header">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
        >
          <img src={menuIcon} alt="Menu" className="w-4 h-4" />
        </button>
        {!collapsed && (
          <img
            src={appLogo}
            alt="Sanctuario Logo"
            className="sidebar-logo"
            onError={(e) => {
              console.error('Logo failed to load:', e.target.src);
              e.target.outerHTML = '<div class="text-neutral-800 font-bold text-sm">SANCTUARIO</div>';
            }}
          />
        )}
      </div>

      {/* Menu Items */}
      <div className="sidebar-menu">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${item.isDisabled ? 'opacity-60' : ''}`
            }
          >
            <div className="sidebar-item-icon">
              <img src={item.icon} alt={item.label} className="w-5 h-5" />
            </div>
            <span className="sidebar-item-label">
              {item.label}
              {item.isDisabled && !collapsed && (
                <span className="ml-1 text-xs text-warning-600">(View Only)</span>
              )}
            </span>
          </NavLink>
        ))}
      </div>

      {/* Settings */}
      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''}`
          }
        >
          <div className="sidebar-item-icon">
            <img src={settingsIcon} alt="Settings" className="w-5 h-5" />
          </div>
          <span className="sidebar-item-label">Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
