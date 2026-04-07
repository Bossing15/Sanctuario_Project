import React, { useEffect, useState } from 'react';
import PaymentModal from './PaymentModal';
import LoginPromptModal from './LoginPromptModal';
import './ServiceDetail.css';

const ServiceDetail = ({ service, onClose }) => {
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const container = document.querySelector('.service-detail-scroll');
    if (!container) return;

    const onScroll = () => setShowScrollBtn(container.scrollTop > 250);
    container.addEventListener('scroll', onScroll);

    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('.service-detail-scroll');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProceedToPayment = (planType, amount) => {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setShowLoginPromptModal(true);
      return;
    }

    // Show payment modal
    setSelectedPlan({ planType, amount });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  if (!service) return null;

  return (
    <div className="service-detail-overlay">
      <div className="service-detail-card">
        <button className="detail-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div className="service-detail-scroll">
          <section className="intro-card">
            <div className="intro-img">
              <img src={service.image} alt={service.title} />
            </div>
            <div className="intro-text">
              <h2>{service.title.toUpperCase()}</h2>
              <p>{service.description}</p>
            </div>
          </section>

          <h2 className="select-banner">SELECT PAYMENT PLAN</h2>
          
          {service.discount_percentage > 0 && (
            <div style={{
              textAlign: 'center',
              backgroundColor: '#fff3e0',
              padding: '12px',
              margin: '0 20px 20px',
              borderRadius: '8px',
              border: '2px solid #ff6b35'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ff6b35'
              }}>
                🎉 Special Offer: {service.discount_percentage}% OFF All Plans!
              </span>
            </div>
          )}

          <div className="plans-wrapper">
            <div className="plans-container">
              {/* Monthly Plan */}
              <div className="plan-card monthly" style={{ position: 'relative' }}>
                {service.discount_percentage > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1
                  }}>
                    {service.discount_percentage}% OFF
                  </div>
                )}
                <h3>Monthly</h3>
                <div className="plan-price">
                  {service.discount_percentage > 0 ? (
                    <>
                      <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.7em', marginBottom: '5px' }}>
                        ₱{service.prices.monthly}
                      </div>
                      <div style={{ color: '#ff6b35' }}>
                        ₱{(service.prices.monthly * (1 - service.discount_percentage / 100)).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <>₱{service.prices.monthly}</>
                  )}
                  <span>/mo</span>
                </div>
                <ul>
                  <li>Flower Watering</li>
                  <li>Grass Cutting</li>
                  <li>Fertilizing (Monthly)</li>
                  <li>Gravesite Sweeping</li>
                </ul>
                <button 
                  className="pay-btn"
                  onClick={() => handleProceedToPayment(
                    'Monthly', 
                    service.discount_percentage > 0 
                      ? (service.prices.monthly * (1 - service.discount_percentage / 100)).toFixed(2)
                      : service.prices.monthly
                  )}
                >
                  Proceed to Payment
                </button>
              </div>

              {/* Yearly Plan */}
              <div className="plan-card yearly" style={{ position: 'relative' }}>
                {service.discount_percentage > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1
                  }}>
                    {service.discount_percentage}% OFF
                  </div>
                )}
                <h3>Yearly</h3>
                <div className="plan-price">
                  {service.discount_percentage > 0 ? (
                    <>
                      <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.7em', marginBottom: '5px' }}>
                        ₱{service.prices.yearly}
                      </div>
                      <div style={{ color: '#ff6b35' }}>
                        ₱{(service.prices.yearly * (1 - service.discount_percentage / 100)).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <>₱{service.prices.yearly}</>
                  )}
                  <span>/yr</span>
                </div>
                <ul>
                  <li>Flower Watering</li>
                  <li>Grass Cutting</li>
                  <li>Fertilizing (Monthly)</li>
                  <li>Gravesite Sweeping</li>
                </ul>
                <button 
                  className="pay-btn"
                  onClick={() => handleProceedToPayment(
                    'Yearly', 
                    service.discount_percentage > 0 
                      ? (service.prices.yearly * (1 - service.discount_percentage / 100)).toFixed(2)
                      : service.prices.yearly
                  )}
                >
                  Proceed to Payment
                </button>
              </div>

              {/* Quarterly Plan */}
              <div className="plan-card quarterly" style={{ position: 'relative' }}>
                {service.discount_percentage > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: '#ff6b35',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    zIndex: 1
                  }}>
                    {service.discount_percentage}% OFF
                  </div>
                )}
                <h3>Quarterly</h3>
                <div className="plan-price">
                  {service.discount_percentage > 0 ? (
                    <>
                      <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.7em', marginBottom: '5px' }}>
                        ₱{service.prices.quarterly}
                      </div>
                      <div style={{ color: '#ff6b35' }}>
                        ₱{(service.prices.quarterly * (1 - service.discount_percentage / 100)).toFixed(2)}
                      </div>
                    </>
                  ) : (
                    <>₱{service.prices.quarterly}</>
                  )}
                  <span>/qtr</span>
                </div>
                <ul>
                  <li>Flower Watering</li>
                  <li>Grass Cutting</li>
                  <li>Fertilizing (Monthly)</li>
                  <li>Gravesite Sweeping</li>
                </ul>
                <button 
                  className="pay-btn"
                  onClick={() => handleProceedToPayment(
                    'Quarterly', 
                    service.discount_percentage > 0 
                      ? (service.prices.quarterly * (1 - service.discount_percentage / 100)).toFixed(2)
                      : service.prices.quarterly
                  )}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {showScrollBtn && (
          <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Back to top">
            ↑
          </button>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          service={service}
          planType={selectedPlan.planType}
          amount={selectedPlan.amount}
          onClose={handleClosePaymentModal}
        />
      )}

      {/* Login Prompt Modal */}
      {showLoginPromptModal && (
        <LoginPromptModal onClose={() => setShowLoginPromptModal(false)} />
      )}
    </div>
  );
};

export default ServiceDetail;
