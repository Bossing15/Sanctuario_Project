import { useState } from 'react';
import './RequirementsModal.css';

function RequirementsModal({ onClose, onSubmit }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const requiredDocuments = [
    'Valid Government ID (Driver\'s License, Passport, or National ID)',
    'Proof of Ownership (Deed of Sale or Certificate of Ownership)',
    'Death Certificate of the Deceased',
    'Burial Permit or Authorization Letter',
    'Recent Photo of the Grave Site (if applicable)'
  ];

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    setUploading(true);

    // Simulate upload (in real app, upload to server)
    setTimeout(() => {
      setUploading(false);
      onSubmit(selectedFiles);
    }, 1500);
  };

  return (
    <div className="requirements-modal-overlay" onClick={onClose}>
      <div className="requirements-modal" onClick={(e) => e.stopPropagation()}>
        <div className="requirements-modal-header">
          <h2>Upload Requirements</h2>
          <button className="requirements-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="requirements-modal-body">
          <div className="requirements-info">
            <h3>📋 Why do we need these documents?</h3>
            <p>
              To ensure proper authorization and maintain the integrity of our maintenance services, 
              we require verification documents. This helps us confirm your ownership and provide 
              the best care for your loved one's resting place.
            </p>
          </div>

          <div className="requirements-list">
            <h4>Required Documents:</h4>
            <ul>
              {requiredDocuments.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>

          <div className="upload-section">
            <label htmlFor="requirements-upload" className="upload-label">
              <div className="upload-icon">📤</div>
              <div className="upload-text">
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} file(s) selected` 
                  : 'Click to upload documents'}
              </div>
              <div className="upload-hint">
                Accepted formats: PDF, JPG, PNG (Max 10MB per file)
              </div>
            </label>
            <input
              id="requirements-upload"
              type="file"
              className="file-input"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileSelect}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h5>Selected Files:</h5>
              <div className="file-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">
                      📄 {file.name}
                    </span>
                    <button
                      className="file-remove-btn"
                      onClick={() => handleRemoveFile(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="requirements-modal-footer">
          <button className="modal-btn cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-btn submit-btn"
            onClick={handleSubmit}
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : 'Submit Requirements'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequirementsModal;
