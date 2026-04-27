import { useState, useEffect } from 'react';
import { FaCreditCard, FaMobile, FaUniversity, FaTimes, FaCheck, FaArrowLeft } from 'react-icons/fa';
import AlertModal from './AlertModal';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

function AdminPaymentModal({ payment, onClose }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });

  // Lock scroll when modal is open
  useModalScrollLock(!!payment);

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
    <div className="modal-overlay">
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <h2>Process Payment for Customer</h2>
          <button className="modern-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modern-modal-content">
          {/* Customer Info */}
          <div className="modal-section">
            <span className="modal-section-title">Customer Information</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Name</label>
                <span>{payment.customer_name || payment.client?.name || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Payment ID</label>
                <span>#{payment.id}</span>
              </div>
              {payment.payment_reference && (
                <div className="modal-info-item">
                  <label>Reference</label>
                  <span>{payment.payment_reference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="modal-section">
            <span className="modal-section-title">Payment Summary</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Description</label>
                <span>{payment.description || 'Payment'}</span>
              </div>
              <div className="modal-info-item">
                <label>Plan</label>
                <span>{payment.payment_type || 'One-time'}</span>
              </div>
              <div className="modal-info-item">
                <label>Total Amount</label>
                <span className="highlight">{formatCurrency(payment.amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="modal-section">
            <span className="modal-section-title">Select Payment Method</span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paymentMethods.map((method) => (
                <div
                  key={method.type}
                  onClick={() => setSelectedMethod(method.type)}
                  style={{
                    padding: '12px',
                    border: selectedMethod === method.type ? '2px solid #1B3022' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: selectedMethod === method.type ? '#f0fdf4' : '#f9fafb',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMethod !== method.type) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMethod !== method.type) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <div style={{ fontSize: '20px', color: '#1B3022' }}>
                    {getMethodIcon(method.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{method.name}</h4>
                    <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>{method.description}</p>
                  </div>
                  {selectedMethod === method.type && (
                    <div style={{ color: '#1B3022', fontSize: '18px' }}>
                      <FaCheck />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modern-modal-footer">
          <button
            className="modal-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="modal-btn-primary"
            onClick={handlePayment}
            disabled={loading || !selectedMethod}
          >
            {loading ? 'Processing...' : `Process ${formatCurrency(payment.amount)}`}
          </button>
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
