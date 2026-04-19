import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPromptModal from '../components/LoginPromptModal';
import AlertModal from '../components/AlertModal';
import './MaintenancePage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

function MaintenancePage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchServices();
    checkLogin();
  }, []);

  const checkLogin = () => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
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

    // Proceed with service request (requirements already submitted during signup)
    await submitServiceRequest(service, planType, amount);
  };

  const submitServiceRequest = async (service, planType, amount) => {
    const token = localStorage.getItem('authToken');

    try {
      // Get current user info
      const userResponse = await fetch('http://localhost:8000/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!userResponse.ok) {
        setAlertModal({ show: true, type: 'warning', message: 'Please login again' });
        return;
      }

      const userData = await userResponse.json();
      
      // Use grave location from user's account data
      const graveLocation = userData.grave_location || 'N/A';
      
      // Create inquiry for maintenance service
      const inquiryData = {
        full_name: userData.name || 'Customer',
        email: userData.email,
        phone: userData.phone || 'N/A',
        grave_location: graveLocation,
        product_interest: `${service.title} - ${planType} Plan`,
        message: `Customer is interested in ${service.title} with ${planType} plan (₱${amount}). Grave Location: ${graveLocation}. Requirements have been submitted. Awaiting maintenance service photos before payment.`
      };

      const inquiryResponse = await fetch('http://localhost:8000/api/inquiries/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (inquiryResponse.ok) {
        // Create payment record
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

        const paymentData = {
          client_id: userData.id,
          amount: parseFloat(amount),
          payment_method: 'Cash', // Default to Cash, can be changed later
          payment_type: 'full', // Maintenance is full payment
          status: 'pending',
          due_date: dueDate.toISOString().split('T')[0],
          description: `${service.title} - ${planType} Plan`
        };

        try {
          console.log('Creating payment with data:', paymentData);
          const paymentResponse = await fetch('http://localhost:8000/api/payments/record', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(paymentData),
          });

          if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            console.log('Payment created successfully:', paymentResult);
          } else {
            const errorData = await paymentResponse.json();
            console.error('Payment creation failed:', errorData);
            console.error('Payment data sent:', paymentData);
            const errorDetails = errorData.errors ? JSON.stringify(errorData.errors) : errorData.message;
            alert('Warning: Payment record could not be created.\nError: ' + errorDetails + '\n\nPlease contact support.');
          }
        } catch (paymentError) {
          console.error('Error creating payment record:', paymentError);
          alert('Warning: Payment record could not be created due to network error.');
        }

        setAlertModal({ 
          show: true, 
          type: 'success', 
          message: `Your ${planType} maintenance service request has been submitted successfully! 

Our team will review your request and send you photos of the maintenance work. You can review the photos before proceeding with payment.

Payment for your ${planType} plan (₱${amount}) can be made after you receive and approve the maintenance photos.

We'll contact you soon with updates!`,
          onClose: () => {
            setAlertModal({ show: false, type: 'info', message: '' });
          }
        });
      } else {
        const errorData = await inquiryResponse.json();
        setAlertModal({ 
          show: true, 
          type: 'error', 
          message: errorData.message || 'Failed to submit request. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setAlertModal({ 
        show: true, 
        type: 'error', 
        message: 'An error occurred. Please try again later.' 
      });
    }
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
    </div>
  );
}

export default MaintenancePage;
