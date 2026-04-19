import React, { useState } from 'react';
import './AuthorizationModal.css';

function AuthorizationModal({ request, onClose, onApprove, onReject }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${window.location.protocol}//${window.location.host}/api/bookings/authorization/${request.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        onApprove(data.booking);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to approve request');
      }
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Error approving request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${window.location.protocol}//${window.location.host}/api/bookings/authorization/${request.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ reason: rejectionReason })
        }
      );

      if (response.ok) {
        const data = await response.json();
        onReject(data.booking);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Error rejecting request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authorization-modal-overlay" onClick={onClose}>
      <div className="authorization-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <h2>Authorization Request Review</h2>
          <button className="auth-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="auth-modal-content">
          {/* Request Details */}
          <div className="auth-details-section">
            <h3>Request Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Request ID:</label>
                <span className="detail-value">#{request.id}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className="detail-value status-badge pending">
                  ⏳ {request.authorization_status_label}
                </span>
              </div>
              <div className="detail-item">
                <label>Requested Date:</label>
                <span className="detail-value">
                  {new Date(request.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="auth-customer-section">
            <h3>Customer Information</h3>
            <div className="customer-card">
              <div className="customer-info">
                <div className="info-row">
                  <label>Name:</label>
                  <span>{request.user?.name || request.customer?.name || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Email:</label>
                  <span>{request.user?.email || request.customer?.email || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Phone:</label>
                  <span>{request.user?.phone || request.customer?.phone || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Address:</label>
                  <span>{request.user?.address || request.customer?.address || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Plot Number:</label>
                  <span>{request.user?.plot_number || request.customer?.plot_number || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Registered Date:</label>
                  <span>
                    {request.user?.registered_date 
                      ? new Date(request.user.registered_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service/Product Information */}
          <div className="auth-service-section">
            <h3>Service/Product Information</h3>
            <div className="service-card">
              <div className="service-info">
                <div className="info-row">
                  <label>Type:</label>
                  <span>
                    {request.product?.title || request.product?.name || request.service?.title || request.service?.name || 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <label>Category:</label>
                  <span>
                    {request.product?.category || request.service?.category || 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <label>Description:</label>
                  <span>
                    {request.product?.description || request.service?.description || 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <label>Plan:</label>
                  <span>{request.plan_type || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <label>Amount:</label>
                  <span className="amount-value">
                    ₱{parseFloat(request.total_amount || request.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="info-row">
                  <label>Booking Date:</label>
                  <span>
                    {request.booking_date 
                      ? new Date(request.booking_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="auth-reject-form">
              <h3>Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="4"
                className="rejection-textarea"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="auth-modal-footer">
          <button
            className="auth-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          {!showRejectForm ? (
            <>
              <button
                className="auth-btn reject"
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
              >
                Reject Request
              </button>
              <button
                className="auth-btn approve"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Approving...' : 'Approve Request'}
              </button>
            </>
          ) : (
            <>
              <button
                className="auth-btn cancel"
                onClick={() => setShowRejectForm(false)}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="auth-btn reject"
                onClick={handleReject}
                disabled={loading || !rejectionReason.trim()}
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthorizationModal;
