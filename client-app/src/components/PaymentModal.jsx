import React, { useState, useEffect, useCallback } from 'react';
import { FaCreditCard, FaMobile, FaUniversity, FaTimes, FaCheck, FaArrowLeft } from 'react-icons/fa';
import AlertModal from './AlertModal';
import LotSelector from './LotSelector';
import './PaymentModal.css';

function PaymentModal({ service, planType, amount, bookingId, paymentId, onClose, isLawnLotProduct = false, productSlug = 'lawn-lots' }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [showLawnLotSelector, setShowLawnLotSelector] = useState(isLawnLotProduct);
  const [selectedGraveId, setSelectedGraveId] = useState(null);

  // Determine lot type based on product slug
  const getLotType = () => {
    switch (productSlug) {
      case 'columbariums':
        return 'columbariums';
      case 'family-estates':
        return 'family-estates';
      case 'lawn-lots':
      default:
        return 'lawn-lots';
    }
  };

  const getLotTitle = () => {
    switch (productSlug) {
      case 'columbariums':
        return 'Select Your Niche';
      case 'family-estates':
        return 'Select Your Estate';
      case 'lawn-lots':
      default:
        return 'Select Your Lot';
    }
  };

  const checkBookingStatus = useCallback(async () => {
    // Skip booking status check if no bookingId (direct payment from billing)
    if (!bookingId) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookingStatus(data.booking.status);
        
        if (data.can_pay === false) {
          setError('Payment not available. Please complete requirements first.');
        }
      } else {
        console.error('Failed to check booking status:', response.status);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  }, [bookingId]);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Set fallback methods immediately
      const fallbackMethods = [
        { type: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, etc.' },
        { type: 'gcash', name: 'GCash', description: 'Mobile wallet payment' },
        { type: 'grab_pay', name: 'GrabPay', description: 'Grab wallet payment' },
        { type: 'paymaya', name: 'PayMaya', description: 'PayMaya wallet' },
      ];
      setPaymentMethods(fallbackMethods);
      setSelectedMethod(fallbackMethods[0].type);

      if (!token) {
        console.warn('No auth token found, using fallback methods');
        return;
      }

      const response = await fetch('http://localhost:8000/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Payment methods fetched:', data);
        if (data.payment_methods && data.payment_methods.length > 0) {
          setPaymentMethods(data.payment_methods);
          setSelectedMethod(data.payment_methods[0].type);
        }
      } else {
        console.error('Failed to fetch payment methods:', response.status);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  }, []);

  useEffect(() => {
    setError(''); // Clear any previous errors when modal opens
    fetchPaymentMethods();
    if (bookingId) {
      checkBookingStatus();
    }
  }, [bookingId, fetchPaymentMethods, checkBookingStatus]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    // Check if lawn lot product and grave is selected
    if (isLawnLotProduct && !selectedGraveId) {
      setError('Please select a lawn lot first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const clientId = localStorage.getItem('userId') || 1;

      // All payment methods use the same checkout flow
      await handleCheckoutPayment(token, clientId);
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutPayment = async (token, clientId) => {
    try {
      // First, get the authenticated user's actual ID
      let actualClientId = clientId;
      try {
        const userResponse = await fetch('http://localhost:8000/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          actualClientId = userData.id;
          console.log('Using authenticated user ID:', actualClientId);
          // Update localStorage to keep it in sync
          localStorage.setItem('userId', actualClientId);
        } else {
          console.warn('Could not fetch user data (status:', userResponse.status, '), using provided clientId:', clientId);
        }
      } catch (err) {
        console.warn('Error fetching user data, using provided clientId:', clientId, err);
      }
      
      if (bookingId) {
        // Use booking payment endpoint
        const response = await fetch(`http://localhost:8000/api/bookings/${bookingId}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            payment_method: selectedMethod,
          })
        });

        if (response.ok) {
          await response.json();
          setAlertModal({ 
            show: true, 
            type: 'success', 
            message: 'Payment successful!',
            onClose: () => {
              setAlertModal({ show: false, type: 'info', message: '' });
              onClose();
            }
          });
          // Optionally redirect to booking details or success page
        } else {
          const error = await response.json();
          console.error('Payment error:', error);
          setError(error.message || 'Payment failed');
        }
      } else {
        // Fallback to old payment method for non-booking payments
        const customerName = localStorage.getItem('userName') || 'Guest';
        
        const requestBody = {
          amount: amount,
          description: `${service?.title || 'Payment'} - ${planType || 'Payment'} Plan`,
          payment_method: selectedMethod,
          client_id: actualClientId,
          customer_name: customerName,
          service_type: service?.slug || 'payment'
        };

        // Add grave_id if lawn lot product
        if (isLawnLotProduct && selectedGraveId) {
          requestBody.grave_id = selectedGraveId;
          console.log('Adding grave_id to payment:', selectedGraveId);
        }
        
        console.log('Creating payment with client_id:', actualClientId);
        
        // If we have an existing payment ID, include it to reuse that payment record
        if (paymentId) {
          requestBody.existing_payment_id = paymentId;
          console.log('Using existing payment ID:', paymentId);
        }
        
        console.log('Creating checkout with data:', requestBody);
        
        // Use public endpoint with authentication headers if available
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        // Add authentication header if token is available
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('http://localhost:8000/api/payments/create-checkout-public', {
          method: 'POST',
          headers: headers,
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        console.log('Checkout response status:', response.status);
        console.log('Checkout response headers:', response.headers);

        if (response.status === 202) {
          // PENDING_AUTHORIZATION response
          const data = await response.json();
          console.log('Authorization pending:', data);
          
          setAlertModal({
            show: true,
            type: 'info',
            message: data.notification || 'Your request is pending approval. You will be notified once approved.',
            onClose: () => {
              setAlertModal({ show: false, type: 'info', message: '' });
              onClose();
            }
          });
          setLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          console.log('Checkout success:', data);
          console.log('Checkout URL:', data.checkout_url);
          
          if (!data.checkout_url) {
            setError('No checkout URL received from server. Please try again.');
            setLoading(false);
            return;
          }
          
          // Store payment ID in sessionStorage so PaymentSuccess page can retrieve it
          sessionStorage.setItem('currentPaymentId', data.payment_id.toString());
          console.log('Stored payment ID in sessionStorage:', data.payment_id);
          
          console.log('Redirecting to:', data.checkout_url);
          window.location.href = data.checkout_url;
        } else {
          const responseText = await response.text();
          console.error('Checkout error response text:', responseText);
          let error = { message: 'Unknown error' };
          try {
            error = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          console.error('Checkout error response:', error);
          const errorMessage = error.error || error.message || 'Failed to create checkout session. Please try again.';
          setError(errorMessage);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed: ' + err.message);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'card': return <FaCreditCard />;
      case 'gcash':
      case 'grab_pay':
      case 'paymaya': return <FaMobile />;
      case 'dob': return <FaUniversity />;
      default: return <FaCreditCard />;
    }
  };

  return (
    <div className="payment-modal-overlay">
      {/* Show Lot Selector first if lot product and not yet selected */}
      {showLawnLotSelector && isLawnLotProduct ? (
        <LotSelector
          bookingId={bookingId}
          onClose={() => {
            setShowLawnLotSelector(false);
            onClose();
          }}
          onLotSelected={(grave) => {
            console.log('Lot selected:', grave);
            setSelectedGraveId(grave.id);
            setShowLawnLotSelector(false);
            
            // Store lot info in sessionStorage for receipt generation
            const lotInfo = {
              id: grave.id,
              plot_number: grave.plot_number || grave.niche_number,
              grave_location: grave.grave_location || grave.location,
              section: grave.section
            };
            sessionStorage.setItem('lawnLotInfo', JSON.stringify(lotInfo));
            
            // Fetch payment methods after lot selection
            fetchPaymentMethods();
            
            setAlertModal({
              show: true,
              type: 'success',
              message: `${grave.plot_number || grave.niche_number} selected! Proceeding to payment...`,
              onClose: () => {
                setAlertModal({ show: false, type: 'info', message: '' });
              }
            });
          }}
          lotType={getLotType()}
          title={getLotTitle()}
        />
      ) : null}
      
      {/* Show Payment Modal after lot selection or if not a lot product */}
      {!showLawnLotSelector || !isLawnLotProduct ? (
        <div className="payment-modal-container">
          {/* Header */}
          <div className="payment-modal-header">
            <div className="payment-modal-header-left">
              <FaCreditCard className="payment-icon" />
              <span className="payment-title">Payment</span>
            </div>
            <div className="payment-modal-header-right">
              <button className="payment-modal-back" onClick={onClose} title="Back">
                <FaArrowLeft />
              </button>
              <button className="payment-modal-close" onClick={onClose} title="Close">
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="payment-modal-content">
          <h2 className="payment-modal-title">Complete Your Payment</h2>
          
          {/* Payment Summary */}
          <div className="payment-summary-section">
            <h3 className="summary-heading">Payment Summary</h3>
            <div className="summary-content">
              <div className="summary-row">
                <span className="summary-label">Service:</span>
                <span className="summary-value">{service?.title || 'Payment'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Plan:</span>
                <span className="summary-value">{planType || 'N/A'}</span>
              </div>
              <div className="summary-row total-row">
                <span className="summary-label">Total Amount:</span>
                <span className="summary-value total-amount">{formatCurrency(amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods-section">
            <h3 className="methods-heading">Select Payment Method</h3>
            {error && <div className="payment-error-message">{error}</div>}
            
            <div className="payment-methods-list">
              {paymentMethods.map((method) => (
                <div
                  key={method.type}
                  className={`payment-method-item ${selectedMethod === method.type ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method.type)}
                >
                  <div className="method-icon">
                    {getMethodIcon(method.type)}
                  </div>
                  <div className="method-details">
                    <h4 className="method-name">{method.name}</h4>
                    <p className="method-description">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Button */}
          <div className="payment-actions-section">
            <button
              className={`pay-now-button ${loading ? 'loading' : ''}`}
              onClick={handlePayment}
              disabled={loading || !selectedMethod}
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
            </button>
          </div>
          </div>
        </div>
      ) : null}
      
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

export default PaymentModal;
