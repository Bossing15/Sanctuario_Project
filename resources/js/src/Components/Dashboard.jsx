import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import revenueIcon from "../assets/icons/icons8-revenue-50.png";
import invoiceIcon from "../assets/icons/icons8-invoice-50.png";
import customerIcon from "../assets/icons/Customers.png";
import pending from "../assets/icons/icons8-pending-50.png";
import dashboardIcon from "../assets/icons/Dashboard.png";
import usePermissions from '../utils/usePermissions';
import { TableSkeleton } from './SkeletonLoader';
import AuthorizationModal from './AuthorizationModal';
import './Dashboard.css';

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
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchDashboardData();
      fetchBookings();
      fetchMaintenanceRequests();
      fetchPurchases();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Fetch total customers
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/clients`;
      const customersResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setTotalCustomers(customersData.clients?.length || 0);
      }

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      const analyticsUrl = `${window.location.protocol}//${window.location.host}/api/payments/analytics?start_date=${startDate}&end_date=${endDate}`;
      const analyticsResponse = await fetch(analyticsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
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
      
      if (!token) {
        setLoadingBookings(false);
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
      
      if (!token) {
        setLoadingMaintenance(false);
        return;
      }
      
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/admin/inquiries`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
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

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoadingPurchases(false);
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
        const bookingsData = data.bookings || data.data || data;
        
        console.log('Fetched bookings:', bookingsData);
        
        // Enrich bookings with client details
        const enrichedBookings = (Array.isArray(bookingsData) ? bookingsData : []).map((booking) => {
          // Extract service/product names from relationships
          const serviceName = booking.service?.title || booking.service?.name || booking.service_name || '';
          const productName = booking.product?.title || booking.product?.name || booking.product_name || '';
          
          // Get client info from user relationship (bookings use user_id for customer)
          const clientName = booking.user?.name || booking.client?.name || booking.customer_name || 'N/A';
          const clientPhone = booking.user?.phone || booking.client?.phone || '';
          const deceasedName = booking.user?.deceased_name || booking.deceased_name || 'N/A';
          
          return {
            ...booking,
            service_name: serviceName,
            product_name: productName,
            customer_name: clientName,
            deceased_name: deceasedName,
            client: booking.user || booking.client || { name: clientName, phone: clientPhone }
          };
        });

        console.log('Enriched bookings:', enrichedBookings);
        setPurchases(enrichedBookings);
      } else {
        console.warn('Failed to fetch purchases:', response.status);
        setPurchases([]);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  const handleApproveService = async (bookingId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${window.location.protocol}//${window.location.host}/api/bookings/authorization/${bookingId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPurchases(purchases.map(p => p.id === bookingId ? data.booking : p));
        alert('Service application approved successfully!');
      } else {
        const errorData = await response.json();
        alert('Failed to approve: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving service:', error);
      alert('Error approving service: ' + error.message);
    }
  };

  const handleDisapproveService = async (bookingId) => {
    const reason = prompt('Enter reason for disapproval:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${window.location.protocol}//${window.location.host}/api/bookings/authorization/${bookingId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ reason })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPurchases(purchases.map(p => p.id === bookingId ? data.booking : p));
        alert('Service application disapproved successfully!');
      } else {
        const errorData = await response.json();
        alert('Failed to disapprove: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error disapproving service:', error);
      alert('Error disapproving service: ' + error.message);
    }
  };

  const fetchAuthorizationRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoadingAuthRequests(false);
        return;
      }

      const apiUrl = `${window.location.protocol}//${window.location.host}/api/bookings/authorization/pending`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAuthorizationRequests(data.requests || []);
      } else {
        console.warn('Failed to fetch authorization requests:', response.status);
        setAuthorizationRequests([]);
      }

      // Fetch stats
      const statsUrl = `${window.location.protocol}//${window.location.host}/api/bookings/authorization/stats`;
      const statsResponse = await fetch(statsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setAuthStats(statsData.stats || {});
      }
    } catch (error) {
      console.error('Error fetching authorization requests:', error);
      setAuthorizationRequests([]);
    } finally {
      setLoadingAuthRequests(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
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

  const getPurchaseStatusBadge = (status) => {
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

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid', icon: '✓' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Unpaid', icon: '⏳' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status, icon: '•' };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
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
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Quick Stats */}
      <div className="mb-8">
        <div className="flex items-center mb-8">
          <img src={dashboardIcon} alt="Dashboard Icon" className="w-10 h-10 object-contain mr-4" />
          <h3 className="text-3xl font-bold text-gray-800">Quick Stats Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 dashboard-stats">
          {/* Customers */}
          <div 
            onClick={() => navigate('/customers')}
            className="stat-card bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
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
          <div className="stat-card bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300">
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
            className="stat-card bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
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
            className="stat-card bg-white text-center p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:scale-105 transition-all duration-300 cursor-pointer"
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
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-2xl text-gray-800">Upcoming Tasks</h4>
          <button 
            onClick={() => {
              fetchMaintenanceRequests();
              fetchPurchases();
            }}
            disabled={loadingMaintenance || loadingPurchases}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMaintenance || loadingPurchases ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        {loadingMaintenance || loadingPurchases ? (
          <TableSkeleton rows={5} columns={8} />
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
                  placeholder="Search by customer name, deceased name, date, contact, or status..."
                  value={dashboardSearchQuery}
                  onChange={(e) => setDashboardSearchQuery(e.target.value)}
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
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Deceased_Name</th>
                  <th>Date_Added</th>
                  <th>Contact</th>
                  <th>Product/Service</th>
                  <th>Amount</th>
                  <th>Authorization</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRequests.length === 0 && purchases.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="11" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontStyle: 'italic' }}>
                      No data available
                    </td>
                  </tr>
                ) : (
                  (() => {
                    // Combine maintenance and purchase data
                    const combinedData = [
                      ...maintenanceRequests.map(req => ({
                        ...req,
                        type: 'Maintenance',
                        sortDate: new Date(req.created_at)
                      })),
                      ...purchases.map(purchase => ({
                        ...purchase,
                        type: 'Purchase',
                        sortDate: new Date(purchase.created_at || purchase.booking_date)
                      }))
                    ];

                    return combinedData
                      .filter((item) => {
                        const query = dashboardSearchQuery.toLowerCase();
                        const customerName = item.type === 'Maintenance' 
                          ? (item.full_name || '').toLowerCase()
                          : (item.client?.name || item.customer_name || '').toLowerCase();
                        const contact = item.type === 'Maintenance'
                          ? (item.phone || '').toLowerCase()
                          : (item.client?.phone || '').toLowerCase();
                        const productService = item.type === 'Maintenance'
                          ? (item.product_interest || '').toLowerCase()
                          : (item.service_name || item.product_name || '').toLowerCase();
                        const status = item.type === 'Maintenance'
                          ? (item.status || '').toLowerCase()
                          : (item.status || '').toLowerCase();
                        const authStatus = item.type === 'Purchase'
                          ? (item.authorization_status || '').toLowerCase()
                          : '';
                        const deceasedName = item.type === 'Purchase'
                          ? (item.deceased_name || '').toLowerCase()
                          : '';

                        return (
                          item.id.toString().includes(query) ||
                          customerName.includes(query) ||
                          contact.includes(query) ||
                          productService.includes(query) ||
                          status.includes(query) ||
                          authStatus.includes(query) ||
                          deceasedName.includes(query) ||
                          item.type.toLowerCase().includes(query)
                        );
                      })
                      .sort((a, b) => {
                        // Sort by date descending
                        return b.sortDate - a.sortDate;
                      })
                      .slice(0, 10)
                      .map((item) => {
                        if (item.type === 'Maintenance') {
                          return (
                            <tr key={`maint-${item.id}`}>
                              <td className="font-mono">#{item.id}</td>
                              <td className="font-bold">{item.full_name}</td>
                              <td className="date-cell">{formatDate(item.created_at)}</td>
                              <td>{item.phone}</td>
                              <td>{item.product_interest}</td>
                              <td>-</td>
                              <td className="text-center">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg">
                                  N/A
                                </span>
                              </td>
                              <td className="text-center">
                                {item.status === 'New' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-lg shadow-sm">
                                    ⏳ Pending
                                  </span>
                                ) : item.status === 'In Progress' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg shadow-sm">
                                    🔄 In Progress
                                  </span>
                                ) : item.status === 'Responded' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                                    ✅ Completed
                                  </span>
                                ) : item.status === 'Closed' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                                    ✅ Closed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg shadow-sm">
                                    ℹ️ {item.status}
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-lg">
                                  Maintenance
                                </span>
                              </td>
                            </tr>
                          );
                        } else {
                          // Purchase row
                          const getAuthorizationBadge = (status) => {
                            const statusConfig = {
                              'PENDING_AUTHORIZATION': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: '⏳' },
                              'AUTHORIZED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved', icon: '✅' },
                              'AUTO_APPROVED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Auto Approved', icon: '✅' },
                              'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: '❌' }
                            };
                            const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status || 'N/A', icon: '•' };
                            return (
                              <span className={`inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold ${config.bg} ${config.text} rounded-lg shadow-sm`}>
                                {config.icon} {config.label}
                              </span>
                            );
                          };

                          return (
                            <tr key={`purchase-${item.id}`}>
                              <td className="font-mono">#{item.id}</td>
                              <td className="font-bold">{item.client?.name || item.customer_name || 'N/A'}</td>
                              <td className="font-semibold text-blue-600">{item.deceased_name || 'N/A'}</td>
                              <td className="date-cell">{formatDate(item.created_at || item.booking_date)}</td>
                              <td>{item.client?.phone || 'N/A'}</td>
                              <td>
                                <div className="flex flex-col gap-1">
                                  <span className="font-semibold">{item.service_name || item.product_name || 'N/A'}</span>
                                  <span className="text-xs text-gray-500">
                                    {item.service?.category || item.product?.category || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td>{formatCurrency(item.total_amount || item.amount || 0)}</td>
                              <td className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {getAuthorizationBadge(item.authorization_status)}
                                  {item.authorization_status === 'PENDING_AUTHORIZATION' && (
                                    <button
                                      onClick={() => {
                                        setSelectedBooking(item);
                                        setShowAuthorizationModal(true);
                                      }}
                                      className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                      Review
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                {item.status === 'ReadyForPayment' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-lg shadow-sm">
                                    ⏳ Pending Payment
                                  </span>
                                ) : item.status === 'Paid' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-lg shadow-sm">
                                    ✅ Paid
                                  </span>
                                ) : item.status === 'Completed' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg shadow-sm">
                                    ✅ Completed
                                  </span>
                                ) : item.status === 'Cancelled' ? (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-lg shadow-sm">
                                    ❌ Cancelled
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg shadow-sm">
                                    ℹ️ {item.status}
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {item.authorization_status === 'PENDING_AUTHORIZATION' && (
                                    <>
                                      <button
                                        onClick={() => handleApproveService(item.id)}
                                        className="px-3 py-1 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                        title="Approve this service application"
                                      >
                                        ✓ Approve
                                      </button>
                                      <button
                                        onClick={() => handleDisapproveService(item.id)}
                                        className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        title="Disapprove this service application"
                                      >
                                        ✕ Disapprove
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg">
                                  Purchase
                                </span>
                              </td>
                            </tr>
                          );
                        }
                      });
                  })()
                )}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Status Legend */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h6 className="font-semibold mb-3 text-gray-800">Status Legend</h6>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-yellow-400 text-black rounded-lg">
                  Pending
                </span>
                <small className="text-gray-600">New maintenance request or pending payment</small>
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
                <small className="text-gray-600">Service has been completed or paid</small>
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

      {/* Booking Authorization Modal */}
      {showAuthorizationModal && selectedBooking && (
        <AuthorizationModal
          request={selectedBooking}
          onClose={() => {
            setShowAuthorizationModal(false);
            setSelectedBooking(null);
          }}
          onApprove={(updatedBooking) => {
            setPurchases(purchases.map(p => p.id === updatedBooking.id ? updatedBooking : p));
            setShowAuthorizationModal(false);
            setSelectedBooking(null);
          }}
          onReject={(updatedBooking) => {
            setPurchases(purchases.map(p => p.id === updatedBooking.id ? updatedBooking : p));
            setShowAuthorizationModal(false);
            setSelectedBooking(null);
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
