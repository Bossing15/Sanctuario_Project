import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaCalendar, FaDollarSign } from 'react-icons/fa';
import './ReservationManagement.css';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const url = filter === 'all' 
        ? '/api/admin/reservations'
        : `/api/admin/reservations?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
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

  const handleApprove = (reservation) => {
    setSelectedReservation(reservation);
    setAction('approve');
    setNotes('');
    setShowModal(true);
  };

  const handleReject = (reservation) => {
    setSelectedReservation(reservation);
    setAction('reject');
    setNotes('');
    setShowModal(true);
  };

  const submitAction = async () => {
    if (action === 'reject' && !notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const endpoint = action === 'approve' 
        ? `/api/admin/reservations/${selectedReservation.id}/approve`
        : `/api/admin/reservations/${selectedReservation.id}/reject`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          notes: notes || null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        fetchReservations();
        alert(`Reservation ${action}d successfully`);
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} reservation`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred');
    }
  };

  const filteredReservations = reservations.filter(res => {
    const query = searchQuery.toLowerCase();
    return (
      res.user?.name?.toLowerCase().includes(query) ||
      res.user?.email?.toLowerCase().includes(query) ||
      res.deceased_name?.toLowerCase().includes(query) ||
      res.id.toString().includes(query)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning"><FaClock /> Pending</span>;
      case 'approved':
        return <span className="badge badge-success"><FaCheckCircle /> Approved</span>;
      case 'rejected':
        return <span className="badge badge-danger"><FaTimesCircle /> Rejected</span>;
      case 'cancelled':
        return <span className="badge badge-secondary">Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="reservation-management">
      <div className="management-header">
        <h2>Reservation Management</h2>
        <p>Manage product and service reservations</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <FaClock /> Pending ({reservations.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`tab-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          <FaCheckCircle /> Approved ({reservations.filter(r => r.status === 'approved').length})
        </button>
        <button 
          className={`tab-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          <FaTimesCircle /> Rejected ({reservations.filter(r => r.status === 'rejected').length})
        </button>
        <button 
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({reservations.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, deceased name, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reservations...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchReservations} className="retry-btn">Retry</button>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="empty-state">
          <p>No reservations found</p>
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="card-header">
                <div className="header-left">
                  <h3>Reservation #{reservation.id}</h3>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="header-right">
                  <span className="date">{new Date(reservation.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="card-content">
                {/* User Information */}
                <div className="section">
                  <h4>User Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label"><FaUser /> Name:</span>
                      <span className="value">{reservation.user?.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{reservation.user?.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{reservation.user?.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Address:</span>
                      <span className="value">{reservation.user?.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Deceased Information */}
                <div className="section">
                  <h4>Deceased Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Name:</span>
                      <span className="value">{reservation.deceased_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label"><FaCalendar /> Date of Death:</span>
                      <span className="value">{new Date(reservation.deceased_date_of_death).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Relationship:</span>
                      <span className="value">{reservation.deceased_relationship || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="section">
                  <h4>Reservation Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Product/Service:</span>
                      <span className="value">
                        {reservation.product?.title || reservation.service?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Plan Type:</span>
                      <span className="value">{reservation.plan_type || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Lot Type:</span>
                      <span className="value">{reservation.lot_type || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label"><FaDollarSign /> Amount:</span>
                      <span className="value">₱{parseFloat(reservation.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {reservation.admin_notes && (
                  <div className="section">
                    <h4>Admin Notes</h4>
                    <p className="notes">{reservation.admin_notes}</p>
                  </div>
                )}

                {/* Approval Info */}
                {reservation.approved_by && (
                  <div className="section">
                    <h4>Approval Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="label">Approved By:</span>
                        <span className="value">{reservation.approved_by?.name || 'Admin'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Approved At:</span>
                        <span className="value">{new Date(reservation.approved_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {reservation.status === 'pending' && (
                <div className="card-actions">
                  <button 
                    className="btn btn-approve"
                    onClick={() => handleApprove(reservation)}
                  >
                    <FaCheckCircle /> Approve
                  </button>
                  <button 
                    className="btn btn-reject"
                    onClick={() => handleReject(reservation)}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{action === 'approve' ? 'Approve Reservation' : 'Reject Reservation'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <p className="reservation-info">
                Reservation #{selectedReservation?.id} - {selectedReservation?.deceased_name}
              </p>

              <div className="form-group">
                <label>
                  {action === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={action === 'approve' ? 'Add any notes...' : 'Please provide a reason for rejection...'}
                  rows="4"
                  className="form-textarea"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`btn ${action === 'approve' ? 'btn-approve' : 'btn-reject'}`}
                onClick={submitAction}
              >
                {action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;
