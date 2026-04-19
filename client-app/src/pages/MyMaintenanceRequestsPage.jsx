import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaClock, FaCheckCircle, FaShoppingBag } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import ImageModal from '../components/ImageModal';
import './MyMaintenanceRequestsPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

function MyMaintenanceRequestsPage() {
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMaintenanceRequests(),
      fetchPurchases()
    ]);
    setLoading(false);
  };

  const fetchMaintenanceRequests = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
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
        
        setPurchases(bookingsWithPaymentStatus);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
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

  const allRequests = [...maintenanceRequests, ...purchases];
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
              setAlertModal({
                show: true,
                type: 'success',
                message: 'Refreshed successfully!',
                onClose: () => setAlertModal({ show: false, type: 'info', message: '' })
              });
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
            {/* Maintenance Requests Section */}
            {maintenanceRequests.length > 0 && (
              <>
                <div className="section-header">
                  <FaClipboardList className="section-icon" />
                  <h2>Maintenance Requests</h2>
                </div>
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
                        {(request.status?.toLowerCase() === 'responded' || request.status?.toLowerCase() === 'closed') && (
                          <p className="status-description">
                            ✅ Your maintenance request has been completed. Thank you for choosing our services!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Purchases Section */}
            {purchases.length > 0 && (
              <>
                <div className="section-header">
                  <FaShoppingBag className="section-icon" />
                  <h2>Purchases</h2>
                </div>
                {purchases.map((purchase) => (
                  <div key={`purchase-${purchase.id}`} className="request-card purchase-card">
                    <div className="request-header">
                      <div className="request-title-section">
                        <h3>{purchase.service?.name || purchase.product?.name || 'Purchase'}</h3>
                        <span className="plan-badge">{purchase.plan_type || 'Standard'}</span>
                      </div>
                      <div className="purchase-status-badges">
                        <div className={`status-badge ${getStatusClass(purchase.status)}`}>
                          <FaShoppingBag className="status-icon" />
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
              </>
            )}
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
