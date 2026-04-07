import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaUserCircle, FaUser, FaCreditCard, FaShoppingBag, FaCamera, FaSignOutAlt as FaLogout } from 'react-icons/fa';
import PaymentModal from '../components/PaymentModal';
import AlertModal from '../components/AlertModal';
import './UserPage.css';

function UserPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token found, redirecting to login');
      navigate('/login');
      return;
    }
  }, [navigate]);
  
  // Read tab from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'profile';
  
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem('userName') || 'User',
    email: localStorage.getItem('userEmail') || 'No email available'
  });
  
  // Update tab when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') || 'profile';
    setActiveTab(tab);
  }, [location.search]);
  
  useEffect(() => {
    if (activeTab === 'billing') {
      fetchPendingPayments();
    }
  }, [activeTab]);

  // Fetch profile picture on mount
  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, redirecting to login');
        navigate('/login');
        return;
      }

      // First check localStorage for cached profile picture
      const cachedProfilePicture = localStorage.getItem('profilePictureUrl');
      if (cachedProfilePicture) {
        setProfilePicture(`http://localhost:8000${cachedProfilePicture}`);
      }

      const response = await fetch('http://localhost:8000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('profilePictureUrl');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.user.profile_picture_url) {
          const fullUrl = `http://localhost:8000${data.user.profile_picture_url}`;
          setProfilePicture(fullUrl);
          localStorage.setItem('profilePictureUrl', data.user.profile_picture_url);
        } else {
          localStorage.removeItem('profilePictureUrl');
          setProfilePicture(null);
        }
        
        // Update user info
        setUserInfo({
          name: data.user.name || localStorage.getItem('userName') || 'User',
          email: data.user.email || localStorage.getItem('userEmail') || 'No email available'
        });
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Please select an image file'
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Image size must be less than 5MB'
      });
      return;
    }

    setIsUploadingPicture(true);

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/profile/upload-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const fullUrl = `http://localhost:8000${data.profile_picture_url}`;
        setProfilePicture(fullUrl);
        localStorage.setItem('profilePictureUrl', data.profile_picture_url);
        setAlertModal({
          show: true,
          type: 'success',
          message: 'Profile picture updated successfully!'
        });
      } else {
        setAlertModal({
          show: true,
          type: 'error',
          message: data.message || 'Failed to upload profile picture'
        });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Failed to upload profile picture'
      });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const fetchPendingPayments = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const pending = (data.data || data).filter(
          payment => payment.status === 'pending' || payment.status === 'overdue'
        );
        setPendingPayments(pending);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleSwitchAccount = () => {
    setShowInfoModal(true);
  };

  return (
    <div className="user-page">
      <div className="user-page-container">
        <div className="user-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <FaArrowLeft />
          </button>
          <div className="logo-container">
            <img src={require('../assets/images/home_logo/main_logo.jpg')} alt="Sanctuario De Carmona Memorial Park Logo" className="brand-logo" />
          </div>
        </div>

        <div className="user-content">
          <div className="profile-hero">
            <div className="profile-hero-bg"></div>
            <div className="profile-hero-content">
              <div className="user-avatar-container">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="user-avatar-img" />
                ) : (
                  <div className="user-avatar-placeholder">
                    <FaUserCircle className="user-avatar" />
                  </div>
                )}
                <button 
                  className="user-avatar-upload-btn"
                  onClick={handleProfilePictureClick}
                  disabled={isUploadingPicture}
                  title="Change profile picture"
                >
                  <FaCamera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="user-info-display">
                <h1 className="user-name">{userInfo.name}</h1>
                <p className="user-email">{userInfo.email}</p>
                <div className="user-status">
                  <span className="status-dot"></span>
                  <span className="status-text">Active Member</span>
                </div>
              </div>
            </div>
          </div>

            {/* Tabs */}
            <div className="profile-tabs-container">
              <div className="profile-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <div className="tab-icon">
                    <FaUser />
                  </div>
                  <div className="tab-content">
                    <span className="tab-title">Profile</span>
                    <span className="tab-subtitle">Personal information</span>
                  </div>
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('billing')}
                >
                  <div className="tab-icon">
                    <FaCreditCard />
                  </div>
                  <div className="tab-content">
                    <span className="tab-title">Billing & Payments</span>
                    <span className="tab-subtitle">Manage payments</span>
                  </div>
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
                  onClick={() => navigate('/my-purchases')}
                >
                  <div className="tab-icon">
                    <FaShoppingBag />
                  </div>
                  <div className="tab-content">
                    <span className="tab-title">My Purchases</span>
                    <span className="tab-subtitle">Order history</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content-area">
              {activeTab === 'profile' && (
                <div className="profile-section">
                  <div className="profile-cards">
                    <div className="profile-card">
                      <div className="card-header">
                        <h3>Profile Information</h3>
                        <p>Manage your personal information and preferences</p>
                      </div>
                      <div className="card-content">
                        <div className="profile-info-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '1.5rem',
                          marginBottom: '2rem',
                          width: '100%'
                        }}>
                          <div className="info-item" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <label className="info-label" style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginBottom: '0.25rem'
                            }}>Full Name</label>
                            <div className="info-value" style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#1e293b',
                              padding: '0.75rem 1rem',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>{userInfo.name}</div>
                          </div>
                          <div className="info-item" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <label className="info-label" style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginBottom: '0.25rem'
                            }}>Email Address</label>
                            <div className="info-value" style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#1e293b',
                              padding: '0.75rem 1rem',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>{userInfo.email}</div>
                          </div>
                          <div className="info-item" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <label className="info-label" style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginBottom: '0.25rem'
                            }}>Member Since</label>
                            <div className="info-value" style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#1e293b',
                              padding: '0.75rem 1rem',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>Active Member</div>
                          </div>
                          <div className="info-item" style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                            <label className="info-label" style={{
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              marginBottom: '0.25rem'
                            }}>Account Status</label>
                            <div className="info-value status-active" style={{
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: '#059669',
                              padding: '0.75rem 1rem',
                              background: '#f0fdf4',
                              borderRadius: '8px',
                              border: '1px solid #bbf7d0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span className="status-indicator" style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#10b981',
                                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
                                animation: 'statusPulse 2s infinite',
                                flexShrink: '0'
                              }}></span>
                              Active
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-card">
                      <div className="card-header">
                        <h3>Account Actions</h3>
                        <p>Manage your account settings and preferences</p>
                      </div>
                      <div className="card-content">
                        <div className="action-buttons">
                          <button className="action-btn secondary-btn" onClick={handleSignup}>
                            <div className="btn-icon">
                              <FaUser />
                            </div>
                            <div className="btn-content">
                              <span className="btn-title">Create New Account</span>
                              <span className="btn-subtitle">Register additional account</span>
                            </div>
                          </button>
                          <button className="action-btn secondary-btn" onClick={handleSwitchAccount}>
                            <div className="btn-icon">
                              <FaArrowLeft />
                            </div>
                            <div className="btn-content">
                              <span className="btn-title">Switch Account</span>
                              <span className="btn-subtitle">Change to different account</span>
                            </div>
                          </button>
                          <button className="action-btn logout-btn" onClick={handleLogout}>
                            <div className="btn-icon">
                              <FaLogout />
                            </div>
                            <div className="btn-content">
                              <span className="btn-title">Sign Out</span>
                              <span className="btn-subtitle">Logout from your account</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="billing-section">
                  <h3>Your Pending Payments</h3>
                  
                  {loading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading your payments...</p>
                    </div>
                  ) : pendingPayments.length === 0 ? (
                    <div className="no-payments-state">
                      <div className="success-icon">✓</div>
                      <h4>All Caught Up!</h4>
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
                  )}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <PaymentModal
          service={{ title: selectedPayment.description || 'Payment' }}
          planType={selectedPayment.payment_type}
          amount={selectedPayment.amount}
          bookingId={selectedPayment.booking_id}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPayment(null);
            fetchPendingPayments();
          }}
        />
      )}
      
      {/* Info Modal */}
      {showInfoModal && (
        <AlertModal
          type="info"
          message="Switch Account feature will be implemented soon"
          onClose={() => setShowInfoModal(false)}
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

export default UserPage;