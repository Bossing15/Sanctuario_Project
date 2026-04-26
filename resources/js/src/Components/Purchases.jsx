import React, { useState, useEffect } from 'react';
import { TableSkeleton } from './SkeletonLoader';
import CrudActions from './CrudActions';
import crudUtils from '../utils/crudUtils';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import './Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const apiUrl = `${window.location.protocol}//${window.location.host}/api/bookings`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const bookingsData = data.data || data;
        
        // Fetch user details for each booking
        const enrichedBookings = await Promise.all(
          (Array.isArray(bookingsData) ? bookingsData : []).map(async (booking) => {
            try {
              const userResponse = await fetch(
                `${window.location.protocol}//${window.location.host}/api/clients/${booking.user_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                  },
                  credentials: 'include'
                }
              );
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                return {
                  ...booking,
                  client: userData.client || userData
                };
              }
            } catch (err) {
              console.error('Error fetching user details:', err);
            }
            return booking;
          })
        );

        setPurchases(enrichedBookings);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleDeletePurchase = (id) => {
    setPurchaseToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeletePurchase = async () => {
    if (!purchaseToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const result = await crudUtils.deleteItem(
        "/api/bookings",
        purchaseToDelete,
        token
      );
      
      if (result.success) {
        fetchPurchases();
        setShowDeleteConfirmModal(false);
        setPurchaseToDelete(null);
      } else {
        alert(result.error || "Failed to delete purchase");
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
      alert("Error deleting purchase");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setPurchaseToDelete(null);
  };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ReadyForPayment': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Payment' },
      'Paid': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      'Completed': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredPurchases = purchases.filter(purchase => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (purchase.client?.name || '').toLowerCase().includes(query) ||
      (purchase.client?.email || '').toLowerCase().includes(query) ||
      (purchase.id?.toString() || '').includes(query);
    
    const matchesFilter = filterStatus === 'all' || purchase.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">All User Purchases</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff'
          }}>
            <input
              type="text"
              placeholder="Search by customer name, email, or ID..."
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
            <svg style={{ width: '20px', height: '20px', color: '#6b7280', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="all">All Status</option>
            <option value="ReadyForPayment">Pending Payment</option>
            <option value="Paid">Paid</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Total Purchases</p>
            <p className="text-2xl font-bold text-blue-600">{purchases.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Pending Payment</p>
            <p className="text-2xl font-bold text-yellow-600">{purchases.filter(p => p.status === 'ReadyForPayment').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Paid</p>
            <p className="text-2xl font-bold text-green-600">{purchases.filter(p => p.status === 'Paid').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(purchases.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0))}
            </p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={7} />
        ) : (
          <div className="table-wrapper bg-white rounded-lg shadow-md overflow-hidden">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Product</th>
                  <th>Plan Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No purchases found
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="font-mono font-semibold">#{purchase.id}</td>
                      <td className="font-semibold">{purchase.client?.name || 'N/A'}</td>
                      <td className="text-sm">{purchase.client?.email || 'N/A'}</td>
                      <td>{purchase.product?.title || 'N/A'}</td>
                      <td className="font-medium">{purchase.plan_type || 'N/A'}</td>
                      <td className="font-semibold text-green-600">{formatCurrency(purchase.amount)}</td>
                      <td>{getStatusBadge(purchase.status)}</td>
                      <td className="text-sm">{formatDate(purchase.created_at)}</td>
                      <td className="text-center">
                        <CrudActions
                          onView={() => {}}
                          onEdit={() => {}}
                          onDelete={() => handleDeletePurchase(purchase.id)}
                          onToggleStatus={() => {}}
                          showView={false}
                          showEdit={false}
                          showDelete={true}
                          showToggle={false}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmModal}
        message="Are you sure you want to delete this purchase?"
        itemName="this purchase"
        onConfirm={confirmDeletePurchase}
        onCancel={closeDeleteConfirmModal}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Purchases;
