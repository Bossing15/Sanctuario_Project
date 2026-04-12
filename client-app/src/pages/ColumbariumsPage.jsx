import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternmentPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';
import lawnLotsImg from '../assets/images/lawn_lots.jpg';
import familyEstateImg from '../assets/images/familt_estate.jpg';
import columbariumImg from '../assets/images/columbarium.jpg';
import intermentImg from '../assets/images/interment.jpg';
import cremationImg from '../assets/images/cremation.jpg';

function ColumbariumsPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(columbariumImg);

  return (
    <div className="internment-page">
      <div className="internment-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content"><h1>Columbariums</h1></div>
      </div>
      <div className="internment-description">
        <div className="description-content">
          <h2>Columbariums</h2>
          <p>Our indoor and garden columbariums facilities provide settings where you can feel at peace while honoring your loved ones.</p>
        </div>
      </div>
      <div className="internment-gallery">
        <div className="gallery-main">
          <img src={selectedImage} alt="Columbariums Gallery" className="main-image" />
        </div>
        <div className="gallery-thumbnails">
          <img src={columbariumImg} alt="Columbarium" className={`thumbnail ${selectedImage === columbariumImg ? 'active' : ''}`} onClick={() => setSelectedImage(columbariumImg)} />
          <img src={lawnLotsImg} alt="Lawn Lots" className={`thumbnail ${selectedImage === lawnLotsImg ? 'active' : ''}`} onClick={() => setSelectedImage(lawnLotsImg)} />
          <img src={familyEstateImg} alt="Family Estate" className={`thumbnail ${selectedImage === familyEstateImg ? 'active' : ''}`} onClick={() => setSelectedImage(familyEstateImg)} />
          <img src={intermentImg} alt="Interment" className={`thumbnail ${selectedImage === intermentImg ? 'active' : ''}`} onClick={() => setSelectedImage(intermentImg)} />
          <img src={cremationImg} alt="Cremation" className={`thumbnail ${selectedImage === cremationImg ? 'active' : ''}`} onClick={() => setSelectedImage(cremationImg)} />
        </div>
      </div>
      <div className="internment-inquiry">
        <h2>Purchase Columbariums Package</h2>
        <p className="inquiry-subtitle">Select your columbariums package and proceed to payment.</p>
        <div className="buy-section">
          <div className="package-info">
            <h3>Columbariums Package</h3>
            <p>Elegant above-ground niches for your loved one</p>
            <p className="package-price">Price will be calculated at checkout</p>
          </div>
          <button 
            className="submit-btn"
            onClick={() => navigate('/payment', { 
              state: { 
                amount: 60000,
                description: 'Columbariums Package',
                serviceType: 'columbariums',
                serviceName: 'Columbariums'
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
          <div className="product-card" onClick={() => navigate('/family-estates')}>
            <div className="product-card-image"><img src={familyEstateImg} alt="Family Estates" /></div>
            <div className="product-card-content"><h3>Family Estates</h3><p>Spacious family burial grounds</p></div>
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

export default ColumbariumsPage;
