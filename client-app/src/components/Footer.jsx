import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import useSettings from '../hooks/useSettings';
import './Footer.css';

const Footer = () => {
  const { getSetting, loading } = useSettings();

  if (loading) {
    return <footer className="footer"><p>Loading...</p></footer>;
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{getSetting('footer_grief_support_title', 'A YEAR OF DAILY GRIEF SUPPORT')}</h3>
          <p>{getSetting('footer_grief_support_text', 'Our support in your time of need does not end after the funeral services. Enter your email below to receive a grief support message from us each day for a year. You can unsubscribe at any time.')}</p>
          <form className="email-form">
            <input type="email" placeholder="Your email" />
            <button type="submit">→</button>
          </form>
        </div>

        <div className="footer-section">
          <h3>{getSetting('footer_location_title', 'OUR LOCATION')}</h3>
          <p>{getSetting('footer_location_address', 'Memorial Park, Calumpang Rd, Carmona, 4116 Cavite')}</p>
          <p>{getSetting('footer_phone', 'Tel: 1-888-881-6131')}</p>
          <p>{getSetting('footer_fax', 'Fax: 1-617-949-5459')}</p>
          <div className="social-links">
            <a href={getSetting('social_facebook', 'https://facebook.com')} target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href={getSetting('social_instagram', 'https://instagram.com')} target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href={getSetting('social_twitter', 'https://twitter.com')} target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href={getSetting('social_youtube', 'https://youtube.com')} target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{getSetting('footer_copyright_text', '© 2025.03 Amandine. All Rights Reserved. Memorial Park Website by Undergraduate IT Students')} | 
          <Link to="/terms"> Terms of Use</Link> | 
          <Link to="/privacy"> Privacy Policy</Link> | 
          <Link to="/accessibility"> Accessibility</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;