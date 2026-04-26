import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPromptModal from '../components/LoginPromptModal';
import AlertModal from '../components/AlertModal';
import PaymentModal from '../components/PaymentModal';
import DeceasedInfoModal from '../components/DeceasedInfoModal';
import './MaintenancePage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

function MaintenancePage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasGravePlot, setHasGravePlot] = useState(false);
  const [checkingGravePlot, setCheckingGravePlot] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDeceasedModal, setShowDeceasedModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deceasedList, setDeceasedList] = useState(null);

  useEffect(() => {
    fetchServices();
    checkLogin();
  }, []);

  const checkLogin = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
    if (token) {
      checkUserGravePlot(token);
    }
  };

  const checkUserGravePlot = async (token) => {
    try {
      setCheckingGravePlot(true);
      const response = await fetch('http://localhost:8000/api/user/grave-plots', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Check if user has any grave plots (lawn lots, columbariums, or family estates)
        const hasPlot = data.grave_plots && data.grave_plots.length > 0;
        setHasGravePlot(hasPlot);
      }
    } catch (error) {
      console.error('Error checking grave plots:', error);
      setHasGravePlot(false);
    } finally {
      setCheckingGravePlot(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/public/services', {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched services:', data);
        setServices(data.services || data);
      } else {
        console.error('Failed to fetch services', response.status);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (service, planType, amount) => {
    const token = localStorage.getItem('authToken');
    
    // Check if user is logged in
    if (!token) {
      setShowLoginPromptModal(true);
      return;
    }

    // Check if user has a grave plot
    if (!hasGravePlot) {
      setAlertModal({ 
        show: true, 
        type: 'warning', 
        message: 'You must have a grave plot (Lawn Lot, Columbarium, or Family Estate) before you can purchase maintenance services. Please purchase a grave plot first.' 
      });
      return;
    }

    // Set selected service and plan, then show pricing modal
    setSelectedService(service);
    setSelectedPlan({ planType, amount });
    setShowPricingModal(false);
    setShowDeceasedModal(true);
  };

  const handleDeceasedSubmit = (deceased) => {
    setDeceasedList(deceased);
    setShowDeceasedModal(false);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedService(null);
    setSelectedPlan(null);
    setDeceasedList(null);
  };

  const handleOpenPricingModal = (service) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setShowLoginPromptModal(true);
      return;
    }

    if (!hasGravePlot) {
      setAlertModal({ 
        show: true, 
        type: 'warning', 
        message: 'You must have a grave plot (Lawn Lot, Columbarium, or Family Estate) before you can purchase maintenance services. Please purchase a grave plot first.' 
      });
      return;
    }

    setSelectedService(service);
    setShowPricingModal(true);
  };



  const getFilteredServices = () => {
    // MaintenancePage only shows Grave Maintenance services
    return services.filter(s => s.category === 'Grave Maintenance');
  };

  return (
    <div className="maintenance-page">
      {/* Hero Banner */}
      <div className="maintenance-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Maintenance Services</h1>
        </div>
      </div>



      {/* Description Section */}
      <div className="maintenance-description">
        <div className="description-content">
          <h2>Maintenance</h2>
          <p>
            Regular grave maintenance not only preserves the dignity of a loved one's resting place but also keeps the area clean, safe, and welcoming. By cleaning the headstone, managing weeds, and tending the surrounding grounds, families ensure the site remains beautiful and well-kept. Consistent care also helps prevent long-term damage to the stone and landscape, protecting the memorial for future generations and offering peace of mind to those who visit.
          </p>
        </div>
      </div>

      {/* Login Notice */}
      {!isLoggedIn && (
        <div className="requirements-notice warning">
          <div className="notice-icon">🔒</div>
          <div className="notice-content">
            <h3>Login Required</h3>
            <p>Please log in to your account to request maintenance services.</p>
            <button className="notice-btn" onClick={() => navigate('/login')}>
              Login Now
            </button>
          </div>
        </div>
      )}

      {/* Grave Plot Notice */}
      {isLoggedIn && !checkingGravePlot && !hasGravePlot && (
        <div className="requirements-notice warning">
          <div className="notice-icon">⚠️</div>
          <div className="notice-content">
            <h3>Grave Plot Required</h3>
            <p>You must have a grave plot (Lawn Lot, Columbarium, or Family Estate) before you can purchase maintenance services.</p>
            <button className="notice-btn" onClick={() => navigate('/products-services')}>
              Purchase a Grave Plot
            </button>
          </div>
        </div>
      )}

      {/* Services Grid by Category */}
      <div className="maintenance-services-section">
        {loading ? (
          <div className="loading-message">Loading services...</div>
        ) : getFilteredServices().length > 0 ? (
          <div className="services-grid">
            {getFilteredServices().map((service) => (
              <div key={service.id} className="service-card-wrapper">
                {service.image_path && (
                  <div className="service-image">
                    <img src={`http://localhost:8000/${service.image_path}`} alt={service.title} />
                  </div>
                )}
                <div className="service-card-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>{service.title}</h3>
                    {service.discount_percentage && parseFloat(service.discount_percentage) > 0 && (
                      <span style={{
                        backgroundColor: '#ff6b35',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}>
                        🏷️ {service.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                  <p className="service-description">{service.description}</p>
                  
                  <div className="pricing-section">
                    {service.price_monthly && (
                      <div className="price-option">
                        <span className="price-label">Monthly</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          {service.discount_percentage && parseFloat(service.discount_percentage) > 0 ? (
                            <>
                              <span style={{ 
                                textDecoration: 'line-through', 
                                color: '#999', 
                                fontSize: '14px' 
                              }}>
                                ₱{parseFloat(service.price_monthly).toFixed(2)}
                              </span>
                              <span className="price-amount" style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                                ₱{(parseFloat(service.price_monthly) * (1 - parseFloat(service.discount_percentage) / 100)).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="price-amount">₱{parseFloat(service.price_monthly).toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          className="select-plan-btn"
                          onClick={() => handleSelectPlan(
                            service, 
                            'Monthly', 
                            service.discount_percentage && parseFloat(service.discount_percentage) > 0
                              ? (parseFloat(service.price_monthly) * (1 - parseFloat(service.discount_percentage) / 100)).toFixed(2)
                              : service.price_monthly
                          )}
                        >
                          Select
                        </button>
                      </div>
                    )}
                    {service.price_quarterly && (
                      <div className="price-option">
                        <span className="price-label">Quarterly</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          {service.discount_percentage && parseFloat(service.discount_percentage) > 0 ? (
                            <>
                              <span style={{ 
                                textDecoration: 'line-through', 
                                color: '#999', 
                                fontSize: '14px' 
                              }}>
                                ₱{parseFloat(service.price_quarterly).toFixed(2)}
                              </span>
                              <span className="price-amount" style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                                ₱{(parseFloat(service.price_quarterly) * (1 - parseFloat(service.discount_percentage) / 100)).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="price-amount">₱{parseFloat(service.price_quarterly).toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          className="select-plan-btn"
                          onClick={() => handleSelectPlan(
                            service, 
                            'Quarterly', 
                            service.discount_percentage && parseFloat(service.discount_percentage) > 0
                              ? (parseFloat(service.price_quarterly) * (1 - parseFloat(service.discount_percentage) / 100)).toFixed(2)
                              : service.price_quarterly
                          )}
                        >
                          Select
                        </button>
                      </div>
                    )}
                    {service.price_yearly && (
                      <div className="price-option">
                        <span className="price-label">Yearly</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          {service.discount_percentage && parseFloat(service.discount_percentage) > 0 ? (
                            <>
                              <span style={{ 
                                textDecoration: 'line-through', 
                                color: '#999', 
                                fontSize: '14px' 
                              }}>
                                ₱{parseFloat(service.price_yearly).toFixed(2)}
                              </span>
                              <span className="price-amount" style={{ color: '#ff6b35', fontWeight: 'bold' }}>
                                ₱{(parseFloat(service.price_yearly) * (1 - parseFloat(service.discount_percentage) / 100)).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="price-amount">₱{parseFloat(service.price_yearly).toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          className="select-plan-btn"
                          onClick={() => handleSelectPlan(
                            service, 
                            'Yearly', 
                            service.discount_percentage && parseFloat(service.discount_percentage) > 0
                              ? (parseFloat(service.price_yearly) * (1 - parseFloat(service.discount_percentage) / 100)).toFixed(2)
                              : service.price_yearly
                          )}
                        >
                          Select
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-services-message">No services available for this category.</div>
        )}
      </div>

      {/* Login Prompt Modal */}
      {showLoginPromptModal && (
        <LoginPromptModal onClose={() => setShowLoginPromptModal(false)} />
      )}

      {/* Alert Modal */}
      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={alertModal.onClose || (() => setAlertModal({ show: false, type: 'info', message: '' }))}
        />
      )}

      {/* Pricing Selection Modal */}
      {showPricingModal && selectedService && (
        <div className="modal-overlay" onClick={() => setShowPricingModal(false)}>
          <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Payment Plan</h2>
              <button className="modal-close" onClick={() => setShowPricingModal(false)}>✕</button>
            </div>
            <div className="modal-content">
              <p className="modal-subtitle">Choose your preferred payment plan for {selectedService.title}</p>
              <div className="plan-options">
                {selectedService.price_monthly && (
                  <div className="plan-card">
                    <h3>Monthly Plan</h3>
                    <p className="plan-price">₱{parseFloat(selectedService.price_monthly).toFixed(2)}</p>
                    <p className="plan-description">Pay monthly for flexibility</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan(selectedService, 'Monthly', selectedService.price_monthly)} style={{ marginTop: '15px', backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
                {selectedService.price_quarterly && (
                  <div className="plan-card">
                    <h3>Quarterly Plan</h3>
                    <p className="plan-price">₱{parseFloat(selectedService.price_quarterly).toFixed(2)}</p>
                    <p className="plan-description">Pay every 3 months</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan(selectedService, 'Quarterly', selectedService.price_quarterly)} style={{ marginTop: '15px', backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
                {selectedService.price_yearly && (
                  <div className="plan-card">
                    <h3>Yearly Plan</h3>
                    <p className="plan-price">₱{parseFloat(selectedService.price_yearly).toFixed(2)}</p>
                    <p className="plan-description">Best value - pay annually</p>
                    <button className="plan-btn" onClick={() => handleSelectPlan(selectedService, 'Yearly', selectedService.price_yearly)} style={{ marginTop: '15px', backgroundColor: '#10b981' }}>Select Plan</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedService && selectedPlan && (
        <PaymentModal
          service={selectedService}
          planType={selectedPlan.planType}
          amount={selectedPlan.amount}
          onClose={handleClosePaymentModal}
          isLawnLotProduct={false}
          productSlug="maintenance"
          deceasedList={deceasedList}
        />
      )}

      {/* Deceased Info Modal */}
      {showDeceasedModal && (
        <DeceasedInfoModal
          onSubmit={handleDeceasedSubmit}
          onClose={() => setShowDeceasedModal(false)}
          allowMultiple={false}
          maxDeceased={1}
          isService={true}
        />
      )}
    </div>
  );
}

export default MaintenancePage;
