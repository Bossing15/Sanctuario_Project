import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import AlertModal from '../components/AlertModal';
import './BillingPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

function BillingPage() {
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });

  useEffect(() => {
    fetchPendingPayments();
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setShowPaymentModal(false);
      setSelectedPayment(null);
    };
  }, []);

  const fetchPendingPayments = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      // Add cache-busting parameter
      const cacheBuster = `?_=${new Date().getTime()}`;
      const response = await fetch(`http://localhost:8000/api/payments${cacheBuster}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allPayments = data.data || data;
        
        console.log('All payments fetched:', allPayments);
        console.log('Payment statuses:', allPayments.map(p => ({ id: p.id, status: p.status, paid_date: p.paid_date })));
        
        const pending = allPayments.filter(
          payment => payment.status === 'pending' || payment.status === 'overdue'
        );
        
        const completed = allPayments.filter(
          payment => payment.status === 'completed'
        );
        
        console.log('Pending payments:', pending.length);
        console.log('Completed payments:', completed.length);
        
        setPendingPayments(pending);
        setCompletedPayments(completed);
      } else {
        console.warn('Failed to fetch payments:', response.status);
        setPendingPayments([]);
        setCompletedPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPendingPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
    console.log('Opening payment modal for payment:', payment);
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalBalance = () => {
    return pendingPayments.reduce((total, payment) => {
      return total + parseFloat(payment.amount);
    }, 0);
  };

  // Force re-render when component mounts
  const [componentKey] = useState(Date.now());

  return (
    <div className="billing-page" key={componentKey}>
      {/* Hero Banner */}
      <div className="billing-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Billing & Payments</h1>
        </div>
      </div>

      <div className="billing-container">
        {/* Tabs */}
        <div className="billing-tabs">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Payments ({pendingPayments.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Payment History ({completedPayments.length})
          </button>
        </div>

        <div className="billing-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your payments...</p>
            </div>
          ) : activeTab === 'pending' ? (
            pendingPayments.length === 0 ? (
              <div className="no-payments-state">
                <div className="success-icon">✓</div>
                <h3>All Caught Up!</h3>
                <p>You have no pending payments at this time.</p>
              </div>
            ) : (
              <>
              <div className="total-balance-card">
                <div className="balance-label">Total Outstanding Balance</div>
                <div className="balance-amount">{formatCurrency(getTotalBalance())}</div>
              </div>

              <div className="payments-list">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-info">
                      <div className="payment-header">
                        <h4>{payment.description || 'Service Payment'}</h4>
                        <span className={`payment-status ${payment.status}`}>
                          {payment.status === 'overdue' ? '⚠️ Overdue' : '⏳ Pending'}
                        </span>
                      </div>
                      <div className="payment-details">
                        <div className="detail-item">
                          <span className="detail-label">Plan:</span>
                          <span className="detail-value">{payment.payment_type || 'One-time'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Due Date:</span>
                          <span className="detail-value">{formatDate(payment.due_date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="payment-action">
                      <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                      <button 
                        className="pay-now-btn"
                        onClick={() => handlePayNow(payment)}
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
            )
          ) : (
            completedPayments.length === 0 ? (
              <div className="no-payments-state">
                <div className="info-icon">ℹ️</div>
                <h3>No Payment History</h3>
                <p>You don't have any completed payments yet.</p>
              </div>
            ) : (
              <div className="payments-list">
                {completedPayments.map((payment) => (
                  <div key={payment.id} className="payment-item completed">
                    <div className="payment-info">
                      <div className="payment-header">
                        <h4>{payment.description || 'Service Payment'}</h4>
                        <span className="payment-status completed">
                          ✓ Paid
                        </span>
                      </div>
                      <div className="payment-details">
                        <div className="detail-item">
                          <span className="detail-label">Plan:</span>
                          <span className="detail-value">{payment.payment_type || 'One-time'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Paid Date:</span>
                          <span className="detail-value">{payment.paid_date ? formatDate(payment.paid_date) : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Payment Method:</span>
                          <span className="detail-value">{payment.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="payment-action">
                      <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <PaymentModal
          key={`payment-modal-${selectedPayment.id}`}
          service={{ title: selectedPayment.description || 'Payment', slug: 'payment' }}
          planType={selectedPayment.payment_type}
          amount={selectedPayment.amount}
          bookingId={selectedPayment.booking_id}
          paymentId={selectedPayment.id}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
            fetchPendingPayments();
          }}
        />
      )}

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

export default BillingPage;
