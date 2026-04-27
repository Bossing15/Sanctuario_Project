import { useMemo, useState, useEffect } from "react";
import adminIcon from "../assets/icons/icons8-admin-50.png";
import { formatDate } from "../utils/dateFormatter";
import usePermissions from "../utils/usePermissions";
import { TableSkeleton } from "./SkeletonLoader";

const Admin = () => {
  const { user, isAdmin } = usePermissions();
  
  const [activeTab, setActiveTab] = useState("list");
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check if user has admin permission
  const canManageAdmins = isAdmin;
  const canViewAdmins = isAdmin || user?.permissions?.admin === true;

  const roleOptions = ["Admin", "Staff", "Caretaker"];
  
  // Default permissions for new accounts (all enabled)
  const defaultPermissions = { 
    dashboard: true, 
    customers: true, 
    billing: true, 
    graves: true, 
    requirements: true, 
    inquiries: true, 
    messages: true, 
    admin: false  // Staff/Caretaker cannot access admin management
  };

  const [addForm, setAddForm] = useState({
    name: "",
    username: "",
    contact: "",
    email: "",
    role: "Staff",
    password: "",
    permissions: { ...defaultPermissions },
  });

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    contact: "",
    email: "",
    role: "Staff",
    status: "Active",
    permissions: { ...defaultPermissions },
  });

  const permissionLabels = useMemo(() => ({
    dashboard: "Dashboard",
    customers: "Customers",
    billing: "Billing & Payments",
    graves: "Graves",
    requirements: "Requirements",
    inquiries: "Inquiries",
    messages: "Messages",
    admin: "Admin Management",
  }), []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admins', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminList(data.admins);
      } else {
        console.error('Failed to fetch admins');
        setAdminList([]);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setAdminList([]);
    } finally {
      setLoading(false);
    }
  };

  function openEdit(admin) {
    setEditForm({
      id: admin.id,
      name: admin.name,
      contact: admin.contact ?? "",
      email: admin.email,
      access_level: admin.access_level,
      status: admin.status ?? "Active",
      permissions: { ...defaultPermissions, ...(admin.permissions || {}) },
    });
    setEditing(admin.id);
    setActiveTab("edit");
  }

  async function saveNewAdmin(e) {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const selectedRole = addForm.role.toLowerCase();
      
      // For Admin role, set all permissions to true
      const permissions = selectedRole === 'admin' 
        ? {
            dashboard: true,
            customers: true,
            billing: true,
            graves: true,
            requirements: true,
            inquiries: true,
            messages: true,
            admin: true,
          }
        : addForm.permissions;
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: addForm.name,
          username: addForm.username,
          email: addForm.email,
          password: addForm.password,
          password_confirmation: addForm.password,
          role: 'admin',
          access_level: selectedRole,
          contact: addForm.contact,
          permissions: permissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUsers();
        setAddForm({ name: "", username: "", contact: "", email: "", role: "Staff", password: "", permissions: { ...defaultPermissions } });
        setActiveTab("list");
        alert('Account created successfully!');
      } else {
        const errorMessage = data.errors 
          ? Object.values(data.errors).flat().join(', ')
          : data.message || 'Failed to create account';
        alert('Error: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    }
  }

  async function saveEditedAdmin(e) {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin-permissions/${editForm.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          permissions: editForm.permissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setAdminList(list => list.map(x => x.id === editForm.id ? { ...x, permissions: editForm.permissions } : x));
        setActiveTab("list");
        setEditing(null);
        alert('Permissions updated successfully!');
      } else {
        const errorMessage = data.error || data.message || 'Failed to update permissions';
        alert('Error: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions. Please try again.');
    }
  }

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '2rem', paddingBottom: '1rem' }}>
        <div className="flex items-center">
          <img src={adminIcon} alt="Admin Icon" className="w-10 h-10 object-contain mr-4" />
          <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
        </div>
      </div>

      {/* Permission Check */}
      {!canViewAdmins && (
        <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: '500' }}>
              You do not have permission to access the Admin Management component.
            </p>
          </div>
        </div>
      )}

      {canViewAdmins && (
        <>
      {/* Tabs */}
      <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div className="flex space-x-3 items-center justify-between">
          <div className="flex space-x-3">
            {[
              { key: "list", label: "Admin List" },
              ...(canManageAdmins ? [{ key: "add", label: "Add Account" }] : []),
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-[#1B3022] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {activeTab === "list" && (
            <button 
              onClick={fetchUsers}
              style={{ padding: '0.75rem 1.5rem', background: '#1B3022', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2A4D36';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1B3022';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
        {/* Admin List Tab */}
        {activeTab === "list" && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#ffffff',
                transition: 'all 0.2s ease'
              }}>
                <input
                  type="text"
                  placeholder="Search by name, email, or contact..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    fontSize: '0.875rem',
                    color: '#374151'
                  }}
                />
                <svg style={{ width: '20px', height: '20px', color: '#6b7280', marginLeft: '0.5rem', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {loading ? (
              <TableSkeleton rows={5} />
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminList.filter((a) => {
                      const query = searchQuery.toLowerCase();
                      return (
                        a.name.toLowerCase().includes(query) ||
                        a.email.toLowerCase().includes(query) ||
                        (a.contact || '').toLowerCase().includes(query)
                      );
                    }).length > 0 ? (
                      adminList.filter((a) => {
                        const query = searchQuery.toLowerCase();
                        return (
                          a.name.toLowerCase().includes(query) ||
                          a.email.toLowerCase().includes(query) ||
                          (a.contact || '').toLowerCase().includes(query)
                        );
                      }).map((a) => (
                        <tr key={a.id}>
                          <td className="font-mono">{a.id}</td>
                          <td className="font-semibold">{a.name}</td>
                          <td>{a.email}</td>
                          <td>{a.contact || 'N/A'}</td>
                          <td>{a.role}</td>
                          <td className="text-center">
                            {a.is_active ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="date-cell">{formatDate(a.created_at)}</td>
                          <td className="text-center">
                            <button 
                              onClick={() => a.role !== 'Admin' && openEdit(a)} 
                              className="action-btn primary"
                              disabled={a.role === 'Admin'}
                              title={a.role === 'Admin' ? 'Cannot edit Admin accounts' : 'Edit permissions'}
                              style={{ opacity: a.role === 'Admin' ? 0.5 : 1, cursor: a.role === 'Admin' ? 'not-allowed' : 'pointer' }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          <div className="table-empty-state">
                            <div className="table-empty-state-title">No Admins Found</div>
                            <div className="table-empty-state-text">Admin accounts will appear here</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Add Account Tab */}
        {activeTab === "add" && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="mb-8">
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Add New Account</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Create a new admin, staff, or caretaker account</p>
            </div>
            
            <form onSubmit={saveNewAdmin} className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Account Information</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      value={addForm.name} 
                      onChange={e => setAddForm(v => ({...v, name: e.target.value}))}
                      placeholder="Enter full name"
                      required
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input 
                      type="text" 
                      value={addForm.username} 
                      onChange={e => setAddForm(v => ({...v, username: e.target.value}))}
                      placeholder="Enter username"
                      required
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      value={addForm.email} 
                      onChange={e => setAddForm(v => ({...v, email: e.target.value}))}
                      placeholder="Enter email address"
                      required
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input 
                      type="text" 
                      value={addForm.contact} 
                      onChange={e => setAddForm(v => ({...v, contact: e.target.value}))}
                      placeholder="Enter contact number"
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Credentials</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={addForm.password} 
                        onChange={e => setAddForm(v => ({...v, password: e.target.value}))}
                        placeholder="Enter password"
                        required
                        style={{ 
                          backgroundColor: '#f9fafb', 
                          borderColor: '#e5e7eb',
                          paddingRight: '2.5rem',
                          width: '100%'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#374151'}
                        onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ) : (
                          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      value={addForm.role} 
                      onChange={e => setAddForm(v => ({...v, role: e.target.value}))}
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Staff">Staff</option>
                      <option value="Caretaker">Caretaker</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1B3022',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2A4D36';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1B3022';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Create Account
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveTab("list")}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Permissions Tab */}
        {activeTab === "edit" && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="mb-8">
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Edit Component Access</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{editForm.name} • {editForm.email}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Enable/Disable component access. Disabled components are view-only.
              </p>
            </div>

            {/* Admin Account Notice */}
            {editForm.access_level === 'admin' && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '0.75rem',
                marginBottom: '2rem'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '500' }}>
                  Admin accounts have full access to all components and cannot be edited.
                </p>
              </div>
            )}
            
            <form onSubmit={saveEditedAdmin} className="space-y-6">
              {/* Component Access */}
              {editForm.access_level !== 'admin' ? (
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Component Access</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    Enabled = Full access | Disabled = View only
                  </p>
                  <div className="grid-4">
                    {Object.keys(editForm.permissions).filter(key => key !== 'admin').map((key) => (
                      <label 
                        key={key} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: editForm.permissions[key] ? '#f0fdf4' : '#fef2f2',
                          borderColor: editForm.permissions[key] ? '#86efac' : '#fecaca',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = editForm.permissions[key] ? '#dcfce7' : '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = editForm.permissions[key] ? '#f0fdf4' : '#fef2f2';
                        }}
                      >
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-green-600 rounded" 
                          checked={editForm.permissions[key]} 
                          onChange={e => setEditForm(v => ({...v, permissions: {...v.permissions, [key]: e.target.checked}}))}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                          {permissionLabels[key]}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: 'auto' }}>
                          {editForm.permissions[key] ? 'Enabled' : 'View Only'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                    Admin accounts cannot have their component access edited. They have full access to all components.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem' }}>
                {editForm.access_level !== 'admin' && (
                  <button 
                    type="submit" 
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#1B3022',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#2A4D36';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#1B3022';
                      e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    Save Changes
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => { setActiveTab("list"); setEditing(null); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default Admin;
