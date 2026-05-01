import React, { useState } from 'react';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

function AuthorizationModal({ request, onClose, onApprove, onReject }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock scroll when modal is open
  useModalScrollLock(!!request);

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <h2>Authorization Request Review</h2>
          <button className="modern-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modern-modal-content">
          {/* Request Details */}
          <div className="modal-section">
            <span className="modal-section-title">Request Details</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Request ID</label>
                <span>#{request.id}</span>
              </div>
              <div className="modal-info-item">
                <label>Status</label>
                <span className="badge warning">{request.authorization_status_label}</span>
              </div>
              <div className="modal-info-item">
                <label>Requested Date</label>
                <span>
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
          <div className="modal-section">
            <span className="modal-section-title">Customer Information</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Name</label>
                <span>{request.user?.name || request.customer?.name || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Email</label>
                <span>{request.user?.email || request.customer?.email || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Phone</label>
                <span>{request.user?.phone || request.customer?.phone || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Address</label>
                <span>{request.user?.address || request.customer?.address || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Plot Number</label>
                <span>{request.user?.plot_number || request.customer?.plot_number || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Registered Date</label>
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

          {/* Service/Property Information */}
          <div className="modal-section">
            <span className="modal-section-title">Service/Property Information</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Type</label>
                <span>
                  {request.property?.title || request.property?.name || request.service?.title || request.service?.name || 'N/A'}
                </span>
              </div>
              <div className="modal-info-item">
                <label>Category</label>
                <span>
                  {request.property?.category || request.service?.category || 'N/A'}
                </span>
              </div>
              <div className="modal-info-item">
                <label>Plan</label>
                <span>{request.plan_type || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Amount</label>
                <span className="highlight">
                  ₱{parseFloat(request.total_amount || request.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="modal-info-item">
                <label>Booking Date</label>
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

          {/* Error Message */}
          {error && (
            <div className="modal-error-message">
              {error}
            </div>
          )}

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="modal-section">
              <span className="modal-section-title">Rejection Reason</span>
              <div className="modal-form-group">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '14px', minHeight: '100px', resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modern-modal-footer">
          <button
            className="modal-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          {!showRejectForm ? (
            <>
              <button
                className="modal-btn-danger"
                onClick={() => setShowRejectForm(true)}
                disabled={loading}
              >
                Reject Request
              </button>
              <button
                className="modal-btn-primary"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Approving...' : 'Approve Request'}
              </button>
            </>
          ) : (
            <>
              <button
                className="modal-btn-secondary"
                onClick={() => setShowRejectForm(false)}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="modal-btn-danger"
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
