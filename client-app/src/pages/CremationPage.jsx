import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternmentPage.css';
import LoginPromptModal from '../components/LoginPromptModal';
import PaymentModal from '../components/PaymentModal';
import heroBg from '../assets/images/Sanctuario3_1.jpg';
import lawnLotsImg from '../assets/images/lawn_lots.jpg';
import familyEstateImg from '../assets/images/familt_estate.jpg';
import columbariumImg from '../assets/images/columbarium.jpg';
import intermentImg from '../assets/images/interment.jpg';
import cremationImg from '../assets/images/cremation.jpg';

function CremationPage() {
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedImage, setSelectedImage] = useState(cremationImg);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/public/products', {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const cremation = data.products?.find(p => p.title === 'Cremation') || data.find(p => p.title === 'Cremation');
        setProduct(cremation);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (product) {
      setShowPricingModal(true);
    }
  };

  const handleSelectPlan = (planType, amount) => {
    setSelectedPlan({ planType, amount });
    setShowPricingModal(false);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };



  return (
    <div className="internment-page">
      <div className="internment-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Cremation</h1>
        </div>
      </div>

      <div className="internment-description">
        <div className="description-content">
          <h2>Cremation</h2>
          <p>
            At the time to embrace a modern way in the country, we are proud to offer our cremation services
            with dignity and respect for your loved ones.
          </p>
        </div>
      </div>

      <div className="internment-gallery">
        <div className="gallery-main">
          <img src={selectedImage} alt="Cremation Gallery" className="main-image" />
        </div>
        <div className="gallery-thumbnails">
          <img src={cremationImg} alt="Cremation" className={`thumbnail ${selectedImage === cremationImg ? 'active' : ''}`} onClick={() => setSelectedImage(cremationImg)} />
          <img src={intermentImg} alt="Interment" className={`thumbnail ${selectedImage === intermentImg ? 'active' : ''}`} onClick={() => setSelectedImage(intermentImg)} />
          <img src={lawnLotsImg} alt="Lawn Lots" className={`thumbnail ${selectedImage === lawnLotsImg ? 'active' : ''}`} onClick={() => setSelectedImage(lawnLotsImg)} />
          <img src={familyEstateImg} alt="Family Estate" className={`thumbnail ${selectedImage === familyEstateImg ? 'active' : ''}`} onClick={() => setSelectedImage(familyEstateImg)} />
          <img src={columbariumImg} alt="Columbarium" className={`thumbnail ${selectedImage === columbariumImg ? 'active' : ''}`} onClick={() => setSelectedImage(columbariumImg)} />
        </div>
      </div>

      <div className="internment-inquiry">
        <h2>Purchase Cremation Package</h2>
        <p className="inquiry-subtitle">Select your cremation package and proceed to payment.</p>
        
        <div className="buy-section">
          <div className="package-info">
            <h3>Cremation Package</h3>
            <p>Complete cremation services for your loved one</p>
            {loading ? (
              <p className="package-price">Loading pricing...</p>
            ) : product ? (
              <div className="pricing-options">
                {product.price_monthly && (
                  <div className="price-row">
                    <span>Monthly Price (₱)</span>
                    <span className="price-value">₱{parseFloat(product.price_monthly).toFixed(2)}</span>
                  </div>
                )}
                {product.price_quarterly && (
                  <div className="price-row">
                    <span>Quarterly Price (₱)</span>
                    <span className="price-value">₱{parseFloat(product.price_quarterly).toFixed(2)}</span>
                  </div>
                )}
                {product.price_yearly && (
                  <div className="price-row">
                    <span>Yearly Price (₱)</span>
                    <span className="price-value">₱{parseFloat(product.price_yearly).toFixed(2)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="package-price">Price will be calculated at checkout</p>
            )}
          </div>
          
          <button 
            className="submit-btn"
            onClick={handleBuyNow}
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
          <div className="product-card" onClick={() => navigate('/columbariums')}>
            <div className="product-card-image"><img src={columbariumImg} alt="Columbariums" /></div>
            <div className="product-card-content"><h3>Columbariums</h3><p>Elegant above-ground niches</p></div>
          </div>
          <div className="product-card" onClick={() => navigate('/internment')}>
            <div className="product-card-image"><img src={intermentImg} alt="Interment" /></div>
            <div className="product-card-content"><h3>Interment</h3><p>Honoring your departed loved ones</p></div>
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}

      {/* Pricing Selection Modal */}
      {showPricingModal && product && (
        <div className="modal-overlay" onClick={() => setShowPricingModal(false)}>
          <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Payment Plan</h2>
              <button className="modal-close" onClick={() => setShowPricingModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <p className="modal-subtitle">Choose your preferred payment plan for {product.title}</p>
              <div className="plan-options">
                {product.price_monthly && (
                  <div className="plan-card">
                    <h3>Monthly Plan</h3>
                    <p className="plan-price">₱{parseFloat(product.price_monthly).toFixed(2)}</p>
                    <p className="plan-description">Pay monthly for flexibility</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan('Monthly', product.price_monthly)} style={{ marginTop: '15px', backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
                {product.price_quarterly && (
                  <div className="plan-card">
                    <h3>Quarterly Plan</h3>
                    <p className="plan-price">₱{parseFloat(product.price_quarterly).toFixed(2)}</p>
                    <p className="plan-description">Pay every 3 months</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan('Quarterly', product.price_quarterly)} style={{ marginTop: '15px', backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
                {product.price_yearly && (
                  <div className="plan-card">
                    <h3>Yearly Plan</h3>
                    <p className="plan-price">₱{parseFloat(product.price_yearly).toFixed(2)}</p>
                    <p className="plan-description">Best value - pay annually</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan('Yearly', product.price_yearly)} style={{ marginTop: '15px', backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal with Lot Selector */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          service={product}
          planType={selectedPlan.planType}
          amount={selectedPlan.amount}
          onClose={handleClosePaymentModal}
          isLawnLotProduct={true}
          productSlug="cremation"
        />
      )}
    </div>
  );
}

export default CremationPage;
