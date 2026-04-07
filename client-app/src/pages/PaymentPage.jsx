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
    amount: location.state?.amount || 5000,
    description: location.state?.description || 'Memorial Service Payment',
    serviceType: location.state?.serviceType || 'general'
  };

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: ''
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/payments/methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.payment_methods);
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
      const clientId = localStorage.getItem('userId') || 1; // Get from localStorage or user context

      if (selectedMethod === 'card') {
        // Handle card payment with Payment Intent
        await handleCardPayment(token, clientId);
      } else {
        // Handle e-wallet/online banking with Checkout Session
        await handleCheckoutPayment(token, clientId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (token, clientId) => {
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: paymentDetails.amount,
        description: paymentDetails.description,
        payment_method: 'card',
        client_id: clientId,
        service_type: paymentDetails.serviceType
      })
    });

    if (response.ok) {
      const data = await response.json();
      // In a real implementation, you would use PayMongo's JavaScript SDK
      // to handle the card payment with the client_secret
      alert('Card payment integration requires PayMongo JS SDK. Redirecting to success page...');
      navigate('/payment/success', { 
        state: { 
          amount: paymentDetails.amount, 
          method: 'card',
          reference: data.payment_intent.id 
        } 
      });
    } else {
      throw new Error('Payment intent creation failed');
    }
  };

  const handleCheckoutPayment = async (token, clientId) => {
    const customerName = localStorage.getItem('userName') || 'Guest';
    
    const response = await fetch('/api/payments/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: paymentDetails.amount,
        description: paymentDetails.description,
        payment_method: selectedMethod,
        client_id: clientId,
        customer_name: customerName,
        service_type: paymentDetails.serviceType
      })
    });

    if (response.ok) {
      const data = await response.json();
      // Redirect to PayMongo checkout page
      window.location.href = data.checkout_url;
    } else {
      throw new Error('Checkout session creation failed');
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

          {/* Card Details Form (shown only for card payments) */}
          {selectedMethod === 'card' && (
            <div className="card-details">
              <h2>Card Details</h2>
              <div className="card-form">
                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Month</label>
                    <select
                      value={cardDetails.expiryMonth}
                      onChange={(e) => setCardDetails({...cardDetails, expiryMonth: e.target.value})}
                    >
                      <option value="">MM</option>
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Expiry Year</label>
                    <select
                      value={cardDetails.expiryYear}
                      onChange={(e) => setCardDetails({...cardDetails, expiryYear: e.target.value})}
                    >
                      <option value="">YYYY</option>
                      {Array.from({length: 10}, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>CVC</label>
                    <input
                      type="text"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;