import React, { useState, useEffect, useCallback } from 'react';
import { FaCreditCard, FaTimes, FaArrowLeft, FaMobile, FaUniversity } from 'react-icons/fa';
import AlertModal from './AlertModal';
import LotSelector from './LotSelector';
import './PaymentModal.css';

function PaymentModal({ service, planType, amount, bookingId, paymentId, onClose, isLawnLotProduct = false, productSlug = 'lawn-lots', reservationId = null, isApprovedReservation = false, deceasedList = null }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [showLawnLotSelector, setShowLawnLotSelector] = useState(isLawnLotProduct && !isApprovedReservation);
  const [selectedGraveId, setSelectedGraveId] = useState(null);
  const [hidePaymentOverlay, setHidePaymentOverlay] = useState(false);

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

  // Determine if this is a product (requires lot selection) or service (no lot selection)
  // For approved reservations from billing, always treat as service (no lot selection needed)
  const isProduct = !isApprovedReservation && (isLawnLotProduct || ['lawn-lots', 'columbariums', 'family-estates'].includes(productSlug));
  const isService = !isProduct;

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
    console.log('PayMongo available:', typeof window.PayMongo);
    console.log('isLawnLotProduct:', isLawnLotProduct);
    console.log('isProduct:', isProduct);
    console.log('isService:', isService);
    
    // Update showLawnLotSelector based on whether it's a product
    // Products show lot selector, services don't
    setShowLawnLotSelector(isProduct && !isApprovedReservation);
    
    if (isApprovedReservation) {
      fetchPaymentMethods();
    }
    if (bookingId) {
      checkBookingStatus();
    }
  }, [bookingId, isApprovedReservation, isProduct, isService, fetchPaymentMethods, checkBookingStatus]);

  const handlePayment = async () => {
    // For approved reservations, require payment method selection
    if (isApprovedReservation && !selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    // Check if product and lot is selected (services don't need lot selection)
    if (isProduct && !selectedGraveId) {
      setError('Please select a lot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const clientId = localStorage.getItem('userId') || 1;

      // If not an approved reservation, create reservation first
      if (!isApprovedReservation) {
        await createReservation(token, clientId);
      } else {
        // If approved reservation, proceed to payment
        await handleCheckoutPayment(token, clientId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (token, clientId) => {
    try {
      // Use the first deceased from the list, or fallback to defaults
      const primaryDeceased = deceasedList && deceasedList.length > 0 ? deceasedList[0] : {};
      
      // Determine if this is a product (requires lot) or service (no lot required)
      const isProduct = isLawnLotProduct || ['lawn-lots', 'columbariums', 'family-estates'].includes(productSlug);
      const isService = !isProduct;
      
      // Build reservation data - same structure for both products and services
      const reservationData = {
        product_id: isProduct ? service?.id || null : null,
        service_id: isService ? service?.id || null : null,
        lot_id: isProduct ? (selectedGraveId || null) : null,
        lot_type: isProduct ? getLotType() : null,
        deceased_name: primaryDeceased.deceasedName || 'To Be Verified',
        deceased_date_of_death: primaryDeceased.dateOfDeath || new Date().toISOString().split('T')[0],
        deceased_relationship: primaryDeceased.relationship || null,
        additional_deceased: deceasedList && deceasedList.length > 1 ? deceasedList.slice(1) : null,
        plan_type: planType || null,
        amount: amount,
      };

      console.log('Creating reservation with data:', reservationData);
      
      const reservationResponse = await fetch('http://localhost:8000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(reservationData)
      });

      console.log('Reservation response status:', reservationResponse.status);

      if (reservationResponse.status === 201) {
        const reservationResult = await reservationResponse.json();
        console.log('Reservation created:', reservationResult);
        
        setHidePaymentOverlay(true);
        setAlertModal({
          show: true,
          type: 'info',
          message: isService 
            ? 'Your service request has been created and is pending admin approval. You will be notified once approved.'
            : 'Your reservation has been created and is pending admin approval. You will be notified once approved. You can view your reservation in "My Reservations".',
          onClose: () => {
            setAlertModal({ show: false, type: 'info', message: '' });
            setHidePaymentOverlay(false);
            onClose();
          }
        });
        setLoading(false);
        return;
      } else {
        const errorData = await reservationResponse.json();
        console.error('Reservation error:', errorData);
        setError(errorData.message || 'Failed to create reservation');
        setLoading(false);
      }
    } catch (err) {
      console.error('Reservation error:', err);
      setError('Failed to create request: ' + err.message);
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
          localStorage.setItem('userId', actualClientId);
        } else {
          console.warn('Could not fetch user data (status:', userResponse.status, '), using provided clientId:', clientId);
        }
      } catch (err) {
        console.warn('Error fetching user data, using provided clientId:', clientId, err);
      }
      
      if (isApprovedReservation && reservationId) {
        // Process payment through PayMongo for existing reservation
        console.log('Processing PayMongo payment for reservation:', reservationId);
        
        try {
          // Process payment for existing payment record
          const processResponse = await fetch(`http://localhost:8000/api/payments/${paymentId}/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              payment_method: selectedMethod,
            })
          });

          if (processResponse.ok) {
            const processData = await processResponse.json();
            console.log('Payment processed:', processData);
            
            // Redirect to PayMongo checkout if checkout_url is available
            if (processData.checkout_url) {
              console.log('Redirecting to PayMongo checkout:', processData.checkout_url);
              window.location.href = processData.checkout_url;
            } else {
              // Fallback: show success message
              setAlertModal({ 
                show: true, 
                type: 'success', 
                message: 'Payment processed successfully! Your payment has been submitted.',
                onClose: () => {
                  setAlertModal({ show: false, type: 'info', message: '' });
                  onClose();
                }
              });
              setLoading(false);
            }
          } else {
            const errorData = await processResponse.json();
            setError(errorData.message || 'Failed to process payment');
            setLoading(false);
          }
        } catch (err) {
          console.error('Payment processing error:', err);
          setError('Payment processing failed: ' + err.message);
          setLoading(false);
        }
      } else if (isApprovedReservation && !reservationId) {
        // For approved reservations without reservationId (e.g., maintenance bookings)
        // paymentId is actually the booking ID, so we need to create a Payment record first
        console.log('Processing payment for maintenance booking:', paymentId);
        
        try {
          // First, create a Payment record for this booking
          const createPaymentResponse = await fetch(`http://localhost:8000/api/bookings/${paymentId}/payment`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'include',
          });

          if (!createPaymentResponse.ok) {
            const errorData = await createPaymentResponse.json();
            console.error('Failed to create/get payment for booking:', errorData);
            setError('Failed to create payment record: ' + (errorData.message || 'Unknown error'));
            setLoading(false);
            return;
          }

          const paymentData = await createPaymentResponse.json();
          const actualPaymentId = paymentData.payment.id;
          console.log('Payment record created/retrieved:', actualPaymentId);

          // Now process the payment using the actual Payment ID
          const processResponse = await fetch(`http://localhost:8000/api/payments/${actualPaymentId}/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              payment_method: selectedMethod,
            })
          });

          if (processResponse.ok) {
            const processData = await processResponse.json();
            console.log('Payment processed:', processData);
            
            // Redirect to PayMongo checkout if checkout_url is available
            if (processData.checkout_url) {
              console.log('Redirecting to PayMongo checkout:', processData.checkout_url);
              window.location.href = processData.checkout_url;
            } else {
              // Fallback: show success message
              setAlertModal({ 
                show: true, 
                type: 'success', 
                message: 'Payment processed successfully! Your payment has been submitted.',
                onClose: () => {
                  setAlertModal({ show: false, type: 'info', message: '' });
                  onClose();
                }
              });
              setLoading(false);
            }
          } else {
            const errorData = await processResponse.json();
            setError(errorData.message || 'Failed to process payment');
            setLoading(false);
          }
        } catch (err) {
          console.error('Payment processing error:', err);
          setError('Payment processing failed: ' + err.message);
          setLoading(false);
        }
      } else if (bookingId) {
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
        } else {
          const error = await response.json();
          console.error('Payment error:', error);
          setError(error.message || 'Payment failed');
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

  const markReservationAsPaid = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setAlertModal({ 
          show: true, 
          type: 'success', 
          message: 'Payment successful! Your reservation has been confirmed.',
          onClose: () => {
            setAlertModal({ show: false, type: 'info', message: '' });
            onClose();
          }
        });
      }
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  return (
    <>
      {/* Alert Modal - Rendered first so it appears on top */}
      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={alertModal.onClose || (() => setAlertModal({ show: false, type: 'info', message: '' }))}
        />
      )}

      {/* Only show payment modal if not hiding for alert */}
      {!hidePaymentOverlay && (
        <div className="payment-modal-overlay">
          {/* Show Lot Selector first if product and not yet selected */}
          {showLawnLotSelector && isProduct ? (
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
          
          {/* Show Payment Modal after lot selection or if not a product */}
          {!showLawnLotSelector || !isProduct ? (
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
                <h2 className="payment-modal-title">{isApprovedReservation ? 'Complete Your Payment' : 'Create Reservation'}</h2>
                
                {/* Payment Summary */}
                <div className="payment-summary-section">
                  <h3 className="summary-heading">Reservation Summary</h3>
                  <div className="summary-content">
                    <div className="summary-row">
                      <span className="summary-label">Service:</span>
                      <span className="summary-value">{service?.title || 'Product/Service'}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Plan:</span>
                      <span className="summary-value">{planType || 'N/A'}</span>
                    </div>
                    <div className="summary-row total-row">
                      <span className="summary-label">Total Amount:</span>
                      <span className="summary-value total-amount">{formatCurrency(amount)}</span>
                    </div>
                    {!isApprovedReservation && (
                      <div className="summary-row info-row">
                        <span className="summary-info">⚠️ This will create a reservation pending admin approval. Payment will be processed after approval.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Methods - Only show for approved reservations */}
                {isApprovedReservation && (
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
                )}

                {/* Error Message - For non-approved reservations */}
                {!isApprovedReservation && error && (
                  <div className="payment-error-message">{error}</div>
                )}

                {/* Payment Button */}
                <div className="payment-actions-section">
                  <button
                    className={`pay-now-button ${loading ? 'loading' : ''}`}
                    onClick={handlePayment}
                    disabled={loading || (isApprovedReservation && !selectedMethod)}
                  >
                    {loading ? 'Processing...' : isApprovedReservation ? `Pay ${formatCurrency(amount)}` : 'Reserve'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

export default PaymentModal;
