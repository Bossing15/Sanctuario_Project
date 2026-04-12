import React, { useState, useEffect } from 'react';
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
  
  // Payment details from navigation state or default values
  const paymentDetails = {
    amount: location.state?.amount || 50000,
    description: location.state?.description || 'Memorial Service Payment',
    serviceType: location.state?.serviceType || 'general',
    serviceName: location.state?.serviceName || 'Service'
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in to proceed with payment');
      // Redirect to login after 2 seconds
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    fetchPaymentMethods();
  }, [navigate]);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        setError('Please log in to proceed with payment');
        return;
      }

      console.log('Fetching payment methods with token:', token.substring(0, 20) + '...');

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
      
      console.log('Payment methods response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment methods error response:', errorText);
        
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('authToken');
          setTimeout(() => navigate('/login'), 2000);
        } else if (response.status === 403) {
          setError('You do not have permission to access payment methods.');
        } else {
          setError(`Failed to load payment methods (${response.status}). Please try again.`);
        }
        return;
      }

      const data = await response.json();
      console.log('Payment methods response:', data);

      if (data.payment_methods && Array.isArray(data.payment_methods) && data.payment_methods.length > 0) {
        setPaymentMethods(data.payment_methods);
        // Auto-select first method
        setSelectedMethod(data.payment_methods[0].type);
        console.log('Payment methods loaded successfully:', data.payment_methods.length);
      } else {
        console.error('Invalid payment methods format or empty array:', data);
        setError('No payment methods available. Please try again later.');
      }
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
      const customerName = localStorage.getItem('userName') || 'Guest';
      
      const requestBody = {
        amount: paymentDetails.amount,
        description: paymentDetails.description,
        payment_method: selectedMethod,
        client_id: clientId,
        customer_name: customerName,
        service_type: paymentDetails.serviceType
      };

      console.log('Creating checkout session with:', requestBody);

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
        
        // Store payment info in sessionStorage
        sessionStorage.setItem('paymentInfo', JSON.stringify({
          amount: paymentDetails.amount,
          method: selectedMethod,
          description: paymentDetails.description,
          sessionId: data.session_id
        }));
        
        // For now, redirect to success page with payment info
        const successUrl = `http://localhost:3002/payment/success?session_id=${data.session_id}&amount=${paymentDetails.amount}&method=${encodeURIComponent(selectedMethod)}`;
        window.location.href = successUrl;
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Checkout error response:', errorData);
        const errorMessage = errorData.message || errorData.error || 'Failed to create checkout session';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed: ' + error.message);
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
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Back
          </button>
          <h1>Payment</h1>
        </div>

        <div className="payment-content">
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
            
            {paymentMethods.length === 0 && !error && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading payment methods...
              </div>
            )}
            
            <div className="methods-grid">
              {paymentMethods.map((method) => (
                <div
                  key={method.type}
                  className={`payment-method ${selectedMethod === method.type ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method.type)}
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
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
