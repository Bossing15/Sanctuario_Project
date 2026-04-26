import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const NotificationModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [readNotifications, setReadNotifications] = useState(new Set());
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'New Payment Received',
      message: 'Maria Dela Cruz completed payment for Grave Maintenance service',
      time: '5 minutes ago',
      read: false,
      icon: 'Payment',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 2,
      type: 'client',
      title: 'New Client Registration',
      message: 'Juan Santos registered as a new client',
      time: '1 hour ago',
      read: false,
      icon: 'Client',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 3,
      type: 'service',
      title: 'Service Request',
      message: 'Pedro Garcia requested Grave Restoration service',
      time: '2 hours ago',
      read: true,
      icon: 'Service',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Pending',
      message: 'Ana Martinez has a pending payment for Monthly Plan',
      time: '3 hours ago',
      read: true,
      icon: 'Pending',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      message: 'Database backup completed successfully',
      time: '5 hours ago',
      read: true,
      icon: 'System',
      color: 'bg-gray-100 text-gray-600'
    },
    {
      id: 6,
      type: 'client',
      title: 'Client Update',
      message: 'Rosa Cruz updated their profile information',
      time: '1 day ago',
      read: true,
      icon: 'Update',
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const filterNotifications = () => {
    if (activeTab === 'unread') {
      return notifications.filter(n => !n.read && !readNotifications.has(n.id));
    }
    return notifications;
  };

  const handleNotificationClick = (notificationId) => {
    setReadNotifications(prev => new Set([...prev, notificationId]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return createPortal(
    <div 
      ref={modalRef}
      className="fixed top-16 right-4 w-96 max-h-[600px] bg-white rounded-xl shadow-xl z-[9999] overflow-hidden border border-gray-100"
    >
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">Notifications</h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-white text-gray-700' 
                  : 'bg-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'unread' 
                  ? 'bg-white text-gray-700' 
                  : 'bg-gray-700 text-white hover:bg-gray-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[480px]">
          {filterNotifications().length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            filterNotifications().map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  readNotifications.has(notification.id) ? '!bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${notification.color} flex items-center justify-center text-xl`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <button className="w-full text-center text-sm text-gray-600 hover:text-gray-700 font-medium py-2 hover:bg-gray-100 rounded-lg transition-colors">
            Mark all as read
          </button>
        </div>
    </div>,
    document.body
  );
};

export default NotificationModal;
