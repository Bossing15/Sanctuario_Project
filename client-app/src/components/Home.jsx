import React from 'react';
import { Link } from 'react-router-dom';
import useSettings from '../hooks/useSettings';
import './Home.css';

function Home() {
  const { getSetting, loading } = useSettings();

  if (loading) {
    return <div className="home"><p>Loading...</p></div>;
  }

  return (
    <div className="home">
      <h1>{getSetting('homepage_title', 'Welcome to Sanctuario De Carmona Memorial Park')}</h1>
      <p>{getSetting('homepage_subtitle', 'Your sanctuary for peace and tranquility in the heart of Cavite')}</p>
      <div className="cta-buttons">
        <Link to="/services" className="cta-button primary">{getSetting('services_cta_text', 'Explore Our Services')}</Link>
        <Link to="/contact" className="cta-button secondary">{getSetting('contact_cta_text', 'Contact Us')}</Link>
      </div>
    </div>
  );
}

export default Home;