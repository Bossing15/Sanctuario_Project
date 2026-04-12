import { useState, useEffect } from "react";
import maintenanceIcon from '../assets/icons/Maintenance.png';
import { TableSkeleton } from "./SkeletonLoader";
import StatsCards from "./StatsCards";

const Maintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
            <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
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
              { label: 'Pending', value: maintenanceRequests.filter(r => r.status === 'pending').length },
              { label: 'In Progress', value: maintenanceRequests.filter(r => r.status === 'active').length },
              { label: 'Completed', value: maintenanceRequests.filter(r => r.status === 'completed').length }
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
                    <th>Request_ID</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date_Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRequests.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontStyle: 'italic' }}>
                        No data available
                      </td>
                    </tr>
                  ) : (
                    maintenanceRequests.filter((request) => {
                      const query = searchQuery.toLowerCase();
                      return (
                        request.id.toString().includes(query) ||
                        request.type.toLowerCase().includes(query) ||
                        request.description.toLowerCase().includes(query)
                      );
                    }).map((request) => (
                      <tr key={request.id}>
                        <td className="font-mono">{request.id}</td>
                        <td>{request.type}</td>
                        <td>{request.description}</td>
                        <td className="text-center">
                          <span className={`status-badge ${request.status === 'completed' ? 'completed' : request.status === 'pending' ? 'pending' : 'active'}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="date-cell">{new Date(request.created_at).toLocaleDateString()}</td>
                        <td className="text-center">
                          <button className="action-btn primary">View</button>
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
    </div>
  );
};

export default Maintenance;

