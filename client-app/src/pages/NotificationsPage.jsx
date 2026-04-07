import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      await fetch(`http://localhost:8000/api/notifications/${notificationId}/mark-read`, {
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
      navigate('/my-services');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'requirement_approved':
        return '✅';
      case 'requirement_rejected':
        return '❌';
      default:
        return '📢';
    }
  };

  const getNotificationClass = (type) => {
    switch (type) {
      case 'requirement_approved':
        return 'bg-green-100 text-green-600';
      case 'requirement_rejected':
        return 'bg-red-100 text-red-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
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

  return (
    <div className="notifications-page">
      <div className="notifications-hero">
        <h1>Notifications</h1>
      </div>

      <div className="notifications-container">
        <div className="notifications-card">
          <div className="notifications-header">
            <div className="flex items-center justify-between mb-4">
              <h2>Notifications</h2>
            </div>
            
            <div className="notifications-tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`tab-button ${activeTab === 'unread' ? 'active' : ''}`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          <div className="notifications-body">
            {loading ? (
              <div className="empty-state">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-sm">Loading notifications...</p>
              </div>
            ) : filterNotifications().length === 0 ? (
              <div className="empty-state">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filterNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className={`notification-icon-badge ${getNotificationClass(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-details">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="notification-title">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <span className="unread-dot"></span>
                        )}
                      </div>
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <p className="notification-timestamp">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.some(n => !n.is_read) && (
            <div className="notifications-footer">
              <button className="mark-all-read-btn" onClick={markAllAsRead}>
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
