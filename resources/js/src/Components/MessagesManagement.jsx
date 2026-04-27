import React, { useState, useEffect } from 'react';
import './MessagesManagement.css';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';
import messageIcon from "../assets/icons/icons8-message-50.png";
import usePermissions from '../utils/usePermissions';
import SmsModal from './SmsModal';
import { TableSkeleton } from './SkeletonLoader';
import CrudActions from './CrudActions';
import crudUtils from '../utils/crudUtils';

const MessagesManagement = () => {
  const { canPerformActions } = usePermissions();
  const canManageMessages = canPerformActions('messages');
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

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

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setMessages([]);
        setLoading(false);
        return;
      }

      console.log('Fetching messages with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('/api/admin/contact-messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Messages data:', data);
      
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        throw new Error(data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      // Don't show alert on initial load, just log the error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/contact-messages/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(messages.map(msg => 
          msg.id === id ? { ...msg, status: newStatus } : msg
        ));
        setAlertModal({
          show: true,
          type: 'success',
          message: 'Status updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Failed to update status'
      });
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      show: true,
      message: 'Are you sure you want to delete this message?',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`/api/admin/contact-messages/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          const data = await response.json();
          if (data.success) {
            setMessages(messages.filter(msg => msg.id !== id));
            setAlertModal({
              show: true,
              type: 'success',
              message: 'Message deleted successfully'
            });
            setShowDetailModal(false);
          }
        } catch (error) {
          console.error('Error deleting message:', error);
          setAlertModal({
            show: true,
            type: 'error',
            message: 'Failed to delete message'
          });
        }
      }
    });
  };

  const handleDeleteMessage = async (id) => {
    const token = localStorage.getItem("authToken");
    const result = await crudUtils.deleteItem(
      "/api/admin/contact-messages",
      id,
      token
    );
    
    if (result.success) {
      setMessages(messages.filter(msg => msg.id !== id));
      setAlertModal({
        show: true,
        type: 'success',
        message: 'Message deleted successfully'
      });
      setShowDetailModal(false);
    } else {
      setAlertModal({
        show: true,
        type: 'error',
        message: result.error || 'Failed to delete message'
      });
    }
  };

  const openDetailModal = (message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    if (message.status === 'New' && canManageMessages) {
      handleStatusChange(message.id, 'Read');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New': return 'status-new';
      case 'Read': return 'status-read';
      case 'Responded': return 'status-responded';
      case 'Archived': return 'status-archived';
      default: return '';
    }
  };

  const filteredMessages = (filterStatus === 'All' 
    ? messages 
    : messages.filter(msg => msg.status === filterStatus))
    .filter(msg => {
      const query = searchQuery.toLowerCase();
      return (
        msg.first_name.toLowerCase().includes(query) ||
        msg.last_name.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        msg.phone?.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      );
    });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="messages-management">
        <div className="messages-header-wrapper">
          <div className="messages-header-title">
            <img src={messageIcon} alt="Messages Icon" className="messages-header-icon" />
            <div>
              <h2>Messages & SMS</h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="messages-tabs-wrapper">
          <nav className="flex space-x-3">
            {[
              { key: 'messages', label: 'Messages' },
              { key: 'sms', label: 'Send SMS' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-[#1B3022] to-[#2A4D36] text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="messages-content-wrapper">
          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-wrapper">
              <label className="filter-section-label">Filter by Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Read">Read</option>
                <option value="Responded">Responded</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="refresh-wrapper">
              <button 
                onClick={fetchMessages}
                className="refresh-btn"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="messages-stats">
            <div className="stat-card">
              <span className="stat-value">0</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">0</span>
              <span className="stat-label">New</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">0</span>
              <span className="stat-label">Read</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">0</span>
              <span className="stat-label">Responded</span>
            </div>
          </div>

          {/* Skeleton Loading */}
          <TableSkeleton rows={5} />
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    return (
      <div className="messages-management">
        <div className="messages-header">
          <h2>Contact Messages</h2>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', background: 'white', borderRadius: '8px', margin: '2rem' }}>
          <p style={{ color: '#d32f2f', fontSize: '1.1rem' }}>You must be logged in as an admin to view messages.</p>
          <p style={{ color: '#666', marginTop: '1rem' }}>Auth Token: {token ? 'Present' : 'Missing'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-management">
      <div className="messages-header-wrapper">
        <div className="messages-header-title">
          <img src={messageIcon} alt="Messages Icon" className="messages-header-icon" />
          <div>
            <h2>Messages & SMS</h2>
          </div>
        </div>
        {!canManageMessages && (
          <p style={{ fontSize: '0.875rem', color: '#ea580c', marginTop: '0.5rem' }}>
            <span style={{ fontWeight: '600' }}>View Only:</span> You can view messages but cannot take actions.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="messages-tabs-wrapper">
        <nav className="flex space-x-3">
          {[
            { key: 'messages', label: 'Messages' },
            { key: 'sms', label: 'Send SMS' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-[#1B3022] to-[#2A4D36] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && (
        <div className="messages-content-wrapper">
          {/* Filter Section */}
          <div className="filter-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label className="filter-section-label">Filter by Status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Read">Read</option>
                <option value="Responded">Responded</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button 
              onClick={fetchMessages}
              className="refresh-btn"
            >
              Refresh
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
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
                placeholder="Search by name, email, phone..."
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

          {/* Stats Cards */}
          <div className="messages-stats">
            <div className="stat-card">
              <span className="stat-value">{messages.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{messages.filter(m => m.status === 'New').length}</span>
              <span className="stat-label">New</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{messages.filter(m => m.status === 'Read').length}</span>
              <span className="stat-label">Read</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{messages.filter(m => m.status === 'Responded').length}</span>
              <span className="stat-label">Responded</span>
            </div>
          </div>

          {/* Messages Table */}
          <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message_Preview</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontStyle: 'italic' }}>
                  No data available
                </td>
              </tr>
            ) : (
              filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td className="date-cell">{formatDate(message.created_at)}</td>
                  <td className="font-bold">{message.first_name} {message.last_name}</td>
                  <td>{message.email}</td>
                  <td>{message.phone || 'N/A'}</td>
                  <td className="nowrap">
                    {message.message.substring(0, 50)}
                    {message.message.length > 50 ? '...' : ''}
                  </td>
                  <td className="text-center">
                    {message.status === 'New' ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-lg shadow-sm">
                        New
                      </span>
                    ) : message.status === 'Responded' ? (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                        Responded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg shadow-sm">
                        {message.status}
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    <button 
                      className="action-btn primary"
                      onClick={() => openDetailModal(message)}
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

      {activeTab === 'sms' && (
        <div className="messages-content-wrapper">
          <SmsModal 
            isOpen={true} 
            onClose={() => setActiveTab('messages')} 
          />
        </div>
      )}

      {showDetailModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message Details</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>From:</strong>
                <span>{selectedMessage.first_name} {selectedMessage.last_name}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{selectedMessage.email}</span>
              </div>
              <div className="detail-row">
                <strong>Phone:</strong>
                <span>{selectedMessage.phone || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <strong>Date:</strong>
                <span>{formatDate(selectedMessage.created_at)}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <select 
                  value={selectedMessage.status}
                  onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value)}
                  className="status-select"
                  disabled={!canManageMessages}
                  title={!canManageMessages ? 'You do not have permission to change status' : ''}
                >
                  <option value="New">New</option>
                  <option value="Read">Read</option>
                  <option value="Responded">Responded</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="detail-row message-full">
                <strong>Message:</strong>
                <p>{selectedMessage.message}</p>
              </div>
            </div>
            <div className="modal-footer">
              <CrudActions
                onView={() => {}}
                onEdit={() => {}}
                onDelete={() => handleDeleteMessage(selectedMessage.id)}
                onToggleStatus={() => {}}
                showView={false}
                showEdit={false}
                showDelete={true}
                showToggle={false}
                disabled={!canManageMessages}
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={() => setAlertModal({ show: false, type: '', message: '' })}
        />
      )}

      {confirmModal.show && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal({ show: false, message: '', onConfirm: null });
          }}
          onCancel={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
        />
      )}
    </div>
  );
};

export default MessagesManagement;
