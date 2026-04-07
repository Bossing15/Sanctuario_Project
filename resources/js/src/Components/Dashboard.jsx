import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import revenueIcon from "../assets/icons/icons8-revenue-50.png";
import invoiceIcon from "../assets/icons/icons8-invoice-50.png";
import customerIcon from "../assets/icons/Customers.png";
import pending from "../assets/icons/icons8-pending-50.png";
import dashboardIcon from "../assets/icons/Dashboard.png";
import usePermissions from '../utils/usePermissions';
import { TableSkeleton } from './SkeletonLoader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { canPerformActions } = usePermissions();
  const canManageInquiries = canPerformActions('inquiries');
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchBookings();
    fetchMaintenanceRequests();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch total customers
      const customersResponse = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setTotalCustomers(customersData.clients?.length || 0);
      }

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      const analyticsResponse = await fetch(`/api/payments/analytics?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setTotalRevenue(analyticsData.total_revenue || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const bookingsData = data.data || data;
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } else {
        console.warn('Failed to fetch bookings:', response.status);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const maintenanceOnly = (data.inquiries || []).filter(inquiry =>
          inquiry.product_interest &&
          (inquiry.product_interest.toLowerCase().includes('maintenance') ||
           inquiry.product_interest.toLowerCase().includes('grave'))
        );
        setMaintenanceRequests(maintenanceOnly);
      } else {
        console.warn('Failed to fetch maintenance requests:', response.status);
        setMaintenanceRequests([]);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setMaintenanceRequests([]);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Scheduled',
      'PendingReview': 'Scheduled',
      'confirmed': 'Scheduled',
      'Approved': 'Scheduled',
      'completed': 'Completed',
      'cancelled': 'Unfinished',
      'Rejected': 'Unfinished'
    };
    return statusMap[status] || status;
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      "Completed": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
      "Scheduled": { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
      "Unfinished": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
      "Active": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
      "Inactive": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
      "Pending": { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
      "In Progress": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
      "Closed": { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
      "Paid": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
      "Overdue": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    };
    
    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" };
    
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        {status}
      </div>
    );
  };

  return (
    <div className="p-8 bg-white min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Quick Stats */}
      <div className="mb-8">
        <div className="flex items-center mb-8">
          <img src={dashboardIcon} alt="Dashboard Icon" className="w-10 h-10 object-contain mr-4" />
          <h3 className="text-3xl font-bold text-gray-800">Quick Stats Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Customers */}
          <div 
            onClick={() => navigate('/customers')}
            className="bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center mb-3">
              <img src={customerIcon} alt="Customer Icon" className="w-10 h-10" />
            </div>
            <h6 className="text-gray-600 mb-1 text-sm font-medium">Total Customers</h6>
            <h5 className="font-bold text-2xl text-blue-600">
              {loading ? '...' : totalCustomers}
            </h5>
          </div>

          {/* Pending Maintenance */}
          <div className="bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-3">
              <img src={pending} alt="Pending Icon" className="w-10 h-10" />
            </div>
            <h6 className="text-gray-600 mb-1 text-sm font-medium">Pending Maintenance Requests</h6>
            <h5 className="font-bold text-2xl text-yellow-600">
              {loadingMaintenance ? '...' : maintenanceRequests.filter(r => r.status === 'New' || r.status === 'In Progress').length}
            </h5>
          </div>

          {/* Revenue */}
          <div 
            onClick={() => navigate('/billing', { state: { tab: 'analytics' } })}
            className="bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center mb-3">
              <img src={revenueIcon} alt="Revenue Icon" className="w-10 h-10" />
            </div>
            <h6 className="text-gray-600 mb-1 text-sm font-medium">Total Revenue This Month</h6>
            <h5 className="font-bold text-2xl text-green-600">
              {loading ? '...' : `₱${parseFloat(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </h5>
          </div>

          {/* Invoices */}
          <div 
            onClick={() => navigate('/billing')}
            className="bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-center mb-3">
              <img src={invoiceIcon} alt="Invoice Icon" className="w-10 h-10" />
            </div>
            <h6 className="text-gray-600 mb-1 text-sm font-medium">Unpaid Invoices</h6>
            <h5 className="font-bold text-2xl text-red-600">10</h5>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="mb-6">
        <h4 className="font-bold text-2xl text-gray-800 mb-4">Upcoming Tasks</h4>
        {loadingMaintenance ? (
          <TableSkeleton rows={5} columns={8} />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Date_Added</th>
                  <th>Contact</th>
                  <th>Grave_Location</th>
                  <th>Service_Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      <div className="table-empty-state">
                        <div className="table-empty-state-icon">📋</div>
                        <div className="table-empty-state-title">No Maintenance Requests</div>
                        <div className="table-empty-state-text">Maintenance requests will appear here</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  maintenanceRequests
                    .sort((a, b) => {
                      const statusPriority = {
                        'New': 1,
                        'In Progress': 2,
                        'Responded': 3,
                        'Closed': 4
                      };
                      const priorityA = statusPriority[a.status] || 5;
                      const priorityB = statusPriority[b.status] || 5;
                      
                      if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                      }
                      return new Date(b.created_at) - new Date(a.created_at);
                    })
                    .slice(0, 10)
                    .map((request) => (
                      <tr key={`maint-${request.id}`}>
                        <td className="font-mono">#{request.id}</td>
                        <td className="font-bold">{request.full_name}</td>
                        <td className="date-cell">{formatDate(request.created_at)}</td>
                        <td>{request.phone}</td>
                        <td>
                          {request.grave_location || `${request.plot_number || 'N/A'} - ${request.section_number || 'N/A'}`}
                        </td>
                        <td>{request.product_interest}</td>
                        <td className="text-center">
                          <span className={`status-badge ${
                            request.status === 'New' ? 'pending' :
                            request.status === 'In Progress' ? 'processing' :
                            request.status === 'Responded' ? 'completed' :
                            request.status === 'Closed' ? 'completed' :
                            'info'
                          }`}>
                            {request.status === 'New' ? 'Pending' :
                             request.status === 'In Progress' ? 'In Progress' :
                             request.status === 'Responded' ? 'Completed' :
                             request.status === 'Closed' ? 'Closed' :
                             request.status}
                          </span>
                        </td>
                        <td className="text-center">
                          <button 
                            className="action-btn primary"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowMaintenanceModal(true);
                              if (request.maintenance_photos) {
                                try {
                                  const photos = JSON.parse(request.maintenance_photos);
                                  const photoObjects = photos.map((url, index) => ({
                                    id: Date.now() + index,
                                    url: `http://localhost:8000/${url}`,
                                    name: `Photo ${index + 1}`
                                  }));
                                  setUploadedPhotos(photoObjects);
                                } catch (e) {
                                  setUploadedPhotos([]);
                                }
                              } else {
                                setUploadedPhotos([]);
                              }
                              setSelectedFiles([]);
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
        )}

        {/* Status Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h6 className="font-semibold mb-3 text-gray-800">Status Legend</h6>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-yellow-400 text-black rounded-lg">
                  Pending
                </span>
                <small className="text-gray-600">New maintenance request</small>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg">
                  In Progress
                </span>
                <small className="text-gray-600">Currently being worked on</small>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded-lg">
                  Completed
                </span>
                <small className="text-gray-600">Service has been completed</small>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gray-600 text-white rounded-lg">
                  Closed
                </span>
                <small className="text-gray-600">Request has been closed</small>
              </li>
            </ul>
        </div>
      </div>

      {/* Maintenance Request Modal */}
      {showMaintenanceModal && selectedRequest && (
        <MaintenanceModal
          request={selectedRequest}
          canManageInquiries={canManageInquiries}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedRequest(null);
            setSelectedFiles([]);
            setUploadedPhotos([]);
          }}
          onUpdate={() => {
            fetchMaintenanceRequests();
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

// Maintenance Modal Component
const MaintenanceModal = ({ request, canManageInquiries, onClose, onUpdate }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(request.status);

  useEffect(() => {
    // Manage blur effect
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  useEffect(() => {
    // Load existing photos
    if (request.maintenance_photos) {
      try {
        const photos = JSON.parse(request.maintenance_photos);
        const photoObjects = photos.map((url, index) => ({
          id: Date.now() + index,
          url: `http://localhost:8000/${url}`,
          name: `Photo ${index + 1}`
        }));
        setUploadedPhotos(photoObjects);
      } catch (e) {
        setUploadedPhotos([]);
      }
    }
  }, [request]);

  const updateRequestStatus = async (newStatus) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${request.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setCurrentStatus(newStatus);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handlePhotoUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const photoPromises = selectedFiles.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const base64Photos = await Promise.all(photoPromises);

      const response = await fetch(`/api/admin/inquiries/${request.id}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ photos: base64Photos }),
      });

      if (response.ok) {
        const data = await response.json();
        const newPhotos = data.photos.map((url, index) => ({
          id: Date.now() + index,
          url: `http://localhost:8000/${url}`,
          name: selectedFiles[index].name
        }));

        setUploadedPhotos(newPhotos);
        setSelectedFiles([]);
        
        const fileInput = document.getElementById('maintenance-photo-upload');
        if (fileInput) fileInput.value = '';

        onUpdate();
        alert('Photos uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    }
  };

  const handleMarkComplete = async () => {
    if (uploadedPhotos.length === 0) {
      alert('Please upload at least one photo before marking as complete.');
      return;
    }

    if (confirm('Mark this maintenance request as complete?')) {
      await updateRequestStatus('Responded');
      alert('Maintenance request marked as complete!');
      onClose();
    }
  };

  const extractPlanType = (productInterest) => {
    if (!productInterest) return 'N/A';
    const match = productInterest.match(/(Monthly|Quarterly|Yearly)/i);
    return match ? match[1] : 'N/A';
  };

  const extractServiceName = (productInterest) => {
    if (!productInterest) return 'Maintenance Service';
    const parts = productInterest.split(' - ');
    return parts[0] || 'Maintenance Service';
  };

  const calculateValidityDate = (createdAt, planType) => {
    if (!createdAt) return 'N/A';
    
    const startDate = new Date(createdAt);
    const validityDate = new Date(startDate);
    
    switch (planType.toLowerCase()) {
      case 'monthly':
        validityDate.setMonth(validityDate.getMonth() + 1);
        break;
      case 'quarterly':
        validityDate.setMonth(validityDate.getMonth() + 3);
        break;
      case 'yearly':
        validityDate.setFullYear(validityDate.getFullYear() + 1);
        break;
      default:
        return 'N/A';
    }
    
    return validityDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="modal-header-icon">🔧</span>
            <span>Maintenance Request #{request.id}</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* View Only Warning */}
          {!canManageInquiries && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <p className="text-sm text-orange-800">
                <span className="font-semibold">View Only Mode:</span> You can view this maintenance request but cannot update status, upload photos, or mark it as complete.
              </p>
            </div>
          )}
          
          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <p className="font-semibold">{request.full_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-semibold">{request.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Phone:</span>
                <p className="font-semibold">{request.phone}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Plan:</span>
                <p className="font-semibold">{extractPlanType(request.product_interest)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Plot Number:</span>
                <p className="font-semibold">{request.plot_number || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Section Number:</span>
                <p className="font-semibold">{request.section_number || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600">Service Validity:</span>
                <p className="font-semibold text-green-600">
                  Valid until {calculateValidityDate(request.created_at, extractPlanType(request.product_interest))}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Status</h3>
            <select
              value={currentStatus}
              onChange={(e) => canManageInquiries && updateRequestStatus(e.target.value)}
              disabled={!canManageInquiries}
              className={`w-full p-3 border border-gray-300 rounded-lg font-semibold ${!canManageInquiries ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
            >
              <option value="New">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            {!canManageInquiries && (
              <p className="text-sm text-orange-600 mt-2">
                You do not have permission to change the status
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Maintenance Photos</h3>
            <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${!canManageInquiries ? 'opacity-50 bg-gray-50' : ''}`}>
              <label htmlFor="maintenance-photo-upload" className={canManageInquiries ? 'cursor-pointer' : 'cursor-not-allowed'}>
                <div className="text-4xl mb-2">📸</div>
                <div className="text-sm text-gray-600">
                  {canManageInquiries 
                    ? (selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to upload photos')
                    : 'Photo upload disabled - no permission'}
                </div>
              </label>
              <input
                id="maintenance-photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                disabled={!canManageInquiries}
                onChange={handleFileSelect}
              />
              {selectedFiles.length > 0 && canManageInquiries && (
                <button
                  onClick={handlePhotoUpload}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
                >
                  Upload {selectedFiles.length} Photo(s)
                </button>
              )}
            </div>

            {/* Photo Gallery */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {canManageInquiries && (
            <button
              onClick={handleMarkComplete}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              ✓ Mark as Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;