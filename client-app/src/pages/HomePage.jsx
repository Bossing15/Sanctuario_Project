import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import SearchModal from '../components/SearchModal';
import useSiteSettings from '../hooks/useSiteSettings';

function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { getSetting, loading: settingsLoading } = useSiteSettings();
  
  // Refs for animation elements
  const quickEasyHeaderRef = useRef(null);
  const processStepsRef = useRef(null);
  const caretakersHeaderRef = useRef(null);
  const caretakerFeaturesRef = useRef(null);
  const whoWeAreTextRef = useRef(null);
  const whoWeAreImageRef = useRef(null);
  const servicesHeaderRef = useRef(null);
  const servicesListRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          // Add animate class to trigger animations
          if (element.classList.contains('quick-easy-header')) {
            element.classList.add('animate');
          }
          
          if (element.classList.contains('caretakers-header')) {
            element.classList.add('animate');
          }

          if (element.classList.contains('who-we-are-text')) {
            element.classList.add('animate');
          }

          if (element.classList.contains('who-we-are-image')) {
            element.classList.add('animate');
          }

          if (element.classList.contains('services-header')) {
            element.classList.add('animate');
          }
          
          // Animate process steps
          if (element.classList.contains('process-steps')) {
            const steps = element.querySelectorAll('.process-step');
            const stepNumbers = element.querySelectorAll('.step-number');
            
            steps.forEach((step, index) => {
              setTimeout(() => {
                step.classList.add('animate');
              }, index * 100);
            });
            
            stepNumbers.forEach((stepNumber, index) => {
              setTimeout(() => {
                stepNumber.classList.add('animate');
              }, index * 100 + 150);
            });
          }
          
          // Animate caretaker features
          if (element.classList.contains('caretakers-features')) {
            const features = element.querySelectorAll('.caretaker-feature');
            const icons = element.querySelectorAll('.feature-icon');
            
            features.forEach((feature, index) => {
              setTimeout(() => {
                feature.classList.add('animate');
              }, index * 100);
            });
            
            icons.forEach((icon, index) => {
              setTimeout(() => {
                icon.classList.add('animate');
              }, index * 100 + 200);
            });
          }

          // Animate services list items
          if (element.classList.contains('services-list')) {
            const items = element.querySelectorAll('.services-list li');
            items.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('animate');
              }, index * 80);
            });
          }
        } else {
          // Reset animations when element goes out of view
          if (element.classList.contains('quick-easy-header')) {
            element.classList.remove('animate');
          }
          
          if (element.classList.contains('caretakers-header')) {
            element.classList.remove('animate');
          }

          if (element.classList.contains('who-we-are-text')) {
            element.classList.remove('animate');
          }

          if (element.classList.contains('who-we-are-image')) {
            element.classList.remove('animate');
          }

          if (element.classList.contains('services-header')) {
            element.classList.remove('animate');
          }
          
          // Reset process steps
          if (element.classList.contains('process-steps')) {
            const steps = element.querySelectorAll('.process-step');
            const stepNumbers = element.querySelectorAll('.step-number');
            
            steps.forEach((step) => {
              step.classList.remove('animate');
            });
            
            stepNumbers.forEach((stepNumber) => {
              stepNumber.classList.remove('animate');
            });
          }
          
          // Reset caretaker features
          if (element.classList.contains('caretakers-features')) {
            const features = element.querySelectorAll('.caretaker-feature');
            const icons = element.querySelectorAll('.feature-icon');
            
            features.forEach((feature) => {
              feature.classList.remove('animate');
            });
            
            icons.forEach((icon) => {
              icon.classList.remove('animate');
            });
          }

          // Reset services list items
          if (element.classList.contains('services-list')) {
            const items = element.querySelectorAll('.services-list li');
            items.forEach((item) => {
              item.classList.remove('animate');
            });
          }
        }
      });
    }, observerOptions);

    // Observe elements
    if (quickEasyHeaderRef.current) observer.observe(quickEasyHeaderRef.current);
    if (processStepsRef.current) observer.observe(processStepsRef.current);
    if (caretakersHeaderRef.current) observer.observe(caretakersHeaderRef.current);
    if (caretakerFeaturesRef.current) observer.observe(caretakerFeaturesRef.current);
    if (whoWeAreTextRef.current) observer.observe(whoWeAreTextRef.current);
    if (whoWeAreImageRef.current) observer.observe(whoWeAreImageRef.current);
    if (servicesHeaderRef.current) observer.observe(servicesHeaderRef.current);
    if (servicesListRef.current) observer.observe(servicesListRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="hero-content">
          <h1>{getSetting('homepage_title', 'Welcome to Sanctuario De Carmona Memorial Park')}</h1>
          <p className="hero-subtitle">{getSetting('homepage_subtitle', 'Your sanctuary for peace and tranquility in the heart of Cavite')}</p>
          <button 
            className="explore-services-button"
            onClick={() => navigate('/properties-services')}
          >
            Explore Our Products & Services
          </button>
        </div>
      </div>

      {/* Vertical image holder section below the hero */}
      <div className="image-holder-section">
        {/* Quick and Easy Section */}
        <div className="feature-card quick-easy-section">
          <div className="quick-easy-content">
            <div className="quick-easy-header" ref={quickEasyHeaderRef}>
              <span className="quick-easy-label">PROCESS</span>
              <h2 className="quick-easy-title">Quick & Easy</h2>
              <p className="quick-easy-subtitle">Memorial Planning Process</p>
            </div>
            
            <div className="process-steps" ref={processStepsRef}>
              <div className="process-step">
                <div className="step-number">1</div>
                <h3>Services</h3>
                <p>We provide comprehensive memorial services designed to honor your loved ones with dignity and respect.</p>
              </div>
              
              <div className="process-step">
                <div className="step-number">2</div>
                <h3>Clean</h3>
                <p>Our professional caretakers maintain pristine conditions with regular cleaning and landscaping services.</p>
              </div>
              
              <div className="process-step">
                <div className="step-number">3</div>
                <h3>Relax</h3>
                <p>Find peace of mind knowing your loved one's resting place is cared for with the utmost respect and attention.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Caretakers Section */}
        <div className="feature-card caretakers-section">
          <div className="caretakers-content">
            <div className="caretakers-header" ref={caretakersHeaderRef}>
              <span className="caretakers-label">THE CARETAKERS</span>
              <h2 className="caretakers-title">We Have Experienced & Expert Caretakers</h2>
            </div>
            
            <div className="caretakers-features" ref={caretakerFeaturesRef}>
              <div className="caretaker-feature">
                <div className="feature-icon satisfaction-icon">
                  <img src={require('../assets/images/customer-satisfaction.png')} alt="Customer Satisfaction" className="icon-image" />
                </div>
                <h3>100% Satisfaction Guarantee</h3>
                <p>If you're not happy with our maintenance and cleaning, we'll be back to fix the missed areas for free.</p>
              </div>
              
              <div className="caretaker-feature">
                <div className="feature-icon experience-icon">
                  <img src={require('../assets/images/farming.png')} alt="Experienced Caretakers" className="icon-image" />
                </div>
                <h3>Experienced Caretakers</h3>
                <p>Our caretakers are experienced with more than a decade of experience, to make sure that your loved one's grave is in safe hands.</p>
              </div>
              
              <div className="caretaker-feature">
                <div className="feature-icon equipment-icon">
                  <img src={require('../assets/images/review.png')} alt="Equipment & Supplies" className="icon-image" />
                </div>
                <h3>Equipment & Supplies Provided</h3>
                <p>Our caretakers provide all the essential equipment & supplies needed for proper maintenance and care.</p>
              </div>
            </div>
            
            <div className="caretakers-stats">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Graves maintained</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">10+</div>
                <div className="stat-label">years experience</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Who We Are Section */}
        <div className="feature-card who-we-are-section">
          <div className="who-we-are-content">
            <div className="who-we-are-text" ref={whoWeAreTextRef}>
              <span className="who-we-are-label">ABOUT US</span>
              <h2 className="who-we-are-title">{getSetting('about_title', 'Who We Are')}</h2>
              <p className="who-we-are-description">
                {getSetting('about_description', 'Sanctuario De Carmona Memorial Park is a peaceful sanctuary dedicated to honoring the memory of your loved ones. With over a decade of experience, we provide compassionate care and professional services in a serene environment.')}
              </p>
              <p className="who-we-are-description">
                Our commitment extends beyond just providing burial services. We create lasting 
                memorials that celebrate life and provide comfort to families during their time 
                of need. Every detail is handled with respect, dignity, and the utmost care.
              </p>
              <button 
                className="who-we-are-button"
                onClick={() => navigate('/about')}
              >
                Learn More About Us
              </button>
            </div>
            <div className="who-we-are-image" ref={whoWeAreImageRef}>
              <img src={require('../assets/images/bg_our_team.jpg')} alt="Sanctuario De Carmona Memorial Park" />
            </div>
          </div>
        </div>

        {/* Services Section with Text - Moved to Bottom */}
        <div className="feature-card services-section">
          <div className="services-content">
            <div className="services-header" ref={servicesHeaderRef}>
              <h2 className="services-title">{getSetting('services_title', 'Our Products & Services')}</h2>
              <p className="services-description">
                {getSetting('services_description', 'At Sanctuario De Carmona Memorial Park, we provide comprehensive memorial products and services designed to honor your loved ones with dignity and respect. Our peaceful sanctuary offers a tranquil environment for remembrance and reflection.')}
              </p>
            </div>
            <ul className="services-list" ref={servicesListRef}>
              <li>Memorial Lots & Burial Services</li>
              <li>Columbarium & Cremation Services</li>
              <li>Memorial Planning & Consultation</li>
              <li>Maintenance & Landscaping</li>
              <li>24/7 Security & Care</li>
            </ul>
            <button 
              className="services-button"
              onClick={() => navigate('/properties-services')}
            >
              Explore Our Products & Services
            </button>
          </div>
        </div>
      </div>

      {/* Global search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default HomePage;
