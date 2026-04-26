import React, { useState } from 'react';
import './ServiceCompletionModal.css';

function ServiceCompletionModal({ booking, onClose, onUpdate }) {
  const [completionStatus, setCompletionStatus] = useState(booking?.service_completion_status || 'pending');
  const [uploadedImages, setUploadedImages] = useState(booking?.completion_images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImages(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (completionStatus === 'done' && uploadedImages.length === 0) {
      setError('Please upload at least one image for completed services');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${window.location.protocol}//${window.location.host}/api/bookings/${booking.id}/update-completion`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            service_completion_status: completionStatus,
            completion_images: completionStatus === 'done' ? uploadedImages : []
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuccess('Service completion status updated successfully!');
        setTimeout(() => {
          onUpdate(data.booking);
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update service completion status');
      }
    } catch (err) {
      console.error('Error updating service completion:', err);
      setError('Error updating service completion: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-completion-overlay" onClick={onClose}>
      <div className="service-completion-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="completion-modal-header">
          <h2>Service Completion Status</h2>
          <button className="completion-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="completion-modal-content">
          {/* Service Info */}
          <div className="completion-info-section">
            <h3>Service Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Service/Product:</label>
                <span>{booking?.service?.title || booking?.product?.title || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Customer:</label>
                <span>{booking?.user?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <label>Amount:</label>
                <span className="amount">₱{parseFloat(booking?.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="completion-status-section">
            <h3>Mark Service Status</h3>
            <div className="status-options">
              <label className={`status-option ${completionStatus === 'pending' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={completionStatus === 'pending'}
                  onChange={(e) => setCompletionStatus(e.target.value)}
                />
                <span className="status-label">
                  <span className="status-text">Pending</span>
                </span>
              </label>

              <label className={`status-option ${completionStatus === 'ongoing' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="ongoing"
                  checked={completionStatus === 'ongoing'}
                  onChange={(e) => setCompletionStatus(e.target.value)}
                />
                <span className="status-label">
                  <span className="status-text">Ongoing</span>
                </span>
              </label>

              <label className={`status-option ${completionStatus === 'done' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="done"
                  checked={completionStatus === 'done'}
                  onChange={(e) => setCompletionStatus(e.target.value)}
                />
                <span className="status-label">
                  <span className="status-text">Done</span>
                </span>
              </label>
            </div>
          </div>

          {/* Image Upload Section - Only show for "Done" status */}
          {completionStatus === 'done' && (
            <div className="completion-images-section">
              <h3>Upload Service Completion Photos</h3>
              <p className="section-description">Upload photos to prove the service has been completed</p>
              
              <div className="image-upload-area">
                <input
                  type="file"
                  id="image-input"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="image-input"
                />
                <label htmlFor="image-input" className="upload-label">
                  <span className="upload-text">Click to upload or drag and drop</span>
                  <span className="upload-hint">PNG, JPG, GIF up to 10MB</span>
                </label>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="images-preview">
                  <h4>Uploaded Images ({uploadedImages.length})</h4>
                  <div className="preview-grid">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="preview-item">
                        <img src={image} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="completion-error-message">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="completion-success-message">
              {success}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="completion-modal-footer">
          <button
            className="completion-btn cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="completion-btn submit"
            onClick={handleSubmit}
            disabled={loading || (completionStatus === 'done' && uploadedImages.length === 0)}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceCompletionModal;
