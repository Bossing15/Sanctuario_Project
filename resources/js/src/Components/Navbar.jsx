import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminIcon from "../assets/icons/icons8-admin-50.png";
import logoutIcon from "../assets/icons/Logout.png";
import NotificationModal from "./NotificationModal";
const logo = "/Sanctuario_Logo_Good.png";

const Navbar = ({ collapsed }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setMounted(false);
    }, 50);
    return () => clearTimeout(timer);
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
    <div className={`navbar ${collapsed ? "collapsed" : ""} ${mounted ? "no-transition" : ""}`} style={{ background: '#1a1f3a' }}>
      <div className="flex items-center">
        <img
          src={logo}
          alt="Sanctuario Logo"
          className="navbar-logo brand-logo-img navbar"
          onError={(e) => {
            e.target.outerHTML = '<div class="text-white font-bold text-lg">SANCTUARIO</div>';
          }}
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="icon-btn white circle relative"
          title="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
            <path d="M9 17a3 3 0 0 0 6 0" />
          </svg>
          <span className="badge-dot"></span>
        </button>

        <div className="relative pointer-events-auto">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded-lg transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <img
                src={adminIcon}
                alt="Admin Icon"
                className="w-5 h-5 object-contain"
              />
            </div>
            <div className="flex sm:flex flex-col items-start">
              <strong className="text-sm font-semibold text-white">{user?.name || 'User'}</strong>
              <small className="text-xs text-gray-400">
                {user?.access_level ? user.access_level.charAt(0).toUpperCase() + user.access_level.slice(1) : 'Staff'}
              </small>
            </div>
            <svg className={`w-4 h-4 text-gray-300 transition-all duration-200 transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5" />
            </svg>
          </button>

          {showProfileMenu && (
            <ul className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[9999]">
              <li className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <img src={adminIcon} alt="Profile" className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">
                      {user?.access_level ? user.access_level.charAt(0).toUpperCase() + user.access_level.slice(1) : 'Staff'}
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
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-gray-700 font-medium"
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
                  className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 text-red-600 font-medium border-t border-gray-100"
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
      />
    </div>
  );
};

export default Navbar;
