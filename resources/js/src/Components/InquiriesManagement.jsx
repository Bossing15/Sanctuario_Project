import React, { useState, useEffect } from 'react';
import './InquiriesManagement.css';
import '../styles/tables.css';
import inquiryIcon from "../assets/icons/icons8-notification-50.png";
import usePermissions from '../utils/usePermissions';
import { TableSkeleton } from './SkeletonLoader';

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

  const deleteInquiry = async (inquiryId) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchInquiries();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
    }
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
    <div className="p-8 bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img src={inquiryIcon} alt="Inquiries Icon" className="w-10 h-10 object-contain mr-4" />
            <h3 className="text-3xl font-bold text-gray-800">Customer Inquiries</h3>
          </div>
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
      <div className="inquiries-filters">
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
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
      ) : filteredInquiries.length === 0 ? (
        <div className="table-container">
          <div className="table-empty-state">
            <div className="table-empty-state-icon">📋</div>
            <h3 className="table-empty-state-title">No Inquiries Found</h3>
            <p className="table-empty-state-text">No inquiries match your current filters.</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer_Name</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id} onClick={() => openDetailModal(inquiry)} style={{ cursor: 'pointer' }}>
                  <td>{formatDate(inquiry.created_at)}</td>
                  <td className="font-semibold">{inquiry.full_name}</td>
                  <td>
                    <div>{inquiry.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{inquiry.phone}</div>
                  </td>
                  <td>{inquiry.product_interest}</td>
                  <td>
                    <span className={`status-badge ${inquiry.status === 'New' ? 'pending' : inquiry.status === 'Responded' ? 'completed' : inquiry.status === 'Closed' ? 'inactive' : 'active'}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(inquiry);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}

export default InquiriesManagement;
