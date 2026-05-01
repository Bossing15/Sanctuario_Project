import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaChevronDown, FaClipboardList, FaCreditCard, FaBell, FaSignOutAlt, FaUser } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';
import ProfileModal from './ProfileModal';
import useSiteSettings from '../hooks/useSiteSettings';
import { MAIN_LOGO, LOGO_ALT_TEXT } from '../config/logoConfig';
import './Navbar.css';

function Navbar() {
  const { getSetting } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isOffersDropdownOpen, setIsOffersDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const offersDropdownRef = useRef(null);
  const notificationRef = useRef(null);
  
  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('authToken');
  const userName = localStorage.getItem('userName') || 'User';



  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (offersDropdownRef.current && !offersDropdownRef.current.contains(event.target)) {
        setIsOffersDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfileMenuClick = (action) => {
    setIsProfileDropdownOpen(false);
    
    switch (action) {
      case 'profile':
        setIsProfileModalOpen(true);
        break;
      case 'maintenance-requests':
        navigate('/my-maintenance-requests');
        break;
      case 'my-purchases':
        navigate('/my-purchases');
        break;
      case 'billing':
        navigate('/billing');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'logout':
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('profilePictureUrl');
        navigate('/login');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <nav className={`navbar${isMobileMenuOpen ? ' open' : ''}${isScrolled ? ' scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo on the left */}
          <Link to="/home" className="nav-logo-container">
            <img 
              src={MAIN_LOGO}
              alt={LOGO_ALT_TEXT.main}
              className="navbar-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </Link>

          {/* Mobile hamburger menu button */}
          <div
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <div className={`hamburger${isMobileMenuOpen ? ' open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          {/* Desktop navigation links - moved to right side */}
          <div className={`nav-links${isMobileMenuOpen ? ' open' : ''}`}>
            <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>{getSetting('nav_home', 'Home')}</Link>
            
            <div 
              className="nav-dropdown" 
              ref={offersDropdownRef}
              onMouseEnter={() => setIsOffersDropdownOpen(true)}
              onMouseLeave={() => setIsOffersDropdownOpen(false)}
            >
              <Link 
                to="/products-services"
                className={`nav-dropdown-btn ${location.pathname === '/products-services' || location.pathname === '/lawn-lots' || location.pathname === '/family-estates' || location.pathname === '/columbariums' || location.pathname === '/internment' || location.pathname === '/cremation' || location.pathname === '/maintenance' ? 'active' : ''}`}
                onClick={() => setIsOffersDropdownOpen(false)}
              >
                {getSetting('nav_products_services', 'Products & Services')} <FaChevronDown className={`nav-chevron ${isOffersDropdownOpen ? 'open' : ''}`} />
              </Link>
              {isOffersDropdownOpen && (
                <div className="dropdown-menu-custom">
                  <div className="dropdown-section">
                    <div className="dropdown-title">{getSetting('nav_dropdown_products', 'Products')}</div>
                    <Link to="/lawn-lots" className="dropdown-link" onClick={() => setIsOffersDropdownOpen(false)}>{getSetting('nav_lawn_lots', 'Lawn Lots')}</Link>
                    <Link to="/family-estates" className="dropdown-link" onClick={() => setIsOffersDropdownOpen(false)}>{getSetting('nav_family_estates', 'Family Estates')}</Link>
                    <Link to="/columbariums" className="dropdown-link" onClick={() => setIsOffersDropdownOpen(false)}>{getSetting('nav_columbariums', 'Columbariums')}</Link>
                  </div>
                  <div className="dropdown-section">
                    <div className="dropdown-title">{getSetting('nav_dropdown_services', 'Services')}</div>
                    <Link to="/internment" className="dropdown-link" onClick={() => setIsOffersDropdownOpen(false)}>{getSetting('nav_internment', 'Interment')}</Link>
                    <Link to="/cremation" className="dropdown-link" onClick={() => setIsOffersDropdownOpen(false)}>{getSetting('nav_cremation', 'Cremation')}</Link>
                    <Link to="/maintenance" className="dropdown-link" onClick={() => setIsOffersDropdownOpen(false)}>{getSetting('nav_maintenance', 'Maintenance')}</Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>{getSetting('nav_about', 'About us')}</Link>
            <Link to="/payments" className={location.pathname === '/payments' ? 'active' : ''}>{getSetting('nav_payments', 'Payments')}</Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>{getSetting('nav_contact', 'Contact us')}</Link>
            <Link to="/blog" className={location.pathname === '/blog' ? 'active' : ''}>{getSetting('nav_blog', 'Blogs')}</Link>
          </div>
          
          <div className="nav-contact-search">
            {isLoggedIn ? (
              <div className="right-section">
                <div ref={notificationRef}>
                  <button
                    className="notification-icon-btn"
                    aria-label="Notifications"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <FaBell />
                    {hasUnreadNotifications && (
                      <span className="notification-unread-badge"></span>
                    )}
                  </button>
                  
                  <NotificationDropdown 
                    isOpen={isNotificationOpen} 
                    onClose={() => setIsNotificationOpen(false)}
                    buttonRef={notificationRef}
                    onUnreadStatusChange={setHasUnreadNotifications}
                  />
                </div>
                
                <div className="profile-dropdown-container" ref={dropdownRef}>
                  <button
                    className="profile-btn"
                    aria-label="Profile menu"
                    onClick={toggleProfileDropdown}
                  >
                    <FaUserCircle />
                    <span className="user-name-display">{userName}</span>
                    <FaChevronDown className={`chevron-icon ${isProfileDropdownOpen ? 'open' : ''}`} />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown">
                      <div className="profile-dropdown-header">
                        <div className="profile-avatar-container">
                          <FaUserCircle className="profile-avatar" />
                        </div>
                        <div className="profile-info">
                          <span className="profile-name">{userName}</span>
                          <span className="profile-email">{localStorage.getItem('userEmail') || 'No email available'}</span>
                        </div>
                      </div>
                  
                  <div className="profile-dropdown-divider"></div>
                  
                  <div className="profile-dropdown-menu">
                    <button 
                      className="profile-menu-item"
                      onClick={() => handleProfileMenuClick('profile')}
                    >
                      <FaUser className="menu-icon" />
                      <span>{getSetting('profile_menu_my_profile', 'My Profile')}</span>
                    </button>
                    
                    <button 
                      className="profile-menu-item"
                      onClick={() => handleProfileMenuClick('maintenance-requests')}
                    >
                      <FaClipboardList className="menu-icon" />
                      <span>{getSetting('profile_menu_maintenance', 'My Requests')}</span>
                    </button>
                    
                    <button 
                      className="profile-menu-item"
                      onClick={() => handleProfileMenuClick('billing')}
                    >
                      <FaCreditCard className="menu-icon" />
                      <span>{getSetting('profile_menu_billing', 'Billing & Payments')}</span>
                    </button>
                    
                    <div className="profile-dropdown-divider"></div>
                    
                    <button 
                      className="profile-menu-item logout-item"
                      onClick={() => handleProfileMenuClick('logout')}
                    >
                      <FaSignOutAlt className="menu-icon" />
                      <span>{getSetting('profile_menu_logout', 'Logout')}</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="login-btn" onClick={() => navigate('/login')}>{getSetting('nav_login', 'Login')}</button>
                <button className="signup-btn" onClick={() => navigate('/signup')}>{getSetting('nav_signup', 'Sign Up')}</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div 
        className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMobileMenu} 
      />

      {/* Mobile sidebar menu */}
      <nav className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <button 
            className="mobile-sidebar-close" 
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-sidebar-menu">
          <button 
            onClick={() => handleNavClick('/home')}
            className={`mobile-sidebar-item ${location.pathname === '/home' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_home', 'Home')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/lawn-lots')}
            className={`mobile-sidebar-item ${location.pathname === '/lawn-lots' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_lawn_lots', 'Lawn Lots')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/family-estates')}
            className={`mobile-sidebar-item ${location.pathname === '/family-estates' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_family_estates', 'Family Estates')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/columbariums')}
            className={`mobile-sidebar-item ${location.pathname === '/columbariums' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_columbariums', 'Columbariums')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/internment')}
            className={`mobile-sidebar-item ${location.pathname === '/internment' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_internment', 'Interment')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/cremation')}
            className={`mobile-sidebar-item ${location.pathname === '/cremation' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_cremation', 'Cremation')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/about')}
            className={`mobile-sidebar-item ${location.pathname === '/about' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_about', 'About Us')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/blog')}
            className={`mobile-sidebar-item ${location.pathname === '/blog' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_blog', 'Blogs')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/contact')}
            className={`mobile-sidebar-item ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('nav_contact', 'Contact Us')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/team')}
            className={`mobile-sidebar-item ${location.pathname === '/team' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('mobile_menu_our_team', 'Our Team')}</span>
          </button>
          <button 
            onClick={() => handleNavClick('/privacy-policy')}
            className={`mobile-sidebar-item ${location.pathname === '/privacy-policy' ? 'active' : ''}`}
          >
            <span className="mobile-sidebar-item-label">{getSetting('mobile_menu_privacy', 'Privacy Policy')}</span>
          </button>
        </div>
      </nav>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </>
  );
}

export default Navbar;
