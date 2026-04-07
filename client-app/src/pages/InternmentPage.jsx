import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternmentPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';
import lawnLotsImg from '../assets/images/lawn_lots.jpg';
import familyEstateImg from '../assets/images/familt_estate.jpg';
import columbariumImg from '../assets/images/columbarium.jpg';
import intermentImg from '../assets/images/interment.jpg';
import cremationImg from '../assets/images/cremation.jpg';

function InternmentPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(intermentImg);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    productInterest: 'Interment',
    message: '',
    consent: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/api/inquiries/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          product_interest: formData.productInterest,
          message: formData.message,
        }),
      });

      const data = await response.json();
      
      console.log('Response:', response.status, data);

      if (response.ok && data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            productInterest: 'Interment',
            message: '',
            consent: false,
          });
        }, 3000);
      } else {
        console.error('Submission failed:', data);
        alert(`Failed to submit inquiry: ${data.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="internment-page">
      {/* Hero Banner */}
      <div className="internment-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Interment</h1>
        </div>
      </div>

      {/* Description Section */}
      <div className="internment-description">
        <div className="description-content">
          <h2>Interment</h2>
          <p>
            Honoring your departed loved ones by providing them a sacred resting place. 
            Send off with our offer our interment packages to provide for every family's needs.
          </p>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="internment-gallery">
        <div className="gallery-main">
          <img src={selectedImage} alt="Interment Gallery" className="main-image" />
        </div>
        <div className="gallery-thumbnails">
          <img 
            src={intermentImg} 
            alt="Interment" 
            className={`thumbnail ${selectedImage === intermentImg ? 'active' : ''}`}
            onClick={() => setSelectedImage(intermentImg)}
          />
          <img 
            src={lawnLotsImg} 
            alt="Lawn Lots" 
            className={`thumbnail ${selectedImage === lawnLotsImg ? 'active' : ''}`}
            onClick={() => setSelectedImage(lawnLotsImg)}
          />
          <img 
            src={familyEstateImg} 
            alt="Family Estate" 
            className={`thumbnail ${selectedImage === familyEstateImg ? 'active' : ''}`}
            onClick={() => setSelectedImage(familyEstateImg)}
          />
          <img 
            src={columbariumImg} 
            alt="Columbarium" 
            className={`thumbnail ${selectedImage === columbariumImg ? 'active' : ''}`}
            onClick={() => setSelectedImage(columbariumImg)}
          />
          <img 
            src={cremationImg} 
            alt="Cremation" 
            className={`thumbnail ${selectedImage === cremationImg ? 'active' : ''}`}
            onClick={() => setSelectedImage(cremationImg)}
          />
        </div>
      </div>

      {/* Inquiry Form Section */}
      <div className="internment-inquiry">
        <h2>Inquire Now</h2>
        <p className="inquiry-subtitle">Send us a message and we will get back to you as soon as possible.</p>
        
        <form className="inquiry-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row two-cols">
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Contact Number *"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row product-service-row">
            <label className="form-label">Product/Service <span className="required">(REQUIRED)</span></label>
            <input
              type="text"
              name="productInterest"
              value="Interment"
              disabled
              readOnly
            />
          </div>

          <div className="form-row">
            <textarea
              name="message"
              placeholder="Leave a Message... *"
              rows="6"
              value={formData.message}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <p className="form-note">Note: We will reply to you via Gmail or text/call as soon as we see your inquiry. Thank you!</p>

          <div className="form-consent">
            <label className="consent-label">
              <span className="consent-title">Consent <span className="required">(REQUIRED)</span></span>
            </label>
            <label className="consent-checkbox">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                required
              />
              <span>
                By accepting this, you have agreed and understood our <a href="/privacy-policy">privacy policy</a> with regards to your personal information.
              </span>
            </label>
          </div>

          <button type="submit" className="submit-btn">
            {submitted ? 'Submitted!' : 'Submit'}
          </button>
        </form>
      </div>

      {/* Other Products Section */}
      <div className="other-products">
        <h2>Other Products and Services</h2>
        <div className="products-grid">
          <div className="product-card" onClick={() => navigate('/lawn-lots')}>
            <div className="product-card-image">
              <img src={lawnLotsImg} alt="Lawn Lots" />
            </div>
            <div className="product-card-content">
              <h3>Lawn Lots</h3>
              <p>Beautiful garden-style burial spaces</p>
            </div>
          </div>
          <div className="product-card" onClick={() => navigate('/family-estates')}>
            <div className="product-card-image">
              <img src={familyEstateImg} alt="Family Estates" />
            </div>
            <div className="product-card-content">
              <h3>Family Estates</h3>
              <p>Spacious family burial grounds</p>
            </div>
          </div>
          <div className="product-card" onClick={() => navigate('/columbariums')}>
            <div className="product-card-image">
              <img src={columbariumImg} alt="Columbariums" />
            </div>
            <div className="product-card-content">
              <h3>Columbariums</h3>
              <p>Elegant above-ground niches</p>
            </div>
          </div>
          <div className="product-card" onClick={() => navigate('/cremation')}>
            <div className="product-card-image">
              <img src={cremationImg} alt="Cremation" />
            </div>
            <div className="product-card-content">
              <h3>Cremation</h3>
              <p>Respectful cremation services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InternmentPage;
