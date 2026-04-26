import { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateFormatter';
import StatsCards from './StatsCards';
import CrudActions from './CrudActions';
import crudUtils from '../utils/crudUtils';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const PaymentManagement = ({ canManageBilling = true }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  // Add blur effect to background when modal opens
  useEffect(() => {
    if (showReceiptModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showReceiptModal]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Add cache-busting parameter to force fresh data
      const cacheBuster = `?_=${new Date().getTime()}`;
      
      // Use /api/payments/admin/all to get all payments (not filtered by user)
      const response = await fetch(`/api/payments/admin/all${cacheBuster}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('=== PaymentManagement Debug ===');
        console.log('Raw API response:', data);
        console.log('Response keys:', Object.keys(data));
        
        // Handle both paginated and non-paginated responses
        let paymentsData;
        
        // Check for Laravel pagination structure
        if (data.data && Array.isArray(data.data)) {
          // Paginated response from Laravel: { data: [...], pagination: {...} }
          paymentsData = data.data;
          console.log('Paginated response detected - using data.data');
        } else if (Array.isArray(data)) {
          // Direct array response
          paymentsData = data;
          console.log('Direct array response detected');
        } else {
          // Last resort - try to extract any array
          const possibleArrays = Object.values(data).filter(v => Array.isArray(v));
          if (possibleArrays.length > 0) {
            paymentsData = possibleArrays[0];
            console.log('Found array in response:', possibleArrays);
          } else {
            paymentsData = [];
            console.error('Unexpected response format - no array found:', data);
          }
        }
        
        console.log('Total payments fetched:', paymentsData.length);
        console.log('First payment sample:', paymentsData[0]);
        console.log('Payment statuses:', paymentsData.map(p => ({ id: p.id, status: p.status, customer: p.customer_name || p.client?.name })));
        console.log('Completed payments count:', paymentsData.filter(p => p.status === 'completed').length);
        console.log('Completed payments:', paymentsData.filter(p => p.status === 'completed'));
        setPayments(paymentsData);
      } else {
        console.error('API request failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
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
        fetchPayments();
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

  const handleDownloadPDF = () => {
    if (selectedPayment) {
      const downloadUrl = `/api/payments/${selectedPayment.id}/download-receipt`;
      window.open(downloadUrl, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Unpaid Bills</h2>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={[
        { label: 'Total Unpaid Bills', value: payments.filter(p => (p.status || '').toLowerCase() !== 'completed' && (p.status || '').toLowerCase() !== 'paid').length },
        { label: 'Pending', value: payments.filter(p => (p.status || '').toLowerCase() === 'pending' || (p.status || '').toLowerCase() === 'unpaid').length },
        { label: 'Overdue', value: payments.filter(p => (p.status || '').toLowerCase() === 'overdue').length },
        { label: 'Total Outstanding', value: `₱${payments.filter(p => (p.status || '').toLowerCase() !== 'completed' && (p.status || '').toLowerCase() !== 'paid').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}` }
      ]} />

      {/* Search Bar and Refresh */}
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={fetchPayments}
          className="refresh-btn"
        >
          Refresh
        </button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#ffffff',
          transition: 'all 0.2s ease',
          minWidth: '300px'
        }}>
          <input
            type="text"
            placeholder="Search by customer name or reference"
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
        <div className="table-wrapper">
          <div className="table-loading">
            <div className="table-loading-spinner"></div>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pay_ID</th>
                <th>Customer_Name</th>
                <th>Product/Service</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Due_Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments
                .filter((payment) => {
                  const status = (payment.status || '').toLowerCase();
                  // Only show completed/paid payments in Payment History
                  return status === 'completed' || status === 'paid';
                })
                .filter((payment) => {
                  const customerName = payment.customer_name || payment.client?.name || 'Guest';
                  const reference = payment.payment_reference || '';
                  const query = searchQuery.toLowerCase();
                  return customerName.toLowerCase().includes(query) || reference.toLowerCase().includes(query);
                })
                .map((payment) => {
                const customerName = payment.customer_name || payment.client?.name || 'Guest';
                const productService = payment.description || 
                                      payment.service?.name || 
                                      payment.grave?.location || 
                                      'General Payment';
                
                return (
                <tr key={payment.id}>
                  <td className="font-mono">{payment.id}</td>
                  <td className="font-bold">{customerName}</td>
                  <td>{productService}</td>
                  <td className="currency">
                    {parseFloat(payment.amount).toFixed(2)}
                    {payment.penalty_amount > 0 && (
                      <span className="currency negative text-xs ml-1">
                        (+{parseFloat(payment.penalty_amount).toFixed(2)})
                      </span>
                    )}
                  </td>
                  <td>{payment.payment_method || 'N/A'}</td>
                  <td className="date-cell">{payment.paid_date ? formatDate(payment.paid_date) : 'N/A'}</td>
                  <td className="text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Paid
                    </span>
                  </td>
                  <td className="text-center">
                    <CrudActions
                      onView={() => handleGenerateReceipt(payment)}
                      onEdit={() => {}}
                      onDelete={() => handleDeletePayment(payment.id)}
                      onToggleStatus={() => {}}
                      showView={true}
                      showEdit={false}
                      showDelete={canManageBilling}
                      showToggle={false}
                      size="sm"
                    />
                  </td>
                </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" className="px-3 py-4 text-center text-gray-500 text-xs" style={{ fontStyle: 'italic' }}>
                    No completed payments available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <span className="modal-header-icon">🧾</span>
                <span>Payment Receipt</span>
              </div>
              <button className="modal-close" onClick={() => setShowReceiptModal(false)}>×</button>
            </div>

            {/* Receipt Content */}
            <div className="modal-body" id="receipt-content">
              {/* Company Header */}
              <div className="text-center border-b-4 border-blue-900 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">Sanctuario De Carmona Memorial Park</h1>
                <p className="text-gray-600">Carmona, Cavite, Philippines</p>
                <p className="text-gray-600">Phone: 0912-345-6789 | Email: info@sanctuario.com</p>
              </div>

              {/* Receipt Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-blue-900">OFFICIAL RECEIPT</h2>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Receipt No:</p>
                  <p className="font-semibold">{selectedPayment.payment_reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date Issued:</p>
                  <p className="font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Date:</p>
                  <p className="font-semibold">{selectedPayment.paid_date ? formatDate(selectedPayment.paid_date) : 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status:</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {selectedPayment.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-blue-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name:</p>
                    <p className="font-semibold">{selectedPayment.customer_name || selectedPayment.client?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="font-semibold">{selectedPayment.client?.email || 'N/A'}</p>
                  </div>
                  {selectedPayment.client?.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone:</p>
                      <p className="font-semibold">{selectedPayment.client.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-blue-900 mb-3">Payment Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-semibold">{selectedPayment.description || 'Payment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{selectedPayment.payment_method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-semibold">{selectedPayment.payment_type}</span>
                  </div>
                </div>
              </div>

              {/* Amount Section */}
              <div className="bg-blue-50 p-6 rounded-lg text-center mb-8">
                <p className="text-sm text-gray-600 mb-2">TOTAL AMOUNT PAID</p>
                <p className="text-4xl font-bold text-blue-900">₱{parseFloat(selectedPayment.amount).toFixed(2)}</p>
              </div>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-8 mt-12 mb-6">
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 pt-2 mt-16">
                    <p className="text-sm text-gray-600">Received By</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 pt-2 mt-16">
                    <p className="text-sm text-gray-600">Authorized Signature</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 mt-8 pt-6 border-t-2 border-gray-300">
                <p>This is an official receipt generated by Sanctuario De Carmona Memorial Park</p>
                <p>For inquiries, please contact us at info@sanctuario.com or call 0912-345-6789</p>
                <p className="mt-2">Generated on: {new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
                onClick={handlePrint}
              >
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="modal-btn primary"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
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

export default PaymentManagement;
