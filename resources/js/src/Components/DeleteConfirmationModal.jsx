export default function DeleteConfirmationModal({ 
  show, 
  itemName = 'this item',
  onConfirm, 
  onCancel,
  isLoading = false 
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="modal-header-icon">⚠️</span>
            <span>Delete Confirmation</span>
          </div>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p className="text-gray-700 text-center mb-6">
            Are you sure you want to delete {itemName}? This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
