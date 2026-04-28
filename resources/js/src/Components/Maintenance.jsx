import { useState, useEffect } from "react";
import maintenanceIcon from '../assets/icons/Maintenance.png';
import { TableSkeleton } from "./SkeletonLoader";
import StatsCards from "./StatsCards";
import CrudActions from "./CrudActions";
import crudUtils from "../utils/crudUtils";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ProgressUpdateModal from "./ProgressUpdateModal";
import ConfirmModal from "./ConfirmModal";

const Maintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const response = await fetch('/api/maintenance-requests', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setMaintenanceRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
      setError(`Failed to load maintenance requests: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setRequestToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const result = await crudUtils.deleteItem(
        "/api/maintenance-requests",
        requestToDelete,
        token
      );
      
      if (result.success) {
        fetchMaintenanceRequests();
        setShowDeleteConfirmModal(false);
        setRequestToDelete(null);
      } else {
        alert(result.error || "Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Error deleting request");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setRequestToDelete(null);
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/maintenance-requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert('Maintenance request approved successfully! You can now update progress.');
        fetchMaintenanceRequests();
        setShowApproveModal(false);
        setSelectedRequest(null);
      } else {
        alert(data.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/maintenance-requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Maintenance request rejected');
        fetchMaintenanceRequests();
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
      } else {
        alert(data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProgress = (request) => {
    setSelectedRequest(request);
    setShowProgressModal(true);
  };

  const handleProgressUpdated = (updatedRequest) => {
    // Update the request in the list
    setMaintenanceRequests(prev =>
      prev.map(req => req.id === updatedRequest.id ? updatedRequest : req)
    );
    alert('Progress updated successfully! Customer has been notified.');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="p-8 min-h-screen flex-grow">
        {/* Header */}
        <div className="flex items-center mb-8">
          <img
            src={maintenanceIcon}
            alt="Services Icon"
            className="w-10 h-10 object-contain mr-4"
          />
          <div>
            <h3 className="text-3xl font-bold text-gray-800">Services Management</h3>
            <p className="text-gray-600 mt-1">Total Requests: {maintenanceRequests.length}</p>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="text-red-600 text-xl mb-4">Error</div>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchMaintenanceRequests}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <StatsCards stats={[
              { label: 'Total Requests', value: maintenanceRequests.length },
              { label: 'Pending Approval', value: maintenanceRequests.filter(r => r.status === 'Pending_Approval').length },
              { label: 'Approved', value: maintenanceRequests.filter(r => r.status === 'Approved').length },
              { label: 'In Progress', value: maintenanceRequests.filter(r => r.progress_status === 'In Progress').length },
              { label: 'Completed', value: maintenanceRequests.filter(r => r.progress_status === 'Completed').length }
            ]} />

            <div className="flex items-center justify-between mb-6">
              <h5 className="text-xl font-semibold text-gray-800">Services List</h5>
              <button 
                onClick={fetchMaintenanceRequests}
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
                  placeholder="Search by request ID, type, or description..."
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

            {/* Table */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRequests.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontStyle: 'italic' }}>
                        No maintenance requests available
                      </td>
                    </tr>
                  ) : (
                    maintenanceRequests.filter((request) => {
                      const query = searchQuery.toLowerCase();
                      return (
                        (request.invoice_number && request.invoice_number.toLowerCase().includes(query)) ||
                        (request.client?.name && request.client.name.toLowerCase().includes(query)) ||
                        (request.user?.name && request.user.name.toLowerCase().includes(query)) ||
                        (request.service?.title && request.service.title.toLowerCase().includes(query))
                      );
                    }).map((request) => (
                      <tr key={request.id}>
                        <td className="font-mono">{request.invoice_number || `REQ-${request.id}`}</td>
                        <td>{request.client?.name || request.user?.name || 'N/A'}</td>
                        <td>{request.service?.title || 'N/A'}</td>
                        <td className="text-center">
                          {request.status === 'Approved' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                              ✓ Approved
                            </span>
                          ) : request.status === 'Pending_Approval' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-lg shadow-sm">
                              ⏳ Pending
                            </span>
                          ) : request.status === 'Rejected' ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                              ✗ Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg shadow-sm">
                              {request.status}
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          {request.status === 'Approved' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg shadow-sm">
                                {request.progress_status || 'Not Started'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                                {request.progress_percentage || 0}%
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td className="date-cell">{new Date(request.created_at).toLocaleDateString()}</td>
                        <td className="text-center">
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {request.status === 'Pending_Approval' && (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(request)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(request)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            {request.status === 'Approved' && (
                              <button
                                onClick={() => handleUpdateProgress(request)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                              >
                                📝 Update Progress
                              </button>
                            )}
                            <CrudActions
                              onView={() => {}}
                              onEdit={() => {}}
                              onDelete={() => handleDeleteRequest(request.id)}
                              showView={false}
                              showEdit={false}
                              showDelete={true}
                              showToggle={false}
                              size="sm"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmModal}
        message="Are you sure you want to delete this maintenance request?"
        itemName="this request"
        onConfirm={confirmDeleteRequest}
        onCancel={closeDeleteConfirmModal}
        isLoading={isDeleting}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        show={showApproveModal}
        title="Approve Maintenance Request"
        message={`Are you sure you want to approve this maintenance request? Once approved, you can update the progress immediately.`}
        onConfirm={confirmApprove}
        onCancel={() => {
          setShowApproveModal(false);
          setSelectedRequest(null);
        }}
        confirmText="Approve"
        confirmColor="#10b981"
        isLoading={isProcessing}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => !isProcessing && setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '700' }}>Reject Maintenance Request</h2>
            <p style={{ marginBottom: '16px', color: '#6b7280' }}>
              Please provide a reason for rejecting this request:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows="4"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '16px'
              }}
              disabled={isProcessing}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isProcessing || !rejectionReason.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  opacity: (isProcessing || !rejectionReason.trim()) ? 0.5 : 1
                }}
              >
                {isProcessing ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      <ProgressUpdateModal
        show={showProgressModal}
        request={selectedRequest}
        onClose={() => {
          setShowProgressModal(false);
          setSelectedRequest(null);
        }}
        onUpdate={handleProgressUpdated}
      />
    </div>
  );
};

export default Maintenance;

