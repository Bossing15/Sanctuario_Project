import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaClock, FaCheckCircle, FaFileAlt, FaTimes, FaEye, FaTrash } from 'react-icons/fa';
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
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchData();
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
        
        const maintenanceOnly = inquiries.filter(inquiry => 
          inquiry.product_interest && 
          (inquiry.product_interest.toLowerCase().includes('maintenance') ||
           inquiry.product_interest.toLowerCase().includes('grave'))
        );
        setMaintenanceRequests(maintenanceOnly);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        
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
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const toggleRowExpanded = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const allRequests = [...maintenanceRequests, ...maintenanceBookings, ...purchases, ...reservations];
  const hasRequests = allRequests.length > 0;

  const renderTableRow = (item, type) => {
    const rowId = `${type}-${item.id}`;
    const isExpanded = expandedRows[rowId];
    
    let serviceName = '';
    let status = '';
    let paymentStatus = '';
    let amount = 0;
    let date = '';
    let id = item.id;

    if (type === 'maintenance-request') {
      serviceName = extractServiceName(item.product_interest);
      status = getStatusText(item.status);
      paymentStatus = 'N/A';
      amount = item.message?.match(/₱([\d,]+)/)?.[1] || '0';
      date = formatDate(item.created_at);
    } else if (type === 'maintenance-booking') {
      serviceName = item.service?.title || item.service?.name || 'Maintenance Service';
      status = item.status || 'Active';
      paymentStatus = getPaymentStatusText(item.paymentStatus);
      amount = item.total_amount || item.amount;
      date = formatDate(item.booking_date || item.created_at);
    } else if (type === 'purchase') {
      serviceName = item.service?.name || item.product?.name || 'Purchase';
      status = item.status || 'Active';
      paymentStatus = getPaymentStatusText(item.paymentStatus);
      amount = item.amount;
      date = formatDate(item.booking_date || item.created_at);
    } else if (type === 'reservation') {
      serviceName = item.product?.title || item.service?.title || 'Reservation';
      status = item.status === 'pending' ? 'Pending' : item.status === 'approved' ? 'Approved' : item.status;
      paymentStatus = 'N/A';
      amount = item.amount;
      date = formatDate(item.created_at);
    }

    return (
      <div key={rowId}>
        <div className="table-row">
          <div className="table-cell id-cell">#{id}</div>
          <div className="table-cell name-cell">{serviceName}</div>
          <div className="table-cell status-cell">
            <span className={`status-badge ${getStatusClass(status)}`}>
              {status}
            </span>
          </div>
          <div className="table-cell payment-cell">
            <span className={`payment-badge ${getPaymentStatusClass(paymentStatus)}`}>
              {paymentStatus}
            </span>
          </div>
          <div className="table-cell amount-cell">{formatCurrency(amount)}</div>
          <div className="table-cell date-cell">{date}</div>
          <div className="table-cell actions-cell">
            <button 
              className="action-btn expand-btn"
              onClick={() => toggleRowExpanded(rowId)}
              title="View details"
            >
              <FaEye />
            </button>
            {type === 'reservation' && item.status === 'pending' && (
              <button 
                className="action-btn delete-btn"
                onClick={() => handleCancelReservation(item.id)}
                title="Cancel reservation"
              >
                <FaTimes />
              </button>
            )}
            {(type === 'maintenance-request' && (item.status?.toLowerCase() === 'responded' || item.status?.toLowerCase() === 'closed')) && (
              <button 
                className="action-btn pay-btn"
                onClick={() => handlePaymentRedirect(item)}
                title="Pay now"
              >
                <FaFileAlt />
              </button>
            )}
            {type === 'maintenance-booking' && item.status?.toLowerCase() === 'readyforpayment' && (
              <button 
                className="action-btn pay-btn"
                onClick={() => {
                  const paymentData = {
                    type: 'maintenance-booking',
                    bookingId: item.id,
                    invoiceNumber: item.invoice_number || `SANC-${item.id}`,
                    description: item.service?.title || item.service?.name || 'Maintenance Service',
                    amount: item.total_amount || item.amount,
                    planType: item.plan_type || 'Standard',
                    createdAt: item.created_at
                  };
                  sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                  navigate('/billing');
                }}
                title="Pay now"
              >
                <FaFileAlt />
              </button>
            )}
            {type === 'reservation' && item.status === 'approved' && (
              <button 
                className="action-btn pay-btn"
                onClick={() => {
                  const paymentData = {
                    type: 'reservation',
                    reservationId: item.id,
                    reservationCode: item.reservation_code,
                    description: item.product?.title || item.service?.title || 'Reservation',
                    amount: item.amount,
                    planType: item.plan_type || 'Standard',
                    deceasedName: item.deceased_name,
                    createdAt: item.created_at
                  };
                  sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
                  navigate('/billing');
                }}
                title="Pay now"
              >
                <FaFileAlt />
              </button>
            )}
          </div>
        </div>
        {isExpanded && (
          <div className="table-row-details">
            <div className="details-content">
              {type === 'maintenance-request' && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Invoice:</span>
                    <span className="detail-value">{item.invoice_number || `SANC-${item.id}`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact:</span>
                    <span className="detail-value">{item.phone}</span>
                  </div>
                  {item.message && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Details:</span>
                      <span className="detail-value">{item.message}</span>
                    </div>
                  )}
                  {item.maintenance_photos && JSON.parse(item.maintenance_photos).length > 0 && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Photos:</span>
                      <div className="photos-grid-compact">
                        {JSON.parse(item.maintenance_photos).map((photo, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:8000/${photo}`} 
                            alt={`Maintenance ${index + 1}`}
                            onClick={() => {
                              const photos = JSON.parse(item.maintenance_photos).map(
                                p => `http://localhost:8000/${p}`
                              );
                              setSelectedImages(photos);
                              setSelectedImageIndex(index);
                              setShowImageModal(true);
                            }}
                            className="photo-thumbnail-compact"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {type === 'maintenance-booking' && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Invoice:</span>
                    <span className="detail-value">{item.invoice_number || `SANC-${item.id}`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Plan Type:</span>
                    <span className="detail-value">{item.plan_type || 'Standard'}</span>
                  </div>
                  {item.notes && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{item.notes}</span>
                    </div>
                  )}
                </>
              )}
              {type === 'purchase' && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Invoice:</span>
                    <span className="detail-value">{item.invoice_number || `SANC-${item.id}`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Plan Type:</span>
                    <span className="detail-value">{item.plan_type || 'Standard'}</span>
                  </div>
                  {item.notes && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{item.notes}</span>
                    </div>
                  )}
                </>
              )}
              {type === 'reservation' && (
                <>
                  <div className="detail-item">
                    <span className="detail-label">Invoice:</span>
                    <span className="detail-value">{item.invoice_number || `SANC-${item.id}`}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deceased Name:</span>
                    <span className="detail-value">{item.deceased_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Death:</span>
                    <span className="detail-value">{formatDate(item.deceased_date_of_death)}</span>
                  </div>
                  {item.admin_notes && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Admin Notes:</span>
                      <span className="detail-value">{item.admin_notes}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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
          <div className="requests-table-container">
            <div className="table-header">
              <div className="table-cell id-cell">ID</div>
              <div className="table-cell name-cell">Service/Product Name</div>
              <div className="table-cell status-cell">Status</div>
              <div className="table-cell payment-cell">Payment Status</div>
              <div className="table-cell amount-cell">Amount</div>
              <div className="table-cell date-cell">Date</div>
              <div className="table-cell actions-cell">Actions</div>
            </div>

            <div className="table-body">
              {maintenanceRequests.map((request) => renderTableRow(request, 'maintenance-request'))}
              {maintenanceBookings.map((booking) => renderTableRow(booking, 'maintenance-booking'))}
              {purchases.map((purchase) => renderTableRow(purchase, 'purchase'))}
              {reservations.map((reservation) => renderTableRow(reservation, 'reservation'))}
            </div>
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
