import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaDownload, FaEnvelope } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  
  // Get payment data from state or query parameters
  const getPaymentData = () => {
    // Check if data is passed via state (from modal)
    if (location.state) {
      return location.state;
    }
    
    // Otherwise, check query parameters (from PayMongo redirect)
    const params = new URLSearchParams(location.search);
    return {
      amount: params.get('amount') || 0,
      method: params.get('method') || 'PayMongo',
      reference: params.get('reference') || params.get('id') || 'N/A'
    };
  };

  const paymentData = getPaymentData();

  useEffect(() => {
    // Mark payment as completed when user returns from PayMongo
    const completePayment = async () => {
      const params = new URLSearchParams(location.search);
      const paymentId = params.get('payment_id');
      
      console.log('PaymentSuccess page loaded with payment_id:', paymentId);
      console.log('Full URL params:', Object.fromEntries(params));
      
      if (paymentId) {
        try {
          console.log('Calling payment success API...');
          const response = await fetch(`http://localhost:8000/api/payments/success?payment_id=${paymentId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          console.log('Payment success API response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Payment marked as completed:', result);
          } else {
            const error = await response.json().catch(() => ({}));
            console.error('Failed to mark payment as completed:', error);
          }
        } catch (error) {
          console.error('Error completing payment:', error);
        }
      } else {
        console.warn('No payment_id found in URL');
      }
    };
    
    console.log('Payment completed page data:', paymentData);
    completePayment();
  }, [location.search]); // Remove paymentData from dependencies to avoid infinite loop

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const generateReceiptNumber = () => {
    return `SANC-${Date.now().toString().slice(-8)}`;
  };

  const handleDownloadReceipt = () => {
    // In a real implementation, this would generate and download a PDF receipt
    setAlertModal({ show: true, type: 'info', message: 'Receipt download functionality will be implemented with PDF generation.' });
  };

  const handleEmailReceipt = () => {
    // In a real implementation, this would send an email receipt
    setAlertModal({ show: true, type: 'info', message: 'Email receipt functionality will be implemented.' });
  };

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Thank you for your payment. Your transaction has been processed successfully.
        </p>

        <div className="payment-details">
          <h2>Payment Details</h2>
          <div className="detail-row">
            <span>Amount Paid:</span>
            <span className="amount">{formatCurrency(paymentData.amount)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>{paymentData.method}</span>
          </div>
          <div className="detail-row">
            <span>Transaction ID:</span>
            <span>{paymentData.reference}</span>
          </div>
          <div className="detail-row">
            <span>Receipt Number:</span>
            <span>{generateReceiptNumber()}</span>
          </div>
          <div className="detail-row">
            <span>Date & Time:</span>
            <span>{new Date().toLocaleString('en-PH')}</span>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="action-button primary"
            onClick={() => {
              // Force a full page reload to clear cache and refresh data
              window.location.href = '/home';
            }}
          >
            <FaHome /> Return to Home
          </button>
          
          <button 
            className="action-button secondary"
            onClick={handleDownloadReceipt}
          >
            <FaDownload /> Download Receipt
          </button>
          
          <button 
            className="action-button secondary"
            onClick={handleEmailReceipt}
          >
            <FaEnvelope /> Email Receipt
          </button>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>You will receive a confirmation email shortly</li>
            <li>Your payment will be processed within 1-2 business days</li>
            <li>For any questions, contact our support team</li>
          </ul>
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

export default PaymentSuccess;