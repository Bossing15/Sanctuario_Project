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
import smsIcon from "../assets/icons/icons8-message-50.png";

const appLogo = "/Sanctuario_Logo_Good.png";

const Sidebar = ({ collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) => {
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
      // Close mobile menu on resize to desktop
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
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
    { label: "Products", icon: productsIcon, path: "/properties", key: 'products' },
    { label: "Services", icon: maintenanceIcon, path: "/services", key: 'services' },
    { label: "Messages", icon: messageIcon, path: "/messages", key: 'messages' },
    { label: "SMS", icon: smsIcon, path: "/sms", key: 'sms' },
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

  // Mobile sidebar with hamburger menu
  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-sidebar-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div className={`mobile-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Sidebar header */}
          <div className="mobile-sidebar-header">
            <img
              src={appLogo}
              alt="Sanctuario Logo"
              className="mobile-sidebar-logo"
              onError={(e) => {
                console.error('Logo failed to load:', e.target.src);
                e.target.outerHTML = '<div class="text-neutral-800 font-bold text-sm">SANCTUARIO</div>';
              }}
            />
            <button
              className="mobile-sidebar-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Menu items */}
          <div className="mobile-sidebar-menu">
            {menuItems.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                end={item.path === "/admin/dashboard"}
                className={({ isActive }) =>
                  `mobile-sidebar-item ${isActive ? 'active' : ''} ${item.isDisabled ? 'opacity-60' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-sidebar-item-icon">
                  <img src={item.icon} alt={item.label} />
                </div>
                <span className="mobile-sidebar-item-label">
                  {item.label}
                  {item.isDisabled && (
                    <span className="ml-1 text-xs text-warning-600">(View Only)</span>
                  )}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Settings */}
          <div className="mobile-sidebar-footer">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `mobile-sidebar-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-sidebar-item-icon">
                <img src={settingsIcon} alt="Settings" />
              </div>
              <span className="mobile-sidebar-item-label">Settings</span>
            </NavLink>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${mounted ? "no-transition" : ""}`}
    >
      {/* Header with hamburger and logo */}
      <div className="sidebar-header">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
          aria-label="Toggle sidebar"
        >
          <img src={menuIcon} alt="Menu" />
        </button>
        <div className="sidebar-header-spacer"></div>
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
            end={item.path === "/admin/dashboard" || item.path === "/admin"}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${item.isDisabled ? 'opacity-60' : ''}`
            }
          >
            <div className="sidebar-item-icon">
              <img src={item.icon} alt={item.label} />
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
            <img src={settingsIcon} alt="Settings" />
          </div>
          <span className="sidebar-item-label">Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
