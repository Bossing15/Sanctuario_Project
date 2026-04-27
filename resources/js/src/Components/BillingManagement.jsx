import { useState, useEffect } from 'react';
import { TableSkeleton } from './SkeletonLoader';
import CrudActions from './CrudActions';
import crudUtils from '../utils/crudUtils';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import './Dashboard.css';

const BillingManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalPayments: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
    failedCount: 0
  });
  const [methodBreakdown, setMethodBreakdown] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAllPayments();
    fetchPaymentStats();
  }, []);

  const fetchAllPayments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/payments/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const paymentsData = data.data || [];
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } else {
        console.warn('Failed to fetch payments:', response.status);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/payments/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const statsData = data.stats || {};
        setStats({
          totalPayments: statsData.total_payments || 0,
          paidAmount: statsData.paid_amount || 0,
          unpaidAmount: statsData.unpaid_amount || 0,
          paidCount: statsData.paid_count || 0,
          unpaidCount: statsData.unpaid_count || 0,
          failedCount: statsData.failed_count || 0
        });
        
        if (statsData.payment_method_breakdown) {
          setMethodBreakdown(statsData.payment_method_breakdown);
        }
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
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

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Unpaid' },
      'failed': { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const methodIcons = {
      'card': 'Card',
      'gcash': 'GCash',
      'grab_pay': 'Grab Pay',
      'paymaya': 'PayMaya',
      'bank_transfer': 'Bank Transfer',
      'cash': 'Cash'
    };
    return methodIcons[method?.toLowerCase()] || 'Card';
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = 
      (payment.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleMarkAsPaid = async (paymentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        alert('Payment marked as paid successfully');
        fetchAllPayments();
        fetchPaymentStats();
      } else {
        alert('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('An error occurred while updating payment');
    }
  };

  const handleSendReminder = async (paymentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/payments/send-reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ payment_id: paymentId })
      });

      if (response.ok) {
        alert('Payment reminder sent successfully');
      } else {
        alert('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('An error occurred while sending reminder');
    }
  };

  const handleGenerateReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/payments/${paymentId}/generate-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('Receipt generated successfully');
      } else {
        alert('Failed to generate receipt');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('An error occurred while generating receipt');
    }
  };

  const handleDeletePayment = (id) => {
    setPaymentToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const result = await crudUtils.deleteItem(
        "/api/payments",
        paymentToDelete,
        token
      );
      
      if (result.success) {
        fetchAllPayments();
        fetchPaymentStats();
        setShowDeleteConfirmModal(false);
        setPaymentToDelete(null);
      } else {
        alert(result.error || "Failed to delete payment");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Error deleting payment");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setPaymentToDelete(null);
  };

  return (
    <div className="p-8 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2">Billing Management</h3>
        <p className="text-gray-600">Manage all customer payments and billing information</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h6 className="text-gray-600 mb-1 text-sm font-medium">Total Payments</h6>
          <h5 className="font-bold text-2xl text-[#1B3022]">{stats.totalPayments}</h5>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h6 className="text-gray-600 mb-1 text-sm font-medium">Paid</h6>
          <h5 className="font-bold text-2xl text-green-600">{stats.paidCount}</h5>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.paidAmount)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h6 className="text-gray-600 mb-1 text-sm font-medium">Unpaid</h6>
          <h5 className="font-bold text-2xl text-yellow-600">{stats.unpaidCount}</h5>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.unpaidAmount)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h6 className="text-gray-600 mb-1 text-sm font-medium">Failed</h6>
          <h5 className="font-bold text-2xl text-red-600">{stats.failedCount}</h5>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h6 className="text-gray-600 mb-1 text-sm font-medium">Total Revenue</h6>
          <h5 className="font-bold text-xl text-purple-600">{formatCurrency(stats.paidAmount)}</h5>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h6 className="text-gray-600 mb-1 text-sm font-medium">Outstanding</h6>
          <h5 className="font-bold text-xl text-orange-600">{formatCurrency(stats.unpaidAmount)}</h5>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {Object.keys(methodBreakdown).length > 0 && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
          <h4 className="font-bold text-lg text-gray-800 mb-4">Payment Method Breakdown</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(methodBreakdown).map(([method, data]) => (
              <div key={method} className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-2xl mb-2">{getPaymentMethodIcon(method)}</div>
                <p className="text-sm font-semibold text-gray-700 capitalize">{method}</p>
                <p className="text-xs text-gray-500 mt-1">{data.count} transactions</p>
                <p className="text-sm font-bold text-[#1B3022] mt-1">{formatCurrency(data.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-[#1B3022] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterStatus === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Unpaid
          </button>
          <button
            onClick={() => setFilterStatus('failed')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filterStatus === 'failed'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Failed
          </button>
        </div>

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
            placeholder="Search by customer name or email..."
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

      {/* Payments Table */}
      {loading ? (
        <TableSkeleton rows={5} columns={8} />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Date</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr className="empty-row">
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontStyle: 'italic' }}>
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="font-bold">{payment.customer_name || 'N/A'}</td>
                    <td className="text-sm">{payment.customer_email || 'N/A'}</td>
                    <td className="font-semibold text-[#1B3022]">{formatCurrency(payment.amount)}</td>
                    <td className="text-center">{getPaymentStatusBadge(payment.status)}</td>
                    <td className="text-center">
                      <span className="text-lg">{getPaymentMethodIcon(payment.payment_method)}</span>
                      <p className="text-xs text-gray-600 capitalize">{payment.payment_method || 'N/A'}</p>
                    </td>
                    <td className="date-cell">{formatDate(payment.created_at)}</td>
                    <td className="font-mono text-xs">{payment.payment_reference || 'N/A'}</td>
                    <td className="text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailsModal(true);
                          }}
                          className="action-btn primary text-xs"
                          title="View Details"
                        >
                          View
                        </button>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handleMarkAsPaid(payment.id)}
                            className="action-btn success text-xs"
                            title="Mark as Paid"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleSendReminder(payment.id)}
                          className="action-btn warning text-xs"
                          title="Send Reminder"
                        >
                          Remind
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Payment Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer Name</p>
                  <p className="font-semibold text-gray-800">{selectedPayment.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{selectedPayment.customer_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-[#1B3022] text-lg">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{getPaymentStatusBadge(selectedPayment.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-800">{selectedPayment.payment_method || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reference</p>
                  <p className="font-mono text-sm text-gray-800">{selectedPayment.payment_reference || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date Created</p>
                  <p className="font-semibold text-gray-800">{formatDate(selectedPayment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date Paid</p>
                  <p className="font-semibold text-gray-800">{selectedPayment.paid_date ? formatDate(selectedPayment.paid_date) : 'Not yet paid'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => handleGenerateReceipt(selectedPayment.id)}
                className="px-4 py-2 bg-[#1B3022] text-white rounded-lg hover:bg-[#2A4D36] font-semibold"
              >
                Generate Receipt
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteConfirmModal}
        message="Are you sure you want to delete this payment?"
        itemName="this payment"
        onConfirm={confirmDeletePayment}
        onCancel={closeDeleteConfirmModal}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BillingManagement;
