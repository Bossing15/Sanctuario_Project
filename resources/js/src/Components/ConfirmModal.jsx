import { useEffect } from 'react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'info' }) {
  if (!isOpen) return null;

  // Add blur effect to background
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
      case 'danger':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'question':
        return 'Question';
      default:
        return 'Info';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="modal-header-icon">{getIcon()}</span>
            <span>{title}</span>
          </div>
          <button
            className="modal-close"
            onClick={onCancel}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button 
            className="modal-btn secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`modal-btn ${getButtonClass()}`}
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
