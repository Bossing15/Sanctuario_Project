import { useEffect } from 'react';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) {
  if (!isOpen) return null;

  // Lock scroll when modal is open
  useModalScrollLock(isOpen);

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'modal-btn-danger';
      case 'success':
        return 'modal-btn-primary';
      case 'warning':
        return 'modal-btn-danger';
      default:
        return 'modal-btn-primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <h2>{title}</h2>
          <button
            className="modern-modal-close"
            onClick={onCancel}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modern-modal-content">
          <div className="modal-section">
            <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '14px', margin: '0' }}>
              {message}
            </p>
          </div>
        </div>

        <div className="modern-modal-footer">
          <button 
            className="modal-btn-secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={getButtonClass()}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
