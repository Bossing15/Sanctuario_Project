import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaCheck, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import AlertModal from './AlertModal';
import './LotSelector.css';

function LotSelector({ bookingId, onClose, onLotSelected, lotType = 'lawn-lots', title = 'Select Your Lot' }) {
  const [allLots, setAllLots] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [userSelectedLots, setUserSelectedLots] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getLotsFromResponse = (data) => {
    switch (lotType) {
      case 'columbariums':
        return data.columbariums || data.properties || [];
      case 'family-estates':
        return data.family_estates || data.properties || [];
      case 'lawn-lots':
      default:
        return data.lawn_lots || data.properties || [];
    }
  };

  // Fetch user's previously selected lots for this specific product type
  const fetchUserSelectedLots = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/user/selected-lots', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Filter selected lots by current product type
        const selectedLotIds = data.selected_lots
          ?.filter(lot => lot.lot_type === lotType)
          ?.map(lot => lot.id) || [];
        setUserSelectedLots(selectedLotIds);
        console.log(`User selected lots for ${lotType}:`, selectedLotIds);
      }
    } catch (err) {
      console.error('Error fetching user selected lots:', err);
    }
  }, [lotType]);

  const fetchLots = useCallback(async () => {
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
        
        let lotsData = getLotsFromResponse(data);
        
        // Filter by section based on product type
        if (lotType === 'columbariums') {
          lotsData = lotsData.filter(lot => lot.section === 'Main Hall');
        } else if (lotType === 'family-estates') {
          lotsData = lotsData.filter(lot => lot.section === 'Main');
        }
        // For lawn-lots, don't filter - show all sections
        
        // Store all lots
        setAllLots(lotsData);
        
        // Extract unique sections, excluding non-lawn-lot sections
        let uniqueLocations = [...new Set(lotsData.map(lot => lot.section))];
        if (lotType === 'lawn-lots') {
          // Only include Section A and Section B for lawn lots
          uniqueLocations = uniqueLocations.filter(loc => loc === 'Section A' || loc === 'Section B');
        }
        setLocations(uniqueLocations);
        
        // For single section products (columbariums, family-estates), show all lots without filtering
        if (lotType !== 'lawn-lots') {
          setSelectedLocation(null);
          setLots(lotsData);
          setStats({
            total: lotsData.length,
            occupied: lotsData.filter(lot => lot.is_occupied).length,
            available: lotsData.filter(lot => !lot.is_occupied).length
          });
        } else if (lotType === 'lawn-lots' && uniqueLocations.length > 0) {
          // For lawn lots with multiple sections, set first location as default
          const defaultLocation = uniqueLocations[0];
          setSelectedLocation(defaultLocation);
          
          // Filter lots by first section
          const filteredLots = lotsData.filter(lot => lot.section === defaultLocation);
          
          setLots(filteredLots);
          setStats({
            total: filteredLots.length,
            occupied: filteredLots.filter(lot => lot.is_occupied).length,
            available: filteredLots.filter(lot => !lot.is_occupied).length
          });
        } else {
          setLots(lotsData);
          setStats({
            total: lotsData.length,
            occupied: lotsData.filter(lot => lot.is_occupied).length,
            available: lotsData.filter(lot => !lot.is_occupied).length
          });
        }
      } else {
        setError('Failed to load lots');
      }
    } catch (err) {
      console.error('Error fetching lots:', err);
      setError('Error loading lots: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [lotType]);

  useEffect(() => {
    fetchUserSelectedLots();
    fetchLots();
  }, [fetchLots, fetchUserSelectedLots]);

  // Handle location changes for lawn lots
  useEffect(() => {
    if (lotType === 'lawn-lots' && selectedLocation && allLots.length > 0) {
      // Filter lots by selected section when location changes
      const filteredLots = allLots.filter(lot => lot.section === selectedLocation);
      setLots(filteredLots);
      setStats({
        total: filteredLots.length,
        occupied: filteredLots.filter(lot => lot.is_occupied).length,
        available: filteredLots.filter(lot => !lot.is_occupied).length
      });
    }
  }, [selectedLocation, lotType, allLots]);

  const handleSelectLot = (lot) => {
    // Don't allow selection if lot is already selected by user or occupied
    if (userSelectedLots.includes(lot.id) || lot.is_occupied) {
      return;
    }
    
    setSelectedLot(lot);
    setError('');
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
        let selectedItem;
        switch (lotType) {
          case 'columbariums':
            selectedItem = data.columbarium || data.property;
            break;
          case 'family-estates':
            selectedItem = data.estate || data.property;
            break;
          case 'lawn-lots':
          default:
            selectedItem = data.lot || data.property;
            break;
        }
        
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
    // Check if lot was previously selected by user
    if (userSelectedLots.includes(lot.id)) return '#d4a574';
    if (lot.is_occupied) return '#cccccc';
    if (selectedLot?.id === lot.id) return '#16a34a';
    
    // For lawn lots with multiple sections, use section-based colors
    if (lotType === 'lawn-lots' && locations.length >= 2) {
      switch (lot.section) {
        case 'Super Premium': return '#8B7355';
        case 'Premium': return '#FFD700';
        case 'Deluxe': return '#87CEEB';
        case 'Standard': return '#FFB6C1';
        default: return '#E8E8E8';
      }
    }
    
    // For single-section products, use a uniform color
    return '#87CEEB';
  };

  const getLotStatus = (lot) => {
    if (userSelectedLots.includes(lot.id)) return 'Your Selection';
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

        {/* Location Selector - Only show for lawn lots with multiple locations */}
        {lotType === 'lawn-lots' && locations.length >= 2 && (
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

        {/* Legend - Only show for lawn lots with multiple sections */}
        {lotType === 'lawn-lots' && locations.length >= 2 && (
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
              <div className="legend-color" style={{ backgroundColor: '#d4a574' }}></div>
              <span>Your Selection</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#cccccc' }}></div>
              <span>Occupied</span>
            </div>
          </div>
        )}

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
                    className={`lot-item ${lot.is_occupied ? 'occupied' : ''} ${selectedLot?.id === lot.id ? 'selected' : ''} ${userSelectedLots.includes(lot.id) ? 'user-selected' : ''}`}
                    onClick={() => handleSelectLot(lot)}
                    style={{
                      backgroundColor: getLotColor(lot),
                      cursor: (lot.is_occupied || userSelectedLots.includes(lot.id)) ? 'not-allowed' : 'pointer'
                    }}
                    title={`${lot.plot_number} - ${lot.section} - ${getLotStatus(lot)}`}
                  >
                    <div className="lot-content">
                      <span className="lot-number">{lot.plot_number}</span>
                      {(lot.is_occupied || userSelectedLots.includes(lot.id)) && <FaLock className="lot-lock" />}
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
