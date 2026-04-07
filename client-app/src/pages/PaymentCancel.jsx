import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaRedo } from 'react-icons/fa';
import './PaymentCancel.css';

function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="payment-cancel-page">
      <div className="cancel-container">
        <div className="cancel-icon">
          <FaTimesCircle />
        </div>
        
        <h1>Payment Cancelled</h1>
        <p className="cancel-message">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div className="cancel-details">
          <h2>What happened?</h2>
          <p>You chose to cancel the payment process. This could be because:</p>
          <ul>
            <li>You changed your mind about the purchase</li>
            <li>You wanted to review the details again</li>
            <li>You encountered an issue during payment</li>
          </ul>
        </div>

        <div className="cancel-actions">
          <button 
            className="action-button primary"
            onClick={() => window.location.href = '/services'}
          >
            <FaRedo /> Try Again
          </button>
          
          <button 
            className="action-button secondary"
            onClick={() => window.location.href = '/home'}
          >
            <FaHome /> Return to Home
          </button>
        </div>

        <div className="help-section">
          <h3>Need Help?</h3>
          <p>If you experienced any issues or have questions, please contact our support team.</p>
          <button 
            className="contact-support-btn"
            onClick={() => navigate('/contact')}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
