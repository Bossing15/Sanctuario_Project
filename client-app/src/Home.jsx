import React from 'react';
import './styles.css';

const Home = () => {
  return (
    <div className="container">
      s
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src="/main_icon.jpg" alt="Sanctuario De Carmona Memorial Park Logo" className="enlarged-logo" />
        </div>
        <nav className="nav">
          <a href="#services" className="nav-link">Services</a>
          <a href="#about" className="nav-link">About us</a>
          <a href="#contact" className="nav-link">Contact us</a>
          <a href="#blog" className="nav-link">Blog</a>
          <div className="phone-number">
            <img src="/phone-icon.svg" alt="phone" />
            +63 9123456789
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Honoring Memories with Care</h1>
          <p>
            We ensure that your loved ones' resting places remain clean, well-maintained, and
            dignified. Let us handle the care, so you can focus on cherishing their memory.
          </p>
          <button className="primary-button">Our Services</button>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-section">
        <h2>Quick and Easy</h2>
        <div className="service-cards">
          <div className="service-card">
            <img src="/services-icon.svg" alt="Services" />
            <h3>Services</h3>
            <p>Choose services that are needed for the cleanliness of your loved one's grave.</p>
          </div>
          <div className="service-card">
            <img src="/clean-icon.svg" alt="Clean" />
            <h3>Clean</h3>
            <p>Our seasoned team of full-time caretakers will clean & maintain your loved one's grave.</p>
          </div>
          <div className="service-card">
            <img src="/relax-icon.svg" alt="Relax" />
            <h3>Relax</h3>
            <p>We take care of your loved ones' resting places, keeping them clean, well-maintained, and dignified.</p>
          </div>
        </div>
      </section>

        {/* Caretakers Info */}
      <section className="caretakers-section">
        <h2>We Have Experienced & Expert Caretakers</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>100% Satisfaction Guarantee</h3>
            <p>If you're not happy with our maintenance and cleaning, we'll be back to fix the missed areas for free.</p>
          </div>
          <div className="feature-card">
            <h3>Experienced Caretakers</h3>
            <p>Our caretakers are experienced with more than a decade of experience, to make sure that your loved one's grave is in safe hands.</p>
          </div>
          <div className="feature-card">
            <h3>Equipment & Supplies Provided</h3>
            <p>Our caretakers provide all the essential equipment & supplies.</p>
          </div>
        </div>
        <div className="stats">
          <div className="stat-item">
            <h2>1000+</h2>
            <p>Graves maintained</p>
          </div>
          <div className="stat-item">
            <h2>10+</h2>
            <p>Years of experience</p>
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="services-showcase">
        <h2>Here's what we can do for your loved one's resting place</h2>
        <div className="services-grid">
          <div className="service-item">
            <img src="/grass-cutting.jpg" alt="Grass Cutting" />
            <h3>Grass Cutting</h3>
            <button className="learn-more-btn">Learn more</button>
          </div>
          <div className="service-item">
            <img src="/grass-watering.jpg" alt="Grass Watering" />
            <h3>Grass Watering</h3>
            <button className="learn-more-btn">Learn more</button>
          </div>
          <div className="service-item">
            <img src="/grass-growing.jpg" alt="Grass Growing" />
            <h3>Grass Growing</h3>
            <button className="learn-more-btn">Learn more</button>
          </div>
          <div className="service-item">
            <img src="/grave-cleaning.jpg" alt="Grave Cleaning" />
            <h3>Grave Cleaning</h3>
            <button className="learn-more-btn">Learn more</button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
