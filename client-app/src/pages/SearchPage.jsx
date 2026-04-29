import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPhone, FaSearch, FaUserCircle } from 'react-icons/fa';
import { MAIN_LOGO, LOGO_ALT_TEXT, LOGO_CLASSES } from '../config/logoConfig';
import SearchModal from '../components/SearchModal';
import './SearchPage.css';

const searchData = [
  // Add all searchable items here
  {
    type: 'blog',
    title: 'Grave Yard Maintenance',
    keywords: ['grave', 'maintenance', 'yard', 'clean', 'service'],
    path: '/blog/2', // The detail page
  },
  {
    type: 'blog',
    title: 'Caring for Memorial Sites',
    keywords: ['memorial', 'caring', 'sites', 'care'],
    path: '/blog/1',
  },
  {
    type: 'service',
    title: 'Payment for Grave Maintenance',
    keywords: ['payment', 'grave', 'maintenance', 'pay'],
    path: '/services', // Or direct to payment if you have a payment page
  },
  // Add more items as needed
];

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.toLowerCase();
    const found = searchData.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q) || q.includes(k))
    );
    setResults(found);
  };

  const handleGo = (path) => {
    navigate(path);
  };

  return (
    <div className="search-page">
      <nav className="main-nav">
        <div className="nav-container">
          <Link to="/home" className="nav-brand">
            <img src={MAIN_LOGO} alt={LOGO_ALT_TEXT.main} className={LOGO_CLASSES.navLogo} />
          </Link>
          
          <div className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/blog">Blog</Link>
            <a href="tel:+639123456789" className="phone-number">
              <FaPhone /> +63 912 3456 789
            </a>
            <button
              className="search-icon-btn"
              aria-label="Open search"
              onClick={() => setIsSearchOpen(true)}
            >
              <FaSearch />
            </button>
            <button
              className="user-icon-btn"
              aria-label="User menu"
              onClick={() => navigate('/user')}
            >
              <FaUserCircle />
            </button>
          </div>
        </div>
      </nav>
      
      <div className="search-content">
        <h2 className="search-title">Search</h2>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for services, blogs, info..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        <div className="search-results">
          {results.length === 0 && query && <p className="no-results">No results found.</p>}
          {results.map((item, idx) => (
            <div key={idx} className="result-item">
              <div className="result-title">{item.title}</div>
              <div>
                <button
                  onClick={() => handleGo(item.path)}
                  className="result-btn"
                >
                  Go to detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Global search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default SearchPage;
