import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

export default function ArchiveConfirmationModal({ 
  isOpen, 
  title = 'Archive Confirmation',
  message = 'Are you sure you want to archive this item? You can restore it later.',
  itemName = 'this item',
  onConfirm, 
  onCancel,
  isLoading = false 
}) {
  // Lock scroll when modal is open
  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <h2 style={{ margin: 0 }}>{title}</h2>
          </div>
          <button className="modern-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modern-modal-content">
          <div className="modal-section">
            <p style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '14px', margin: '0', fontWeight: '500' }}>
              {message}
            </p>
          </div>
        </div>
        <div className="modern-modal-footer">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="modal-btn-secondary"
            style={{ minWidth: '100px' }}
          >
            No
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="modal-btn-warning"
            style={{ minWidth: '100px' }}
          >
            {isLoading ? 'Archiving...' : 'Yes'}
          </button>
        </div>
      </div>
    </div>
  );
}
