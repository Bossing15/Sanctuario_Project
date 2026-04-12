import React, { useState } from 'react';

const MaintenanceHeader = ({ onSave, canManageServices }) => {
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    maintenance_title: 'MAINTENANCE',
    maintenance_description: 'REGULAR GRAVE MAINTENANCE NOT ONLY PRESERVES THE DIGNITY OF A LOVED ONE\'S RESTING PLACE BUT ALSO KEEPS THE AREA CLEAN, SAFE, AND WELCOMING. BY CLEANING THE HEADSTONE, MANAGING WEEDS, AND TENDING THE SURROUNDING GROUNDS, FAMILIES ENSURE THE SITE REMAINS BEAUTIFUL AND WELL-KEPT. CONSISTENT CARE ALSO HELPS PREVENT LONG-TERM DAMAGE TO THE STONE AND LANDSCAPE, PROTECTING THE MEMORIAL FOR FUTURE GENERATIONS AND OFFERING PEACE OF MIND TO THOSE WHO VISIT.',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      showNotification("Maintenance header updated successfully!", "success");
    } catch (error) {
      showNotification("Error saving maintenance header", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="maintenance-header-section">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSave} className="maintenance-header-form">
        {/* Title */}
        <div className="maintenance-title-wrapper">
          {editingField === 'maintenance_title' ? (
            <input
              type="text"
              name="maintenance_title"
              value={formData.maintenance_title}
              onChange={handleInputChange}
              onBlur={() => setEditingField(null)}
              autoFocus
              className="maintenance-title-input"
            />
          ) : (
            <h2 
              className="maintenance-title-display editable"
              onClick={() => setEditingField('maintenance_title')}
            >
              {formData.maintenance_title}
              <span className="edit-hint">Click to edit</span>
            </h2>
          )}
        </div>

        {/* Description */}
        <div className="maintenance-description-wrapper">
          {editingField === 'maintenance_description' ? (
            <textarea
              name="maintenance_description"
              value={formData.maintenance_description}
              onChange={handleInputChange}
              onBlur={() => setEditingField(null)}
              autoFocus
              className="maintenance-description-input"
              rows={3}
            />
          ) : (
            <p 
              className="maintenance-description-display editable"
              onClick={() => setEditingField('maintenance_description')}
            >
              {formData.maintenance_description}
              <span className="edit-hint">Click to edit</span>
            </p>
          )}
        </div>

        {/* Save Button */}
        {canManageServices && (
          <div className="maintenance-header-actions">
            <button
              type="submit"
              className="btn-save-maintenance"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Header'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MaintenanceHeader;
