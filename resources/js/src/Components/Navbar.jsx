import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import adminIcon from "../assets/icons/icons8-admin-50.png";
import logoutIcon from "../assets/icons/Logout.png";
import menuIcon from "../assets/icons/icons8-hamburger-menu-50.png";
import NotificationModal from "./NotificationModal";
import "./Navbar.css";
const logo = "/Sanctuario_Logo_Good.png";

const Navbar = ({ collapsed, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationButtonRef = useRef(null);

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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className={`navbar ${collapsed ? "collapsed" : ""} ${mounted ? "no-transition" : ""}`}>
      <div className="flex items-center gap-4">
        {/* Show logo when sidebar is collapsed */}
        {collapsed && !isMobile && (
          <img
            src={logo}
            alt="Sanctuario Logo"
            className="navbar-logo-when-collapsed"
            onError={(e) => {
              console.error('Logo failed to load:', e.target.src);
              e.target.outerHTML = '<div class="text-neutral-800 font-bold text-sm">SANCTUARIO</div>';
            }}
          />
        )}
        {isMobile && (
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            <img src={menuIcon} alt="Menu" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 ml-auto">
        {/* Notification Bell */}
        <button 
          ref={notificationButtonRef}
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-opacity-10 hover:bg-white rounded-lg transition-all text-gray-300 pointer-events-auto"
          title="Notifications"
          style={{ color: '#D4C4A8' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
            <path d="M9 17a3 3 0 0 0 6 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Profile Menu */}
        <div className="relative pointer-events-auto">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-opacity-20 hover:bg-gray-600 px-3 py-2 rounded-lg transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <img
                src={adminIcon}
                alt="Admin Icon"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex flex-col items-start">
              <strong className="text-sm font-semibold text-white">{user?.name || 'Administrator'}</strong>
              <small className="text-xs text-gray-400">
                {user?.access_level ? user.access_level.charAt(0).toUpperCase() + user.access_level.slice(1) : 'Admin'}
              </small>
            </div>
            <svg className={`w-4 h-4 transition-all duration-200 transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} style={{ color: '#D4C4A8', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
            </svg>
          </button>

          {showProfileMenu && (
            <ul className="profile-menu-dropdown">
              <li className="profile-menu-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                    <img src={adminIcon} alt="Profile" className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-gray-500">
                      {user?.access_level ? user.access_level.charAt(0).toUpperCase() + user.access_level.slice(1) : 'Admin'}
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="profile-menu-item"
                >
                  <img src={adminIcon} alt="Profile" className="w-5 h-5 object-contain" />
                  My Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowProfileMenu(false);
                  }}
                  className="profile-menu-item profile-menu-logout"
                >
                  <img src={logoutIcon} alt="Logout" className="w-5 h-5 object-contain" />
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      <NotificationModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        triggerButtonRef={notificationButtonRef}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
};

export default Navbar;
