import React, { useState } from 'react';
import './DeceasedInfoModal.css';

function DeceasedInfoModal({ onSubmit, onClose, allowMultiple = false, maxDeceased = 5, isService = false, requestPurpose = 'deceased' }) {
  const [deceasedList, setDeceasedList] = useState([
    { name: '', dateOfDeath: '', relationship: '' }
  ]);
  const [idFile, setIdFile] = useState(null);
  const [idFileName, setIdFileName] = useState('');
  const [error, setError] = useState('');
  
  // Determine if we need deceased info based on purpose
  const isReservationOnly = requestPurpose === 'reservation';
  const isDeceasedPurpose = requestPurpose === 'deceased';

  const handleAddDeceased = () => {
    if (deceasedList.length < maxDeceased) {
      setDeceasedList([
        ...deceasedList,
        { name: '', dateOfDeath: '', relationship: '' }
      ]);
      setError('');
    }
  };

  const handleRemoveDeceased = (index) => {
    if (deceasedList.length > 1) {
      setDeceasedList(deceasedList.filter((_, i) => i !== index));
      setError('');
    }
  };

  const handleDeceasedChange = (index, field, value) => {
    const updated = [...deceasedList];
    updated[index][field] = value;
    setDeceasedList(updated);
  };

  const handleIdFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdFile(file);
      setIdFileName(file.name);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For services (no purpose), just need ID upload and deceased name
    if (isService && !requestPurpose) {
      if (!idFile) {
        setError('Please upload your ID');
        return;
      }
      setError('');
      onSubmit({
        requestPurpose: null,
        idFile: idFile,
        deceasedList: deceasedList.map(d => ({
          deceasedName: d.name.trim() || 'To Be Verified',
          dateOfDeath: d.dateOfDeath || new Date().toISOString().split('T')[0],
          relationship: d.relationship.trim() || ''
        }))
      });
      return;
    }
    
    // For reservation only, just need ID upload
    if (isReservationOnly) {
      if (!idFile) {
        setError('Please upload your ID');
        return;
      }
      setError('');
      onSubmit({
        requestPurpose: 'reservation',
        idFile: idFile,
        deceasedList: []
      });
      return;
    }

    // For deceased purpose, validate deceased info
    if (isDeceasedPurpose) {
      // Validate all deceased entries
      for (let i = 0; i < deceasedList.length; i++) {
        const deceased = deceasedList[i];
        
        if (!deceased.name.trim()) {
          setError(`Please enter the name for deceased #${i + 1}`);
          return;
        }
        
        if (!deceased.dateOfDeath) {
          setError(`Please select the date of death for deceased #${i + 1}`);
          return;
        }

        // Check if date is not in the future
        const selectedDate = new Date(deceased.dateOfDeath);
        const today = new Date();
        if (selectedDate > today) {
          setError(`Date of death for deceased #${i + 1} cannot be in the future`);
          return;
        }
      }

      if (!idFile) {
        setError('Please upload your ID');
        return;
      }

      setError('');
      onSubmit({
        requestPurpose: 'deceased',
        idFile: idFile,
        deceasedList: deceasedList.map(d => ({
          deceasedName: d.name.trim(),
          dateOfDeath: d.dateOfDeath,
          relationship: d.relationship.trim()
        }))
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="deceased-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isReservationOnly ? 'Reservation Information' : 'Deceased Information'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="deceased-form">
          {/* Deceased Information Section - Show for deceased purpose and services */}
          {(isDeceasedPurpose || (isService && !requestPurpose)) && (
            <div className="deceased-list">
              {deceasedList.map((deceased, index) => (
                <div key={index} className="deceased-entry">
                  <div className="entry-header">
                    <h3>Deceased #{index + 1}</h3>
                    {deceasedList.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveDeceased(index)}
                        title="Remove this deceased"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`deceasedName-${index}`}>
                      Deceased Name {isDeceasedPurpose ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      id={`deceasedName-${index}`}
                      value={deceased.name}
                      onChange={(e) => handleDeceasedChange(index, 'name', e.target.value)}
                      placeholder="Enter the full name of the deceased"
                      className="form-input"
                    />
                  </div>

                  {isDeceasedPurpose && (
                    <>
                      <div className="form-group">
                        <label htmlFor={`dateOfDeath-${index}`}>Date of Death *</label>
                        <input
                          type="date"
                          id={`dateOfDeath-${index}`}
                          value={deceased.dateOfDeath}
                          onChange={(e) => handleDeceasedChange(index, 'dateOfDeath', e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor={`relationship-${index}`}>Relationship *</label>
                        <select
                          id={`relationship-${index}`}
                          value={deceased.relationship}
                          onChange={(e) => handleDeceasedChange(index, 'relationship', e.target.value)}
                          className="form-input"
                        >
                          <option value="">Select relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Child</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Grandparent">Grandparent</option>
                          <option value="Grandchild">Grandchild</option>
                          <option value="In-law">In-law</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  {index < deceasedList.length - 1 && <div className="entry-divider"></div>}
                </div>
              ))}
            </div>
          )}

          {allowMultiple && deceasedList.length < maxDeceased && isDeceasedPurpose && (
            <button
              type="button"
              className="btn-add-deceased"
              onClick={handleAddDeceased}
            >
              + Add Another Deceased (Max {maxDeceased})
            </button>
          )}

          {/* ID Upload Section - Show for both purposes */}
          <div className="id-upload-section">
            <h3>Upload Your ID *</h3>
            <p className="id-upload-description">Please upload a valid government-issued ID (e.g., Passport, Driver's License, National ID)</p>
            
            <div className="file-input-wrapper">
              <input
                type="file"
                id="idFile"
                onChange={handleIdFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="file-input"
              />
              <label htmlFor="idFile" className="file-input-label">
                <span className="file-input-icon">📎</span>
                <span className="file-input-text">
                  {idFileName ? `Selected: ${idFileName}` : 'Click to upload or drag and drop'}
                </span>
              </label>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {isService ? 'Continue' : 'Continue to Select Lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeceasedInfoModal;
