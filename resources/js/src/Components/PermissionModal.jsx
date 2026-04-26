import { useState, useEffect } from "react";

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

  // Add blur effect to background
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

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
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <span>Manage Permissions</span>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading permissions...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Admin:</strong> {admin?.name}
                  <br />
                  <strong>Role:</strong> {admin?.role}
                  <br />
                  <span className="text-xs text-gray-500 block mt-2">Toggle permissions to grant or revoke access to perform actions in each component.</span>
                </p>
              </div>
              
              <div className="space-y-2">
                {Object.keys(permissions).map((key) => (
                  <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <div>
                      <span className="text-gray-800 font-medium text-sm">{permissionLabels[key]}</span>
                      {!permissions[key] && (
                        <span className="block text-xs text-red-600 mt-1">View Only</span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={permissions[key]}
                      onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="modal-btn primary"
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
