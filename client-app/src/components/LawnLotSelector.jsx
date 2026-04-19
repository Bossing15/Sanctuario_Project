import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import AlertModal from './AlertModal';
import './LawnLotSelector.css';

function LawnLotSelector({ bookingId, onClose, onLotSelected }) {
  const [lawnLots, setLawnLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
  const [selectedLocation, setSelectedLocation] = useState('Location A');

  useEffect(() => {
    fetchLawnLots();
  }, [selectedLocation]);

  const fetchLawnLots = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/lawn-lots', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Lawn lots fetched:', data);
        
        // Filter lots by selected location
        const filteredLots = data.lawn_lots.filter(lot => lot.grave_location.includes(selectedLocation));
        
        setLawnLots(filteredLots);
        setStats({
          total: filteredLots.length,
          occupied: filteredLots.filter(lot => lot.is_occupied).length,
          available: filteredLots.filter(lot => !lot.is_occupied).length
        });
      } else {
        setError('Failed to load lawn lots');
      }
    } catch (err) {
      console.error('Error fetching lawn lots:', err);
      setError('Error loading lawn lots: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLot = (lot) => {
    if (!lot.is_occupied) {
      setSelectedLot(lot);
      setError('');
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedLot) {
      setError('Please select a lawn lot');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/lawn-lots/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: bookingId,
          grave_id: selectedLot.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Lawn lot selected successfully:', data);
        setAlertModal({
          show: true,
          type: 'success',
          message: `Lawn lot ${selectedLot.plot_number} selected successfully!`,
          onClose: () => {
            setAlertModal({ show: false, type: 'info', message: '' });
            if (onLotSelected) {
              onLotSelected(data.grave);
            }
            onClose();
          }
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to select lawn lot');
      }
    } catch (err) {
      console.error('Error selecting lawn lot:', err);
      setError('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getLotColor = (lot) => {
    if (lot.is_occupied) return '#cccccc';
    if (selectedLot?.id === lot.id) return '#16a34a';
    
    switch (lot.section) {
      case 'Super Premium': return '#8B7355';
      case 'Premium': return '#FFD700';
      case 'Deluxe': return '#87CEEB';
      case 'Standard': return '#FFB6C1';
      default: return '#E8E8E8';
    }
  };

  const getLotStatus = (lot) => {
    if (lot.is_occupied) return 'Occupied';
    if (selectedLot?.id === lot.id) return 'Selected';
    return 'Available';
  };

  return (
    <div className="lawn-lot-selector-overlay">
      <div className="lawn-lot-selector-container">
        {/* Header */}
        <div className="selector-header">
          <div className="header-content">
            <FaMapMarkerAlt className="header-icon" />
            <h2>Select Your Lawn Lot</h2>
          </div>
          <button className="selector-close" onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        {/* Location Selector */}
        <div className="location-selector">
          <button 
            className={`location-btn ${selectedLocation === 'Location A' ? 'active' : ''}`}
            onClick={() => setSelectedLocation('Location A')}
          >
            Location A
          </button>
          <button 
            className={`location-btn ${selectedLocation === 'Location B' ? 'active' : ''}`}
            onClick={() => setSelectedLocation('Location B')}
          >
            Location B
          </button>
        </div>

        {/* Stats */}
        <div className="selector-stats">
          <div className="stat-item">
            <span className="stat-label">Total Lots:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Available:</span>
            <span className="stat-value available">{stats.available}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Occupied:</span>
            <span className="stat-value occupied">{stats.occupied}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="selector-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8B7355' }}></div>
            <span>Super Premium</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFD700' }}></div>
            <span>Premium</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#87CEEB' }}></div>
            <span>Deluxe</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FFB6C1' }}></div>
            <span>Standard</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#cccccc' }}></div>
            <span>Occupied</span>
          </div>
        </div>

        {/* Content */}
        <div className="selector-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading lawn lots...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchLawnLots} className="retry-btn">Retry</button>
            </div>
          ) : (
            <>
              {/* Lawn Lot Grid */}
              <div className="lawn-lot-grid">
                {lawnLots.map((lot) => (
                  <div
                    key={lot.id}
                    className={`lawn-lot-item ${lot.is_occupied ? 'occupied' : ''} ${selectedLot?.id === lot.id ? 'selected' : ''}`}
                    onClick={() => handleSelectLot(lot)}
                    style={{
                      backgroundColor: getLotColor(lot),
                      cursor: lot.is_occupied ? 'not-allowed' : 'pointer'
                    }}
                    title={`${lot.plot_number} - ${lot.section} - ${getLotStatus(lot)}`}
                  >
                    <div className="lot-content">
                      <span className="lot-number">{lot.plot_number}</span>
                      {lot.is_occupied && <FaLock className="lot-lock" />}
                      {selectedLot?.id === lot.id && <FaCheck className="lot-check" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Lot Details */}
              {selectedLot && (
                <div className="selected-lot-details">
                  <h3>Selected Lot Details</h3>
                  <div className="detail-row">
                    <span className="detail-label">Plot Number:</span>
                    <span className="detail-value">{selectedLot.plot_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Section:</span>
                    <span className="detail-value">{selectedLot.section}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedLot.grave_location || selectedLot.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value available">Available</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="selector-actions">
          <button
            className="action-btn cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className={`action-btn confirm ${!selectedLot ? 'disabled' : ''}`}
            onClick={handleConfirmSelection}
            disabled={!selectedLot || submitting}
          >
            {submitting ? 'Confirming...' : 'Confirm Selection'}
          </button>
        </div>
      </div>

      {/* Alert Modal */}
      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={alertModal.onClose || (() => setAlertModal({ show: false, type: 'info', message: '' }))}
        />
      )}
    </div>
  );
}

export default LawnLotSelector;
