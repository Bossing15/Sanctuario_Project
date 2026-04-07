import React, { useEffect } from 'react';
import '../styles/modals.css';

/**
 * Modern Modal Component
 * Reusable modal with modern design
 */
const ModernModal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  size = 'md',
  closeButton = true,
  onBackdropClick = true,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (onBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal ${sizeClasses[size]} ${className}`}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            {icon && <span className="modal-header-icon">{icon}</span>}
            <span>{title}</span>
          </div>
          {closeButton && (
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernModal;

