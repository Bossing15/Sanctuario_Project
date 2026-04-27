import React, { useState } from 'react';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

function ServiceCompletionModal({ booking, onClose, onUpdate }) {
  const [completionStatus, setCompletionStatus] = useState(booking?.service_completion_status || 'pending');
  const [uploadedImages, setUploadedImages] = useState(booking?.completion_images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lock scroll when modal is open
  useModalScrollLock(!!booking);

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modern-modal-header">
          <h2>Service Completion Status</h2>
          <button className="modern-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Content */}
        <div className="modern-modal-content">
          {/* Service Info */}
          <div className="modal-section">
            <span className="modal-section-title">Service Information</span>
            <div className="modal-info-grid">
              <div className="modal-info-item">
                <label>Service/Product</label>
                <span>{booking?.service?.title || booking?.product?.title || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Customer</label>
                <span>{booking?.user?.name || 'N/A'}</span>
              </div>
              <div className="modal-info-item">
                <label>Amount</label>
                <span className="highlight">₱{parseFloat(booking?.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="modal-section">
            <span className="modal-section-title">Mark Service Status</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['pending', 'ongoing', 'done'].map((status) => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', padding: '12px', backgroundColor: completionStatus === status ? '#f0fdf4' : '#f9fafb', border: `1px solid ${completionStatus === status ? '#86efac' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 200ms ease' }}>
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={completionStatus === status}
                    onChange={(e) => setCompletionStatus(e.target.value)}
                    style={{ marginRight: '12px', cursor: 'pointer', accentColor: '#1B3022' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload Section - Only show for "Done" status */}
          {completionStatus === 'done' && (
            <div className="modal-section">
              <span className="modal-section-title">Upload Service Completion Photos</span>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Upload photos to prove the service has been completed</p>
              
              <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '24px', textAlign: 'center', backgroundColor: '#f9fafb', cursor: 'pointer', transition: 'all 200ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1B3022'; e.currentTarget.style.backgroundColor = '#f0fdf4'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.backgroundColor = '#f9fafb'; }}>
                <input
                  type="file"
                  id="image-input"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-input" style={{ cursor: 'pointer', display: 'block' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', display: 'block' }}>Click to upload or drag and drop</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginTop: '4px' }}>PNG, JPG, GIF up to 10MB</span>
                </label>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Uploaded Images ({uploadedImages.length})</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {uploadedImages.map((image, index) => (
                      <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                        <img src={image} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms ease' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#991b1b'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
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
            <div className="modal-error-message">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="modal-success-message">
              {success}
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
          <button
            className="modal-btn-primary"
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
