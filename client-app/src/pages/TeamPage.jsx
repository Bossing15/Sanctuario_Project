import React from 'react';
import { Link } from 'react-router-dom';
import teamBanner from '../assets/images/bg_our_team.jpg';
import './TeamPage.css';

function TeamPage() {
  return (
    <div className="team-page">
      {/* Header section with team banner */}
      <div className="team-banner" style={{ backgroundImage: `url(${teamBanner})` }}>
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h1>Our Team</h1>
          <p>Meet the dedicated professionals behind Sanctuario De Carmona Memorial Park</p>
        </div>
      </div>

      {/* Sub-navigation below banner */}
      <div className="about-navigation">
        <Link to="/about" className="nav-link">About Us</Link>
        <span className="separator">|</span>
        <Link to="/team" className="nav-link active">Our Team</Link>
        <span className="separator">|</span>
        <Link to="/privacy" className="nav-link">Privacy Policy</Link>
      </div>

      {/* Team content section */}
      <div className="page-container">
        <div className="team-intro">
          <h2>Working Together to Honor Your Loved Ones</h2>
          <p>At Sanctuario De Carmona Memorial Park, we believe that love doesn't end at goodbye; it continues in the way we honor and remember those we've lost. Our mission is simple yet meaningful: to provide clean, peaceful, and dignified gravesites for their loved ones, even when life gets busy or distance makes it challenging to visit a loved one's memorial regularly.</p>
          <p>Our team is committed to making grave care easier for families, especially those who are far away, busy, or simply want to give their loved ones the dignity of a well-maintained memorial. We take pride in providing not just services, but peace of mind, knowing that you're entrusting your loved ones' space to people who genuinely care.</p>
        </div>

        {/* Team members section */}
        <div className="team-members">
          <div className="team-member">
            <div className="member-image">
              {/* Placeholder for team member image */}
              <div className="image-placeholder"></div>
            </div>
            <div className="member-info">
              <h3>Juan Dela Cruz</h3>
              <p className="member-title">Founder & CEO</p>
              <p className="member-bio">With over 15 years of experience in memorial services, Juan founded Sanctuario De Carmona Memorial Park with a vision to provide dignified and compassionate care for gravesites.</p>
            </div>
          </div>

          <div className="team-member">
            <div className="member-image">
              {/* Placeholder for team member image */}
              <div className="image-placeholder"></div>
            </div>
            <div className="member-info">
              <h3>Maria Santos</h3>
              <p className="member-title">Operations Manager</p>
              <p className="member-bio">Maria ensures that all our services are delivered with the highest standards of care and respect. She oversees our daily operations and staff training.</p>
            </div>
          </div>

          <div className="team-member">
            <div className="member-image">
              {/* Placeholder for team member image */}
              <div className="image-placeholder"></div>
            </div>
            <div className="member-info">
              <h3>Pedro Reyes</h3>
              <p className="member-title">Grounds Supervisor</p>
              <p className="member-bio">Pedro leads our grounds maintenance team, bringing expertise in landscaping and memorial care to ensure each site receives personalized attention.</p>
            </div>
          </div>

          <div className="team-member">
            <div className="member-image">
              {/* Placeholder for team member image */}
              <div className="image-placeholder"></div>
            </div>
            <div className="member-info">
              <h3>Ana Lim</h3>
              <p className="member-title">Customer Relations</p>
              <p className="member-bio">Ana is dedicated to providing compassionate support to families, helping them select the right services and addressing any concerns with empathy.</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default TeamPage;
