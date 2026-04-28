import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook to manage token expiration and auto-logout
 * Checks token expiration on mount and periodically
 */
export const useTokenExpiration = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('authToken');
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      const userRole = localStorage.getItem('userRole');

      if (!token || !expiresAt) {
        return;
      }

      const expirationTime = parseInt(expiresAt) * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // If token has expired
      if (timeUntilExpiration <= 0) {
        handleTokenExpiration(userRole);
        return;
      }

      // If token expires in less than 5 minutes, show warning
      if (timeUntilExpiration < 5 * 60 * 1000) {
        console.warn('Token will expire soon');
      }
    };

    const handleTokenExpiration = (userRole) => {
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');

      // Redirect to appropriate login page
      if (userRole === 'admin') {
        navigate('/admin/login');
      } else {
        navigate('/login');
      }

      console.log('Token expired, user logged out');
    };

    // Check on mount
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [navigate]);
};

/**
 * Check if token is still valid
 * @returns {boolean} true if token is valid, false if expired or missing
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('authToken');
  const expiresAt = localStorage.getItem('tokenExpiresAt');

  if (!token || !expiresAt) {
    return false;
  }

  const expirationTime = parseInt(expiresAt) * 1000;
  const currentTime = Date.now();

  return currentTime < expirationTime;
};

/**
 * Get time remaining until token expiration
 * @returns {number} milliseconds until expiration, or 0 if expired
 */
export const getTimeUntilExpiration = () => {
  const expiresAt = localStorage.getItem('tokenExpiresAt');

  if (!expiresAt) {
    return 0;
  }

  const expirationTime = parseInt(expiresAt) * 1000;
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;

  return timeRemaining > 0 ? timeRemaining : 0;
};

/**
 * Format time remaining until expiration
 * @returns {string} formatted time string (e.g., "2 hours 30 minutes")
 */
export const formatTimeRemaining = () => {
  const timeRemaining = getTimeUntilExpiration();

  if (timeRemaining <= 0) {
    return 'Expired';
  }

  const seconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours % 24} hour${(hours % 24) !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} minute${(minutes % 60) !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''}`;
  }
};
