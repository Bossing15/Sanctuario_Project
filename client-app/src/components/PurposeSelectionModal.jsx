import React from 'react';
import './PurposeSelectionModal.css';

function PurposeSelectionModal({ onSelectPurpose, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="purpose-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>What is this request for?</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <p className="modal-subtitle">Please select the purpose of your request</p>
          
          <div className="purpose-options">
            <button 
              className="purpose-card"
              onClick={() => onSelectPurpose('deceased')}
            >
              <div className="purpose-icon">👤</div>
              <h3>Deceased Loved One</h3>
              <p>I want to arrange burial/internment for a deceased loved one</p>
            </button>
            
            <button 
              className="purpose-card"
              onClick={() => onSelectPurpose('reservation')}
            >
              <div className="purpose-icon">📅</div>
              <h3>Reservation Only</h3>
              <p>I want to reserve a space for future use</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurposeSelectionModal;
