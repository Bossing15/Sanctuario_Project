import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaClock, FaCheckCircle, FaFileAlt, FaTimes } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import ImageModal from '../components/ImageModal';
import './MyMaintenanceRequestsPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

function MyMaintenanceRequestsPage() {
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [maintenanceBookings, setMaintenanceBookings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchData();

    // Auto-refresh disabled - data loads on page load only
    // Users can manually refresh if needed
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMaintenanceRequests(),
      fetchMaintenanceBookings(),
      fetchPurchases(),
      fetchReservations()
    ]);
    setLoading(false);
  };

  const fetchMaintenanceRequests = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/inquiries/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        const inquiries = result.data || result.inquiries || result || [];
        
        // Filter only maintenance-related inquiries
        const maintenanceOnly = inquiries.filter(inquiry => 
          inquiry.product_interest && 
          (inquiry.product_interest.toLowerCase().includes('maintenance') ||
           inquiry.product_interest.toLowerCase().includes('grave'))
        );
        setMaintenanceRequests(maintenanceOnly);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
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
        
        setAlertModal({ 
          show: true, 
          type: 'error', 
          message: errorData.message || 'Failed to load maintenance requests' 
        });
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setAlertModal({ 
        show: true, 
        type: 'error', 
        message: `An error occurred while loading your requests: ${error.message}` 
      });
    }
  };

  const fetchMaintenanceBookings = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      // First get the current user to get their ID
      const userResponse = await fetch('http://localhost:8000/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      // Then fetch bookings for this user
      const response = await fetch(`http://localhost:8000/api/bookings/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        let bookings = result.data || result.bookings || result || [];
        
        // Fetch payment status for each booking
        const bookingsWithPaymentStatus = await Promise.all(
          bookings.map(async (booking) => {
            try {
              const paymentResponse = await fetch('http://localhost:8000/api/payments', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              });

              if (paymentResponse.ok) {
                const paymentsData = await paymentResponse.json();
                const payments = Array.isArray(paymentsData) ? paymentsData : (Array.isArray(paymentsData.data) ? paymentsData.data : (Array.isArray(paymentsData.payments) ? paymentsData.payments : []));
                
                // Find payment for this booking
                const payment = payments.find(p => p.booking_id === booking.id);
                
                return {
                  ...booking,
                  paymentStatus: payment?.status || 'unpaid',
                  paymentId: payment?.id
                };
              }
              return { ...booking, paymentStatus: 'unpaid' };
            } catch (error) {
              console.error('Error fetching payment status:', error);
              return { ...booking, paymentStatus: 'unpaid' };
            }
          })
        );
        
        // Filter only maintenance bookings (those with service_id and no product_id)
        const maintenanceOnly = bookingsWithPaymentStatus.filter(b => b.service_id && !b.product_id);
        setMaintenanceBookings(maintenanceOnly);
      }
    } catch (error) {
      console.error('Error fetching maintenance bookings:', error);
    }
  };

  const fetchPurchases = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      // First get the current user to get their ID
      const userResponse = await fetch('http://localhost:8000/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!userResponse.ok) {
        // If 401, clear token and redirect to login
        if (userResponse.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      // Then fetch bookings for this user
      const response = await fetch(`http://localhost:8000/api/bookings/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        let bookings = result.data || result.bookings || result || [];
        
        // Fetch payment status for each booking
        const bookingsWithPaymentStatus = await Promise.all(
          bookings.map(async (booking) => {
            try {
              const paymentResponse = await fetch('http://localhost:8000/api/payments', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
              });

              if (paymentResponse.ok) {
                const paymentsData = await paymentResponse.json();
                const payments = Array.isArray(paymentsData) ? paymentsData : (Array.isArray(paymentsData.data) ? paymentsData.data : (Array.isArray(paymentsData.payments) ? paymentsData.payments : []));
                
                // Find payment for this booking
                const payment = payments.find(p => p.booking_id === booking.id);
                
                return {
                  ...booking,
                  paymentStatus: payment?.status || 'unpaid',
                  paymentId: payment?.id
                };
              }
              return { ...booking, paymentStatus: 'unpaid' };
            } catch (error) {
              console.error('Error fetching payment status:', error);
              return { ...booking, paymentStatus: 'unpaid' };
            }
          })
        );
        
        // Filter out maintenance services (those with service_id and no product_id)
        // and only keep product bookings
        const productBookings = bookingsWithPaymentStatus.filter(b => b.product_id && !b.service_id);
        setPurchases(productBookings);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchReservations = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/reservations', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return <FaClock className="status-icon pending" />;
      case 'in progress':
        return <FaClock className="status-icon in-progress" />;
      case 'responded':
      case 'closed':
        return <FaCheckCircle className="status-icon completed" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'pending';
      case 'in progress':
        return 'in-progress';
      case 'responded':
      case 'closed':
        return 'completed';
      case 'paid':
        return 'completed';
      default:
        return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'Pending Review';
      case 'in progress':
        return 'In Progress';
      case 'responded':
        return 'Responded';
      case 'closed':
        return 'Completed';
      case 'paid':
        return 'Paid';
      default:
        return status || 'Pending';
    }
  };

  const getPaymentStatusIcon = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="payment-status-icon paid" />;
      case 'pending':
      case 'overdue':
        return <FaClock className="payment-status-icon unpaid" />;
      default:
        return <FaClock className="payment-status-icon unpaid" />;
    }
  };

  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
        return 'Paid';
      case 'pending':
        return 'Pending Payment';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unpaid';
    }
  };

  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'completed':
        return 'paid';
      case 'pending':
      case 'overdue':
        return 'unpaid';
      default:
        return 'unpaid';
    }
  };

  const extractPlanType = (productInterest) => {
    if (!productInterest) return 'N/A';
    const match = productInterest.match(/(Monthly|Quarterly|Yearly)/i);
    return match ? match[1] : 'N/A';
  };

  const extractServiceName = (productInterest) => {
    if (!productInterest) return 'Maintenance Service';
    const parts = productInterest.split(' - ');
    return parts[0] || 'Maintenance Service';
  };

  const handlePaymentRedirect = async (request) => {
    // Store the request data in sessionStorage to be picked up by BillingPage
    const amount = request.message?.match(/₱([\d,]+)/)?.[1] || '0';
    const paymentData = {
      type: 'maintenance-request',
      requestId: request.id,
      invoiceNumber: request.invoice_number,
      description: extractServiceName(request.product_interest),
      amount: parseFloat(amount.replace(/,/g, '')) || 0,
      planType: extractPlanType(request.product_interest),
      createdAt: request.created_at
    };
    console.log('Storing payment data:', paymentData);
    sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
    
    // Create payment record for this inquiry
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/inquiries/${request.id}/create-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: paymentData.amount,
          description: paymentData.description,
        })
      });

      if (response.ok) {
        const paymentResult = await response.json();
        console.log('Payment created:', paymentResult);
      } else {
        console.error('Failed to create payment:', response.status);
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
    
    console.log('Redirecting to billing...');
    navigate('/billing');
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setAlertModal({
          show: true,
          type: 'success',
          message: 'Reservation cancelled successfully',
          onClose: () => {
            setAlertModal({ show: false, type: 'info', message: '' });
            fetchData();
          }
        });
      } else {
        const errorData = await response.json();
        setAlertModal({
          show: true,
          type: 'error',
          message: errorData.message || 'Failed to cancel reservation',
          onClose: () => setAlertModal({ show: false, type: 'info', message: '' })
        });
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Error cancelling reservation: ' + error.message,
        onClose: () => setAlertModal({ show: false, type: 'info', message: '' })
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const calculateValidityDate = (createdAt, planType) => {
    if (!createdAt) return 'N/A';
    
    const startDate = new Date(createdAt);
    const validityDate = new Date(startDate);
    
    switch (planType.toLowerCase()) {
      case 'monthly':
        validityDate.setMonth(validityDate.getMonth() + 1);
        break;
      case 'quarterly':
        validityDate.setMonth(validityDate.getMonth() + 3);
        break;
      case 'yearly':
        validityDate.setFullYear(validityDate.getFullYear() + 1);
        break;
      default:
        return 'N/A';
    }
    
    return validityDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const allRequests = [...maintenanceRequests, ...maintenanceBookings, ...purchases, ...reservations];
  const hasRequests = allRequests.length > 0;

  return (
    <div className="my-maintenance-page">
      {/* Hero Banner */}
      <div className="maintenance-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>My Requests</h1>
        </div>
      </div>

      <div className="maintenance-content-wrapper">
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              fetchData();
            }}
            className="refresh-button"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your requests...</p>
          </div>
        ) : !hasRequests ? (
          <div className="empty-state">
            <FaClipboardList className="empty-icon" />
            <h3>No Requests Yet</h3>
            <p>You haven't submitted any requests or purchases yet.</p>
            <button 
              className="browse-btn"
              onClick={() => navigate('/products-services')}
            >
              Browse Products & Services
            </button>
          </div>
        ) : (
          <div className="requests-list">
            {/* Requests Section - Consolidated */}
            <div className="section-header">
              <FaClipboardList className="section-icon" />
              <h2>Requests</h2>
            </div>

            {/* Maintenance Requests */}
            {maintenanceRequests.map((request) => (
                  <div key={`maint-${request.id}`} className="request-card">
                    <div className="request-header">
                      <div className="request-title-section">
                        <h3>{extractServiceName(request.product_interest)}</h3>
                        <span className="plan-badge">{extractPlanType(request.product_interest)} Plan</span>
                      </div>
                      <div className={`status-badge ${getStatusClass(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{getStatusText(request.status)}</span>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-label">Invoice Number:</span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                          {request.invoice_number || `SANC-${request.id}-${String(new Date(request.created_at).getTime()).slice(-6)}`}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Request ID:</span>
                        <span className="detail-value">#{request.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Submitted:</span>
                        <span className="detail-value">{formatDate(request.created_at)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Valid Until:</span>
                        <span className="detail-value validity-date">
                          {calculateValidityDate(request.created_at, extractPlanType(request.product_interest))}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Contact:</span>
                        <span className="detail-value">{request.phone}</span>
                      </div>
                    </div>

                    {request.message && (
                      <div className="request-message">
                        <h4>Request Details:</h4>
                        <p>{request.message}</p>
                      </div>
                    )}

                    {request.maintenance_photos && JSON.parse(request.maintenance_photos).length > 0 && (
                      <div className="maintenance-photos-section">
                        <h4>Maintenance Photos:</h4>
                        <div className="photos-grid">
                          {JSON.parse(request.maintenance_photos).map((photo, index) => (
                            <div key={index} className="photo-thumbnail">
                              <img 
                                src={`http://localhost:8000/${photo}`} 
                                alt={`Maintenance ${index + 1}`}
                                onClick={() => {
                                  const photos = JSON.parse(request.maintenance_photos).map(
                                    p => `http://localhost:8000/${p}`
                                  );
                                  setSelectedImages(photos);
                                  setSelectedImageIndex(index);
                                  setShowImageModal(true);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="request-footer">
                      <div className="status-info">
                        {request.status?.toLowerCase() === 'new' && (
                          <p className="status-description">
                            ⏳ Your request is being reviewed by our team. We'll contact you soon!
                          </p>
                        )}
                        {request.status?.toLowerCase() === 'in progress' && (
                          <p className="status-description">
                            🔄 Our team is working on your maintenance request. You'll receive photos before payment.
                          </p>
                        )}
                        {request.status?.toLowerCase() === 'responded' && (
                          <p className="status-description">
                            ✅ Our team has responded to your request. You can now proceed to payment.
                          </p>
                        )}
                        {request.status?.toLowerCase() === 'closed' && (
                          <p className="status-description">
                            ✅ Your maintenance request has been completed. You can now proceed to payment.
                          </p>
                        )}
                        {request.status?.toLowerCase() === 'paid' && (
                          <p className="status-description">
                            ✅ Payment completed! Your maintenance request has been confirmed.
                          </p>
                        )}
                      </div>
                      {(request.status?.toLowerCase() === 'responded' || request.status?.toLowerCase() === 'closed') && (
                        <button
                          className="pay-now-btn"
                          onClick={() => handlePaymentRedirect(request)}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}

            {/* Maintenance Bookings */}
            {maintenanceBookings.map((booking) => (
                  <div key={`maintenance-booking-${booking.id}`} className="request-card purchase-card">
                    <div className="request-header">
                      <div className="request-title-section">
                        <h3>{booking.service?.title || booking.service?.name || 'Maintenance Service'}</h3>
                        <span className="plan-badge">{booking.plan_type || 'Standard'}</span>
                      </div>
                      <div className="purchase-status-badges">
                        <div className={`status-badge ${getStatusClass(booking.status)}`}>
                          <FaClipboardList className="status-icon" />
                          <span>{booking.status || 'Active'}</span>
                        </div>
                        <div className={`payment-status-badge ${getPaymentStatusClass(booking.paymentStatus)}`}>
                          {getPaymentStatusIcon(booking.paymentStatus)}
                          <span>{getPaymentStatusText(booking.paymentStatus)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-label">Invoice Number:</span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#3b82f6' }}>{booking.invoice_number || `SANC-${booking.id}`}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">#{booking.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value amount">{formatCurrency(booking.total_amount || booking.amount)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Requested:</span>
                        <span className="detail-value">{formatDate(booking.booking_date || booking.created_at)}</span>
                      </div>
                      {booking.notes && (
                        <div className="detail-row">
                          <span className="detail-label">Notes:</span>
                          <span className="detail-value">{booking.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="request-footer">
                      <div className="status-info">
                        {booking.status?.toLowerCase() === 'pendingreview' && (
                          <p className="status-description">
                            ⏳ Your maintenance request is pending admin approval. We'll contact you soon!
                          </p>
                        )}
                        {booking.status?.toLowerCase() === 'readyforpayment' && (
                          <p className="status-description">
                            💳 Your request has been approved! Please proceed to payment.
                          </p>
                        )}
                        {booking.status?.toLowerCase() === 'paid' && (
                          <p className="status-description">
                            ✅ Payment completed! Your maintenance request has been confirmed.
                          </p>
                        )}
                        {booking.status?.toLowerCase() === 'completed' && (
                          <p className="status-description">
                            ✅ Your maintenance service has been completed. Thank you!
                          </p>
                        )}
                      </div>
                      <div className="action-buttons">
                        {booking.status?.toLowerCase() === 'readyforpayment' && (
                          <button
                            className="pay-now-btn"
                            onClick={() => {
                              const paymentData = {
                                type: 'maintenance-booking',
                                bookingId: booking.id,
                                invoiceNumber: booking.invoice_number || `SANC-${booking.id}`,
                                description: booking.service?.title || booking.service?.name || 'Maintenance Service',
                                amount: booking.total_amount || booking.amount,
                                planType: booking.plan_type || 'Standard',
                                createdAt: booking.created_at
                              };
                              console.log('Storing payment data for maintenance booking:', paymentData);
                              sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                              navigate('/billing');
                            }}
                          >
                            <FaFileAlt /> Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

            {/* Purchases */}
            {purchases.map((purchase) => (
                  <div key={`purchase-${purchase.id}`} className="request-card purchase-card">
                    <div className="request-header">
                      <div className="request-title-section">
                        <h3>{purchase.service?.name || purchase.product?.name || 'Purchase'}</h3>
                        <span className="plan-badge">{purchase.plan_type || 'Standard'}</span>
                      </div>
                      <div className="purchase-status-badges">
                        <div className={`status-badge ${getStatusClass(purchase.status)}`}>
                          <FaCheckCircle className="status-icon" />
                          <span>{purchase.status || 'Active'}</span>
                        </div>
                        <div className={`payment-status-badge ${getPaymentStatusClass(purchase.paymentStatus)}`}>
                          {getPaymentStatusIcon(purchase.paymentStatus)}
                          <span>{getPaymentStatusText(purchase.paymentStatus)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-label">Invoice Number:</span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#3b82f6' }}>{purchase.invoice_number || `SANC-${purchase.id}`}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Booking ID:</span>
                        <span className="detail-value">#{purchase.id}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value amount">{formatCurrency(purchase.amount)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Purchased:</span>
                        <span className="detail-value">{formatDate(purchase.booking_date || purchase.created_at)}</span>
                      </div>
                      {purchase.notes && (
                        <div className="detail-row">
                          <span className="detail-label">Notes:</span>
                          <span className="detail-value">{purchase.notes}</span>
                        </div>
                      )}
                    </div>

                    <div className="request-footer">
                      <div className="status-info">
                        {purchase.status?.toLowerCase() === 'pending' && (
                          <p className="status-description">
                            ⏳ Your purchase is being processed. We'll contact you with more details soon.
                          </p>
                        )}
                        {purchase.status?.toLowerCase() === 'active' && (
                          <p className="status-description">
                            ✅ Your purchase is active. Thank you for choosing our services!
                          </p>
                        )}
                        {purchase.status?.toLowerCase() === 'completed' && (
                          <p className="status-description">
                            ✅ Your purchase has been completed. Thank you for choosing our services!
                          </p>
                        )}
                        {purchase.paymentStatus?.toLowerCase() === 'pending' && (
                          <p className="payment-status-description">
                            💳 Payment pending - Please complete your payment to activate this service.
                          </p>
                        )}
                        {purchase.paymentStatus?.toLowerCase() === 'completed' && (
                          <p className="payment-status-description paid">
                            ✅ Payment completed - Your service is now active!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

            {/* Reservations */}
            {reservations.map((reservation) => (
                  <div key={`reservation-${reservation.id}`} className="request-card reservation-card">
                    <div className="request-header">
                      <div className="request-title-section">
                        <h3>{reservation.product?.title || reservation.service?.title || 'Reservation'}</h3>
                        <span className="plan-badge">{reservation.plan_type || 'Standard'}</span>
                      </div>
                      <div className={`status-badge ${reservation.status === 'pending' ? 'pending' : reservation.status === 'approved' ? 'completed' : reservation.status === 'rejected' ? 'rejected' : reservation.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                        {reservation.status === 'pending' && <FaClock className="status-icon" />}
                        {reservation.status === 'approved' && <FaCheckCircle className="status-icon" />}
                        {reservation.status === 'rejected' && <FaTimes className="status-icon" />}
                        {reservation.status === 'cancelled' && <FaTimes className="status-icon" />}
                        <span>
                          {reservation.status === 'pending' && 'Reserved - Waiting for Admin Approval'}
                          {reservation.status === 'approved' && 'Approved - Ready to Pay'}
                          {reservation.status === 'rejected' && 'Rejected'}
                          {reservation.status === 'cancelled' && 'Cancelled by You'}
                          {reservation.status === 'paid' && 'Paid'}
                        </span>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="detail-row">
                        <span className="detail-label">Invoice Number:</span>
                        <span className="detail-value" style={{ fontWeight: 'bold', color: '#3b82f6' }}>{reservation.invoice_number || `SANC-${reservation.id}`}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Deceased Name:</span>
                        <span className="detail-value">{reservation.deceased_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Date of Death:</span>
                        <span className="detail-value">{formatDate(reservation.deceased_date_of_death)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value amount">{formatCurrency(reservation.amount)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Reserved:</span>
                        <span className="detail-value">{formatDate(reservation.created_at)}</span>
                      </div>
                    </div>

                    {reservation.admin_notes && (
                      <div className="request-message">
                        <h4>Admin Notes:</h4>
                        <p>{reservation.admin_notes}</p>
                      </div>
                    )}

                    <div className="request-footer">
                      <div className="status-info">
                        {reservation.status === 'pending' && (
                          <p className="status-description">
                            ⏳ Your reservation is pending admin approval. We'll notify you once reviewed.
                          </p>
                        )}
                        {reservation.status === 'approved' && (
                          <p className="status-description">
                            ✅ Your reservation has been approved! You can now proceed to payment.
                          </p>
                        )}
                        {reservation.status === 'rejected' && (
                          <p className="status-description">
                            ❌ Your reservation has been rejected. Please contact us for more information.
                          </p>
                        )}
                        {reservation.status === 'cancelled' && (
                          <p className="status-description">
                            ❌ Your reservation has been cancelled. You can create a new reservation anytime.
                          </p>
                        )}
                        {reservation.status === 'paid' && (
                          <p className="status-description">
                            ✅ Payment completed! Your reservation is confirmed.
                          </p>
                        )}
                      </div>
                      <div className="action-buttons">
                        {reservation.status === 'pending' && (
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelReservation(reservation.id)}
                          >
                            <FaTimes /> Cancel Reservation
                          </button>
                        )}
                        {reservation.status === 'approved' && (
                          <button
                            className="pay-now-btn"
                            onClick={() => {
                              const paymentData = {
                                type: 'reservation',
                                reservationId: reservation.id,
                                reservationCode: reservation.reservation_code,
                                description: reservation.product?.title || reservation.service?.title || 'Reservation',
                                amount: reservation.amount,
                                planType: reservation.plan_type || 'Standard',
                                deceasedName: reservation.deceased_name,
                                createdAt: reservation.created_at
                              };
                              console.log('Storing payment data with reservation code:', paymentData);
                              sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                              navigate('/billing');
                            }}
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
        )}
      </div>

      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={() => setAlertModal({ show: false, type: 'info', message: '' })}
        />
      )}

      {showImageModal && (
        <ImageModal
          images={selectedImages}
          initialIndex={selectedImageIndex}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
}

export default MyMaintenanceRequestsPage;
