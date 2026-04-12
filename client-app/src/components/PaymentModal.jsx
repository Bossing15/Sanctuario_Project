import React, { useState, useEffect, useCallback } from 'react';
import { FaCreditCard, FaMobile, FaUniversity, FaTimes, FaCheck, FaArrowLeft } from 'react-icons/fa';
import AlertModal from './AlertModal';
import './PaymentModal.css';

function PaymentModal({ service, planType, amount, bookingId, paymentId, onClose }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingStatus, setBookingStatus] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });

  const checkBookingStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookingStatus(data.booking.status);
        
        if (!data.can_pay) {
          setError('Payment not available. Please complete requirements first.');
        }
      } else {
        console.error('Failed to check booking status:', response.status);
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchPaymentMethods();
    if (bookingId) {
      checkBookingStatus();
    }
  }, [bookingId, checkBookingStatus]);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('authToken');
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
        setPaymentMethods(data.payment_methods || []);
      } else {
        console.error('Failed to fetch payment methods:', response.status);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
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
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          actualClientId = userData.id;
          console.log('Using authenticated user ID:', actualClientId);
          // Update localStorage to keep it in sync
          localStorage.setItem('userId', actualClientId);
        } else {
          console.warn('Could not fetch user data, using localStorage userId');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
      
      if (bookingId) {
        // Use booking payment endpoint
        const response = await fetch(`/api/bookings/${bookingId}/pay`, {
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
          description: `${service.title} - ${planType} Plan`,
          payment_method: selectedMethod,
          client_id: actualClientId,
          customer_name: customerName,
          service_type: service.slug
        };
        
        console.log('Creating payment with client_id:', actualClientId);
        
        // If we have an existing payment ID, include it to reuse that payment record
        if (paymentId) {
          requestBody.existing_payment_id = paymentId;
          console.log('Using existing payment ID:', paymentId);
        }
        
        console.log('Creating checkout with data:', requestBody);
        
        const response = await fetch('http://localhost:8000/api/payments/create-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Checkout response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Checkout success:', data);
          window.location.href = data.checkout_url;
        } else {
          const error = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Checkout error response:', error);
          const errorMessage = error.error || error.message || 'Failed to create checkout session. Please try again.';
          setAlertModal({ show: true, type: 'error', message: errorMessage });
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setAlertModal({ show: true, type: 'error', message: 'Payment failed: ' + err.message });
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
      <div className="payment-modal-container">
        <div className="payment-modal-header">
          <div className="payment-modal-header-title">
            <span>💳 Payment</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button className="payment-modal-back" onClick={onClose}>
              <FaArrowLeft />
              <span>Back</span>
            </button>
            <button className="payment-modal-close" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="payment-modal-content">
          <h2 className="payment-modal-title">Complete Your Payment</h2>
          
          {/* Payment Summary */}
          <div className="payment-summary-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Service:</span>
              <span>{service.title}</span>
            </div>
            <div className="summary-row">
              <span>Plan:</span>
              <span>{planType}</span>
            </div>
            {bookingId && bookingStatus && (
              <div className="summary-row">
                <span>Status:</span>
                <span className={`status-${bookingStatus.toLowerCase()}`}>{bookingStatus}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span className="amount">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods-section">
            <h3>Select Payment Method</h3>
            {error && <div className="payment-error-message">{error}</div>}
            
            <div className="payment-methods-grid">
              {paymentMethods.map((method) => (
                <div
                  key={method.type}
                  className={`payment-method-option ${selectedMethod === method.type ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method.type)}
                >
                  <div className="method-icon-box">
                    {getMethodIcon(method.type)}
                  </div>
                  <div className="method-info-box">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                  <div className="method-check-box">
                    {selectedMethod === method.type && <FaCheck />}
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
