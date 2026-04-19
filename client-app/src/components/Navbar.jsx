import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaChevronDown, FaClipboardList, FaCreditCard, FaBell, FaSignOutAlt, FaUser } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';
import ProfileModal from './ProfileModal';
import useSiteSettings from '../hooks/useSiteSettings';
import './Navbar.css';

const logo = '/Sanctuario_Logo_Good.png';

function Navbar() {
  const { getSetting } = useSiteSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isOffersDropdownOpen, setIsOffersDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
          <Link to="/home" className="nav-logo">
            <img 
              src={logo}
              alt="Sanctuario De Carmona Memorial Park Logo" 
              className="enlarged-logo"
            />
          </Link>
          
          {/* Desktop navigation links - hidden on mobile */}
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
              <>
                <div ref={notificationRef}>
                  <button
                    className="notification-icon-btn"
                    aria-label="Notifications"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  >
                    <FaBell />
                  </button>
                  
                  <NotificationDropdown 
                    isOpen={isNotificationOpen} 
                    onClose={() => setIsNotificationOpen(false)}
                    buttonRef={notificationRef}
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
              </>
            ) : (
              <div className="auth-buttons">
                <button className="login-btn" onClick={() => navigate('/login')}>{getSetting('nav_login', 'Login')}</button>
                <button className="signup-btn" onClick={() => navigate('/signup')}>{getSetting('nav_signup', 'Sign Up')}</button>
              </div>
            )}
          </div>
          
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
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={closeMobileMenu} 
      />

      {/* Mobile menu */}
      <nav className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <img 
            src={logo}
            alt="Sanctuario De Carmona Memorial Park" 
            className="mobile-menu-logo"
          />
          <button 
            className="mobile-menu-close" 
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            ×
          </button>
        </div>

        <ul className="mobile-menu-list">
          <li>
            <button 
              onClick={() => handleNavClick('/home')}
              className={`mobile-menu-link ${location.pathname === '/home' ? 'active' : ''}`}
            >
              {getSetting('nav_home', 'Home')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/lawn-lots')}
              className={`mobile-menu-link ${location.pathname === '/lawn-lots' ? 'active' : ''}`}
            >
              {getSetting('nav_lawn_lots', 'Lawn Lots')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/family-estates')}
              className={`mobile-menu-link ${location.pathname === '/family-estates' ? 'active' : ''}`}
            >
              {getSetting('nav_family_estates', 'Family Estates')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/columbariums')}
              className={`mobile-menu-link ${location.pathname === '/columbariums' ? 'active' : ''}`}
            >
              {getSetting('nav_columbariums', 'Columbariums')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/internment')}
              className={`mobile-menu-link ${location.pathname === '/internment' ? 'active' : ''}`}
            >
              {getSetting('nav_internment', 'Interment')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/cremation')}
              className={`mobile-menu-link ${location.pathname === '/cremation' ? 'active' : ''}`}
            >
              {getSetting('nav_cremation', 'Cremation')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/about')}
              className={`mobile-menu-link ${location.pathname === '/about' ? 'active' : ''}`}
            >
              {getSetting('nav_about', 'About Us')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/blog')}
              className={`mobile-menu-link ${location.pathname === '/blog' ? 'active' : ''}`}
            >
              {getSetting('nav_blog', 'Blogs')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/contact')}
              className={`mobile-menu-link ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              {getSetting('nav_contact', 'Contact Us')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/team')}
              className={`mobile-menu-link ${location.pathname === '/team' ? 'active' : ''}`}
            >
              {getSetting('mobile_menu_our_team', 'Our Team')}
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleNavClick('/privacy-policy')}
              className={`mobile-menu-link ${location.pathname === '/privacy-policy' ? 'active' : ''}`}
            >
              {getSetting('mobile_menu_privacy', 'Privacy Policy')}
            </button>
          </li>
        </ul>

        <div className="mobile-menu-contact">
          <p className="mobile-contact-phone">
            📞 {getSetting('mobile_menu_phone', '0912-345-6789')}
          </p>
          <p className="mobile-contact-address">
            📍 {getSetting('mobile_menu_address', 'Sanctuario De Carmona Memorial Park, Cavite, Philippines')}
          </p>
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
