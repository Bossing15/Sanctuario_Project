import { useState, useEffect, useMemo, useRef } from "react";
import adminIcon from "../assets/icons/icons8-admin-50.png";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    contact: '',
  });
  const [permissions, setPermissions] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const permissionLabels = useMemo(() => ({
    customers: "Customers",
    billing: "Billing & Payments",
    graves: "Graves",
    requirements: "Requirements",
    inquiries: "Products",
    messages: "Messages",
    admin: "Admin Management",
  }), []);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditForm({
          name: userData.name || '',
          email: userData.email || '',
          contact: userData.contact || userData.phone || '',
        });
        
        // Fetch permissions
        const permResponse = await fetch('/api/my-permissions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        if (permResponse.ok) {
          const permData = await permResponse.json();
          setPermissions(permData.permissions || {});
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admins/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          contact: editForm.contact,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.user || updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser.user || updatedUser));
        setIsEditing(false);
        alert('Profile updated successfully!');
        // Refresh to get latest data
        fetchUserData();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('New password must be at least 8 characters long');
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      alert('New password must be different from current password');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admins/${user.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          new_password_confirmation: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordSection(false);
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex items-center mb-8">
        <img src={adminIcon} alt="Profile Icon" className="w-10 h-10 object-contain mr-4" />
        <h3 className="text-3xl font-bold text-gray-800">My Profile</h3>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        {/* Profile Header */}
        <div className="flex items-center mb-8 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-800">
              {user?.access_level || user?.role || 'User'} – {user?.name || 'User'}
            </h4>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Personal Info */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              ) : (
                <p className="text-gray-700 text-lg">{user?.name || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              ) : (
                <p className="text-gray-700 text-lg">{user?.email || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Username:</label>
              <p className="text-gray-700 text-lg">{user?.username || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Role:</label>
              <p className="text-gray-700 text-lg capitalize">{user?.access_level || user?.role || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Contact Number:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.contact}
                  onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter contact number"
                />
              ) : (
                <p className="text-gray-700 text-lg">{user?.contact || user?.phone || 'N/A'}</p>
              )}
            </div>
          </div>

          {/* Right Column - Permissions */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-4">Component Permissions:</label>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                {Object.keys(permissionLabels).map((key) => {
                  const hasPermission = permissions[key] === true || 
                                       (typeof permissions[key] === 'object' && permissions[key]?.can_perform_actions !== false);
                  return (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-700 font-medium">{permissionLabels[key]}</span>
                      <span className={`flex items-center gap-2 ${hasPermission ? 'text-green-600' : 'text-red-600'}`}>
                        {hasPermission ? (
                          <>
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-sm font-semibold">Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="text-sm font-semibold">Inactive</span>
                          </>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
              {user?.access_level === 'admin' && (
                <p className="text-xs text-blue-600 mt-2">
                  ℹ️ Admin accounts have full access to all components
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            <span>{showPasswordSection ? '▼' : '▶'}</span>
            Change Password
          </button>

          {showPasswordSection && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Current Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    New Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-gray-500 mt-1">Min. 8 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Confirm New Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setShowPasswordSection(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.contact || user?.phone || '',
                  });
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;