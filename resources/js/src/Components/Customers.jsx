import { useState, useEffect } from "react";
import { TableSkeleton } from "./SkeletonLoader";
import customerIcon from '../assets/icons/Customers.png';
import { formatDate } from '../utils/dateFormatter';
import StatsCards from "./StatsCards";
import CrudActions from "./CrudActions";
import crudUtils from "../utils/crudUtils";
import ArchiveConfirmationModal from "./ArchiveConfirmationModal";
import usePermissions from "../utils/usePermissions";
import { preserveScrollPosition, restoreScrollPosition } from "../utils/scrollPreserver";
import { getSequentialIdFromIndex } from "../utils/tableIdGenerator";

const CustomersPage = () => {
  const { canPerformActions, canView, isComponentDisabled } = usePermissions();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArchiveConfirmModal, setShowArchiveConfirmModal] = useState(false);
  const [customerToArchive, setCustomerToArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deceased_name: '',
    relationship: '',
    date_of_burial: '',
    plot_number: '',
    grave_location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Fetch customers from API
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchCustomers();
    }
  }, []);

  // Add blur effect to background when modal opens
  useEffect(() => {
    if (showModal) {
      preserveScrollPosition();
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      restoreScrollPosition();
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  // Add blur effect to background when add modal opens
  useEffect(() => {
    if (showAddModal) {
      preserveScrollPosition();
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      restoreScrollPosition();
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAddModal]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      // Since admin panel is on 127.0.0.1:8000, use absolute URL to ensure proper routing
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/clients`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.clients && Array.isArray(data.clients)) {
        setCustomers(data.clients);
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format: expected clients array');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      
      // If it's a JSON parsing error, the response was likely HTML (error page)
      if (err.message.includes('Unexpected token') || err.message.includes('not valid JSON')) {
        setError('Server returned an error page instead of data. Please check if you are properly logged in and try refreshing the page.');
      } else {
        setError(`Failed to load customers: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customerId) => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/clients/${customerId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedCustomer(data.client);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      alert('Failed to load customer details. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${window.location.protocol}//${window.location.host}/api/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      alert('Customer added successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        deceased_name: '',
        relationship: '',
        date_of_burial: '',
        plot_number: '',
        grave_location: ''
      });
      fetchCustomers();
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Failed to add customer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    return (
      <>
        {status === "Active" ? (
          <span style={{ display: 'inline-flex !important', alignItems: 'center !important', flexDirection: 'row !important', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: '600', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', whiteSpace: 'nowrap' }}>
            Active
          </span>
        ) : (
          <span style={{ display: 'inline-flex !important', alignItems: 'center !important', flexDirection: 'row !important', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: '600', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', whiteSpace: 'nowrap' }}>
            Inactive
          </span>
        )}
      </>
    );
  };

  const handleArchiveCustomer = (id) => {
    setCustomerToArchive(id);
    setShowArchiveConfirmModal(true);
  };

  const confirmArchiveCustomer = async () => {
    if (!customerToArchive) return;

    setIsArchiving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/clients/${customerToArchive}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true })
      });
      
      if (response.ok) {
        fetchCustomers();
        setShowArchiveConfirmModal(false);
        setCustomerToArchive(null);
      } else {
        alert("Failed to archive customer");
      }
    } catch (error) {
      console.error("Error archiving customer:", error);
      alert("Error archiving customer");
    } finally {
      setIsArchiving(false);
    }
  };

  const closeArchiveConfirmModal = () => {
    setShowArchiveConfirmModal(false);
    setCustomerToArchive(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="p-8 min-h-screen flex-grow" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="mb-8">
            <div className="flex items-center">
              <img
                src={customerIcon}
                alt="Customer Icon"
                className="w-10 h-10 object-contain mr-4"
              />
              <div>
                <h3 className="text-3xl font-bold text-gray-800">Customers Management</h3>
                <p className="text-gray-600 mt-1">Total Registered Customers: 0</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h5 className="text-xl font-semibold text-gray-800">Registered Customers</h5>
            <button 
              onClick={fetchCustomers}
              className="refresh-btn"
            >
              Refresh
            </button>
          </div>

          <TableSkeleton rows={8} columns={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="p-8 min-h-screen flex-grow" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-red-600 text-xl mb-4">Error Loading Customers</div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 font-semibold mb-2">Error Details:</p>
              <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
            </div>
            <div className="bg-[#f0f5f2] border border-[#1B3022] rounded-lg p-4 mb-4">
              <p className="text-[#1B3022] font-semibold mb-2">Debugging Information:</p>
              <p className="text-[#2A4D36] text-sm">
                • Auth Token: {localStorage.getItem('authToken') ? 'Present' : 'Missing'}<br/>
                • User Role: {localStorage.getItem('userRole') || 'Not set'}<br/>
                • Current URL: {window.location.href}<br/>
                • Customers Count: {customers.length}
              </p>
            </div>
            <button 
              onClick={fetchCustomers}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-2"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                console.log('Current state:', { customers, loading, error });
                console.log('Auth token:', localStorage.getItem('authToken'));
                console.log('User role:', localStorage.getItem('userRole'));
              }}
              className="px-4 py-2 bg-[#1B3022] text-white rounded-lg hover:bg-[#2A4D36] transition-colors"
            >
              Log Debug Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user can view this component
  if (!canView('customers')) {
    return (
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="p-8 min-h-screen flex-grow" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-red-600 text-xl mb-4">Access Denied</div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-semibold">
                You do not have permission to access the Customers component.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar is now handled globally in App.jsx */}

      {/* Customer Details Modal - Rendered at top level */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span>Customer Details</span>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Customer ID</label>
                  <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">{selectedCustomer.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <div>{renderStatusBadge(selectedCustomer.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <p className="text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <p className="text-gray-900">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Date</label>
                  <p className="text-gray-900">{selectedCustomer.registered_date}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Memorial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Deceased Name</label>
                    <p className="text-gray-900">{selectedCustomer.deceased_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                    <p className="text-gray-900">{selectedCustomer.relationship}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Burial</label>
                    <p className="text-gray-900">{selectedCustomer.date_of_burial}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plot Number</label>
                    <p className="text-gray-900">{selectedCustomer.plot_number}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grave Location</label>
                    <p className="text-gray-900">{selectedCustomer.grave_location}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <p className="text-gray-900">{selectedCustomer.address}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Last Payment:</strong> {selectedCustomer.last_payment}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Payment tracking system will be implemented in future updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span>Add New Customer</span>
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddCustomer}>
                {/* Personal Information */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <input 
                        type="text" 
                        name="address"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                      />
                    </div>
                  </div>
                </div>

                {/* Memorial Information */}
                <div className="mb-6 border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Memorial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Deceased Name *</label>
                      <input 
                        type="text" 
                        name="deceased_name"
                        placeholder="Enter deceased name"
                        value={formData.deceased_name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship *</label>
                      <input 
                        type="text" 
                        name="relationship"
                        placeholder="e.g., Father, Mother, Spouse"
                        value={formData.relationship}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Burial</label>
                      <input 
                        type="date" 
                        name="date_of_burial"
                        value={formData.date_of_burial}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Plot Number</label>
                      <input 
                        type="text" 
                        name="plot_number"
                        placeholder="Enter plot number"
                        value={formData.plot_number}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Grave Location</label>
                      <input 
                        type="text" 
                        name="grave_location"
                        placeholder="Enter grave location"
                        value={formData.grave_location}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">* Required fields</p>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleAddCustomer}
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 min-h-screen flex-grow">
        {/* Header */}
        <div className="flex items-center mb-8">
          <img
            src={customerIcon}
            alt="Customer Icon"
            className="w-10 h-10 object-contain mr-4"
          />
          <div>
            <h3 className="text-3xl font-bold text-gray-800">Customers Management</h3>
            <p className="text-gray-600 mt-1">Total Registered Customers: {customers.length}</p>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2" style={{ fontStyle: 'italic' }}>No data available</h3>
          </div>
        ) : (
          <>
            {loading ? (
              <TableSkeleton rows={8} columns={8} />
            ) : (
              <>
                <StatsCards stats={[
                  { label: 'Total Customers', value: customers.length },
                  { label: 'Active', value: customers.filter(c => c.status === 'Active').length },
                  { label: 'Inactive', value: customers.filter(c => c.status !== 'Active').length },
                  { label: 'Registered This Month', value: customers.filter(c => {
                    const date = new Date(c.created_at);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length }
                ]} />

                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-xl font-semibold text-gray-800">Customers List</h5>
                  <button 
                    onClick={fetchCustomers}
                    className="refresh-btn"
                  >
                    Refresh
                  </button>
                </div>

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
                      placeholder="Search customers by ID, name, email, or phone..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
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
                        <th>Customer_ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Grave_Location</th>
                        <th>Registered_Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.filter((customer) => {
                        const query = customerSearchQuery.toLowerCase();
                        return (
                          customer.id.toString().includes(query) ||
                          customer.name.toLowerCase().includes(query) ||
                          customer.email.toLowerCase().includes(query) ||
                          customer.phone.toLowerCase().includes(query)
                        );
                      }).map((customer, index) => (
                        <tr key={customer.id}>
                          <td className="font-mono">{getSequentialIdFromIndex(index)}</td>
                          <td className="font-bold">{customer.name}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phone}</td>
                          <td>
                            {customer.grave_location !== 'N/A' ? customer.grave_location : 
                             customer.plot_number !== 'N/A' ? `Plot ${customer.plot_number}` : 'Not Assigned'}
                          </td>
                          <td className="date-cell">{formatDate(customer.registered_date)}</td>
                          <td className="text-center">
                            {customer.status === "Active" ? (
                              <span style={{ display: 'inline-flex !important', alignItems: 'center !important', flexDirection: 'row !important', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: '600', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', whiteSpace: 'nowrap' }}>
                                Active
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex !important', alignItems: 'center !important', flexDirection: 'row !important', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: '600', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.375rem', whiteSpace: 'nowrap' }}>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <CrudActions
                              onView={() => handleViewCustomer(customer.id)}
                              onEdit={() => {}}
                              onArchive={() => handleArchiveCustomer(customer.id)}
                              onToggleStatus={() => {}}
                              showView={true}
                              showEdit={false}
                              showArchive={!isComponentDisabled('customers')}
                              showToggle={false}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Add Customer Button */}
            <div className="text-right mt-8">
              <button 
                onClick={() => setShowAddModal(true)}
                disabled={isComponentDisabled('customers')}
                className={`px-6 py-3 rounded-xl shadow-md font-bold transition-all ${
                  isComponentDisabled('customers')
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                }`}
                title={isComponentDisabled('customers') ? 'This component is disabled for your account' : 'Add a new customer'}
              >
                Add New Customer
              </button>
            </div>
          </>
        )}
      </div>

      {/* Archive Confirmation Modal */}
      <ArchiveConfirmationModal
        isOpen={showArchiveConfirmModal}
        title="Archive Customer"
        message="Are you sure you want to archive this customer?"
        itemName="this customer"
        onConfirm={confirmArchiveCustomer}
        onCancel={closeArchiveConfirmModal}
        isLoading={isArchiving}
      />
    </div>
  );
};

export default CustomersPage;


