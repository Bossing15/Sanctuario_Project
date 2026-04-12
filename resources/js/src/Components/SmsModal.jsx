import { useState, useEffect } from 'react';

const SmsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('single');
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [result, setResult] = useState(null);
  const [clickedClients, setClickedClients] = useState(new Set());

  const maxLength = 160;
  const remainingChars = maxLength - message.length;

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/sms/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (activeTab === 'single' && !singlePhone.trim()) {
      alert('Please enter a phone number');
      return;
    }

    if (activeTab === 'bulk' && selectedClients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const token = localStorage.getItem('authToken');
      
      if (activeTab === 'single') {
        const response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            phone: singlePhone,
            message: message
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setResult({ success: true, message: 'SMS sent successfully!' });
          setSinglePhone('');
          setMessage('');
        } else {
          setResult({ success: false, message: data.message });
        }
      } else {
        const recipients = selectedClients.map(id => {
          const client = clients.find(c => c.id === id);
          return {
            phone: client.phone,
            name: client.name
          };
        });

        const response = await fetch('/api/sms/send-bulk', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            recipients: recipients,
            message: message
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setResult({ 
            success: true, 
            message: `Sent ${data.sent} of ${data.total} messages successfully!`,
            details: data
          });
          setSelectedClients([]);
          setMessage('');
        } else {
          setResult({ success: false, message: 'Failed to send bulk SMS' });
        }
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      setResult({ success: false, message: 'Error sending SMS. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const toggleClientSelection = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
    setClickedClients(prev => new Set([...prev, clientId]));
  };

  const selectAll = () => {
    setSelectedClients(clients.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedClients([]);
  };

  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          Send SMS
        </h3>
        <p className="text-gray-600 text-sm">Send single or bulk SMS messages to your clients</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
            activeTab === 'single'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
          }`}
        >
          Single SMS
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
            activeTab === 'bulk'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
          }`}
        >
          Bulk SMS
        </button>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`p-4 rounded-xl border-l-4 ${result.success ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
          <p className="font-medium">{result.message}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        {activeTab === 'single' && (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Phone Number
            </label>
            <input
              type="text"
              value={singlePhone}
              onChange={(e) => setSinglePhone(e.target.value)}
              placeholder="09XXXXXXXXX or 639XXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">Format: 09XXXXXXXXX or 639XXXXXXXXX</p>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-800">
                Select Recipients ({selectedClients.length} selected)
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs text-gray-600 hover:text-gray-700 font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading clients...</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto bg-gray-50">
                {clients.map((client) => (
                  <label
                    key={client.id}
                    className={`flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                      clickedClients.has(client.id) ? 'bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">Use {'{name}'} in your message to personalize it</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={maxLength}
            rows="5"
            placeholder={activeTab === 'bulk' ? "Hello {name}, your appointment is confirmed..." : "Enter your message here..."}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {remainingChars} characters remaining
            </p>
            <p className={`text-xs font-semibold ${remainingChars < 20 ? 'text-red-600' : 'text-gray-600'}`}>
              {message.length}/{maxLength}
            </p>
          </div>
        </div>

        <button
          onClick={handleSendSms}
          disabled={sending || !message.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
        >
          {sending ? 'Sending...' : `Send SMS ${activeTab === 'bulk' ? `(${selectedClients.length})` : ''}`}
        </button>
      </div>
    </div>
  );
};

export default SmsModal;
