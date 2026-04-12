import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaClock, FaCheckCircle } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import ImageModal from '../components/ImageModal';
import './MyMaintenanceRequestsPage.css';
import heroBg from '../assets/images/Sanctuario3_1.jpg';

function MyMaintenanceRequestsPage() {
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchMaintenanceRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMaintenanceRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchMaintenanceRequests = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/inquiries/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        // Handle the response structure - the API returns { success: true, data: [...] }
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
        setAlertModal({ 
          show: true, 
          type: 'error', 
          message: errorData.message || 'Failed to load maintenance requests' 
        });
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      console.error('Error details:', error.message);
      setAlertModal({ 
        show: true, 
        type: 'error', 
        message: `An error occurred while loading your requests: ${error.message}` 
      });
    } finally {
      setLoading(false);
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

  const extractPlanType = (productInterest) => {
    if (!productInterest) return 'N/A';
    const match = productInterest.match(/(Monthly|Quarterly|Yearly)/i);
    return match ? match[1] : 'N/A';
  };

  const extractServiceName = (productInterest) => {
    if (!productInterest) return 'Maintenance Service';
    // Extract service name before the plan type
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

  return (
    <div className="my-maintenance-page">
        {/* Hero Banner */}
        <div className="maintenance-hero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>My Maintenance Requests</h1>
          </div>
        </div>

        <div className="maintenance-content-wrapper">
          {/* Refresh Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                fetchMaintenanceRequests();
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
              <p>Loading your maintenance requests...</p>
            </div>
          ) : maintenanceRequests.length === 0 ? (
            <div className="empty-state">
              <FaClipboardList className="empty-icon" />
              <h3>No Maintenance Requests Yet</h3>
              <p>You haven't submitted any maintenance service requests.</p>
              <button 
                className="browse-btn"
                onClick={() => navigate('/maintenance')}
              >
                Browse Maintenance Services
              </button>
            </div>
          ) : (
            <div className="requests-list">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="request-card">
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

                  {/* Maintenance Photos */}
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
