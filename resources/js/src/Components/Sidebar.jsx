import { NavLink } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

import adminIcon from "../assets/icons/icons8-admin-50.png";
import billingIcon from "../assets/icons/Billing2.png";
import customerIcon from "../assets/icons/Customers.png";
import dashboardIcon from "../assets/icons/Dashboard.png";
import graveIcon from "../assets/icons/Graves.png";
import settingsIcon from "../assets/icons/Settings.png";
import messageIcon from "../assets/icons/icons8-message-50.png";
import menuIcon from "../assets/icons/icons8-hamburger-menu-50.png";
import inquiryIcon from "../assets/icons/icons8-notification-50.png";
import maintenanceIcon from "../assets/icons/Maintenance.png";
import requirementIcon from "../assets/icons/Requirements.png";
// Use public path instead of import for better reliability
const appLogo = "/Sanctuario_Logo_Good.png";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Disable transitions on mount
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setMounted(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when a link is clicked
  const handleMenuItemClick = () => {
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };
  
  // Get user and permissions from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = user.permissions || {};

  // Define all menu items with their permission keys
  const allMenuItems = [
    { label: "Dashboard", icon: dashboardIcon, path: "/admin/dashboard", key: 'dashboard' },
    { label: "Customers", icon: customerIcon, path: "/customers", key: 'customers' },
    { label: "Billing", icon: billingIcon, path: "/billing", key: 'billing' },
    { label: "Graves", icon: graveIcon, path: "/graves", key: 'graves' },
    { label: "Requirements", icon: requirementIcon, path: "/requirements", key: 'requirements' },
    { label: "Inquiries", icon: inquiryIcon, path: "/inquiries", key: 'inquiries' },
    { label: "Maintenance", icon: maintenanceIcon, path: "/maintenance-requests", key: 'inquiries' },
    { label: "Messages", icon: messageIcon, path: "/messages", key: 'messages' },
    { label: "Admin", icon: adminIcon, path: "/admin", key: 'admin' },
  ];

  // All items are visible, but we track which ones have action permissions
  const menuItems = useMemo(() => {
    return allMenuItems.map(item => {
      // Handle both old (boolean) and new (object) permission formats
      const permission = permissions[item.key];
      const canPerformActions = typeof permission === 'object' 
        ? permission?.can_perform_actions !== false 
        : permission !== false;
      
      return {
        ...item,
        canPerformActions
      };
    });
  }, [permissions]);

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <div
        className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${mounted ? "no-transition" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        {/* Header with hamburger */}
        <div className="sidebar-header">
          <button
            onClick={() => {
              if (window.innerWidth <= 768) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
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
              onLoad={(e) => console.log('Sidebar logo loaded successfully from:', e.target.src)}
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
              onClick={handleMenuItemClick}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''} ${!item.canPerformActions ? 'opacity-60' : ''}`
              }
            >
              <div className="sidebar-item-icon">
                <img src={item.icon} alt={item.label} className="w-5 h-5" />
              </div>
              <span className="sidebar-item-label">
                {item.label}
                {!item.canPerformActions && !collapsed && (
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
            onClick={handleMenuItemClick}
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
    </>
  );
};

export default Sidebar;
