import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternmentPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';
import lawnLotsImg from '../assets/images/lawn_lots.jpg';
import familyEstateImg from '../assets/images/familt_estate.jpg';
import columbariumImg from '../assets/images/columbarium.jpg';
import intermentImg from '../assets/images/interment.jpg';
import cremationImg from '../assets/images/cremation.jpg';

function FamilyEstatesPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(familyEstateImg);

  return (
    <div className="internment-page">
      <div className="internment-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content"><h1>Family Estates</h1></div>
      </div>
      <div className="internment-description">
        <div className="description-content">
          <h2>Family Estates</h2>
          <p>Family Estates display luxury and exclusivity allowing you to have a private and secure place for your family's eternal rest.</p>
        </div>
      </div>
      <div className="internment-gallery">
        <div className="gallery-main">
          <img src={selectedImage} alt="Family Estates Gallery" className="main-image" />
        </div>
        <div className="gallery-thumbnails">
          <img src={familyEstateImg} alt="Family Estate" className={`thumbnail ${selectedImage === familyEstateImg ? 'active' : ''}`} onClick={() => setSelectedImage(familyEstateImg)} />
          <img src={lawnLotsImg} alt="Lawn Lots" className={`thumbnail ${selectedImage === lawnLotsImg ? 'active' : ''}`} onClick={() => setSelectedImage(lawnLotsImg)} />
          <img src={columbariumImg} alt="Columbarium" className={`thumbnail ${selectedImage === columbariumImg ? 'active' : ''}`} onClick={() => setSelectedImage(columbariumImg)} />
          <img src={intermentImg} alt="Interment" className={`thumbnail ${selectedImage === intermentImg ? 'active' : ''}`} onClick={() => setSelectedImage(intermentImg)} />
          <img src={cremationImg} alt="Cremation" className={`thumbnail ${selectedImage === cremationImg ? 'active' : ''}`} onClick={() => setSelectedImage(cremationImg)} />
        </div>
      </div>
      <div className="internment-inquiry">
        <h2>Purchase Family Estates Package</h2>
        <p className="inquiry-subtitle">Select your family estates package and proceed to payment.</p>
        <div className="buy-section">
          <div className="package-info">
            <h3>Family Estates Package</h3>
            <p>Spacious family burial grounds for your loved ones</p>
            <p className="package-price">Price will be calculated at checkout</p>
          </div>
          <button 
            className="submit-btn"
            onClick={() => navigate('/payment', { 
              state: { 
                amount: 75000,
                description: 'Family Estates Package',
                serviceType: 'family_estates',
                serviceName: 'Family Estates'
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
          <div className="product-card" onClick={() => navigate('/lawn-lots')}>
            <div className="product-card-image"><img src={lawnLotsImg} alt="Lawn Lots" /></div>
            <div className="product-card-content"><h3>Lawn Lots</h3><p>Beautiful garden-style burial spaces</p></div>
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

export default FamilyEstatesPage;
