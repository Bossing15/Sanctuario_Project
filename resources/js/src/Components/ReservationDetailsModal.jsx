import React from 'react';
import './ReservationDetailsModal.css';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

const ReservationDetailsModal = ({ reservation, onClose }) => {
  // Lock scroll when modal is open
  useModalScrollLock(!!reservation);

  if (!reservation) return null;

  // Handle both Reservation and Booking objects
  const data = reservation;
  const isBooking = !!data.service_id && !data.product_id;

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
          <h2>{isBooking ? 'Service Booking Details' : 'Reservation Details'}</h2>
          <button className="modern-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modern-modal-content">
          {/* Customer Information */}
          <div className="modal-section">
            <span className="modal-section-title">Customer Information</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Customer Name</label>
                <span>{data.user?.name || data.client?.name || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Email</label>
                <span>{data.user?.email || data.client?.email || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Phone</label>
                <span>{data.user?.phone || data.client?.phone || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Address</label>
                <span>{data.user?.address || data.client?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Deceased Information - Only show if purpose is deceased (for reservations) */}
          {!isBooking && data.request_purpose === 'deceased' && (
            <div className="modal-section">
              <span className="modal-section-title">Deceased Information</span>
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <label>Deceased Name</label>
                  <span className="highlight">{data.deceased_name || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Date of Death</label>
                  <span className="highlight">{formatDate(data.deceased_date_of_death) || 'N/A'}</span>
                </div>
                <div className="modal-info-item">
                  <label>Relationship</label>
                  <span>{data.deceased_relationship || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="modal-section">
            <span className="modal-section-title">{isBooking ? 'Service Booking Details' : 'Reservation Details'}</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>{isBooking ? 'Service' : 'Product/Service'}</label>
                <span>{data.service?.title || data.product?.title || 'N/A'}</span>
              </div>
              {!isBooking && (
                <div className="modal-info-item">
                  <label>Plan Type</label>
                  <span>{data.plan_type || 'N/A'}</span>
                </div>
              )}
              <div className="modal-info-item">
                <label>Amount</label>
                <span>{formatCurrency(data.amount || data.total_amount || 0)}</span>
              </div>
              <div className="modal-info-item">
                <label>Status</label>
                <span className={`badge ${data.status === 'pending' ? 'warning' : data.status === 'approved' || data.status === 'Paid' ? 'success' : 'danger'}`}>
                  {(data.status || '').charAt(0).toUpperCase() + (data.status || '').slice(1)}
                </span>
              </div>
              <div className="modal-info-item">
                <label>{isBooking ? 'Booking Date' : 'Reserved Date'}</label>
                <span>{formatDate(data.created_at || data.booking_date)}</span>
              </div>
              {data.approved_at && (
                <div className="modal-info-item">
                  <label>Approved Date</label>
                  <span>{formatDate(data.approved_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Request Purpose - Only show for reservations */}
          {!isBooking && (
            <div className="modal-section">
              <span className="modal-section-title">Request Purpose</span>
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <label>Purpose</label>
                  <span className={`badge ${data.request_purpose === 'deceased' ? 'warning' : 'success'}`}>
                    {data.request_purpose === 'deceased' ? '👤 Deceased Loved One' : '📅 Reservation Only'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ID Verification */}
          <div className="modal-section">
            <span className="modal-section-title">ID Verification</span>
            {data.id_file ? (
              <div style={{ marginTop: '12px' }}>
                <a 
                  href={`http://localhost:8000/api/files/${data.id_file}`}
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
          {data.admin_notes && (
            <div className="modal-section">
              <span className="modal-section-title">Admin Notes</span>
              <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #1B3022', color: '#1f2937', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px' }}>
                {data.admin_notes}
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
