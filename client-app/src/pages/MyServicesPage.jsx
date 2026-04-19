import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaEnvelope, FaPhone, FaCalendar, FaInfoCircle } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import './MyServicesPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

function MyServicesPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // First get the current user info to get the user ID
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
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      // Fetch bookings
      const bookingsResponse = await fetch(`http://localhost:8000/api/bookings/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      let bookingsArray = [];
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        bookingsArray = Array.isArray(bookingsData.data || bookingsData) ? (bookingsData.data || bookingsData) : [];
      } else {
        console.warn('Failed to fetch bookings:', bookingsResponse.status);
      }

      // Fetch maintenance inquiries
      const inquiriesResponse = await fetch('http://localhost:8000/api/inquiries/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (inquiriesResponse.ok) {
        const inquiriesData = await inquiriesResponse.json();
        const allInquiries = Array.isArray(inquiriesData.data || inquiriesData) ? (inquiriesData.data || inquiriesData) : [];
        
        // Filter only maintenance inquiries
        const maintenanceInquiries = allInquiries.filter(inquiry => 
          inquiry.product_interest && 
          inquiry.product_interest.toLowerCase().includes('maintenance')
        );

        // Convert inquiries to booking format and combine with bookings
        const inquiryBookings = maintenanceInquiries.map(inquiry => ({
          id: `INQ-${inquiry.id}`,
          client: { name: inquiry.full_name },
          booking_date: inquiry.created_at,
          created_at: inquiry.created_at,
          service: { name: inquiry.product_interest },
          status: inquiry.status,
          total_amount: 0,
          notes: inquiry.message,
          phone: inquiry.phone,
          email: inquiry.email,
          isInquiry: true
        }));

        setBookings([...bookingsArray, ...inquiryBookings]);
      } else {
        console.warn('Failed to fetch inquiries:', inquiriesResponse.status);
        setBookings(bookingsArray);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setBookings([]);
      setAlertModal({ show: true, type: 'error', message: 'Failed to load your maintenance requests. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'PendingReview': 'status-review',
      'Approved': 'status-approved',
      'Rejected': 'status-rejected'
    };
    return statusMap[status] || 'status-default';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'PendingReview': 'Pending Review',
      'Approved': 'Approved',
      'Rejected': 'Rejected'
    };
    return labelMap[status] || status;
  };

  return (
    <div className="my-services-page">
      {/* Hero Banner */}
      <div className="services-hero" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>My Maintenance Requests</h1>
        </div>
      </div>

      <div className="services-container">
        {/* Content */}
        <div className="services-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your requests...</p>
            </div>
          ) : (
            <div className="bookings-section">
                  {bookings.length === 0 ? (
                    <div className="empty-state">
                      <FaClipboardList className="empty-icon" />
                      <h3>No Maintenance Requests</h3>
                      <p>You haven't made any maintenance requests yet.</p>
                      <button className="btn-primary" onClick={() => navigate('/products-services')}>
                        Browse Services
                      </button>
                    </div>
                  ) : (
                    <div className="bookings-list">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                      <div className="card-header">
                            <h3>{booking.product?.name || booking.service?.name || 'Service Booking'}</h3>
                            <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                              {getStatusLabel(booking.status)}
                            </span>
                          </div>
                          <div className="card-body">
                            <div className="info-row">
                              <FaCalendar className="info-icon" />
                              <span className="info-label">{booking.isInquiry ? 'Request Date:' : 'Booking Date:'}</span>
                              <span className="info-value">{formatDate(booking.booking_date || booking.created_at)}</span>
                            </div>
                            {!booking.isInquiry && booking.total_amount > 0 && (
                              <div className="info-row">
                                <FaInfoCircle className="info-icon" />
                                <span className="info-label">Total Amount:</span>
                                <span className="info-value">{formatCurrency(booking.total_amount)}</span>
                              </div>
                            )}
                            {booking.phone && (
                              <div className="info-row">
                                <FaPhone className="info-icon" />
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{booking.phone}</span>
                              </div>
                            )}
                            {booking.email && (
                              <div className="info-row">
                                <FaEnvelope className="info-icon" />
                                <span className="info-label">Email:</span>
                                <span className="info-value">{booking.email}</span>
                              </div>
                            )}
                            {booking.payment_method && (
                              <div className="info-row">
                                <span className="info-label">Payment Method:</span>
                                <span className="info-value">{booking.payment_method}</span>
                              </div>
                            )}
                            {booking.notes && (
                              <div className="info-row message-row">
                                <span className="info-label">{booking.isInquiry ? 'Message:' : 'Notes:'}</span>
                                <p className="info-value message-text">{booking.notes}</p>
                              </div>
                            )}
                            {booking.isInquiry && booking.status === 'New' && (
                              <div className="status-info">
                                <FaInfoCircle className="status-info-icon" />
                                <span>Your request is pending review by our team.</span>
                              </div>
                            )}
                          </div>
                          <div className="card-footer">
                            <small>{booking.isInquiry ? 'Request submitted' : 'Booked'} on {formatDate(booking.created_at)}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

export default MyServicesPage;
