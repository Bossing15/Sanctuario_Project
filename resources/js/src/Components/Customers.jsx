import { useState, useEffect } from "react";
import { TableSkeleton } from "./SkeletonLoader";
import customerIcon from '../assets/icons/Customers.png';
import { formatDate } from '../utils/dateFormatter';
import StatsCards from "./StatsCards";

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
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
    fetchCustomers();
  }, []);

  // Add blur effect to background when modal opens
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  // Add blur effect to background when add modal opens
  useEffect(() => {
    if (showAddModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
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
    const isActive = status === "Active";
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="p-8 min-h-screen flex-grow">
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
      <div className="flex flex-col min-h-screen">
        <div className="p-8 min-h-screen flex-grow">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-red-600 text-xl mb-4">⚠️ Error Loading Customers</div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 font-semibold mb-2">Error Details:</p>
              <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-700 font-semibold mb-2">Debugging Information:</p>
              <p className="text-blue-600 text-sm">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log Debug Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar is now handled globally in App.jsx */}

      {/* Customer Details Modal - Rendered at top level */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span className="modal-header-icon">👤</span>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2" style={{ fontStyle: 'italic' }}>No data available</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-xl font-semibold text-gray-800">Registered Customers</h5>
              <button 
                onClick={fetchCustomers}
                className="refresh-btn"
              >
                Refresh
              </button>
            </div>

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
                      }).map((customer) => (
                        <tr key={customer.id}>
                          <td className="font-mono">{customer.id}</td>
                          <td className="font-bold">{customer.name}</td>
                          <td>{customer.email}</td>
                          <td>{customer.phone}</td>
                          <td>
                            {customer.grave_location !== 'N/A' ? customer.grave_location : 
                             customer.plot_number !== 'N/A' ? `Plot ${customer.plot_number}` : 'Not Assigned'}
                          </td>
                          <td className="date-cell">{formatDate(customer.registered_date)}</td>
                          <td className="text-center">
                            <span className={`status-badge ${customer.status === 'Active' ? 'active' : 'inactive'}`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="text-center">
                            <button 
                              onClick={() => handleViewCustomer(customer.id)}
                              className="action-btn primary"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Status Legend */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <strong className="text-gray-800 font-semibold mb-3 block">Status Legend</strong>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">✅</span>
                <strong className="text-gray-700">Active</strong> – Customer is active.
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">❌</span>
                <strong className="text-gray-700">Inactive</strong> – Customer is inactive.
              </div>
            </div>

            {/* Add Customer Button */}
            <div className="text-right mt-8">
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 hover:shadow-lg transition-all font-bold"
              >
                Add New Customer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;


