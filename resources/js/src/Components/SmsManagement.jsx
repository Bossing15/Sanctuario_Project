import { useState, useEffect } from "react";
import { TableSkeleton } from "./SkeletonLoader";
import smsIcon from '../assets/icons/totalcustomers.png';
import StatsCards from "./StatsCards";
import "./SmsManagement.css";

const SmsManagement = () => {
  const [activeTab, setActiveTab] = useState('send'); // send, reminders, logs, balance
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success, error, info

  // Send SMS state
  const [smsForm, setSmsForm] = useState({
    phone: '',
    message: '',
    reference: '',
  });
  const [bulkPhones, setBulkPhones] = useState('');
  const [isBulk, setIsBulk] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(null);

  // Payment reminders state
  const [daysUntilDue, setDaysUntilDue] = useState(3);
  const [reminderStatus, setReminderStatus] = useState(null);

  // SMS logs state
  const [smsLogs, setSmsLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Balance state
  const [balance, setBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Clients state
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const token = localStorage.getItem('authToken');
  const API_BASE = '/api';

  // Fetch SMS logs
  const fetchSmsLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await fetch(`${API_BASE}/sms/logs?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch SMS logs');

      const data = await response.json();
      setSmsLogs(data.data || []);
    } catch (err) {
      console.error('Error fetching SMS logs:', err);
      setError('Failed to fetch SMS logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch SMS balance
  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const response = await fetch(`${API_BASE}/sms/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch balance');

      const data = await response.json();
      setBalance(data.data);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch SMS balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await fetch(`${API_BASE}/sms/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch clients');

      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients');
    } finally {
      setClientsLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchSmsLogs();
    } else if (activeTab === 'balance') {
      fetchBalance();
    } else if (activeTab === 'send') {
      fetchClients();
    }
  }, [activeTab]);

  // Send single SMS
  const handleSendSms = async (e) => {
    e.preventDefault();
    if (!smsForm.phone || !smsForm.message) {
      setMessageType('error');
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/sms/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smsForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage('SMS sent successfully!');
        setSmsForm({ phone: '', message: '', reference: '' });
        setSendingStatus(data);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to send SMS');
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
      setMessageType('error');
      setMessage('Error sending SMS');
    } finally {
      setLoading(false);
    }
  };

  // Send bulk SMS
  const handleSendBulkSms = async (e) => {
    e.preventDefault();
    if (!bulkPhones || !smsForm.message) {
      setMessageType('error');
      setMessage('Please fill in all required fields');
      return;
    }

    const phones = bulkPhones.split('\n').map(p => p.trim()).filter(p => p);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/sms/send-bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phones,
          message: smsForm.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage(`SMS sent to ${data.successful} out of ${data.count} recipients`);
        setBulkPhones('');
        setSmsForm({ ...smsForm, message: '' });
        setSendingStatus(data);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to send bulk SMS');
      }
    } catch (err) {
      console.error('Error sending bulk SMS:', err);
      setMessageType('error');
      setMessage('Error sending bulk SMS');
    } finally {
      setLoading(false);
    }
  };

  // Send payment reminders
  const handleSendPaymentReminders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/sms/send-payment-reminders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days_until_due: daysUntilDue }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage(`Payment reminders sent to ${data.successful} out of ${data.count} clients`);
        setReminderStatus(data);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to send payment reminders');
      }
    } catch (err) {
      console.error('Error sending payment reminders:', err);
      setMessageType('error');
      setMessage('Error sending payment reminders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="p-8 min-h-screen flex-grow">
        {/* Header */}
        <div className="flex items-center mb-8">
          <img
            src={smsIcon}
            alt="SMS Icon"
            className="w-10 h-10 object-contain mr-4"
          />
          <div>
            <h3 className="text-3xl font-bold text-gray-800">SMS Management</h3>
            <p className="text-gray-600 mt-1">Send SMS messages and manage payment reminders</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'send'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Send SMS
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'reminders'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Payment Reminders
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'logs'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            SMS Logs
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'balance'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Balance
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : messageType === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* Send SMS Tab */}
        {activeTab === 'send' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Single SMS */}
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Send Single SMS</h4>
                <form onSubmit={handleSendSms} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="+63912345678"
                      value={smsForm.phone}
                      onChange={(e) => setSmsForm({ ...smsForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message * ({smsForm.message.length}/160)
                    </label>
                    <textarea
                      placeholder="Enter your message"
                      value={smsForm.message}
                      onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value.slice(0, 160) })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reference (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Reference ID"
                      value={smsForm.reference}
                      onChange={(e) => setSmsForm({ ...smsForm, reference: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send SMS'}
                  </button>
                </form>
              </div>

              {/* Bulk SMS */}
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Send Bulk SMS</h4>
                <form onSubmit={handleSendBulkSms} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Numbers * (one per line)
                    </label>
                    <textarea
                      placeholder="+63912345678&#10;+63987654321&#10;09123456789"
                      value={bulkPhones}
                      onChange={(e) => setBulkPhones(e.target.value)}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message * ({smsForm.message.length}/160)
                    </label>
                    <textarea
                      placeholder="Enter your message"
                      value={smsForm.message}
                      onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value.slice(0, 160) })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Bulk SMS'}
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Select Clients */}
            {clients.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Select Clients</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {clients.slice(0, 9).map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSmsForm({ ...smsForm, phone: client.phone })}
                      className="p-3 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-600 transition-colors text-left"
                    >
                      <div className="font-semibold text-gray-800">{client.name}</div>
                      <div className="text-sm text-gray-600">{client.phone}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-6">Send Payment Reminders</h4>
            <div className="max-w-md">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Send reminders for payments due within (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={daysUntilDue}
                  onChange={(e) => setDaysUntilDue(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <button
                onClick={handleSendPaymentReminders}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Payment Reminders'}
              </button>
            </div>

            {reminderStatus && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h5 className="font-semibold text-gray-800 mb-4">Reminder Status</h5>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700">
                    <strong>Total:</strong> {reminderStatus.count} clients
                  </p>
                  <p className="text-green-700">
                    <strong>Successful:</strong> {reminderStatus.successful} reminders sent
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SMS Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-6">SMS Logs</h4>
            {logsLoading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : smsLogs.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No SMS logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smsLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800 font-mono text-sm">{log.phone}</td>
                        <td className="py-3 px-4 text-gray-800 text-sm">{log.message.substring(0, 50)}...</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Balance Tab */}
        {activeTab === 'balance' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-6">SMS Balance</h4>
            {balanceLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : balance ? (
              <div className="max-w-md">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm mb-2">Current Balance</p>
                  <p className="text-4xl font-bold text-green-600">{balance.balance || 0}</p>
                  <p className="text-gray-600 text-sm mt-2">SMS Credits Available</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Unable to fetch balance</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmsManagement;
