import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCreditCard, FaMobile, FaUniversity, FaArrowLeft, FaCheck } from 'react-icons/fa';
import './PaymentPage.css';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const checkoutRef = useRef(null);
  
  // Payment details from navigation state or default values
  const paymentDetails = {
    amount: location.state?.amount || 50000,
    description: location.state?.description || 'Memorial Service Payment',
    serviceType: location.state?.serviceType || 'general',
    serviceName: location.state?.serviceName || 'Service',
    productId: location.state?.product?.id || location.state?.productId || null,
    planType: location.state?.planType || 'Monthly'
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    console.log('PaymentPage mounted, token:', token ? 'present' : 'missing');
    console.log('Payment details:', paymentDetails);
    
    if (!token) {
      console.log('No token found, showing error');
      setError('Please log in to proceed with payment');
      // Redirect to login after 2 seconds
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    console.log('Token found, fetching payment methods');
    fetchPaymentMethods();
  }, [navigate]);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('Fetching payment methods...');

      // Set fallback methods immediately
      const fallbackMethods = [
        { type: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, etc.', enabled: true },
        { type: 'gcash', name: 'GCash', description: 'Mobile wallet payment', enabled: true },
        { type: 'grab_pay', name: 'GrabPay', description: 'Grab wallet payment', enabled: true },
        { type: 'paymaya', name: 'PayMaya', description: 'PayMaya wallet', enabled: true },
      ];
      
      setPaymentMethods(fallbackMethods);
      setSelectedMethod(fallbackMethods[0].type);
      console.log('Fallback methods set:', fallbackMethods.length);

      // Try public endpoint first (most reliable)
      console.log('Trying public endpoint...');
      try {
        const publicResponse = await fetch('http://localhost:8000/api/public/payment-methods', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Public endpoint response status:', publicResponse.status);

        if (publicResponse.ok) {
          const data = await publicResponse.json();
          console.log('Payment methods from public endpoint:', data);
          if (data.payment_methods && Array.isArray(data.payment_methods) && data.payment_methods.length > 0) {
            setPaymentMethods(data.payment_methods);
            setSelectedMethod(data.payment_methods[0].type);
            console.log('Payment methods loaded successfully from public endpoint:', data.payment_methods.length);
            return;
          }
        }
      } catch (publicError) {
        console.error('Public endpoint error:', publicError);
      }

      // Try authenticated endpoint as backup
      if (token) {
        console.log('Trying authenticated endpoint with token:', token.substring(0, 20) + '...');
        
        try {
          const response = await fetch('http://localhost:8000/api/payments/methods', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'include'
          });
          
          console.log('Authenticated endpoint response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Payment methods from authenticated endpoint:', data);
            if (data.payment_methods && Array.isArray(data.payment_methods) && data.payment_methods.length > 0) {
              setPaymentMethods(data.payment_methods);
              setSelectedMethod(data.payment_methods[0].type);
              console.log('Payment methods loaded successfully from authenticated endpoint:', data.payment_methods.length);
              return;
            }
          }
        } catch (authError) {
          console.error('Authenticated endpoint error:', authError);
        }
      }

      console.log('Using fallback payment methods');
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Error loading payment methods: ' + error.message);
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
      if (!token) {
        setError('Please log in to proceed with payment');
        setLoading(false);
        return;
      }

      // Get the authenticated user's ID from the API instead of localStorage
      let clientId = localStorage.getItem('userId');
      
      try {
        const userResponse = await fetch('http://localhost:8000/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          clientId = userData.id;
          console.log('User ID from API:', clientId);
        } else {
          console.warn('Could not fetch user from API (status:', userResponse.status, '), using localStorage userId:', clientId);
        }
      } catch (userError) {
        console.warn('Error fetching user info, using localStorage userId:', clientId, userError);
      }

      // Proceed to checkout with selected payment method
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
      const customerName = localStorage.getItem('userName') || 'Guest';
      
      console.log('Location state:', location.state);
      console.log('Product from state:', location.state?.product);
      console.log('Product ID from state:', location.state?.product?.id);
      console.log('Payment details:', paymentDetails);
      
      const requestBody = {
        amount: paymentDetails.amount,
        description: paymentDetails.description,
        payment_method: selectedMethod,
        client_id: clientId,
        customer_name: customerName,
        service_type: paymentDetails.serviceType,
        product_id: paymentDetails.productId,
        plan_type: paymentDetails.planType
      };

      console.log('Creating checkout session with:', requestBody);
      console.log('Using token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

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

      if (response.ok) {
        const data = await response.json();
        console.log('Checkout success:', data);
        
        // Store payment data and show checkout form
        setPaymentData(data);
        setShowCheckout(true);
        
        // Initialize PayMongo checkout after a short delay to ensure DOM is ready
        setTimeout(() => {
          initializePayMongoCheckout(data);
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Checkout error response:', errorData);
        console.error('Response headers:', response.headers);
        
        const errorMessage = errorData.message || errorData.error || 'Failed to create checkout session';
        setError(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed: ' + error.message);
      setLoading(false);
    }
  };

  const initializePayMongoCheckout = (data) => {
    try {
      console.log('PayMongo checkout data received:', data);
      
      // Redirect to PayMongo hosted checkout
      if (data.checkout_url) {
        console.log('Redirecting to PayMongo checkout:', data.checkout_url);
        window.location.href = data.checkout_url;
      } else {
        setError('No checkout URL received from server');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error initializing PayMongo checkout:', error);
      setError('Failed to initialize payment form: ' + error.message);
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
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <button 
            className="back-button"
            onClick={() => {
              if (showCheckout) {
                setShowCheckout(false);
                setPaymentData(null);
              } else {
                navigate(-1);
              }
            }}
          >
            <FaArrowLeft /> Back
          </button>
          <h1>Payment</h1>
        </div>

        <div className="payment-content">
          {!showCheckout ? (
            <>
              {/* Payment Summary */}
              <div className="payment-summary">
                <h2>Payment Summary</h2>
                <div className="summary-item">
                  <span>Service:</span>
                  <span>{paymentDetails.serviceName}</span>
                </div>
                <div className="summary-item">
                  <span>Description:</span>
                  <span>{paymentDetails.description}</span>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <span className="amount">{formatCurrency(paymentDetails.amount)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="payment-methods">
                <h2>Select Payment Method</h2>
                {error && <div className="error-message">{error}</div>}
                
                <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px', borderRadius: '4px', fontSize: '12px' }}>
                  <p>Debug: Methods count: {paymentMethods.length}</p>
                  <p>Debug: Selected: {selectedMethod}</p>
                </div>
                
                {paymentMethods.length === 0 && !error && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    <p>Loading payment methods...</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      Methods: {paymentMethods.length}, Error: {error || 'none'}
                    </p>
                  </div>
                )}
                
                <div className="methods-grid">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.type}
                      className={`payment-method ${selectedMethod === method.type ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedMethod(method.type);
                        setError('');
                      }}
                    >
                      <div className="method-icon">
                        {getMethodIcon(method.type)}
                      </div>
                      <div className="method-info">
                        <h3>{method.name}</h3>
                        <p>{method.description}</p>
                      </div>
                      <div className="method-check">
                        {selectedMethod === method.type && <FaCheck />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GCash Phone Number Input */}
              {selectedMethod === 'gcash' && (
                <div className="payment-credentials-section">
                  <h3>GCash Payment Details</h3>
                  <p className="credential-info">You will be redirected to GCash to complete your payment securely.</p>
                </div>
              )}

              {/* GrabPay Phone Number Input */}
              {selectedMethod === 'grab_pay' && (
                <div className="payment-credentials-section">
                  <h3>GrabPay Payment Details</h3>
                  <p className="credential-info">You will be redirected to GrabPay to complete your payment securely.</p>
                </div>
              )}

              {/* PayMaya Phone Number Input */}
              {selectedMethod === 'paymaya' && (
                <div className="payment-credentials-section">
                  <h3>PayMaya Payment Details</h3>
                  <p className="credential-info">You will be redirected to PayMaya to complete your payment securely.</p>
                </div>
              )}

              {/* Credit/Debit Card Input */}
              {selectedMethod === 'card' && (
                <div className="payment-credentials-section">
                  <h3>Credit/Debit Card Details</h3>
                  <p className="credential-info">You will enter your card details securely on the next page.</p>
                </div>
              )}

              {/* Payment Button */}
              <div className="payment-actions">
                <button
                  className={`pay-button ${loading ? 'loading' : ''}`}
                  onClick={handlePayment}
                  disabled={loading || !selectedMethod}
                >
                  {loading ? 'Processing...' : `Pay ${formatCurrency(paymentDetails.amount)}`}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* PayMongo Checkout Form */}
              <div className="paymongo-checkout">
                <h2>Enter Payment Details</h2>
                {error && <div className="error-message">{error}</div>}
                <div ref={checkoutRef} className="checkout-form"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
