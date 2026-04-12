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

      {/* Buy Section */}
      <div className="internment-inquiry">
        <h2>Purchase Interment Package</h2>
        <p className="inquiry-subtitle">Select your interment package and proceed to payment.</p>
        
        <div className="buy-section">
          <div className="package-info">
            <h3>Interment Package</h3>
            <p>Complete interment services for your loved one</p>
            <p className="package-price">Price will be calculated at checkout</p>
          </div>
          
          <button 
            className="submit-btn"
            onClick={() => navigate('/payment', { 
              state: { 
                amount: 55000,
                description: 'Interment Package',
                serviceType: 'interment',
                serviceName: 'Interment'
              } 
            })}
          >
            Buy Now
          </button>
        </div>
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
