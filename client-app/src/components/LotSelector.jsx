import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import AlertModal from './AlertModal';
import './LotSelector.css';

function LotSelector({ bookingId, onClose, onLotSelected, lotType = 'lawn-lots', title = 'Select Your Lot' }) {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLots();
  }, [selectedLocation]);

  const getApiEndpoint = () => {
    switch (lotType) {
      case 'columbariums':
        return 'http://localhost:8000/api/columbariums';
      case 'family-estates':
        return 'http://localhost:8000/api/family-estates';
      case 'lawn-lots':
      default:
        return 'http://localhost:8000/api/lawn-lots';
    }
  };

  const getLotsFromResponse = (data) => {
    switch (lotType) {
      case 'columbariums':
        return data.columbariums || [];
      case 'family-estates':
        return data.family_estates || [];
      case 'lawn-lots':
      default:
        return data.lawn_lots || [];
    }
  };

  const getLocationField = () => {
    switch (lotType) {
      case 'columbariums':
      case 'family-estates':
        return 'location';
      case 'lawn-lots':
      default:
        return 'grave_location';
    }
  };

  const fetchLots = async () => {
    try {
      setLoading(true);
      const endpoint = getApiEndpoint();
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Lots fetched:', data);
        
        const lotsData = getLotsFromResponse(data);
        const locationField = getLocationField();
        
        // Extract unique locations
        const uniqueLocations = [...new Set(lotsData.map(lot => {
          const locationValue = lot[locationField];
          if (lotType === 'lawn-lots') {
            const parts = locationValue.split(' - ');
            return parts[0]; // Get the location name (first part before ' - ')
          }
          return locationValue;
        }))];
        
        setLocations(uniqueLocations);
        
        // Set default location if not set
        if (!selectedLocation && uniqueLocations.length > 0) {
          setSelectedLocation(uniqueLocations[0]);
          return; // Will refetch with location set
        }
        
        // Filter lots by selected location
        const filteredLots = selectedLocation 
          ? lotsData.filter(lot => {
              const locationValue = lot[locationField];
              if (lotType === 'lawn-lots') {
                return locationValue.includes(selectedLocation);
              }
              return locationValue === selectedLocation;
            })
          : lotsData;
        
        setLots(filteredLots);
        setStats({
          total: filteredLots.length,
          occupied: filteredLots.filter(lot => lot.is_occupied).length,
          available: filteredLots.filter(lot => !lot.is_occupied).length
        });
      } else {
        setError('Failed to load lots');
      }
    } catch (err) {
      console.error('Error fetching lots:', err);
      setError('Error loading lots: ' + err.message);
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
      setError('Please select a lot');
      return;
    }

    try {
      setSubmitting(true);
      const endpoint = getApiEndpoint();
      
      // Prepare the request body based on lot type
      let requestBody = {};
      switch (lotType) {
        case 'columbariums':
          requestBody = { columbarium_id: selectedLot.id };
          break;
        case 'family-estates':
          requestBody = { estate_id: selectedLot.id };
          break;
        case 'lawn-lots':
        default:
          requestBody = { lot_id: selectedLot.id };
          break;
      }
      
      const response = await fetch(`${endpoint}/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Lot selected successfully:', data);
        
        // Get the selected item based on lot type
        const selectedItem = data.lot || data.columbarium || data.estate;
        
        // Call onLotSelected directly without showing alert
        // PaymentModal will handle the success message
        if (onLotSelected) {
          onLotSelected(selectedItem);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to select lot');
      }
    } catch (err) {
      console.error('Error selecting lot:', err);
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
    <div className="lot-selector-overlay">
      <div className="lot-selector-container">
        {/* Header */}
        <div className="selector-header">
          <div className="header-content">
            <FaMapMarkerAlt className="header-icon" />
            <h2>{title}</h2>
          </div>
          <button className="selector-close" onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        {/* Location Selector - Only show if multiple locations */}
        {locations.length > 1 && (
          <div className="location-selector">
            {locations.map(location => (
              <button 
                key={location}
                className={`location-btn ${selectedLocation === location ? 'active' : ''}`}
                onClick={() => setSelectedLocation(location)}
              >
                {location}
              </button>
            ))}
          </div>
        )}

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
              <p>Loading lots...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchLots} className="retry-btn">Retry</button>
            </div>
          ) : (
            <>
              {/* Lot Grid */}
              <div className="lot-grid">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className={`lot-item ${lot.is_occupied ? 'occupied' : ''} ${selectedLot?.id === lot.id ? 'selected' : ''}`}
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
                  <h3>Selected {lotType === 'columbariums' ? 'Niche' : lotType === 'family-estates' ? 'Estate' : 'Lot'} Details</h3>
                  <div className="detail-row">
                    <span className="detail-label">{lotType === 'columbariums' ? 'Niche Number' : 'Plot Number'}:</span>
                    <span className="detail-value">{selectedLot.niche_number || selectedLot.plot_number}</span>
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

export default LotSelector;
