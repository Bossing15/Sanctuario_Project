import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaCheck, FaTimes, FaTrash, FaCreditCard } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import PaymentModal from '../components/PaymentModal';
import './MyReservationsPage.css';

function MyReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchReservations();
  }, [navigate, fetchReservations]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:8000/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
        setError('');
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load reservations');
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Error loading reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        setAlertModal({
          show: true,
          type: 'success',
          message: 'Reservation cancelled successfully',
          onClose: () => {
            setAlertModal({ show: false, type: 'info', message: '' });
            fetchReservations();
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
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Error cancelling reservation',
        onClose: () => setAlertModal({ show: false, type: 'info', message: '' })
      });
    }
  };

  const handlePayNow = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'approved':
        return <FaCheck className="status-icon approved" />;
      case 'rejected':
        return <FaTimes className="status-icon rejected" />;
      case 'cancelled':
        return <FaTimes className="status-icon cancelled" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'Reserved - Waiting for Admin Approval',
      approved: 'Approved - Ready to Pay',
      rejected: 'Rejected',
      cancelled: 'Cancelled by You',
      paid: 'Paid - Completed'
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReservations = filterStatus === 'all' 
    ? reservations 
    : reservations.filter(r => r.status === filterStatus);

  return (
    <div className="my-reservations-page">
      {/* Header */}
      <div className="reservations-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1>My Reservations</h1>
      </div>

      {/* Filter Tabs */}
      <div className="reservations-filters">
        <button 
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({reservations.length})
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({reservations.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'approved' ? 'active' : ''}`}
          onClick={() => setFilterStatus('approved')}
        >
          Approved ({reservations.filter(r => r.status === 'approved').length})
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected ({reservations.filter(r => r.status === 'rejected').length})
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelled ({reservations.filter(r => r.status === 'cancelled').length})
        </button>
      </div>

      {/* Content */}
      <div className="reservations-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading reservations...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchReservations} className="retry-button">Retry</button>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-state">
            <p>No reservations found</p>
          </div>
        ) : (
          <div className="reservations-list">
            {filteredReservations.map((reservation) => (
              <div key={reservation.id} className={`reservation-card status-${reservation.status}`}>
                {/* Status Badge */}
                <div className="reservation-status">
                  {getStatusIcon(reservation.status)}
                  <span className="status-text">{getStatusBadge(reservation.status)}</span>
                </div>

                {/* Reservation Info */}
                <div className="reservation-info">
                  <div className="info-row">
                    <span className="info-label">Deceased Name:</span>
                    <span className="info-value">{reservation.deceased_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date of Death:</span>
                    <span className="info-value">{formatDate(reservation.deceased_date_of_death)}</span>
                  </div>
                  {reservation.deceased_relationship && (
                    <div className="info-row">
                      <span className="info-label">Relationship:</span>
                      <span className="info-value">{reservation.deceased_relationship}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Product:</span>
                    <span className="info-value">
                      {reservation.product?.title || reservation.service?.title || 'N/A'}
                    </span>
                  </div>
                  {reservation.plan_type && (
                    <div className="info-row">
                      <span className="info-label">Plan:</span>
                      <span className="info-value">{reservation.plan_type}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Amount:</span>
                    <span className="info-value amount">{formatCurrency(reservation.amount)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Created:</span>
                    <span className="info-value">{formatDate(reservation.created_at)}</span>
                  </div>
                </div>

                {/* Admin Notes */}
                {reservation.admin_notes && (
                  <div className="admin-notes">
                    <strong>Admin Notes:</strong>
                    <p>{reservation.admin_notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="reservation-actions">
                  {reservation.status === 'pending' && (
                    <button 
                      className="action-button cancel-button"
                      onClick={() => handleCancelReservation(reservation.id)}
                    >
                      <FaTrash /> Cancel
                    </button>
                  )}
                  {reservation.status === 'approved' && (
                    <>
                      <button 
                        className="action-button pay-button"
                        onClick={() => handlePayNow(reservation)}
                      >
                        <FaCreditCard /> Pay Now
                      </button>
                      <button 
                        className="action-button info-button"
                        onClick={() => window.open('/', '_blank')}
                      >
                        <FaArrowLeft /> Visit Memorial Park
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedReservation && (
        <PaymentModal
          service={selectedReservation.product || selectedReservation.service}
          planType={selectedReservation.plan_type}
          amount={selectedReservation.amount}
          reservationId={selectedReservation.id}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedReservation(null);
            fetchReservations();
          }}
          isApprovedReservation={true}
        />
      )}

      {/* Alert Modal */}
      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={alertModal.onClose || (() => setAlertModal({ show: false, type: 'info', message: '' }))}
        />
      )}
    </div>
  );
}

export default MyReservationsPage;
