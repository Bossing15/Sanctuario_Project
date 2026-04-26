import React, { useState } from 'react';
import './DeceasedInfoModal.css';

function DeceasedInfoModal({ onSubmit, onClose, allowMultiple = false, maxDeceased = 5, isService = false }) {
  const [deceasedList, setDeceasedList] = useState([
    { name: '', dateOfDeath: '', relationship: '' }
  ]);
  const [error, setError] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    setError('');
    onSubmit(deceasedList.map(d => ({
      deceasedName: d.name.trim(),
      dateOfDeath: d.dateOfDeath,
      relationship: d.relationship.trim()
    })));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="deceased-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Deceased Information</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="deceased-form">
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
                  <label htmlFor={`deceasedName-${index}`}>Deceased Name *</label>
                  <input
                    type="text"
                    id={`deceasedName-${index}`}
                    value={deceased.name}
                    onChange={(e) => handleDeceasedChange(index, 'name', e.target.value)}
                    placeholder="Enter the full name of the deceased"
                    className="form-input"
                  />
                </div>

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

                {index < deceasedList.length - 1 && <div className="entry-divider"></div>}
              </div>
            ))}
          </div>

          {allowMultiple && deceasedList.length < maxDeceased && (
            <button
              type="button"
              className="btn-add-deceased"
              onClick={handleAddDeceased}
            >
              + Add Another Deceased (Max {maxDeceased})
            </button>
          )}

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
