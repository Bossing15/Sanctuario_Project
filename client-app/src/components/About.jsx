import React from 'react';
import useSettings from '../hooks/useSettings';
import './About.css';

function About() {
  const { getSetting, loading } = useSettings();

  if (loading) {
    return <div className="about"><p>Loading...</p></div>;
  }

  return (
    <div className="about">
      <div className="about-hero">
        <h1>{getSetting('about_title', 'Who We Are')}</h1>
        <p>{getSetting('about_description', 'Discover our story and commitment to excellence')}</p>
      </div>
      <div className="about-content">
        <div className="about-section">
          <h2>{getSetting('about_story_title', 'Our Story')}</h2>
          <p>{getSetting('about_story_content', 'Founded in 2024, Sanctuario De Carmona Memorial Park has been a beacon of peace and tranquility in the heart of Cavite. Our journey began with a simple mission: to create a space where people can find solace, healing, and spiritual growth.')}</p>
        </div>
        <div className="about-section">
          <h2>{getSetting('about_mission_title', 'Our Mission')}</h2>
          <p>{getSetting('about_mission_content', 'We are dedicated to providing a sanctuary where individuals can connect with their inner selves, find peace in nature, and experience spiritual renewal. Through our various programs and services, we aim to foster personal growth and community well-being.')}</p>
        </div>
        <div className="about-section">
          <h2>{getSetting('about_values_title', 'Our Values')}</h2>
          <ul>
            <li>Peace and Tranquility</li>
            <li>Spiritual Growth</li>
            <li>Community Connection</li>
            <li>Environmental Stewardship</li>
            <li>Personal Development</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
