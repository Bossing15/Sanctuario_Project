import React from 'react';
import './ReservationDetailsModal.css';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

const ReservationDetailsModal = ({ reservation, onClose }) => {
  // Lock scroll when modal is open
  useModalScrollLock(!!reservation);

  if (!reservation) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <h2>Reservation Details</h2>
          <button className="modern-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modern-modal-content">
          {/* Customer Information */}
          <div className="modal-section">
            <span className="modal-section-title">Customer Information</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Customer Name</label>
                <span>{reservation.user?.name || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Email</label>
                <span>{reservation.user?.email || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Phone</label>
                <span>{reservation.user?.phone || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Address</label>
                <span>{reservation.user?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Deceased Information - Only show if purpose is deceased */}
          {reservation.request_purpose === 'deceased' && (
            <div className="modal-section">
              <span className="modal-section-title">Deceased Information</span>
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <label>Deceased Name</label>
                  <span className="highlight">{reservation.deceased_name || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Date of Death</label>
                  <span className="highlight">{formatDate(reservation.deceased_date_of_death) || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Relationship</label>
                  <span>{reservation.deceased_relationship || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Reservation Details */}
          <div className="modal-section">
            <span className="modal-section-title">Reservation Details</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Product/Service</label>
                <span>{reservation.product?.title || reservation.service?.title || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Plan Type</label>
                <span>{reservation.plan_type || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Amount</label>
                <span>{formatCurrency(reservation.amount)}</span>
              </div>
              <div className="modal-info-item">
                <label>Status</label>
                <span className={`badge ${reservation.status === 'pending' ? 'warning' : reservation.status === 'approved' ? 'success' : 'danger'}`}>
                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
              </div>
              <div className="modal-info-item">
                <label>Reserved Date</label>
                <span>{formatDate(reservation.created_at)}</span>
              </div>
              {reservation.approved_at && (
                <div className="modal-info-item">
                  <label>Approved Date</label>
                  <span>{formatDate(reservation.approved_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Request Purpose */}
          <div className="modal-section">
            <span className="modal-section-title">Request Purpose</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Purpose</label>
                <span className={`badge ${reservation.request_purpose === 'deceased' ? 'warning' : 'success'}`}>
                  {reservation.request_purpose === 'deceased' ? '👤 Deceased Loved One' : '📅 Reservation Only'}
                </span>
              </div>
            </div>
          </div>

          {/* ID Verification */}
          <div className="modal-section">
            <span className="modal-section-title">ID Verification</span>
            {reservation.id_file ? (
              <div style={{ marginTop: '12px' }}>
                <a 
                  href={`http://localhost:8000/api/files/${reservation.id_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex' }}
                >
                  📄 View ID Document
                </a>
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: '12px 0 0 0' }}>No ID file uploaded</p>
            )}
          </div>

          {/* Admin Notes */}
          {reservation.admin_notes && (
            <div className="modal-section">
              <span className="modal-section-title">Admin Notes</span>
              <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #1B3022', color: '#1f2937', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px' }}>
                {reservation.admin_notes}
              </div>
            </div>
          )}
        </div>

        <div className="modern-modal-footer">
          <button className="modal-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;
