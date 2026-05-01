import React, { useState } from 'react';
import './CrudActions.css';

export default function CrudActions({
  onView,
  onEdit,
  onArchive,
  onToggleStatus,
  showView = true,
  showEdit = true,
  showArchive = true,
  showToggle = true,
  disabled = false,
  size = 'md'
}) {
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      await onArchive();
      setShowArchiveConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`crud-actions ${size}`}>
      {showView && onView && (
        <button
          onClick={onView}
          disabled={disabled || isLoading}
          className="action-btn view-btn"
          title="View details"
        >
          View
        </button>
      )}

      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          disabled={disabled || isLoading}
          className="action-btn edit-btn"
          title="Edit item"
        >
          Edit
        </button>
      )}

      {showToggle && onToggleStatus && (
        <button
          onClick={onToggleStatus}
          disabled={disabled || isLoading}
          className="action-btn toggle-btn"
          title="Toggle status"
        >
          Toggle
        </button>
      )}

      {showArchive && onArchive && (
        <>
          {!showArchiveConfirm ? (
            <button
              onClick={() => setShowArchiveConfirm(true)}
              disabled={disabled || isLoading}
              className="action-btn archive-btn"
              title="Archive item"
            >
              Archive
            </button>
          ) : (
            <div className="archive-confirm">
              <span className="confirm-text">Sure?</span>
              <button
                onClick={handleArchive}
                disabled={isLoading}
                className="action-btn confirm-yes"
              >
                {isLoading ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowArchiveConfirm(false)}
                disabled={isLoading}
                className="action-btn confirm-no"
              >
                No
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
