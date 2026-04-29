import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modern-modal.css';
import { useModalScrollLock } from '../hooks/useModalScrollLock';

const NotificationModal = ({ isOpen, onClose, triggerButtonRef, onUnreadCountChange }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [readNotifications, setReadNotifications] = useState(new Set());
  const modalRef = useRef(null);

  // Lock scroll when modal is open
  useModalScrollLock(isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking the trigger button
      if (triggerButtonRef?.current && triggerButtonRef.current.contains(event.target)) {
        return;
      }
      
      // Close if clicking outside the modal
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
  }, [isOpen, onClose, triggerButtonRef]);

  const notifications = [
    {
      id: 1,
      type: 'payment',
      title: 'New Payment Received',
      message: 'Maria Dela Cruz completed payment for Grave Maintenance service',
      time: '5 minutes ago',
      read: false,
      icon: 'payment',
      color: 'forest-green'
    },
    {
      id: 2,
      type: 'client',
      title: 'New Client Registration',
      message: 'Juan Santos registered as a new client',
      time: '1 hour ago',
      read: false,
      icon: 'client',
      color: 'blue'
    },
    {
      id: 3,
      type: 'service',
      title: 'Service Request',
      message: 'Pedro Garcia requested Grave Restoration service',
      time: '2 hours ago',
      read: true,
      icon: 'service',
      color: 'purple'
    },
    {
      id: 4,
      type: 'pending',
      title: 'Payment Pending',
      message: 'Ana Martinez has a pending payment for Monthly Plan',
      time: '3 hours ago',
      read: true,
      icon: 'pending',
      color: 'orange'
    },
    {
      id: 5,
      type: 'system',
      title: 'System Update',
      message: 'Database backup completed successfully',
      time: '5 hours ago',
      read: true,
      icon: 'system',
      color: 'forest-green'
    },
    {
      id: 6,
      type: 'client',
      title: 'Client Update',
      message: 'Rosa Cruz updated their profile information',
      time: '1 day ago',
      read: true,
      icon: 'client',
      color: 'blue'
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

  const unreadCount = notifications.filter(n => !n.read && !readNotifications.has(n.id)).length;

  // Notify parent of unread count changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'payment':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0 1 1 0 012 0zM7 6h.01M7 3h5c.582 0 1.063.213 1.367.573m-6.367 5.428V9m0 0a1 1 0 10-2 0m2 0a1 1 0 11-2 0m0-5a1 1 0 10-2 0 1 1 0 012 0z" />
          </svg>
        );
      case 'client':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'service':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0-10a9 9 0 110 18 9 9 0 010-18z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // Responsive styles based on viewport width
  const getNotificationStyles = () => {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    const isIphone12Pro = window.innerWidth <= 390;

    if (isIphone12Pro) {
      return {
        position: 'fixed',
        top: '50px',
        right: '8px',
        left: '8px',
        width: 'auto',
        maxHeight: 'calc(100vh - 70px)',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 20px 50px -12px rgba(13, 20, 16, 0.3)',
        border: '2px solid #2A4D36',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
      };
    } else if (isSmallMobile) {
      return {
        position: 'fixed',
        top: '52px',
        right: '12px',
        left: '12px',
        width: 'auto',
        maxHeight: 'calc(100vh - 72px)',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 20px 50px -12px rgba(13, 20, 16, 0.3)',
        border: '2px solid #2A4D36',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
      };
    } else if (isMobile) {
      return {
        position: 'fixed',
        top: '56px',
        right: '16px',
        left: '16px',
        width: 'auto',
        maxHeight: 'calc(100vh - 76px)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 50px -12px rgba(13, 20, 16, 0.3)',
        border: '2px solid #2A4D36',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
      };
    } else {
      // Desktop
      return {
        position: 'fixed',
        top: '60px',
        right: '20px',
        width: '400px',
        maxHeight: '600px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 50px -12px rgba(13, 20, 16, 0.3)',
        border: '2px solid #2A4D36',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
      };
    }
  };

  return createPortal(
    <div 
      ref={modalRef}
      style={getNotificationStyles()}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
        flexShrink: 0
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '700', color: '#0D1A12' }}>Notifications</h3>
        
        {/* Segmented Controller */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '6px' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTab === 'all' ? 'white' : 'transparent',
              color: activeTab === 'all' ? '#1B3022' : '#9ca3af',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: activeTab === 'unread' ? 'white' : 'transparent',
              color: activeTab === 'unread' ? '#1B3022' : '#9ca3af',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', minWidth: 0 }}>
        {filterNotifications().length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ margin: '0', fontSize: '14px' }}>No notifications</p>
          </div>
        ) : (
          filterNotifications().map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: readNotifications.has(notification.id) ? '#ffffff' : '#f9fafb',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                minWidth: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = readNotifications.has(notification.id) ? '#ffffff' : '#f9fafb'}
            >
              {/* Icon Circle */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: notification.color === 'forest-green' ? '#d1fae5' : notification.color === 'blue' ? '#dbeafe' : '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: notification.color === 'forest-green' ? '#065f46' : notification.color === 'blue' ? '#1e40af' : '#92400e',
                flexShrink: 0
              }}>
                {renderIcon(notification.icon)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {notification.title}
                </h4>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {notification.message}
                </p>
                <p style={{ margin: '0', fontSize: '11px', color: '#9ca3af' }}>
                  {notification.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#f9fafb',
        flexShrink: 0
      }}>
        <button style={{
          width: '100%',
          padding: '8px 12px',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: 'transparent',
          color: '#1B3022',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 200ms ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Mark all as read
        </button>
      </div>
    </div>,
    document.body
  );
};

export default NotificationModal;
