import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternmentPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';
import lawnLotsImg from '../assets/images/lawn_lots.jpg';
import familyEstateImg from '../assets/images/familt_estate.jpg';
import columbariumImg from '../assets/images/columbarium.jpg';
import intermentImg from '../assets/images/interment.jpg';
import cremationImg from '../assets/images/cremation.jpg';

function LawnLotsPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(lawnLotsImg);

  return (
    <div className="internment-page">
      <div className="internment-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content"><h1>Lawn Lots</h1></div>
      </div>
      <div className="internment-description">
        <div className="description-content">
          <h2>Lawn Lots</h2>
          <p>Lawn Lots are the most basic type and at the same time most economical burial option for families seeking a peaceful resting place.</p>
        </div>
      </div>
      <div className="internment-gallery">
        <div className="gallery-main">
          <img src={selectedImage} alt="Lawn Lots Gallery" className="main-image" />
        </div>
        <div className="gallery-thumbnails">
          <img src={lawnLotsImg} alt="Lawn Lots" className={`thumbnail ${selectedImage === lawnLotsImg ? 'active' : ''}`} onClick={() => setSelectedImage(lawnLotsImg)} />
          <img src={familyEstateImg} alt="Family Estate" className={`thumbnail ${selectedImage === familyEstateImg ? 'active' : ''}`} onClick={() => setSelectedImage(familyEstateImg)} />
          <img src={columbariumImg} alt="Columbarium" className={`thumbnail ${selectedImage === columbariumImg ? 'active' : ''}`} onClick={() => setSelectedImage(columbariumImg)} />
          <img src={intermentImg} alt="Interment" className={`thumbnail ${selectedImage === intermentImg ? 'active' : ''}`} onClick={() => setSelectedImage(intermentImg)} />
          <img src={cremationImg} alt="Cremation" className={`thumbnail ${selectedImage === cremationImg ? 'active' : ''}`} onClick={() => setSelectedImage(cremationImg)} />
        </div>
      </div>
      <div className="internment-inquiry">
        <h2>Purchase Lawn Lots Package</h2>
        <p className="inquiry-subtitle">Select your lawn lots package and proceed to payment.</p>
        <div className="buy-section">
          <div className="package-info">
            <h3>Lawn Lots Package</h3>
            <p>Beautiful garden-style burial spaces for your loved one</p>
            <p className="package-price">Price will be calculated at checkout</p>
          </div>
          <button 
            className="submit-btn"
            onClick={() => navigate('/payment', { 
              state: { 
                amount: 50000,
                description: 'Lawn Lots Package',
                serviceType: 'lawn_lots',
                serviceName: 'Lawn Lots'
              } 
            })}
          >
            Buy Now
          </button>
        </div>
      </div>
      <div className="other-products">
        <h2>Other Products and Services</h2>
        <div className="products-grid">
          <div className="product-card" onClick={() => navigate('/family-estates')}>
            <div className="product-card-image"><img src={familyEstateImg} alt="Family Estates" /></div>
            <div className="product-card-content"><h3>Family Estates</h3><p>Spacious family burial grounds</p></div>
          </div>
          <div className="product-card" onClick={() => navigate('/columbariums')}>
            <div className="product-card-image"><img src={columbariumImg} alt="Columbariums" /></div>
            <div className="product-card-content"><h3>Columbariums</h3><p>Elegant above-ground niches</p></div>
          </div>
          <div className="product-card" onClick={() => navigate('/internment')}>
            <div className="product-card-image"><img src={intermentImg} alt="Interment" /></div>
            <div className="product-card-content"><h3>Interment</h3><p>Honoring your departed loved ones</p></div>
          </div>
          <div className="product-card" onClick={() => navigate('/cremation')}>
            <div className="product-card-image"><img src={cremationImg} alt="Cremation" /></div>
            <div className="product-card-content"><h3>Cremation</h3><p>Respectful cremation services</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LawnLotsPage;
