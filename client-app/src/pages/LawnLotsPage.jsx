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

function LawnLotsPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(lawnLotsImg);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const url = 'http://localhost:8000/api/public/products';
      console.log('Fetching from:', url);
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response URL:', response.url);

      if (response.ok) {
        const text = await response.text();
        console.log('Response text:', text.substring(0, 500));
        const data = JSON.parse(text);
        console.log('Product data:', data);
        const lawnLots = data.products?.find(p => p.title === 'Lawn Lots') || data.find(p => p.title === 'Lawn Lots');
        setProduct(lawnLots);
      } else {
        const text = await response.text();
        console.error('Error response:', response.status, text.substring(0, 200));
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
                    <button className="plan-btn" onClick={() => handleSelectPlan('Monthly', product.price_monthly)} style={{ backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
                {product.price_quarterly && (
                  <div className="plan-card">
                    <h3>Quarterly Plan</h3>
                    <p className="plan-price">₱{parseFloat(product.price_quarterly).toFixed(2)}</p>
                    <p className="plan-description">Pay every 3 months</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan('Quarterly', product.price_quarterly)} style={{ backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
                {product.price_yearly && (
                  <div className="plan-card">
                    <h3>Yearly Plan</h3>
                    <p className="plan-price">₱{parseFloat(product.price_yearly).toFixed(2)}</p>
                    <p className="plan-description">Best value - pay annually</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan('Yearly', product.price_yearly)} style={{ backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal with Lawn Lot Selector */}
      {showPaymentModal && product && selectedPlan && (
        <PaymentModal
          service={product}
          planType={selectedPlan.planType}
          amount={selectedPlan.amount}
          onClose={handleClosePaymentModal}
          isLawnLotProduct={true}
          productSlug="lawn-lots"
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  );
}

export default LawnLotsPage;
