import { useState, useEffect } from 'react';
import { FaCreditCard, FaMobile, FaUniversity, FaTimes, FaCheck, FaArrowLeft } from 'react-icons/fa';
import AlertModal from './AlertModal';
import './AdminPaymentModal.css';

function AdminPaymentModal({ payment, onClose }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });

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
        setPaymentMethods(data.payment_methods || []);
      } else if (response.status === 403) {
        const error = await response.json().catch(() => ({ message: 'Permission denied' }));
        setAlertModal({ 
          show: true, 
          type: 'error', 
          message: error.message || 'You do not have permission to access payment methods' 
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setAlertModal({ show: true, type: 'error', message: 'Please select a payment method' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const customerName = payment.customer_name || payment.client?.name || 'Customer';
      
      const requestBody = {
        amount: payment.amount,
        description: payment.description || 'Payment',
        payment_method: selectedMethod,
        client_id: payment.client_id,
        customer_name: customerName,
        existing_payment_id: payment.id,
        is_admin: true
      };
      
      console.log('Admin processing payment:', requestBody);
      
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Checkout created:', data);
        // Redirect to PayMongo
        window.location.href = data.checkout_url;
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        const errorMessage = error.error || error.message || 'Failed to create checkout session';
        
        // Handle permission errors specifically
        if (response.status === 403) {
          setAlertModal({ 
            show: true, 
            type: 'error', 
            message: 'Permission Denied: ' + errorMessage 
          });
          // Close modal after showing error
          setTimeout(() => {
            onClose();
          }, 3000);
        } else {
          setAlertModal({ show: true, type: 'error', message: errorMessage });
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setAlertModal({ show: true, type: 'error', message: 'Payment failed: ' + err.message });
    } finally {
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
      <div className="payment-modal-container">
        <button className="payment-modal-back" onClick={onClose}>
          <FaArrowLeft />
          <span>Back</span>
        </button>
        
        <button className="payment-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="payment-modal-content">
          <h2 className="payment-modal-title">Process Payment for Customer</h2>
          
          {/* Customer Info */}
          <div className="customer-info-box">
            <h3>Customer Information</h3>
            <div className="info-row">
              <span>Name:</span>
              <span>{payment.customer_name || payment.client?.name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span>Payment ID:</span>
              <span>#{payment.id}</span>
            </div>
            {payment.payment_reference && (
              <div className="info-row">
                <span>Reference:</span>
                <span>{payment.payment_reference}</span>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="payment-summary-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Description:</span>
              <span>{payment.description || 'Payment'}</span>
            </div>
            <div className="summary-row">
              <span>Plan:</span>
              <span>{payment.payment_type || 'One-time'}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span className="amount">{formatCurrency(payment.amount)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods-section">
            <h3>Select Payment Method</h3>
            
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
              {loading ? 'Processing...' : `Process ${formatCurrency(payment.amount)}`}
            </button>
          </div>
        </div>
      </div>
      
      {/* Alert Modal */}
      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={() => setAlertModal({ show: false, type: 'info', message: '' })}
        />
      )}
    </div>
  );
}

export default AdminPaymentModal;
