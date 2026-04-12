import React, { useState, useEffect } from 'react';
import './InquiriesManagement.css';
import '../styles/tables.css';
import inquiryIcon from "../assets/icons/Products.png";
import usePermissions from '../utils/usePermissions';
import { TableSkeleton } from './SkeletonLoader';
import DeleteConfirmationModal from "./DeleteConfirmationModal";

function InquiriesManagement() {
  const { canPerformActions } = usePermissions();
  const canManageInquiries = canPerformActions('inquiries');
  
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('All');

  // Delete confirmation modal state
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inquiries, statusFilter, serviceFilter, searchQuery, dateRange]);

  // Add blur effect to background when modal opens
  useEffect(() => {
    if (showDetailModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showDetailModal]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out maintenance-related inquiries
        const nonMaintenanceInquiries = (data.inquiries || []).filter(inquiry => {
          const productInterest = (inquiry.product_interest || '').toLowerCase();
          return !productInterest.includes('maintenance') && !productInterest.includes('grave');
        });
        setInquiries(nonMaintenanceInquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...inquiries];

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(inq => inq.status === statusFilter);
    }

    // Service filter
    if (serviceFilter !== 'All') {
      filtered = filtered.filter(inq => inq.product_interest === serviceFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inq =>
        inq.full_name.toLowerCase().includes(query) ||
        inq.email.toLowerCase().includes(query) ||
        inq.phone.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateRange !== 'All') {
      const now = new Date();
      filtered = filtered.filter(inq => {
        const inquiryDate = new Date(inq.created_at);
        const diffDays = Math.floor((now - inquiryDate) / (1000 * 60 * 60 * 24));
        
        switch (dateRange) {
          case 'Today':
            return diffDays === 0;
          case 'Week':
            return diffDays <= 7;
          case 'Month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredInquiries(filtered);
  };

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteInquiry = (inquiryId) => {
    setInquiryToDelete(inquiryId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteInquiry = async () => {
    if (!inquiryToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchInquiries();
        setShowDetailModal(false);
        setShowDeleteConfirmModal(false);
        setInquiryToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setInquiryToDelete(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New':
        return 'status-new';
      case 'In Progress':
        return 'status-progress';
      case 'Responded':
        return 'status-responded';
      case 'Closed':
        return 'status-closed';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openDetailModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
    if (inquiry.status === 'New' && canManageInquiries) {
      updateInquiryStatus(inquiry.id, 'In Progress');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={inquiryIcon} alt="Products Icon" className="w-10 h-10 object-contain mr-4" />
            <h3 className="text-3xl font-bold text-gray-800">Products Management</h3>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="refresh-btn" onClick={fetchInquiries}>
            Refresh
          </button>
        </div>
        {!canManageInquiries && (
          <p className="text-sm text-orange-600 mt-2">
            <span className="font-semibold">View Only:</span> You can view inquiries but cannot take actions.
          </p>
        )}
      </div>

      {/* Filters Section */}
      <div className="inquiries-filters mt-6">
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Responded">Responded</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Service:</label>
          <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
            <option value="All">All Services</option>
            <option value="Interment">Interment</option>
            <option value="Cremation">Cremation</option>
            <option value="Lawn Lots">Lawn Lots</option>
            <option value="Family Estates">Family Estates</option>
            <option value="Columbariums">Columbariums</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Week">Last 7 Days</option>
            <option value="Month">Last 30 Days</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label>Search:</label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
            height: '38px'
          }}>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
      </div>

      {/* Statistics */}
      <div className="inquiries-stats">
        <div className="stat-card">
          <span className="stat-number">{inquiries.length}</span>
          <span className="stat-label">Total Inquiries</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{inquiries.filter(i => i.status === 'New').length}</span>
          <span className="stat-label">New</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{inquiries.filter(i => i.status === 'In Progress').length}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{inquiries.filter(i => i.status === 'Responded').length}</span>
          <span className="stat-label">Responded</span>
        </div>
      </div>

      {/* Inquiries Table */}
      {loading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold">DATE</th>
                  <th className="px-6 py-4 text-sm font-semibold">CUSTOMER_NAME</th>
                  <th className="px-6 py-4 text-sm font-semibold">CONTACT</th>
                  <th className="px-6 py-4 text-sm font-semibold">SERVICE</th>
                  <th className="px-6 py-4 text-sm font-semibold">STATUS</th>
                  <th className="px-6 py-4 text-sm font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInquiries.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500" style={{ fontStyle: 'italic' }}>
                      No data available
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry, index) => (
                    <tr key={inquiry.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors cursor-pointer`} onClick={() => openDetailModal(inquiry)}>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(inquiry.created_at)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{inquiry.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div>{inquiry.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{inquiry.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{inquiry.product_interest}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
                          inquiry.status === 'New' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : inquiry.status === 'Responded' 
                            ? 'bg-green-100 text-green-700' 
                            : inquiry.status === 'Closed' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailModal(inquiry);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span className="modal-header-icon">📋</span>
                <span>Inquiry Details</span>
              </div>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <label className="detail-label">Customer Name:</label>
                <span className="detail-value">{selectedInquiry.full_name}</span>
              </div>
              <div className="detail-row">
                <label className="detail-label">Email:</label>
                <span className="detail-value">{selectedInquiry.email}</span>
              </div>
              <div className="detail-row">
                <label className="detail-label">Phone:</label>
                <span className="detail-value">{selectedInquiry.phone}</span>
              </div>
              <div className="detail-row">
                <label className="detail-label">Service Interested:</label>
                <span className="detail-value">{selectedInquiry.product_interest}</span>
              </div>
              <div className="detail-row">
                <label className="detail-label">Date Submitted:</label>
                <span className="detail-value">{formatDate(selectedInquiry.created_at)}</span>
              </div>
              <div className="detail-row full-width">
                <label className="detail-label">Message:</label>
                <p className="message-content">{selectedInquiry.message}</p>
              </div>
              <div className="detail-row">
                <label className="detail-label">Status:</label>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => updateInquiryStatus(selectedInquiry.id, e.target.value)}
                  className="status-select"
                  disabled={!canManageInquiries}
                  title={!canManageInquiries ? 'You do not have permission to change status' : ''}
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Responded">Responded</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.product_interest} Inquiry`}
                className={`modal-btn secondary ${!canManageInquiries ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => !canManageInquiries && e.preventDefault()}
                title={!canManageInquiries ? 'You do not have permission to respond' : ''}
              >
                📧 Email
              </a>
              <a
                href={`tel:${selectedInquiry.phone}`}
                className={`modal-btn secondary ${!canManageInquiries ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => !canManageInquiries && e.preventDefault()}
                title={!canManageInquiries ? 'You do not have permission to call' : ''}
              >
                📞 Call
              </a>
              <button
                className={`modal-btn danger ${!canManageInquiries ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => canManageInquiries && deleteInquiry(selectedInquiry.id)}
                disabled={!canManageInquiries}
                title={!canManageInquiries ? 'You do not have permission to delete' : ''}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmModal}
        itemName="this inquiry"
        onConfirm={confirmDeleteInquiry}
        onCancel={closeDeleteConfirmModal}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default InquiriesManagement;

