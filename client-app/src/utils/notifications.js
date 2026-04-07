/**
 * Modern Notification System
 * Provides toast/notification functionality with modern design
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'notification-container top-right';
      document.body.appendChild(this.container);
    }
  }

  show(options = {}) {
    const {
      type = 'info',
      title = '',
      message = '',
      duration = 5000,
      position = 'top-right',
      icon = null,
      onClose = null
    } = options;

    // Update container position
    this.container.className = `notification-container ${position}`;

    // Create notification element
    const notification = document.createElement('div');
    const id = Date.now();
    notification.className = `notification ${type}`;
    notification.setAttribute('data-id', id);

    // Determine icon based on type
    let displayIcon = icon;
    if (!displayIcon) {
      const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      displayIcon = iconMap[type] || 'ℹ';
    }

    notification.innerHTML = `
      <div class="notification-icon">${displayIcon}</div>
      <div class="notification-content">
        ${title ? `<div class="notification-title">${title}</div>` : ''}
        ${message ? `<div class="notification-message">${message}</div>` : ''}
      </div>
      <button class="notification-close" aria-label="Close notification">×</button>
      <div class="notification-progress"></div>
    `;

    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.remove(id);
      if (onClose) onClose();
    });

    // Add to container
    this.container.appendChild(notification);
    this.notifications.push({ id, element: notification, onClose });

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      notification.element.classList.add('closing');

      setTimeout(() => {
        notification.element.remove();
        this.notifications.splice(index, 1);
        if (notification.onClose) {
          notification.onClose();
        }
      }, 300);
    }
  }

  success(title, message, options = {}) {
    return this.show({
      type: 'success',
      title,
      message,
      icon: '✓',
      ...options
    });
  }

  error(title, message, options = {}) {
    return this.show({
      type: 'error',
      title,
      message,
      icon: '✕',
      ...options
    });
  }

  warning(title, message, options = {}) {
    return this.show({
      type: 'warning',
      title,
      message,
      icon: '⚠',
      ...options
    });
  }

  info(title, message, options = {}) {
    return this.show({
      type: 'info',
      title,
      message,
      icon: 'ℹ',
      ...options
    });
  }

  clear() {
    this.notifications.forEach(notification => {
      notification.element.remove();
    });
    this.notifications = [];
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;

// Export individual functions for convenience
export const showNotification = (options) => notificationManager.show(options);
export const showSuccess = (title, message, options) => notificationManager.success(title, message, options);
export const showError = (title, message, options) => notificationManager.error(title, message, options);
export const showWarning = (title, message, options) => notificationManager.warning(title, message, options);
export const showInfo = (title, message, options) => notificationManager.info(title, message, options);
export const clearNotifications = () => notificationManager.clear();

