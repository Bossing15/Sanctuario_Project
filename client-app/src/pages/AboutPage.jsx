import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css';
import SearchModal from '../components/SearchModal';
import teamBanner from '../assets/images/bg_our_team.jpg';

function AboutPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="about">
      {/* Tinanggal na yung duplicate navbar - gamitin na lang yung global navbar sa App.jsx */}
      
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className="about-hero" style={{ backgroundImage: `url(${teamBanner})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>About Us</h1>
        </div>
      </div>

      <div className="about-navigation">
        <Link to="/about" className="nav-link active">About Us</Link>
        <span className="separator">|</span>
        <Link to="/team" className="nav-link">Our Team</Link>
        <span className="separator">|</span>
        <Link to="/privacy" className="nav-link">Privacy Policy</Link>
      </div>

      <div className="about-content">
        <p>At Sanctuario De Carmona Memorial Park, we understand the deep emotional connection families have as they care for the resting places of those we've lost. Our mission is simple yet meaningful: to help families maintain clean, peaceful, and dignified gravesites for their loved ones, even when life gets busy or distance makes it difficult. We understand that in today's fast-paced world, it's often challenging to maintain regular maintenance, but as a symbol of respect, remembrance, and ongoing love, that's why we offer thoughtful, reliable, and hands-on grave cleaning services with a personal touch.</p>
        
        <p>From gentle grave cleaning, grass trimming, flower placement, watering, to replacing, each service we provide is done with care, attention to detail, and a heart full of respect. We take pride in visiting plots as if it were our own because we know, every grave holds stories, legacies, and lives well-lived.</p>
        
        <p>We understand the emotional weight of maintaining a loved one's final resting place, but it's okay to ask for help when you need the dignity of a well-maintained space. We take pride in providing these services, but peace of mind, knowing that you're entrusting your loved ones' space to people who genuinely care.</p>
        
        <p>So whether it's a one-time cleaning or regular maintenance, we're here to help you honor their memory beautifully, respectfully, and lovingly.</p>
      </div>

    </div>
  );
}

export default AboutPage;
