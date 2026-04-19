import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaDownload, FaEnvelope } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [paymentData, setPaymentData] = useState(null);
  
  // Initialize payment data
  useEffect(() => {
    // Get payment data from state or query parameters or sessionStorage
    const getPaymentData = () => {
      // Check if data is passed via state (from modal)
      if (location.state) {
        return location.state;
      }
      
      // Check query parameters (from PayMongo redirect)
      const params = new URLSearchParams(location.search);
      const paymentId = params.get('payment_id');
      
      if (paymentId) {
        return {
          payment_id: paymentId,
          amount: params.get('amount') || 0,
          method: params.get('method') || 'PayMongo',
          reference: params.get('session_id') || paymentId,
          description: params.get('description') || 'Service Payment'
        };
      }
      
      // Check sessionStorage (fallback when PayMongo strips query params)
      const storedPaymentInfo = sessionStorage.getItem('paymentInfo');
      if (storedPaymentInfo) {
        try {
          const info = JSON.parse(storedPaymentInfo);
          sessionStorage.removeItem('paymentInfo'); // Clear after retrieving
          return {
            payment_id: info.paymentId,
            amount: info.amount || 0,
            method: info.method || 'PayMongo',
            reference: info.sessionId || info.paymentId,
            description: info.description || 'Service Payment'
          };
        } catch (e) {
          console.error('Error parsing stored payment info:', e);
        }
      }
      
      // Default fallback
      return {
        payment_id: null,
        amount: 0,
        method: 'PayMongo',
        reference: 'N/A',
        description: 'Service Payment'
      };
    };

    setPaymentData(getPaymentData());
  }, [location.state, location.search]);

  useEffect(() => {
    // Mark payment as completed when user returns from PayMongo
    const completePayment = async () => {
      const params = new URLSearchParams(location.search);
      let paymentId = params.get('payment_id');
      
      // If payment_id not in URL, check sessionStorage
      if (!paymentId) {
        paymentId = sessionStorage.getItem('currentPaymentId');
        console.log('Retrieved payment_id from sessionStorage:', paymentId);
      }
      
      console.log('PaymentSuccess page loaded with payment_id:', paymentId);
      console.log('Full URL params:', Object.fromEntries(params));
      
      if (paymentId) {
        try {
          console.log('Calling payment success API with payment_id:', paymentId);
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
            
            // Clear the stored payment ID
            sessionStorage.removeItem('currentPaymentId');
            
            // Store payment completion info in sessionStorage for BillingPage to pick up
            sessionStorage.setItem('paymentCompleted', JSON.stringify({
              paymentId: paymentId,
              amount: result.amount,
              method: result.method,
              completedAt: result.completed_at,
              timestamp: new Date().getTime()
            }));
          } else {
            const error = await response.json().catch(() => ({}));
            console.error('Failed to mark payment as completed:', error);
            // Don't throw - allow page to continue even if API call fails
          }
        } catch (error) {
          console.error('Error completing payment:', error);
          // Don't throw - allow page to continue even if API call fails
        }
      } else {
        console.warn('No payment_id found in URL');
      }
    };
    
    if (paymentData) {
      console.log('Payment completed page data:', paymentData);
      completePayment();
    }
  }, [location.search, paymentData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const receiptNumber = paymentData ? `SANC-${Date.now().toString().slice(-8)}` : 'N/A';
  const transactionDate = new Date();

  const generatePDFReceipt = () => {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || 'N/A';
    
    // Get lawn lot info from sessionStorage if available
    const lawnLotInfo = sessionStorage.getItem('lawnLotInfo');
    let lawnLotHTML = '';
    
    if (lawnLotInfo) {
      try {
        const lotData = JSON.parse(lawnLotInfo);
        lawnLotHTML = `
          <div class="section">
            <div class="section-title">Lawn Lot Information</div>
            <div class="detail-row">
              <span class="label">Lot Number:</span>
              <span class="value">${lotData.plot_number || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">${lotData.grave_location || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Section:</span>
              <span class="value">${lotData.section || 'N/A'}</span>
            </div>
          </div>
        `;
      } catch (e) {
        console.error('Error parsing lawn lot info:', e);
      }
    }
    
    // Create a simple HTML receipt that can be printed
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt-container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { margin: 0; color: #333; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row .label { font-weight: 500; }
          .detail-row .value { text-align: right; }
          .amount-row { font-size: 16px; font-weight: bold; color: #27ae60; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; color: #666; font-size: 12px; }
          .status { text-align: center; color: #27ae60; font-weight: bold; font-size: 18px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>Sanctuario De Carmona</h1>
            <p>Memorial Park</p>
            <p>Payment Receipt</p>
          </div>
          
          <div class="status">✓ PAYMENT SUCCESSFUL</div>
          
          <div class="section">
            <div class="section-title">Receipt Information</div>
            <div class="detail-row">
              <span class="label">Receipt Number:</span>
              <span class="value">${receiptNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date & Time:</span>
              <span class="value">${transactionDate.toLocaleString('en-PH')}</span>
            </div>
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value">${paymentData.reference}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Customer Information</div>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${userName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${userEmail}</span>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Payment Details</div>
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">${paymentData.description}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span class="value">${paymentData.method}</span>
            </div>
            <div class="detail-row amount-row">
              <span class="label">Amount Paid:</span>
              <span class="value">${formatCurrency(paymentData.amount)}</span>
            </div>
          </div>
          
          ${lawnLotHTML}
          
          <div class="section">
            <div class="section-title">Status</div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value" style="color: #27ae60; font-weight: bold;">COMPLETED</span>
            </div>
            <div class="detail-row">
              <span class="label">Processing Status:</span>
              <span class="value">Pending (1-2 business days)</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>For inquiries, please contact us at info@sanctuario.com or call 1-888-881-6131</p>
            <p>This is an automated receipt. Please keep this for your records.</p>
            <p style="margin-top: 20px;">Generated on ${transactionDate.toLocaleString('en-PH')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return receiptHTML;
  };

  const handleDownloadReceipt = async () => {
    try {
      const receiptHTML = generatePDFReceipt();
      
      // Create a blob from the HTML
      const blob = new Blob([receiptHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${receiptNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setAlertModal({ 
        show: true, 
        type: 'success', 
        message: 'Receipt downloaded successfully! You can open it in any web browser or print it.' 
      });
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setAlertModal({ 
        show: true, 
        type: 'error', 
        message: 'Failed to download receipt. Please try again.' 
      });
    }
  };

  const handleEmailReceipt = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      if (!userEmail) {
        setAlertModal({ 
          show: true, 
          type: 'error', 
          message: 'Email address not found. Please update your profile.' 
        });
        return;
      }
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/payments/send-receipt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: userEmail,
          payment_id: paymentData.payment_id,
          receipt_number: receiptNumber,
          amount: paymentData.amount,
          method: paymentData.method,
          transaction_id: paymentData.reference,
          description: paymentData.description
        })
      });
      
      if (response.ok) {
        setAlertModal({ 
          show: true, 
          type: 'success', 
          message: `Receipt has been sent to ${userEmail}. Please check your inbox.` 
        });
      } else {
        const error = await response.json().catch(() => ({}));
        setAlertModal({ 
          show: true, 
          type: 'error', 
          message: error.message || 'Failed to send receipt. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error sending receipt:', error);
      setAlertModal({ 
        show: true, 
        type: 'error', 
        message: 'Failed to send receipt. Please try again.' 
      });
    }
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

        {paymentData && (
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
            <span>{receiptNumber}</span>
          </div>
          <div className="detail-row">
            <span>Date & Time:</span>
            <span>{new Date().toLocaleString('en-PH')}</span>
          </div>
        </div>
        )}

        <div className="success-actions">
          <button 
            className="action-button primary"
            onClick={() => {
              // Use React Router navigation instead of full page reload
              navigate('/home', { replace: true });
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
