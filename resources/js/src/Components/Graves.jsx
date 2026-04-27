import { useState, useEffect } from "react";
import graveIcon from "../assets/icons/Graves.png";
import { formatDate } from "../utils/dateFormatter";
import usePermissions from "../utils/usePermissions";
import { TableSkeleton } from "./SkeletonLoader";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import StatsCards from "./StatsCards";

export default function Graves() {
  const { canPerformActions } = usePermissions();
  const canManageGraves = canPerformActions('graves');

  // Real data from database
  const [gravesData, setGravesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGrave, setSelectedGrave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [graveSearchQuery, setGraveSearchQuery] = useState("");

  // Edit grave state
  const [showEditGraveModal, setShowEditGraveModal] = useState(false);
  const [editGrave, setEditGrave] = useState(null);

  // Notification modal state
  const [notification, setNotification] = useState(null);

  // Fetch graves on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchGraves();
    }
  }, []);

  // Add blur effect to background when modals open
  useEffect(() => {
    if (showModal || showEditGraveModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal, showEditGraveModal]);

  // Clear modals when search query changes
  useEffect(() => {
    setShowModal(false);
    setShowEditGraveModal(false);
    setNotification(null);
  }, [graveSearchQuery]);

  const fetchGraves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const apiUrl = `${window.location.protocol}//${window.location.host}/api/graves`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGravesData(data.graves || []);
    } catch (err) {
      console.error('Error fetching graves:', err);
      setError('Failed to load graves. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditedGrave = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/graves/${editGrave.id}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          deceased_name: editGrave.deceased_name,
          burial_date: editGrave.burial_date,
          grave_location: editGrave.grave_location,
          status: editGrave.status,
          notes: editGrave.notes,
        }),
      });

      if (response.ok) {
        await fetchGraves();
        setShowEditGraveModal(false);
        setShowModal(false);
        showNotification('Grave updated successfully!', 'success');
      } else {
        const error = await response.json();
        console.error('Failed to update grave:', error);
        showNotification('Failed to update grave: ' + JSON.stringify(error), 'error');
      }
    } catch (error) {
      console.error('Error updating grave:', error);
      showNotification('Error updating grave: ' + error.message, 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleViewGrave = async (graveId) => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/graves/${graveId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSelectedGrave(data.grave);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching grave details:', err);
      showNotification('Failed to load grave details. Please try again.', 'error');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* <Navbar /> */}

      {/* Grave Details Modal - Rendered at top level */}
      {showModal && selectedGrave && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span>Grave Details</span>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grave ID</label>
                  <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">{selectedGrave.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <div>{selectedGrave.status === "Active" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                      Inactive
                    </span>
                  )}</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deceased Name</label>
                  <p className="text-gray-900">{selectedGrave.deceased_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Burial Date</label>
                  <p className="text-gray-900">{selectedGrave.burial_date}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grave Location</label>
                  <p className="text-gray-900">{selectedGrave.grave_location}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Added</label>
                  <p className="text-gray-900">{selectedGrave.date_added}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
                    <p className="text-gray-900">{selectedGrave.customer}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{selectedGrave.customer_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <p className="text-gray-900">{selectedGrave.customer_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship to Deceased</label>
                    <p className="text-gray-900">{selectedGrave.relationship_to_deceased}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-800">{selectedGrave.notes}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setEditGrave(selectedGrave);
                  setShowEditGraveModal(true);
                }}
                className="px-4 py-2 bg-[#1B3022] text-white rounded-lg hover:bg-[#2A4D36] transition-colors"
              >
                Edit Grave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grave Modal */}
      {showEditGraveModal && editGrave && (
        <div className="modal-overlay" onClick={() => setShowEditGraveModal(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveEditedGrave}>
              <div className="modal-header">
                <div className="modal-header-title">
                  <span>Edit Grave</span>
                </div>
                <button type="button" className="modal-close" onClick={() => setShowEditGraveModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Deceased Name</label>
                      <input 
                        type="text"
                        value={editGrave.deceased_name || ''}
                        onChange={(e) => setEditGrave({...editGrave, deceased_name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1B3022] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Burial Date</label>
                      <input 
                        type="date"
                        value={editGrave.burial_date || ''}
                        onChange={(e) => setEditGrave({...editGrave, burial_date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1B3022] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Grave Location</label>
                      <input 
                        type="text"
                        value={editGrave.grave_location || ''}
                        onChange={(e) => setEditGrave({...editGrave, grave_location: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1B3022] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Status</label>
                      <select 
                        value={editGrave.status || 'Active'}
                        onChange={(e) => setEditGrave({...editGrave, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1B3022] focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Notes</label>
                    <textarea 
                      rows={4}
                      value={editGrave.notes || ''}
                      onChange={(e) => setEditGrave({...editGrave, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#1B3022] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditGraveModal(false)}
                  className="px-6 py-2.5 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg transition-colors font-semibold shadow-md bg-[#1B3022] text-white hover:bg-[#2A4D36]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification && (
        <div className="modal-overlay" onClick={() => setNotification(null)}>
          <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span>{notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Error' : 'Information'}</span>
              </div>
              <button className="modal-close" onClick={() => setNotification(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="text-gray-700 text-center">
                {notification.message}
              </p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setNotification(null)}
                className={`px-6 py-2.5 rounded-lg transition-colors font-semibold ${
                  notification.type === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : notification.type === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-[#1B3022] text-white hover:bg-[#2A4D36]'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-8 pt-8 graves-container" style={{ flex: 1, backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-center mb-8">
          <img src={graveIcon} alt="Grave Icon" className="w-10 h-10 object-contain mr-4" />
          <h3 className="text-3xl font-bold text-gray-800">Graves Management</h3>
        </div>

        <div>
            {loading ? (
              <TableSkeleton rows={8} columns={8} />
            ) : error ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="text-red-600 text-xl mb-4">Error</div>
                <p className="text-gray-700 mb-4">{error}</p>
                <button 
                  onClick={fetchGraves}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : gravesData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Purchased Graves Found</h3>
                <p className="text-gray-500">No graves have been purchased yet.</p>
              </div>
            ) : (
              <>
                <StatsCards stats={[
                  { label: 'Purchased Graves', value: gravesData.length },
                  { label: 'Active', value: gravesData.filter(g => g.status === 'Active').length },
                  { label: 'Inactive', value: gravesData.filter(g => g.status === 'Inactive').length },
                  { label: 'Occupied', value: gravesData.filter(g => g.status === 'Occupied').length }
                ]} />

                <div className="flex items-center justify-between mb-6">
                  <h5 className="text-xl font-semibold text-gray-800">Purchased Graves List</h5>
                  <button 
                    onClick={fetchGraves}
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
                      placeholder="Search graves by ID, deceased name, location, customer, or product type..."
                      value={graveSearchQuery}
                      onChange={(e) => setGraveSearchQuery(e.target.value)}
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

                <div className="table-wrapper" style={{ minHeight: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Grave_ID</th>
                        <th>Deceased_Name</th>
                        <th>Grave_Location</th>
                        <th>Customer</th>
                        <th>Product_Type</th>
                        <th>Relationship_to_Deceased</th>
                        <th>Status</th>
                        <th>Date_Added</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...gravesData].sort((a, b) => {
                        if (a.status === "Active" && b.status !== "Active") return -1;
                        if (a.status !== "Active" && b.status === "Active") return 1;
                        return 0;
                      }).filter((grave) => {
                        const query = graveSearchQuery.toLowerCase();
                        return (
                          grave.id.toString().includes(query) ||
                          grave.deceased_name.toLowerCase().includes(query) ||
                          grave.grave_location.toLowerCase().includes(query) ||
                          grave.customer.toLowerCase().includes(query) ||
                          (grave.product_type && grave.product_type.toLowerCase().includes(query))
                        );
                      }).length > 0 ? (
                        [...gravesData].sort((a, b) => {
                          if (a.status === "Active" && b.status !== "Active") return -1;
                          if (a.status !== "Active" && b.status === "Active") return 1;
                          return 0;
                        }).filter((grave) => {
                          const query = graveSearchQuery.toLowerCase();
                          return (
                            grave.id.toString().includes(query) ||
                            grave.deceased_name.toLowerCase().includes(query) ||
                            grave.grave_location.toLowerCase().includes(query) ||
                            grave.customer.toLowerCase().includes(query) ||
                            (grave.product_type && grave.product_type.toLowerCase().includes(query))
                          );
                        }).map((grave) => (
                          <tr key={grave.id}>
                            <td className="font-mono">{grave.id}</td>
                            <td className="font-bold">{grave.deceased_name}</td>
                            <td>{grave.grave_location}</td>
                            <td>{grave.customer}</td>
                            <td>
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-[#f0f5f2] text-[#1B3022] rounded-lg">
                                {grave.product_type}
                              </span>
                            </td>
                            <td>{grave.relationship_to_deceased}</td>
                            <td className="text-center">
                              {grave.status === "Active" ? (
                                <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="date-cell">{formatDate(grave.date_added)}</td>
                            <td className="text-center">
                              <button 
                                onClick={() => handleViewGrave(grave.id)}
                                className="table-action-btn primary"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center py-8">
                            <div className="text-gray-400 text-lg">
                              {graveSearchQuery ? 'No graves match your search criteria' : 'No graves found'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="graves-legend pb-8">
                  <p className="text-sm">
                    <span className="text-green-600 font-semibold">Active</span> – The Customer is Active and is Paying for the Services.
                  </p>
                  <p className="text-sm">
                    <span className="text-red-600 font-semibold">Inactive</span> – The Customer is Inactive Due to Non-Payment of the Services.
                  </p>
                </div>
              </>
            )}
        </div>

      </div>
    </div>
  );
}


