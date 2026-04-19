import React, { useState, useEffect } from 'react';
import { TableSkeleton } from './SkeletonLoader';
import './AdminBillings.css';

const AdminBillings = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalPayments: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidCount: 0,
    unpaidCount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const apiUrl = `${window.location.protocol}//${window.location.host}/api/payments/all`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const paymentsData = data.payments || data.data || [];
        
        // Fetch client details for each payment
        const enrichedPayments = await Promise.all(
          (Array.isArray(paymentsData) ? paymentsData : []).map(async (payment) => {
            try {
              const clientResponse = await fetch(
                `${window.location.protocol}//${window.location.host}/api/clients/${payment.client_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                  },
                  credentials: 'include'
                }
              );
              
              if (clientResponse.ok) {
                const clientData = await clientResponse.json();
                return {
                  ...payment,
                  client: clientData.client || clientData
                };
              }
            } catch (err) {
              console.error('Error fetching client details:', err);
            }
            return payment;
          })
        );

        setPayments(enrichedPayments);
        
        // Calculate stats
        const paidPayments = enrichedPayments.filter(p => p.status === 'completed');
        const unpaidPayments = enrichedPayments.filter(p => p.status === 'pending');
        
        const paidAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const unpaidAmount = unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        setStats({
          totalPayments: enrichedPayments.length,
          paidAmount,
          unpaidAmount,
          paidCount: paidPayments.length,
          unpaidCount: unpaidPayments.length
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status) => {
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

  const filteredPayments = payments.filter(payment => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (payment.client?.name || '').toLowerCase().includes(query) ||
      (payment.client?.email || '').toLowerCase().includes(query) ||
      (payment.id?.toString() || '').includes(query) ||
      (payment.payment_reference || '').toLowerCase().includes(query);
    
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Billing & Payments</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Total Payments</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalPayments}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Paid</p>
            <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Unpaid</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.unpaidCount}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <p className="text-gray-600 text-sm font-medium">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.unpaidAmount)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff'
          }}>
            <input
              type="text"
              placeholder="Search by customer name, email, ID, or reference..."
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
            <svg style={{ width: '20px', height: '20px', color: '#6b7280', marginLeft: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <option value="all">All Status</option>
            <option value="completed">Paid</option>
            <option value="pending">Unpaid</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={10} columns={8} />
        ) : (
          <div className="table-wrapper bg-white rounded-lg shadow-md overflow-hidden">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reference</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-mono font-semibold">#{payment.id}</td>
                      <td className="font-mono text-sm">{payment.payment_reference || 'N/A'}</td>
                      <td className="font-semibold">{payment.client?.name || payment.customer_name || 'N/A'}</td>
                      <td className="text-sm">{payment.client?.email || 'N/A'}</td>
                      <td className="font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                      <td className="text-sm capitalize">{payment.payment_method || 'N/A'}</td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td className="text-sm">{formatDate(payment.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBillings;
