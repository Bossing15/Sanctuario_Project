import { useMemo, useState, useEffect } from "react";
import adminIcon from "../assets/icons/icons8-admin-50.png";
import { formatDate } from "../utils/dateFormatter";
import PermissionModal from "./PermissionModal";
import usePermissions from "../utils/usePermissions";
import { TableSkeleton } from "./SkeletonLoader";

const tabs = [
  { key: "list", label: "Admin List" },
  { key: "add", label: "Add Account" },
  { key: "roles", label: "Roles & Permissions" },
];

const Admin = () => {
  const { canPerformActions, user } = usePermissions();
  const canManageAdmins = canPerformActions('admin');
  const isAdmin = user.access_level === 'admin';
  
  const [activeTab, setActiveTab] = useState("list");
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [rolesSearchQuery, setRolesSearchQuery] = useState("");
  const [listSearchQuery, setListSearchQuery] = useState("");

  const roleOptions = ["Admin", "Staff", "Caretaker"];
  const defaultPermissions = { 
    dashboard: true, 
    customers: true, 
    billing: false, 
    graves: true, 
    requirements: true, 
    inquiries: true, 
    messages: true, 
    admin: false 
  };

  const [addForm, setAddForm] = useState({
    name: "",
    username: "",
    contact: "",
    email: "",
    role: "Admin",
    password: "",
    permissions: { ...defaultPermissions },
  });

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    contact: "",
    email: "",
    role: "Admin",
    oldPassword: "",
    newPassword: "",
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

  useEffect(() => {
    if (addForm.role === 'Admin') {
      const allPermissionsEnabled = Object.keys(defaultPermissions).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      
      const allEnabled = Object.values(addForm.permissions).every(val => val === true);
      if (!allEnabled) {
        setAddForm(v => ({...v, permissions: allPermissionsEnabled}));
      }
    }
  }, [addForm.role]);

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

  function openEdit(a) {
    setEditForm({
      id: a.id,
      name: a.name,
      contact: a.contact ?? "",
      email: a.email,
      role: a.role,
      oldPassword: "",
      newPassword: "",
      status: a.status ?? "Active",
      permissions: { ...defaultPermissions, ...(a.permissions || {}) },
    });
    setEditing(a.id);
    setActiveTab("edit");
  }

  async function saveNewAdmin(e) {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
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
          access_level: addForm.role.toLowerCase(),
          contact: addForm.contact,
          permissions: addForm.permissions,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUsers();
        setAddForm({ name: "", username: "", contact: "", email: "", role: "Admin", password: "", permissions: { ...defaultPermissions } });
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

  function saveEditedAdmin(e) {
    e.preventDefault();
    setAdminList(list => list.map(x => x.id === editForm.id ? { ...x, name: editForm.name, email: editForm.email, role: editForm.role, status: editForm.status, contact: editForm.contact, permissions: editForm.permissions } : x));
    setActiveTab("list");
    setEditing(null);
  }

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '2rem', paddingBottom: '1rem' }}>
        <div className="flex items-center">
          <img src={adminIcon} alt="Admin Icon" className="w-10 h-10 object-contain mr-4" />
          <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div className="flex space-x-3 items-center justify-between">
          <div className="flex space-x-3">
            {tabs.filter(t => {
              if ((t.key === 'add' || t.key === 'roles') && !isAdmin) {
                return false;
              }
              return true;
            }).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === t.key
                    ? 'bg-blue-600 text-white shadow-md'
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
              style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1d4ed8';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem' }}>
        {activeTab === "list" && (
          <>
            {!canManageAdmins && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ fontSize: '0.875rem', color: '#ea580c' }}>
                  <span style={{ fontWeight: '600' }}>View Only:</span> You can view accounts but cannot edit or manage permissions.
                </p>
              </div>
            )}

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
                  placeholder="Search by admin name, email, or contact..."
                  value={listSearchQuery}
                  onChange={(e) => setListSearchQuery(e.target.value)}
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
                      <th>Admin_ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact_Number</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Registered_Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminList.filter((a) => {
                      const query = listSearchQuery.toLowerCase();
                      return (
                        a.name.toLowerCase().includes(query) ||
                        a.email.toLowerCase().includes(query) ||
                        (a.contact || a.phone || '').toLowerCase().includes(query)
                      );
                    }).length > 0 ? (
                      adminList.filter((a) => {
                        const query = listSearchQuery.toLowerCase();
                        return (
                          a.name.toLowerCase().includes(query) ||
                          a.email.toLowerCase().includes(query) ||
                          (a.contact || a.phone || '').toLowerCase().includes(query)
                        );
                      }).map((a) => (
                        <tr key={a.id}>
                          <td className="font-mono">{a.id}</td>
                          <td className="font-semibold">{a.name}</td>
                          <td>{a.email}</td>
                          <td>{a.contact || a.phone || 'N/A'}</td>
                          <td>{a.role}</td>
                          <td className="text-center">
                            {a.status === "Active" ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                                ✅ Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                                ❌ Inactive
                              </span>
                            )}
                          </td>
                          <td className="date-cell">{formatDate(a.created_at)}</td>
                          <td className="text-center">
                            <button 
                              onClick={() => isAdmin && canManageAdmins && a.role !== 'Admin' && openEdit(a)} 
                              className="action-btn primary"
                              disabled={!isAdmin || !canManageAdmins || a.role === 'Admin'}
                              title={!isAdmin ? 'Only admins can edit accounts' : a.role === 'Admin' ? 'Cannot edit Admin accounts' : ''}
                              style={{ opacity: (!isAdmin || !canManageAdmins || a.role === 'Admin') ? 0.5 : 1, cursor: (!isAdmin || !canManageAdmins || a.role === 'Admin') ? 'not-allowed' : 'pointer' }}
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
                            <div className="table-empty-state-icon">📋</div>
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

        {activeTab === "add" && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="mb-8">
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Add New Account</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Create a new admin account with custom permissions</p>
            </div>
            
            <form onSubmit={saveNewAdmin} className="space-y-6">
              {/* Basic Info Section */}
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

              {/* Credentials Section */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Credentials</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      value={addForm.password} 
                      onChange={e => setAddForm(v => ({...v, password: e.target.value}))}
                      placeholder="Enter password"
                      required
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      value={addForm.role} 
                      onChange={e => setAddForm(v => ({...v, role: e.target.value}))}
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    >
                      {roleOptions.map(r => (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Permissions</h3>
                {addForm.role === 'Admin' ? (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '500' }}>
                      ✓ Admin role has full access to all components by default.
                    </p>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Select which components this account can access</p>
                )}
                <div className="grid-4">
                  {Object.keys(addForm.permissions).map((key) => (
                    <label 
                      key={key} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        cursor: addForm.role === 'Admin' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: addForm.permissions[key] ? '#f0fdf4' : '#f9fafb',
                        borderColor: addForm.permissions[key] ? '#86efac' : '#e5e7eb',
                        opacity: addForm.role === 'Admin' ? 0.7 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (addForm.role !== 'Admin') {
                          e.currentTarget.style.backgroundColor = addForm.permissions[key] ? '#dcfce7' : '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = addForm.permissions[key] ? '#f0fdf4' : '#f9fafb';
                      }}
                    >
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-green-600 rounded" 
                        checked={addForm.permissions[key]} 
                        onChange={e => setAddForm(v => ({...v, permissions: {...v.permissions, [key]: e.target.checked}}))}
                        disabled={addForm.role === 'Admin'}
                        style={{ cursor: addForm.role === 'Admin' ? 'not-allowed' : 'pointer' }}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{permissionLabels[key]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
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
                    e.target.style.backgroundColor = '#1d4ed8';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
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

        {activeTab === "edit" && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div className="mb-8">
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Edit Account</h2>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{editForm.name} • {editForm.email}</p>
            </div>
            
            <form onSubmit={saveEditedAdmin} className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Basic Information</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm(v => ({...v, name: e.target.value}))}
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                      type="email" 
                      value={editForm.email} 
                      onChange={e => setEditForm(v => ({...v, email: e.target.value}))}
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input 
                      type="text" 
                      value={editForm.contact} 
                      onChange={e => setEditForm(v => ({...v, contact: e.target.value}))}
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      value={editForm.role} 
                      onChange={e => setEditForm(v => ({...v, role: e.target.value}))}
                      style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                    >
                      <option value="Staff">Staff</option>
                      <option value="Caretaker">Caretaker</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Account Status</h3>
                <div className="form-group" style={{ maxWidth: '300px' }}>
                  <label className="form-label">Status</label>
                  <select 
                    value={editForm.status} 
                    onChange={e => setEditForm(v => ({...v, status: e.target.value}))}
                    style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Permissions Section */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Permissions</h3>
                <div className="grid-4">
                  {Object.keys(editForm.permissions).map((key) => (
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
                        backgroundColor: editForm.permissions[key] ? '#f0fdf4' : '#f9fafb',
                        borderColor: editForm.permissions[key] ? '#86efac' : '#e5e7eb'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = editForm.permissions[key] ? '#dcfce7' : '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = editForm.permissions[key] ? '#f0fdf4' : '#f9fafb';
                      }}
                    >
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-green-600 rounded" 
                        checked={editForm.permissions[key]} 
                        onChange={e => setEditForm(v => ({...v, permissions: {...v.permissions, [key]: e.target.checked}}))}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{permissionLabels[key]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
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
                    e.target.style.backgroundColor = '#1d4ed8';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Save Changes
                </button>
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
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "roles" && (
          <div>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : (
              <>
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
                      placeholder="Search by admin name or email..."
                      value={rolesSearchQuery}
                      onChange={(e) => setRolesSearchQuery(e.target.value)}
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
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      {Object.keys(defaultPermissions).map(key => (
                        <th key={key} className="text-center">{permissionLabels[key]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminList.length > 0 ? (
                      adminList.filter((a) => {
                        const query = rolesSearchQuery.toLowerCase();
                        return (
                          a.name.toLowerCase().includes(query) ||
                          a.email.toLowerCase().includes(query)
                        );
                      }).map((a) => (
                        <tr key={a.id}>
                          <td className="font-semibold">{a.name}</td>
                          <td>{a.email}</td>
                          <td>{a.role}</td>
                          {Object.keys(defaultPermissions).map(k => (
                            <td key={k} className="text-center">
                              <span className={`badge ${
                                (a.permissions?.[k] || (k === "admin" && a.role === "Admin")) 
                                  ? 'badge-success' 
                                  : 'badge-neutral'
                              }`}>
                                {(a.permissions?.[k] || (k === "admin" && a.role === "Admin")) ? "✓" : "✖"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3 + Object.keys(defaultPermissions).length} className="text-center">
                          <div className="table-empty-state">
                            <div className="table-empty-state-icon">📋</div>
                            <div className="table-empty-state-title">No Admins Found</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )}
      </div>

      <PermissionModal 
        isOpen={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        admin={selectedAdmin}
        onSave={fetchUsers}
      />
    </div>
  );
};

export default Admin;

