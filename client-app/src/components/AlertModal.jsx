import React from 'react';
import ModernModal from './ModernModal';
import '../styles/modals.css';

function AlertModal({ type = 'info', title, message, onClose }) {
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const titleMap = {
    success: title || 'Success',
    error: title || 'Error',
    warning: title || 'Warning',
    info: title || 'Information'
  };

  const footer = (
    <button className="modal-btn primary" onClick={onClose}>
      OK
    </button>
  );

  return (
    <ModernModal
      isOpen={true}
      onClose={onClose}
      title={titleMap[type]}
      icon={iconMap[type]}
      footer={footer}
      size="sm"
    >
      <div className="alert-modal-message">
        {message}
      </div>
    </ModernModal>
  );
}

export default AlertModal;
