import React, { useState } from 'react';
import './CrudActions.css';

export default function CrudActions({
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  showView = true,
  showEdit = true,
  showDelete = true,
  showToggle = true,
  disabled = false,
  size = 'md'
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
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

      {showDelete && onDelete && (
        <>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={disabled || isLoading}
              className="action-btn delete-btn"
              title="Delete item"
            >
              Delete
            </button>
          ) : (
            <div className="delete-confirm">
              <span className="confirm-text">Sure?</span>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="action-btn confirm-yes"
              >
                {isLoading ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
