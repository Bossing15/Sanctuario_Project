import { useState, useEffect } from 'react';
import { FaHistory, FaFilter, FaDownload, FaSearch } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import './ActivityLogsPage.css';

function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [filters, setFilters] = useState({
    action: '',
    entity_type: '',
    user_id: '',
    start_date: '',
    end_date: '',
    search: '',
    per_page: 50,
    page: 1,
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState(null);
  const [actions, setActions] = useState([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    fetchActivityLogs();
    fetchStats();
    fetchActions();
  }, [filters]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`http://localhost:8000/api/admin/activity-logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setPagination(data.pagination || {});
      } else {
        setAlertModal({
          show: true,
          type: 'error',
          message: 'Failed to load activity logs',
        });
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Error loading activity logs: ' + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/admin/activity-logs/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/admin/activity-logs/actions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setActions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams();
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);

      const response = await fetch(`http://localhost:8000/api/admin/activity-logs/export/csv?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Failed to export activity logs',
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      'payment_processed': 'bg-green-100 text-green-700',
      'reservation_approved': 'bg-blue-100 text-blue-700',
      'reservation_rejected': 'bg-red-100 text-red-700',
      'requirement_reviewed': 'bg-purple-100 text-purple-700',
      'booking_authorized': 'bg-indigo-100 text-indigo-700',
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const getActionLabel = (action) => {
    const labels = {
      'payment_processed': '💳 Payment Processed',
      'reservation_approved': '✅ Reservation Approved',
      'reservation_rejected': '❌ Reservation Rejected',
      'requirement_reviewed': '📋 Requirement Reviewed',
      'booking_authorized': '🔐 Booking Authorized',
    };
    return labels[action] || action;
  };

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <div className="header-content">
          <FaHistory className="header-icon" />
          <div>
            <h1>Activity Logs</h1>
            <p>Track all admin actions and system activities</p>
          </div>
        </div>
        <button
          onClick={handleExportCsv}
          className="export-btn"
          title="Export logs to CSV"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <button
            onClick={() => setShowStats(!showStats)}
            className="stats-toggle"
          >
            {showStats ? '▼' : '▶'} Activity Statistics
          </button>
          {showStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Activities</h3>
                <p className="stat-value">{stats.total_activities}</p>
              </div>
              <div className="stat-card">
                <h3>By Action</h3>
                <div className="stat-list">
                  {Object.entries(stats.by_action || {}).map(([action, count]) => (
                    <div key={action} className="stat-item">
                      <span>{getActionLabel(action)}</span>
                      <span className="count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stat-card">
                <h3>By Entity Type</h3>
                <div className="stat-list">
                  {Object.entries(stats.by_entity_type || {}).map(([type, count]) => (
                    <div key={type} className="stat-item">
                      <span>{type}</span>
                      <span className="count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stat-card">
                <h3>Top Users</h3>
                <div className="stat-list">
                  {(stats.by_user || []).slice(0, 5).map((user) => (
                    <div key={user.user_id} className="stat-item">
                      <span>{user.user_name}</span>
                      <span className="count">{user.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Search</label>
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by description, user, or action..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Action</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
          >
            <option value="">All Actions</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {getActionLabel(action)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
          />
        </div>

        <button
          onClick={() => setFilters({
            action: '',
            entity_type: '',
            user_id: '',
            start_date: '',
            end_date: '',
            search: '',
            per_page: 50,
            page: 1,
          })}
          className="reset-filters-btn"
        >
          Reset Filters
        </button>
      </div>

      {/* Logs Table */}
      <div className="logs-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <FaHistory className="empty-icon" />
            <h3>No Activity Logs</h3>
            <p>No activities found matching your filters.</p>
          </div>
        ) : (
          <>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="log-row">
                    <td className="date-cell">{formatDate(log.created_at)}</td>
                    <td className="user-cell">
                      <div className="user-info">
                        <p className="user-name">{log.user_name}</p>
                        <p className="user-email">{log.user_email}</p>
                      </div>
                    </td>
                    <td className="action-cell">
                      <span className={`action-badge ${getActionBadgeColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="entity-cell">
                      {log.entity_type && (
                        <div>
                          <p className="entity-type">{log.entity_type}</p>
                          {log.entity_id && <p className="entity-id">#{log.entity_id}</p>}
                        </div>
                      )}
                    </td>
                    <td className="description-cell">
                      <p className="description">{log.description}</p>
                      {log.changes && (
                        <details className="changes-details">
                          <summary>View Changes</summary>
                          <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                        </details>
                      )}
                    </td>
                    <td className="ip-cell">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: Math.min(pagination.last_page, filters.page + 1) })}
                  disabled={filters.page === pagination.last_page}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          message={alertModal.message}
          onClose={() => setAlertModal({ show: false, type: 'info', message: '' })}
        />
      )}
    </div>
  );
}

export default ActivityLogsPage;
