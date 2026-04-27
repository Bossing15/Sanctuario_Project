import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertModal from './AlertModal';

const PaymentAnalytics = () => {
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', message: '' });
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, [dateRange]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const cacheBuster = `?_=${new Date().getTime()}`;
      
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
        const paymentsData = data?.data || [];
        setPayments(paymentsData);
        calculateAnalytics(paymentsData);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (paymentsData) => {
    // Filter payments by date range
    const startDate = new Date(dateRange.start_date);
    const endDate = new Date(dateRange.end_date);
    endDate.setHours(23, 59, 59, 999);

    const filteredPayments = paymentsData.filter(payment => {
      const paymentDate = new Date(payment.created_at);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    // Calculate totals
    const completed = filteredPayments.filter(p => p.status === 'completed' || p.status === 'paid');
    const pending = filteredPayments.filter(p => p.status === 'pending' || p.status === 'unpaid');
    const overdue = filteredPayments.filter(p => p.status === 'overdue');

    const totalRevenue = completed.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const pendingAmount = pending.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const overdueAmount = overdue.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    // Group by payment method
    const paymentMethods = {};
    filteredPayments.forEach(payment => {
      const method = payment.payment_method || 'N/A';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, total: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].total += parseFloat(payment.amount) || 0;
    });

    // Group by month for trend
    const monthlyRevenue = {};
    completed.forEach(payment => {
      const date = new Date(payment.paid_date || payment.created_at);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += parseFloat(payment.amount) || 0;
    });

    setAnalytics({
      total_revenue: totalRevenue,
      pending_amount: pendingAmount,
      overdue_amount: overdueAmount,
      total_payments: filteredPayments.length,
      completed_payments: completed.length,
      pending_payments: pending.length,
      overdue_payments: overdue.length,
      payment_methods: Object.entries(paymentMethods).map(([method, data]) => ({
        payment_method: method,
        count: data.count,
        total: data.total
      })),
      monthly_revenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue
      })),
      revenue_trend: 0,
      pending_trend: 0,
      overdue_trend: 0,
      payment_count_trend: 0
    });
  };

  const sendReminders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/payments/send-reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlertModal({
          show: true,
          type: 'success',
          message: `Reminders sent: ${data.sent} of ${data.total}`
        });
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Failed to send reminders'
      });
    }
  };

  const checkOverdue = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/payments/check-overdue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlertModal({
          show: true,
          type: 'success',
          message: `Overdue payments updated: ${data.count}`
        });
        fetchPayments();
      }
    } catch (error) {
      console.error('Error checking overdue:', error);
      setAlertModal({
        show: true,
        type: 'error',
        message: 'Failed to check overdue payments'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const getTrendIcon = (trend) => {
    if (trend > 0) return '▲';
    if (trend < 0) return '▼';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Payment Reports</h2>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <button
            onClick={fetchPayments}
            className="px-6 py-2 bg-[#1B3022] text-white rounded-lg hover:bg-[#2A4D36]"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={sendReminders}
          className="bg-yellow-500 text-white p-4 rounded-xl font-semibold hover:bg-yellow-600 shadow-lg"
        >
          Send Payment Reminders
        </button>
        <button
          onClick={checkOverdue}
          className="bg-red-500 text-white p-4 rounded-xl font-semibold hover:bg-red-600 shadow-lg"
        >
          Check Overdue Payments
        </button>
      </div>

      {/* Top KPI Cards with Trends */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-sm text-gray-600 mb-4">Total Revenue</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            ₱{parseFloat(analytics?.total_revenue || 0).toLocaleString('en-US', {minimumFractionDigits: 0})}
          </div>
          <div className={`text-sm font-semibold ${getTrendColor(analytics?.revenue_trend || 0)}`}>
            {getTrendIcon(analytics?.revenue_trend || 0)} {Math.abs(analytics?.revenue_trend || 0).toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">vs previous period</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-sm text-gray-600 mb-4">Pending Amount</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            ₱{parseFloat(analytics?.pending_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 0})}
          </div>
          <div className={`text-sm font-semibold ${getTrendColor(analytics?.pending_trend || 0)}`}>
            {getTrendIcon(analytics?.pending_trend || 0)} {Math.abs(analytics?.pending_trend || 0).toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">vs previous period</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-sm text-gray-600 mb-4">Overdue Amount</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            ₱{parseFloat(analytics?.overdue_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 0})}
          </div>
          <div className={`text-sm font-semibold ${getTrendColor(analytics?.overdue_trend || 0)}`}>
            {getTrendIcon(analytics?.overdue_trend || 0)} {Math.abs(analytics?.overdue_trend || 0).toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">vs previous period</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-sm text-gray-600 mb-4">Total Payments</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {analytics?.total_payments || 0}
          </div>
          <div className={`text-sm font-semibold ${getTrendColor(analytics?.payment_count_trend || 0)}`}>
            {getTrendIcon(analytics?.payment_count_trend || 0)} {Math.abs(analytics?.payment_count_trend || 0).toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">vs previous period</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4">Monthly Revenue Trend</h3>
          <div className="space-y-3">
            {analytics?.monthly_revenue && analytics.monthly_revenue.length > 0 ? (
              analytics.monthly_revenue.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-semibold text-gray-700">{month.month}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-3 text-white text-xs font-semibold"
                      style={{
                        width: `${Math.min((month.revenue / Math.max(...(analytics?.monthly_revenue?.map(m => m.revenue) || [1]))) * 100, 100)}%`
                      }}
                    >
                      ₱{parseFloat(month.revenue).toLocaleString('en-US', {minimumFractionDigits: 0})}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4">Payment Status</h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {analytics?.completed_payments || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">
                {analytics?.pending_payments || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {analytics?.overdue_payments || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <h3 className="text-lg font-bold mb-4">Payment Methods</h3>
        <div className="space-y-3">
          {analytics?.payment_methods && analytics.payment_methods.length > 0 ? (
            analytics.payment_methods.map((method) => (
              <div key={method.payment_method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">{method.payment_method}</div>
                  <div className="text-xs text-gray-500">{method.count} transactions</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#1B3022]">₱{parseFloat(method.total).toLocaleString('en-US', {minimumFractionDigits: 0})}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No payment methods data</div>
          )}
        </div>
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
};

export default PaymentAnalytics;
