import React, { useEffect, useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './SearchModal.css';

/**
 * Full-screen search modal that allows users to quickly navigate to
 * pages in the site based on simple keywords.  
 * The component renders nothing when `isOpen` is false, enabling the
 * parent (e.g. Navbar) to mount it at all times without affecting layout.
 */
function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Close when ESC is pressed
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    const searchMap = [
      // Top-level pages
      { keywords: ['home', 'memorial'], path: '/home' },
      { keywords: ['about', 'about us', 'company'], path: '/about' },
      { keywords: ['contact', 'contact us', 'phone', 'email'], path: '/contact' },
      { keywords: ['privacy', 'policy'], path: '/privacy' },

      // Services overview
      { keywords: ['service', 'services', 'service page'], path: '/services' },

      // Specific services with direct navigation to service details
      { keywords: ['grave maintenance', 'maintenance', 'grave care', 'grave'], path: '/services?service=grave-maintenance' },
      { keywords: ['grave repainting', 'repainting', 'paint', 'grave painting'], path: '/services?service=grave-repainting' },
      { keywords: ['grave restoration', 'restoration', 'restore'], path: '/services?service=grave-restoration' },
      { keywords: ['grave cleaning', 'clean gravesite', 'cleaning', 'clean'], path: '/services?service=grave-maintenance' },
      { keywords: ['grave painting demonstration', 'painting demo', 'painting demonstration'], path: '/services?service=grave-painting-demo' },
      { keywords: ['grave cleaning demonstration', 'cleaning demo', 'cleaning demonstration'], path: '/services?service=grave-cleaning-demo' },

      // Authentication / utility pages
      { keywords: ['login', 'sign in'], path: '/login' },
      { keywords: ['search', 'site search'], path: '/search' },

      // Misc
      { keywords: ['payment', 'pay', 'checkout'], path: '/services' },
      { keywords: ['terms', 'conditions', 'terms and conditions'], path: '/privacy' },
      { keywords: ['faq', 'questions'], path: '/about' },
    ];

    const found = searchMap.find((item) =>
      item.keywords.some((kw) => q.includes(kw))
    );

    if (found) {
      navigate(found.path);
      onClose();
    } else {
      alert('No matching page found.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close search">
          <FaTimes />
        </button>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" aria-label="Search">
            <FaSearch />
          </button>
        </form>
      </div>
    </div>
  );
}

export default SearchModal;
