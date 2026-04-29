import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import totalRevenueIcon from "../assets/icons/totalrevenue.png";
import unpaidInvoiceIcon from "../assets/icons/unpaidinvoice.png";
import totalCustomersIcon from "../assets/icons/totalcustomers.png";
import pendingRequestsIcon from "../assets/icons/pendinfrequests.png";
import usePermissions from '../utils/usePermissions';
import './MobileOptimizedDashboard.css';

const MobileOptimizedDashboard = () => {
  const navigate = useNavigate();
  const { canPerformActions } = usePermissions();
  const canManageInquiries = canPerformActions('inquiries');
  
  // State Management
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Summary Cards State
  const [bookings, setBookings] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  // Expanded Card State
  const [expandedCard, setExpandedCard] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchDashboardData();
      fetchBookings();
      fetchMaintenanceRequests();
      fetchPurchases();
      fetchReservations();
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
      const customersResponse = await fetch(`/api/clients`, {
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

      // Fetch analytics
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      const analyticsResponse = await fetch(`/api/payments/analytics?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setTotalRevenue(analyticsData.total_revenue || 0);
        setUnpaidInvoices(analyticsData.unpaid_count || 0);
      }

      // Fetch pending requests
      const requestsResponse = await fetch(`/api/requests/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setPendingRequests(requestsData.requests?.length || 0);
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
      const response = await fetch(`/api/bookings?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/maintenance-requests?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/purchases?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases || []);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/reservations?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  // KPI Card Component
  const KPICard = ({ icon, label, value, color }) => (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icon">
        <img src={icon} alt={label} />
      </div>
      <div className="kpi-content">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
      </div>
    </div>
  );

  // Summary Card Component
  const SummaryCard = ({ title, items, cardKey, icon }) => {
    const isExpanded = expandedCard === cardKey;

    return (
      <div className={`summary-card ${isExpanded ? 'expanded' : ''}`}>
        <div
          className="summary-card-header"
          onClick={() => setExpandedCard(isExpanded ? null : cardKey)}
        >
          <div className="summary-card-title">
            {icon && <img src={icon} alt={title} className="summary-card-icon" />}
            <h3>{title}</h3>
          </div>
          <div className={`summary-card-toggle ${isExpanded ? 'open' : ''}`}>
            ▼
          </div>
        </div>

        {isExpanded && (
          <div className="summary-card-content">
            {items && items.length > 0 ? (
              <div className="summary-items">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={`summary-item ${expandedItem === index ? 'expanded' : ''}`}
                    onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                  >
                    <div className="summary-item-header">
                      <div className="summary-item-title">
                        <p className="summary-item-name">{item.name || item.title || 'N/A'}</p>
                        <p className="summary-item-status">{item.status || 'Active'}</p>
                      </div>
                      <div className={`summary-item-toggle ${expandedItem === index ? 'open' : ''}`}>
                        ▶
                      </div>
                    </div>

                    {expandedItem === index && (
                      <div className="summary-item-details">
                        <div className="detail-row">
                          <span className="detail-label">ID:</span>
                          <span className="detail-value">{item.id}</span>
                        </div>
                        {item.amount && (
                          <div className="detail-row">
                            <span className="detail-label">Amount:</span>
                            <span className="detail-value">₱{item.amount.toLocaleString()}</span>
                          </div>
                        )}
                        {item.date && (
                          <div className="detail-row">
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {item.client_name && (
                          <div className="detail-row">
                            <span className="detail-label">Client:</span>
                            <span className="detail-value">{item.client_name}</span>
                          </div>
                        )}
                        {item.description && (
                          <div className="detail-row">
                            <span className="detail-label">Description:</span>
                            <span className="detail-value">{item.description}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="summary-empty">
                <p>No items available</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mobile-dashboard">
        <div className="loading-state">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-dashboard">
      {/* KPI Grid - 2x2 */}
      <div className="kpi-grid">
        <KPICard
          icon={totalCustomersIcon}
          label="Total Customers"
          value={totalCustomers}
          color="blue"
        />
        <KPICard
          icon={totalRevenueIcon}
          label="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          color="green"
        />
        <KPICard
          icon={unpaidInvoiceIcon}
          label="Unpaid Invoices"
          value={unpaidInvoices}
          color="orange"
        />
        <KPICard
          icon={pendingRequestsIcon}
          label="Pending Requests"
          value={pendingRequests}
          color="red"
        />
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-container">
        <SummaryCard
          title="Recent Bookings"
          items={bookings}
          cardKey="bookings"
          icon={null}
        />
        <SummaryCard
          title="Maintenance Requests"
          items={maintenanceRequests}
          cardKey="maintenance"
          icon={null}
        />
        <SummaryCard
          title="Recent Purchases"
          items={purchases}
          cardKey="purchases"
          icon={null}
        />
        <SummaryCard
          title="Reservations"
          items={reservations}
          cardKey="reservations"
          icon={null}
        />
      </div>
    </div>
  );
};

export default MobileOptimizedDashboard;
