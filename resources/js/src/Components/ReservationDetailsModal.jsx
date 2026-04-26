import React from 'react';
import './ReservationDetailsModal.css';

const ReservationDetailsModal = ({ reservation, onClose }) => {
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
    <div className="reservation-details-overlay" onClick={onClose}>
      <div className="reservation-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reservation Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Customer Information */}
          <div className="section">
            <h3 className="section-title">Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Customer Name:</label>
                <span>{reservation.user?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{reservation.user?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{reservation.user?.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Address:</label>
                <span>{reservation.user?.address || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Deceased Information */}
          <div className="section">
            <h3 className="section-title">Deceased Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Deceased Name:</label>
                <span className="highlight">{reservation.deceased_name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Date of Death:</label>
                <span className="highlight">{formatDate(reservation.deceased_date_of_death) || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Relationship:</label>
                <span>{reservation.deceased_relationship || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="section">
            <h3 className="section-title">Reservation Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Product/Service:</label>
                <span>{reservation.product?.title || reservation.service?.title || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Plan Type:</label>
                <span>{reservation.plan_type || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Amount:</label>
                <span className="amount">{formatCurrency(reservation.amount)}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status-badge status-${reservation.status}`}>
                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                </span>
              </div>
              <div className="info-item">
                <label>Reserved Date:</label>
                <span>{formatDate(reservation.created_at)}</span>
              </div>
              {reservation.approved_at && (
                <div className="info-item">
                  <label>Approved Date:</label>
                  <span>{formatDate(reservation.approved_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {reservation.admin_notes && (
            <div className="section">
              <h3 className="section-title">Admin Notes</h3>
              <div className="notes-box">
                {reservation.admin_notes}
              </div>
            </div>
          )}


        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;
