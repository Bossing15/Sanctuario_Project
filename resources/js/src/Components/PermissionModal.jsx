import { useState, useEffect } from "react";
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

const PermissionModal = ({ isOpen, onClose, admin, onSave }) => {
  const [permissions, setPermissions] = useState({
    dashboard: true,
    customers: true,
    billing: true,
    graves: true,
    requirements: true,
    inquiries: true,
    messages: true,
    admin: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Lock scroll when modal is open
  useModalScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && admin) {
      fetchPermissions();
    }
  }, [isOpen, admin]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const numericId = parseInt(admin.id.replace(/\D/g, ''));
      
      const response = await fetch(`/api/admin-permissions/${numericId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract can_perform_actions from the permission structure
        const permissionsMap = {};
        Object.keys(data.permissions).forEach(key => {
          permissionsMap[key] = data.permissions[key].can_perform_actions;
        });
        setPermissions(permissionsMap);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const numericId = parseInt(admin.id.replace(/\D/g, ''));
      
      const response = await fetch(`/api/admin-permissions/${numericId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        onSave && onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const permissionLabels = {
    dashboard: 'Dashboard',
    customers: 'Customers',
    billing: 'Billing',
    graves: 'Graves',
    requirements: 'Requirements',
    inquiries: 'Products',
    messages: 'Messages',
    admin: 'Admin Management',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <h2>Manage Permissions</h2>
          <button
            className="modern-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modern-modal-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af' }}>
              <p>Loading permissions...</p>
            </div>
          ) : (
            <>
              <div className="modal-section">
                <span className="modal-section-title">Admin Information</span>
                <div className="modal-info-grid">
                  <div className="modal-info-item">
                    <label>Name</label>
                    <span>{admin?.name}</span>
                  </div>
                  <div className="modal-info-item">
                    <label>Role</label>
                    <span>{admin?.role}</span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px', lineHeight: '1.5' }}>
                  Toggle permissions to grant or revoke access to perform actions in each component.
                </p>
              </div>

              <div className="modal-section">
                <span className="modal-section-title">Component Permissions</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.keys(permissions).map((key) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', cursor: 'pointer', transition: 'all 200ms ease', border: '1px solid #f0f0f0' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', display: 'block' }}>{permissionLabels[key]}</span>
                        {!permissions[key] && (
                          <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', display: 'block' }}>View Only</span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={permissions[key]}
                        onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#1B3022' }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modern-modal-footer">
          <button
            className="modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="modal-btn-primary"
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
