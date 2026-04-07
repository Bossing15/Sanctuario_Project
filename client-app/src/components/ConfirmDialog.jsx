import React from 'react';
import ModernModal from './ModernModal';
import '../styles/modals.css';

/**
 * Confirmation Dialog Component
 * Modern confirmation dialog with customizable actions
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  title = 'Confirm Action',
  message = 'Are you sure?',
  icon = '⚠',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info', // info, warning, error, success
  loading = false,
  danger = false
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const iconMap = {
    info: 'ℹ',
    warning: '⚠',
    error: '✕',
    success: '✓'
  };

  const displayIcon = icon || iconMap[type];

  const footer = (
    <div className="confirmation-actions">
      <button
        className="modal-btn secondary"
        onClick={handleCancel}
        disabled={loading}
      >
        {cancelText}
      </button>
      <button
        className={`modal-btn ${danger ? 'danger' : 'primary'}`}
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? '...' : confirmText}
      </button>
    </div>
  );

  return (
    <ModernModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={displayIcon}
      footer={footer}
      size="sm"
      className="confirmation-dialog"
    >
      <div className="confirmation-message">
        {message}
      </div>
    </ModernModal>
  );
};

export default ConfirmDialog;

