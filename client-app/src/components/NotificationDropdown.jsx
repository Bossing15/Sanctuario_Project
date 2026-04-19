import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationDropdown.css';

function NotificationDropdown({ isOpen, onClose, buttonRef }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown AND outside the button
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('http://localhost:8000/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.booking_id) {
      onClose();
      navigate('/my-services');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'requirement_approved':
        return '✅';
      case 'requirement_rejected':
        return '❌';
      case 'payment':
        return '💰';
      case 'service':
        return '🔧';
      case 'maintenance':
        return '🏞️';
      default:
        return '📢';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'requirement_approved':
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'requirement_rejected':
        return 'bg-red-100 text-red-600';
      case 'service':
        return 'bg-purple-100 text-purple-600';
      case 'maintenance':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const filterNotifications = () => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.is_read);
    }
    return notifications;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="notification-dropdown"
    >
      <div className="notification-dropdown-header">
        <div className="notification-header-top">
          <h3>Notifications</h3>
          <button 
            onClick={onClose}
            className="notification-close-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="notification-tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`notification-tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`notification-tab ${activeTab === 'unread' ? 'active' : ''}`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      <div className="notification-dropdown-body">
        {loading ? (
          <div className="notification-skeleton-list">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="notification-skeleton-item">
                <div className="notification-skeleton-icon"></div>
                <div className="notification-skeleton-content">
                  <div className="notification-skeleton-title"></div>
                  <div className="notification-skeleton-message"></div>
                  <div className="notification-skeleton-time"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filterNotifications().length === 0 ? (
          <div className="notification-empty">
            <div className="notification-empty-icon">🔔</div>
            <p>No notifications</p>
          </div>
        ) : (
          filterNotifications().map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-item-content">
                <div className={`notification-icon ${getNotificationClass(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-text">
                  <div className="notification-title-row">
                    <h4>{notification.title}</h4>
                    {!notification.is_read && (
                      <span className="notification-unread-dot"></span>
                    )}
                  </div>
                  <p className="notification-message">
                    {notification.message}
                  </p>
                  <p className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.some(n => !n.is_read) && (
        <div className="notification-dropdown-footer">
          <button onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
