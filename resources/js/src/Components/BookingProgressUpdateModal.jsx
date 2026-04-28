import { useState } from 'react';
import './ProgressUpdateModal.css';

const BookingProgressUpdateModal = ({ show, booking, onClose, onUpdate }) => {
  const [progressStatus, setProgressStatus] = useState(booking?.progress_status || 'Not Started');
  const [progressPercentage, setProgressPercentage] = useState(booking?.progress_percentage || 0);
  const [progressNote, setProgressNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!progressNote.trim()) {
      setError('Progress note is required');
      return;
    }

    if (progressNote.length > 1000) {
      setError('Progress note must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/bookings/${booking.id}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          progress_status: progressStatus,
          progress_percentage: parseInt(progressPercentage),
          progress_note: progressNote,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onUpdate(data.booking);
        onClose();
      } else {
        setError(data.message || 'Failed to update progress');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('Failed to update progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageChange = (e) => {
    const value = parseInt(e.target.value);
    setProgressPercentage(Math.min(100, Math.max(0, value)));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="progress-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Progress</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="request-info">
            <p><strong>Booking ID:</strong> #{booking.id}</p>
            <p><strong>Service:</strong> {booking.service?.title || booking.service_name || 'N/A'}</p>
            <p><strong>Customer:</strong> {booking.user?.name || booking.client?.name || 'N/A'}</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="progressStatus">Progress Status *</label>
              <select
                id="progressStatus"
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}
                required
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="progressPercentage">
                Progress Percentage: {progressPercentage}%
              </label>
              <input
                type="range"
                id="progressPercentage"
                min="0"
                max="100"
                step="5"
                value={progressPercentage}
                onChange={handlePercentageChange}
                className="progress-slider"
              />
              <div className="percentage-display">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="progressNote">Progress Note * (Max 1000 characters)</label>
              <textarea
                id="progressNote"
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                placeholder="Describe the current progress, what has been done, and any updates for the customer..."
                rows="5"
                maxLength="1000"
                required
              />
              <div className="char-count">
                {progressNote.length} / 1000 characters
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Progress'}
              </button>
            </div>
          </form>

          {/* Progress History */}
          {booking.progress_updates && booking.progress_updates.length > 0 && (
            <div className="progress-history">
              <h3>Progress History</h3>
              <div className="history-timeline">
                {booking.progress_updates.map((update, index) => (
                  <div key={index} className="history-item">
                    <div className="history-marker"></div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="history-status">{update.status}</span>
                        <span className="history-percentage">{update.percentage}%</span>
                      </div>
                      <p className="history-note">{update.note}</p>
                      <div className="history-meta">
                        <span>By: {update.admin_name}</span>
                        <span>{new Date(update.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingProgressUpdateModal;
