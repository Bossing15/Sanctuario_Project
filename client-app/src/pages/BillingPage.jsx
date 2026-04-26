import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaPrint, FaEye } from 'react-icons/fa';
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
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState(null);
  const [highlightedPaymentId, setHighlightedPaymentId] = useState(null);

  useEffect(() => {
    fetchPendingPayments();
    
    // Check if payment was completed via query parameter (from PayMongo redirect)
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_completed') === 'true') {
      console.log('Payment completed via redirect, refreshing payments');
      
      // Refresh payments after a short delay to ensure backend has updated
      setTimeout(() => {
        fetchPendingPayments();
      }, 1000);
      
      // Show success message
      setAlertModal({
        show: true,
        type: 'success',
        message: 'Payment completed successfully! Your payment has been processed.',
        onClose: () => {
          setAlertModal({ show: false, type: 'info', message: '' });
          // Clear the query parameter
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
    
    // Check if a payment was just completed (legacy sessionStorage method)
    const checkPaymentCompletion = () => {
      const paymentCompleted = sessionStorage.getItem('paymentCompleted');
      if (paymentCompleted) {
        try {
          const completedPayment = JSON.parse(paymentCompleted);
          console.log('Payment was just completed, refreshing data:', completedPayment);
          
          // Refresh payments after a short delay to ensure backend has updated
          setTimeout(() => {
            fetchPendingPayments();
          }, 1000);
          
          // Clear the flag
          sessionStorage.removeItem('paymentCompleted');
        } catch (e) {
          console.error('Error parsing payment completion info:', e);
        }
      }
    };
    
    checkPaymentCompletion();
    
    // Check if there's a pending payment from My Requests redirect
    const checkPendingPayment = () => {
      const pendingPaymentData = sessionStorage.getItem('pendingPayment');
      console.log('Checking pending payment:', pendingPaymentData);
      
      if (pendingPaymentData) {
        try {
          const paymentData = JSON.parse(pendingPaymentData);
          console.log('Pending payment from redirect:', paymentData);
          
          // Store for later matching
          sessionStorage.setItem('redirectedPaymentInfo', JSON.stringify(paymentData));
          console.log('Stored redirectedPaymentInfo');
          
          // Clear the pending payment data
          sessionStorage.removeItem('pendingPayment');
          console.log('Cleared pendingPayment');
        } catch (e) {
          console.error('Error parsing pending payment info:', e);
        }
      }
    };
    
    checkPendingPayment();
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setShowPaymentModal(false);
      setSelectedPayment(null);
    };
  }, []);

  // Effect to highlight payment after it's loaded
  useEffect(() => {
    console.log('Highlight effect triggered:', { loading, pendingPaymentsLength: pendingPayments.length });
    
    if (!loading && pendingPayments.length > 0) {
      const redirectedPaymentInfo = sessionStorage.getItem('redirectedPaymentInfo');
      console.log('Redirected payment info:', redirectedPaymentInfo);
      
      if (redirectedPaymentInfo) {
        try {
          const paymentInfo = JSON.parse(redirectedPaymentInfo);
          console.log('Looking for payment to highlight:', paymentInfo);
          console.log('All pending payments:', pendingPayments);
          
          // Match by invoice_number (for maintenance requests) or reservation_code (for reservations)
          const matchingPayment = pendingPayments.find(p => {
            const invoiceNumberMatch = p.invoice_number === paymentInfo.invoiceNumber;
            const reservationCodeMatch = p.reservation_code === paymentInfo.reservationCode;
            
            console.log('Comparing payment:', { 
              id: p.id,
              paymentInvoiceNumber: p.invoice_number,
              infoInvoiceNumber: paymentInfo.invoiceNumber,
              invoiceNumberMatch,
              paymentReservationCode: p.reservation_code,
              infoReservationCode: paymentInfo.reservationCode,
              reservationCodeMatch
            });
            
            return invoiceNumberMatch || reservationCodeMatch;
          });
          
          console.log('Matching payment result:', matchingPayment);
          
          if (matchingPayment) {
            console.log('Found matching payment to highlight:', matchingPayment.id);
            setHighlightedPaymentId(matchingPayment.id);
            
            // Auto-scroll to the highlighted payment after a small delay
            setTimeout(() => {
              const element = document.getElementById(`payment-${matchingPayment.id}`);
              console.log('Element found:', !!element);
              if (element) {
                console.log('Scrolling to payment:', matchingPayment.id);
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
            
            // Clear highlight after 5 seconds
            setTimeout(() => {
              console.log('Clearing highlight');
              setHighlightedPaymentId(null);
              sessionStorage.removeItem('redirectedPaymentInfo');
            }, 5000);
          } else {
            console.log('No matching payment found');
          }
        } catch (e) {
          console.error('Error processing redirected payment info:', e);
        }
      }
    }
  }, [loading, pendingPayments]);

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
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include',
      });

      let allPayments = [];
      
      if (response.ok) {
        const data = await response.json();
        allPayments = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (Array.isArray(data.payments) ? data.payments : []));
        
        console.log('All payments fetched:', allPayments);
        console.log('Payment statuses:', allPayments.map(p => ({ id: p.id, status: p.status, paid_date: p.paid_date })));
      } else {
        console.warn('Failed to fetch payments:', response.status);
        
        // If 401, clear token and redirect to login
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          navigate('/login');
          return;
        }
      }
      
      // Fetch maintenance bookings that are ready for payment
      try {
        const userResponse = await fetch('http://localhost:8000/api/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userId = userData.id;

          const bookingsResponse = await fetch(`http://localhost:8000/api/bookings/user/${userId}${cacheBuster}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            credentials: 'include',
          });

          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            let bookings = Array.isArray(bookingsData) ? bookingsData : (Array.isArray(bookingsData.data) ? bookingsData.data : (Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []));
            
            // Filter maintenance bookings that are ready for payment
            const maintenanceReadyForPayment = bookings.filter(b => 
              b.service_id && !b.product_id && b.status?.toLowerCase() === 'readyforpayment'
            );
            
            console.log('Maintenance bookings ready for payment:', maintenanceReadyForPayment);
            
            // Convert maintenance bookings to payment format
            // Use booking ID as the payment ID for now
            const maintenancePayments = maintenanceReadyForPayment.map(booking => ({
              id: booking.id,
              booking_id: booking.id,
              type: 'maintenance-booking',
              invoice_number: booking.invoice_number || `SANC-${booking.id}`,
              description: booking.service?.title || booking.service?.name || 'Maintenance Service',
              amount: booking.total_amount || booking.amount,
              status: 'pending',
              created_at: booking.created_at,
              plan_type: booking.plan_type || 'Standard'
            }));
            
            // Combine regular payments with maintenance bookings
            allPayments = [...allPayments, ...maintenancePayments];
          }
        }
      } catch (error) {
        console.error('Error fetching maintenance bookings:', error);
      }
        
        const pending = allPayments.filter(
          payment => payment.status === 'pending' || payment.status === 'overdue'
        );
        
        const completed = allPayments.filter(
          payment => payment.status === 'completed'
        );
        
        console.log('Pending payments (including maintenance):', pending.length);
        console.log('Completed payments:', completed.length);
        
        setPendingPayments(pending);
        setCompletedPayments(completed);
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

  const generateReceiptHTML = (payment) => {
    const userName = localStorage.getItem('userName') || 'Guest';
    const userEmail = localStorage.getItem('userEmail') || 'N/A';
    const receiptNumber = `SANC-${payment.id}-${new Date(payment.paid_date || payment.created_at).getTime().toString().slice(-6)}`;
    const transactionDate = new Date(payment.paid_date || payment.created_at);
    const isPaid = payment.status === 'completed';
    
    // Get lawn lot information if available
    const lawnLotInfo = payment.grave_location ? `
      <div class="section">
        <div class="section-title">Lawn Lot Information</div>
        <div class="detail-row">
          <span class="label">Lot Number:</span>
          <span class="value">${payment.plot_number || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Location:</span>
          <span class="value">${payment.grave_location || 'N/A'}</span>
        </div>
        <div class="detail-row">
          <span class="label">Section:</span>
          <span class="value">${payment.section || 'N/A'}</span>
        </div>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${isPaid ? 'Receipt' : 'Invoice'} - ${receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .receipt-container { max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ddd; padding: 30px; border-radius: 8px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #333; font-size: 24px; }
          .header p { margin: 5px 0; color: #666; font-size: 14px; }
          .section { margin: 25px 0; }
          .section-title { font-weight: bold; font-size: 14px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 8px; color: #333; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-row .label { font-weight: 500; color: #555; }
          .detail-row .value { text-align: right; color: #333; }
          .amount-row { font-size: 16px; font-weight: bold; color: #27ae60; border-bottom: 2px solid #27ae60; padding: 15px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #333; color: #666; font-size: 12px; }
          .status { text-align: center; font-weight: bold; font-size: 18px; margin: 20px 0; padding: 10px; border-radius: 4px; }
          .status.paid { color: #27ae60; background-color: #d4edda; }
          .status.pending { color: #ff9800; background-color: #fff3cd; }
          .status.overdue { color: #dc3545; background-color: #f8d7da; }
          @media print {
            body { background-color: white; }
            .receipt-container { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>Sanctuario De Carmona</h1>
            <p>Memorial Park</p>
            <p>${isPaid ? 'Payment Receipt' : 'Invoice'}</p>
          </div>
          
          <div class="status ${isPaid ? 'paid' : payment.status === 'overdue' ? 'overdue' : 'pending'}">
            ${isPaid ? '✓ PAYMENT SUCCESSFUL' : payment.status === 'overdue' ? '⚠️ PAYMENT OVERDUE' : '⏳ PAYMENT PENDING'}
          </div>
          
          <div class="section">
            <div class="section-title">${isPaid ? 'Receipt' : 'Invoice'} Information</div>
            <div class="detail-row">
              <span class="label">${isPaid ? 'Receipt' : 'Invoice'} Number:</span>
              <span class="value">${receiptNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date & Time:</span>
              <span class="value">${transactionDate.toLocaleString('en-PH')}</span>
            </div>
            ${isPaid ? `
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value">${payment.paymongo_intent_id || payment.payment_reference || 'N/A'}</span>
            </div>
            ` : ''}
            ${!isPaid ? `
            <div class="detail-row">
              <span class="label">Due Date:</span>
              <span class="value">${new Date(payment.due_date).toLocaleString('en-PH')}</span>
            </div>
            ` : ''}
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
              <span class="value">${payment.description || 'Service Payment'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Method:</span>
              <span class="value">${payment.payment_method || 'Pending'}</span>
            </div>
            <div class="detail-row amount-row">
              <span class="label">Amount:</span>
              <span class="value">${formatCurrency(payment.amount)}</span>
            </div>
          </div>
          
          ${lawnLotInfo}
          
          <div class="section">
            <div class="section-title">Status</div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value" style="font-weight: bold; ${isPaid ? 'color: #27ae60;' : payment.status === 'overdue' ? 'color: #dc3545;' : 'color: #ff9800;'}">${isPaid ? 'COMPLETED' : payment.status === 'overdue' ? 'OVERDUE' : 'PENDING'}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>For inquiries, please contact us at info@sanctuario.com or call 1-888-881-6131</p>
            <p>This is an automated ${isPaid ? 'receipt' : 'invoice'}. Please keep this for your records.</p>
            <p style="margin-top: 20px;">Generated on ${transactionDate.toLocaleString('en-PH')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleViewReceipt = (payment) => {
    setSelectedReceiptPayment(payment);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = (payment) => {
    try {
      const receiptHTML = generateReceiptHTML(payment);
      const blob = new Blob([receiptHTML], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${payment.id}-${new Date(payment.paid_date).getTime().toString().slice(-6)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setAlertModal({ 
        show: true, 
        type: 'success', 
        message: 'Receipt downloaded successfully!' 
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

  const handlePrintReceipt = (payment) => {
    try {
      const receiptHTML = generateReceiptHTML(payment);
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error printing receipt:', error);
      setAlertModal({ 
        show: true, 
        type: 'error', 
        message: 'Failed to print receipt. Please try again.' 
      });
    }
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
                  <div 
                    key={payment.id} 
                    id={`payment-${payment.id}`}
                    className={`payment-item ${highlightedPaymentId === payment.id ? 'highlighted' : ''}`}
                  >
                    <div className="payment-info">
                      <div className="payment-header">
                        <h4>{payment.description || 'Service Payment'}</h4>
                        <span className={`payment-status ${payment.status}`}>
                          {payment.status === 'overdue' ? '⚠️ Overdue' : '⏳ Pending'}
                        </span>
                      </div>
                      <div className="payment-details">
                        <div className="detail-item">
                          <span className="detail-label">Invoice Number:</span>
                          <span className="detail-value" style={{ fontWeight: 'bold', color: '#3b82f6' }}>{payment.invoice_number || 'N/A'}</span>
                        </div>
                        {payment.transaction_id && (
                          <div className="detail-item">
                            <span className="detail-label">Transaction ID:</span>
                            <span className="detail-value" style={{ fontWeight: 'bold', color: '#10b981' }}>{payment.transaction_id}</span>
                          </div>
                        )}
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
                      <div className="payment-action-buttons">
                        <div className="receipt-actions">
                          <button 
                            className="receipt-btn view-btn"
                            onClick={() => handleViewReceipt(payment)}
                            title="View Invoice"
                          >
                            <FaEye /> View
                          </button>
                          <button 
                            className="receipt-btn download-btn"
                            onClick={() => handleDownloadReceipt(payment)}
                            title="Download Invoice"
                          >
                            <FaDownload /> Download
                          </button>
                          <button 
                            className="receipt-btn print-btn"
                            onClick={() => handlePrintReceipt(payment)}
                            title="Print Invoice"
                          >
                            <FaPrint /> Print
                          </button>
                        </div>
                        <button 
                          className="pay-now-btn"
                          onClick={() => handlePayNow(payment)}
                        >
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
            )
          ) : (
            completedPayments.length === 0 ? (
              <div className="no-payments-state">
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
                          <span className="detail-label">Invoice Number:</span>
                          <span className="detail-value" style={{ fontWeight: 'bold', color: '#3b82f6' }}>{payment.invoice_number || 'N/A'}</span>
                        </div>
                        {payment.transaction_id && (
                          <div className="detail-item">
                            <span className="detail-label">Transaction ID:</span>
                            <span className="detail-value" style={{ fontWeight: 'bold', color: '#10b981' }}>{payment.transaction_id}</span>
                          </div>
                        )}
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
                      <div className="receipt-actions">
                        <button 
                          className="receipt-btn view-btn"
                          onClick={() => handleViewReceipt(payment)}
                          title="View Receipt"
                        >
                          <FaEye /> View
                        </button>
                        <button 
                          className="receipt-btn download-btn"
                          onClick={() => handleDownloadReceipt(payment)}
                          title="Download Receipt"
                        >
                          <FaDownload /> Download
                        </button>
                        <button 
                          className="receipt-btn print-btn"
                          onClick={() => handlePrintReceipt(payment)}
                          title="Print Receipt"
                        >
                          <FaPrint /> Print
                        </button>
                      </div>
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
          paymentId={selectedPayment.id}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
            fetchPendingPayments();
          }}
          isLawnLotProduct={false}
          isApprovedReservation={true}
          reservationId={selectedPayment.reservation_id}
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

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceiptPayment && (
        <div className="receipt-modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="receipt-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <h2>Payment Receipt</h2>
              <button 
                className="receipt-modal-close"
                onClick={() => setShowReceiptModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="receipt-modal-content">
              <div dangerouslySetInnerHTML={{ __html: generateReceiptHTML(selectedReceiptPayment) }} />
            </div>
            <div className="receipt-modal-footer">
              <button 
                className="receipt-action-btn download"
                onClick={() => {
                  handleDownloadReceipt(selectedReceiptPayment);
                  setShowReceiptModal(false);
                }}
              >
                <FaDownload /> Download
              </button>
              <button 
                className="receipt-action-btn print"
                onClick={() => {
                  handlePrintReceipt(selectedReceiptPayment);
                  setShowReceiptModal(false);
                }}
              >
                <FaPrint /> Print
              </button>
              <button 
                className="receipt-action-btn close"
                onClick={() => setShowReceiptModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingPage;
