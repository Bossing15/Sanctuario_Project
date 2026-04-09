import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import invoiceIcon from '../assets/icons/Billing2.png';
import search from '../assets/icons/icons8-search-50.png';
import PaymentManagement from './PaymentManagement';
import PaymentAnalytics from './PaymentAnalytics';
import AdminPaymentModal from './AdminPaymentModal';
import { formatDate } from '../utils/dateFormatter';
import usePermissions from '../utils/usePermissions';

const Billing = () => {
  const { canPerformActions } = usePermissions();
  const canManageBilling = canPerformActions('billing');
  const location = useLocation();
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('management');
  const [searchQuery, setSearchQuery] = useState('');
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // Default to unpaid for management tab
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const pollingRef = useRef(null);

  // Check if we should open a specific tab from navigation state
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  // Fetch payments from backend
  const fetchPayments = async () => {
    try {
      // Add cache-busting parameter to force fresh data
      const cacheBuster = `?_=${new Date().getTime()}`;
      const res = await fetch(`/api/payments/all${cacheBuster}`, {
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      // Expecting array of payments from backend
      const paymentsData = Array.isArray(data) ? data : (data?.data || []);
      console.log('Billing - Fetched payments:', paymentsData.length);
      console.log('Billing - Completed payments:', paymentsData.filter(p => p.status === 'completed').length);
      setPayments(paymentsData);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error fetching payments:', e);
    }
  };

  useEffect(() => {
    fetchPayments();
    // Poll every 15s to reflect new transactions
    pollingRef.current = setInterval(fetchPayments, 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleGenerateReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/payments/${paymentId}/generate-receipt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert('Receipt generated successfully!');
        console.log('Receipt URL:', data.download_url);
      } else {
        alert('Failed to generate receipt');
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('An error occurred while generating receipt');
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const token = localStorage.getItem('authToken');
      window.open(`/api/payments/${paymentId}/download-receipt?token=${token}`, '_blank');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('An error occurred while downloading receipt');
    }
  };

  const filteredPaymentData = payments
    .filter((row) => {
      // Filter by status - for management tab, exclude completed payments
      const status = (row.status || '').toLowerCase();
      
      // Never show completed payments in management tab
      if (status === 'completed' || status === 'paid') {
        return false;
      }
      
      if (statusFilter === 'overdue') {
        return status === 'overdue';
      }
      // 'all' - show all unpaid (pending, unpaid, overdue)
      return status === 'pending' || status === 'unpaid' || status === 'overdue';
    })
    .filter((row) => {
      // Get customer name from various possible sources
      const customerName = row.customer_name || row.client?.name || row.client_name || row.payer_name || '';
      return customerName.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <div className="p-8 flex-grow">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <img src={invoiceIcon} alt="Invoice Icon" className="w-10 h-10 object-contain mr-4" />
            <h3 className="font-bold text-3xl text-gray-800">Billing & Payments</h3>
          </div>
          {!canManageBilling && (
            <p className="text-sm text-orange-600 mt-2 ml-14">
              <span className="font-semibold">View Only:</span> You can view billing information but cannot process payments.
            </p>
          )}
        </div>

        {/* Tabs */}
        <nav className="mb-8">
          <div className="flex space-x-3">
            {[
              { key: 'management', label: 'Payment Management' },
              { key: 'history', label: 'Payment History' },
              { key: 'analytics', label: 'Reports' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        {activeTab === 'history' && <PaymentManagement canManageBilling={canManageBilling} />}
        {activeTab === 'analytics' && <PaymentAnalytics />}
        
        {activeTab === 'management' && (
          <>
        
        {/* Filter and Search */}
        <div className="flex justify-between items-center mb-6">
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Unpaid
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                statusFilter === 'overdue'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Overdue
            </button>
          </div>
          
          {/* Search */}
          <div className="flex justify-end">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden max-w-xs shadow-sm bg-white">
            <input
              type="text"
              placeholder="Search by customer name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button className="bg-gray-50 hover:bg-gray-100 px-3 transition-colors">
              <img src={search} alt="Search" className="w-5 h-5" />
            </button>
          </div>
          </div>
        </div>
        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pay_ID</th>
                <th>Customer_Name</th>
                <th>Product/Service</th>
                <th>Due_Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaymentData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '500' }}>
                      💳 No payments found
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                      No billing records match your search criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPaymentData.map((row) => {
                  const id = row.id || row.payment_id || row.uuid;
                  const name = row.customer_name || row.client?.name || row.client_name || row.payer_name || row.name || 'N/A';
                  const date = row.due_date || row.date || row.created_at;
                  const amount = row.amount || row.total || row.amount_paid || row.value || 0;
                  const status = (row.status || '').toString();
                  const method = row.method || row.payment_method || row.channel || '-';
                  const productService = row.description || 
                                        row.service?.name || 
                                        row.grave?.location || 
                                        'General Payment';
                  return (
                    <tr
                      key={id}
                      onClick={() => setSelectedRow({ id, name, date, amount, status, method, productService })}
                      className={selectedRow?.id === id ? 'selected' : ''}
                    >
                      <td className="font-mono">{id}</td>
                      <td className="font-bold">{name}</td>
                      <td>{productService}</td>
                      <td className="date-cell">{formatDate(date)}</td>
                      <td className="currency">{Number(amount).toLocaleString()}</td>
                      <td className="text-center">
                        <span className={`status-badge ${
                          status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed' ? 'completed' :
                          status.toLowerCase() === 'overdue' ? 'overdue' :
                          status.toLowerCase() === 'pending' || status.toLowerCase() === 'unpaid' ? 'pending' :
                          'info'
                        }`}>
                          {status.toLowerCase() === 'unpaid' ? 'Unpaid' : status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            className={`bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all ${
              !selectedRow || !canManageBilling ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (selectedRow && canManageBilling) {
                setShowPaymentModal(true);
              }
            }}
            disabled={!selectedRow || !canManageBilling}
            title={!canManageBilling ? 'You do not have permission to process payments' : ''}
          >
            Process New Payment
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            onClick={() => document.getElementById('soaModal').showModal()}
          >
            Generate SOA
          </button>
        </div>
        {/* Selected row */}
        {selectedRow && (
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg text-blue-900 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <strong className="font-semibold">Selected:</strong> {selectedRow.name} - ₱{Number(selectedRow.amount).toLocaleString()} ({selectedRow.status})
              </div>
            </div>
          </div>
        )}
        
        {/* Admin Payment Modal */}
        {showPaymentModal && selectedRow && (
          <AdminPaymentModal
            payment={{
              id: selectedRow.id,
              customer_name: selectedRow.name,
              amount: selectedRow.amount,
              description: `Payment for ${selectedRow.name}`,
              payment_reference: `PAY-${selectedRow.id}`,
              payment_type: selectedRow.status,
              client_id: payments.find(p => (p.id || p.payment_id) === selectedRow.id)?.client_id
            }}
            onClose={() => {
              setShowPaymentModal(false);
              fetchPayments(); // Refresh payments after modal closes
            }}
          />
        )}
        {/* Statement of Account Modal */}
        <dialog 
          id="soaModal" 
          className="p-0 rounded-3xl shadow-2xl w-3/4 max-w-5xl bg-white border-0"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <div className="p-8" id="soa-content">
            {/* Company Header */}
            <div className="text-center border-b-4 border-blue-900 pb-6 mb-8">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Sanctuario De Carmona Memorial Park</h1>
              <p className="text-gray-600">Carmona, Cavite, Philippines</p>
              <p className="text-gray-600">Phone: 0912-345-6789 | Email: info@sanctuario.com</p>
            </div>

            {/* SOA Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-blue-900">STATEMENT OF ACCOUNT</h2>
            </div>

            {selectedRow ? (
              <>
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-900 mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Name:</p>
                        <p className="font-semibold">{selectedRow.name}</p>
                      </div>
                      {payments.find(p => {
                        const itemName = p.customer_name || p.client?.name || p.client_name || p.name;
                        return itemName === selectedRow.name;
                      })?.client?.email && (
                        <div>
                          <p className="text-sm text-gray-600">Email:</p>
                          <p className="font-semibold">{payments.find(p => {
                            const itemName = p.customer_name || p.client?.name || p.client_name || p.name;
                            return itemName === selectedRow.name;
                          })?.client?.email}</p>
                        </div>
                      )}
                      {payments.find(p => {
                        const itemName = p.customer_name || p.client?.name || p.client_name || p.name;
                        return itemName === selectedRow.name;
                      })?.client?.phone && (
                        <div>
                          <p className="text-sm text-gray-600">Phone:</p>
                          <p className="font-semibold">{payments.find(p => {
                            const itemName = p.customer_name || p.client?.name || p.client_name || p.name;
                            return itemName === selectedRow.name;
                          })?.client?.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-900 mb-3">Statement Details</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Statement Date:</p>
                        <p className="font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Account Status:</p>
                        <p className="font-semibold">{selectedRow.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Table */}
                <div className="mb-8">
                  <h3 className="font-bold text-blue-900 mb-4">Transaction History</h3>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead className="bg-blue-900 text-white">
                      <tr>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm">Date</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm">Description</th>
                        <th className="border border-gray-300 px-4 py-3 text-left text-sm">Payment Method</th>
                        <th className="border border-gray-300 px-4 py-3 text-right text-sm">Amount</th>
                        <th className="border border-gray-300 px-4 py-3 text-center text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments
                        .filter((item) => {
                          const itemName = item.customer_name || item.client?.name || item.client_name || item.name;
                          return itemName === selectedRow.name;
                        })
                        .map((item, index) => {
                          const date = item.date || item.created_at || item.paid_at || item.updated_at;
                          const amount = item.amount || item.total || item.amount_paid || 0;
                          const status = item.status || 'Unpaid';
                          const method = item.method || item.payment_method || '-';
                          const description = item.description || 'Payment';
                          return (
                            <tr key={(item.id || index).toString()} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{formatDate(date)}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{description}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm">{method}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold">₱{Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  status.toLowerCase() === 'paid' || status.toLowerCase() === 'completed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : status.toLowerCase() === 'overdue'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Section */}
                <div className="bg-blue-50 p-6 rounded-lg mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-bold text-blue-900 mb-4">Account Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Total Charges:</span>
                          <span className="font-semibold">₱{payments
                            .filter((item) => {
                              const itemName = item.customer_name || item.client?.name || item.client_name || item.name;
                              return itemName === selectedRow.name;
                            })
                            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
                            .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Total Paid:</span>
                          <span className="font-semibold text-green-700">₱{payments
                            .filter((item) => {
                              const itemName = item.customer_name || item.client?.name || item.client_name || item.name;
                              const status = (item.status || '').toLowerCase();
                              return itemName === selectedRow.name && (status === 'paid' || status === 'completed');
                            })
                            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
                            .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t-2 border-blue-900">
                          <span className="font-bold text-blue-900">Balance Due:</span>
                          <span className="font-bold text-red-700 text-lg">₱{payments
                            .filter((item) => {
                              const itemName = item.customer_name || item.client?.name || item.client_name || item.name;
                              const status = (item.status || '').toLowerCase();
                              return itemName === selectedRow.name && status !== 'paid' && status !== 'completed';
                            })
                            .reduce((sum, item) => sum + Number(item.amount || 0), 0)
                            .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-900">
                      <h4 className="font-bold text-blue-900 mb-2">Payment Instructions</h4>
                      <p className="text-sm text-gray-700 mb-2">Please make payment to:</p>
                      <div className="text-sm space-y-1">
                        <p><strong>Bank:</strong> BDO</p>
                        <p><strong>Account Name:</strong> Sanctuario De Carmona</p>
                        <p><strong>Account Number:</strong> 1234-5678-9012</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 pt-6 border-t-2 border-gray-300">
                  <p className="mb-2">This is a computer-generated statement and does not require a signature.</p>
                  <p>For inquiries, please contact us at info@sanctuario.com or call 0912-345-6789</p>
                  <p className="mt-2">Generated on: {new Date().toLocaleString()}</p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Please select a customer from the table to generate their Statement of Account.</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
              onClick={() => window.print()}
            >
              🖨️ Print
            </button>
            <form method="dialog">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all">
                Close
              </button>
            </form>
          </div>
        </dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default Billing;
