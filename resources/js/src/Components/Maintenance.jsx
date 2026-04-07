import { useState, useEffect } from "react";
import maintenanceIcon from '../assets/icons/Maintenance.png';
import { TableSkeleton } from "./SkeletonLoader";

const Maintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="p-8 bg-white min-h-screen flex-grow">
        {/* Header */}
        <div className="flex items-center mb-8">
          <img
            src={maintenanceIcon}
            alt="Maintenance Icon"
            className="w-10 h-10 object-contain mr-4"
          />
          <div>
            <h3 className="text-3xl font-bold text-gray-800">Maintenance Requests</h3>
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
        ) : maintenanceRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Maintenance Requests</h3>
            <p className="text-gray-500">No maintenance requests have been submitted yet.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h5 className="text-xl font-semibold text-gray-800">Maintenance Requests List</h5>
              <button 
                onClick={fetchMaintenanceRequests}
                className="refresh-btn"
              >
                Refresh
              </button>
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
                  {maintenanceRequests.map((request) => (
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
                  ))}
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
