import { useState, useEffect } from 'react';
import { TableSkeleton } from './SkeletonLoader';
import './ActivityLogsPage.css';

function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchActivityLogs();
    fetchActions();
  }, [filterAction, searchQuery]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      let url = '/api/admin/activity-logs';
      const params = new URLSearchParams();
      
      if (filterAction) params.append('action', filterAction);
      if (searchQuery) params.append('search', searchQuery);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/activity-logs/actions', {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      'payment_processed': 'Payment Processed',
      'reservation_approved': 'Reservation Approved',
      'reservation_rejected': 'Reservation Rejected',
      'requirement_reviewed': 'Requirement Reviewed',
      'booking_authorized': 'Booking Authorized',
    };
    return labels[action] || action;
  };

  const getActionColor = (action) => {
    const colors = {
      'payment_processed': 'bg-green-100 text-green-700',
      'reservation_approved': 'bg-green-100 text-green-700',
      'reservation_rejected': 'bg-red-100 text-red-700',
      'requirement_reviewed': 'bg-purple-100 text-purple-700',
      'booking_authorized': 'bg-indigo-100 text-indigo-700',
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Activity Logs</h1>
        <p className="text-gray-600">Track all admin actions and system activities</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by description or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3022]"
            >
              <option value="">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterAction('');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No activity logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Entity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm text-gray-700">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{log.user_name || 'Unknown User'}</p>
                        <p className="text-gray-500 text-xs">{log.user_email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {log.entity_type && (
                        <>
                          <p className="font-semibold">{log.entity_type}</p>
                          {log.entity_id && <p className="text-gray-500">#{log.entity_id}</p>}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogsPage;
