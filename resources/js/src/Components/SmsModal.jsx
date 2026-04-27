import { useState, useEffect } from 'react';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

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

  // Lock scroll when modal is open
  useModalScrollLock(isOpen);

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modern-modal-header">
          <h2>Send SMS</h2>
          <button className="modern-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modern-modal-content">
          {/* Tabs */}
          <div className="modal-section">
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '6px', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('single')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'single' ? '#1B3022' : 'transparent',
                  color: activeTab === 'single' ? 'white' : '#9ca3af',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                Single SMS
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: activeTab === 'bulk' ? '#1B3022' : 'transparent',
                  color: activeTab === 'bulk' ? 'white' : '#9ca3af',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                Bulk SMS
              </button>
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <div className={result.success ? 'modal-success-message' : 'modal-error-message'}>
              <p style={{ margin: '0' }}>{result.message}</p>
            </div>
          )}

          {/* Phone Number Input - Single SMS */}
          {activeTab === 'single' && (
            <div className="modal-section">
              <span className="modal-section-title">Phone Number</span>
              <div className="modal-form-group">
                <input
                  type="text"
                  value={singlePhone}
                  onChange={(e) => setSinglePhone(e.target.value)}
                  placeholder="09XXXXXXXXX or 639XXXXXXXXX"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '14px' }}
                />
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px', margin: '6px 0 0 0' }}>Format: 09XXXXXXXXX or 639XXXXXXXXX</p>
              </div>
            </div>
          )}

          {/* Recipients Selection - Bulk SMS */}
          {activeTab === 'bulk' && (
            <div className="modal-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="modal-section-title" style={{ margin: '0' }}>Select Recipients ({selectedClients.length} selected)</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={selectAll}
                    style={{ fontSize: '12px', color: '#1B3022', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                  <p>Loading clients...</p>
                </div>
              ) : (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
                  {clients.map((client) => (
                    <label
                      key={client.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                        backgroundColor: selectedClients.includes(client.id) ? '#f0fdf4' : 'white',
                        transition: 'all 200ms ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedClients.includes(client.id) ? '#f0fdf4' : 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClientSelection(client.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1B3022' }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{client.name}</p>
                        <p style={{ margin: '0', fontSize: '12px', color: '#9ca3af' }}>{client.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', margin: '8px 0 0 0' }}>Use {'{name}'} in your message to personalize it</p>
            </div>
          )}

          {/* Message Input */}
          <div className="modal-section">
            <span className="modal-section-title">Message</span>
            <div className="modal-form-group">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={maxLength}
                placeholder={activeTab === 'bulk' ? "Hello {name}, your appointment is confirmed..." : "Enter your message here..."}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit', fontSize: '14px', minHeight: '100px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
                <span>{remainingChars} characters remaining</span>
                <span style={{ fontWeight: '600', color: remainingChars < 20 ? '#dc2626' : '#9ca3af' }}>
                  {message.length}/{maxLength}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modern-modal-footer">
          <button
            className="modal-btn-secondary"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            className="modal-btn-primary"
            onClick={handleSendSms}
            disabled={sending || !message.trim() || (activeTab === 'single' && !singlePhone.trim()) || (activeTab === 'bulk' && selectedClients.length === 0)}
          >
            {sending ? 'Sending...' : `Send SMS ${activeTab === 'bulk' ? `(${selectedClients.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsModal;
