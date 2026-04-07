import { useMemo } from 'react';

export const usePermissions = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = user.permissions || {};

  const canPerformActions = (componentKey) => {
    const permission = permissions[componentKey];
    // Handle both old (boolean) and new (object) permission formats
    if (typeof permission === 'object') {
      return permission?.can_perform_actions !== false;
    }
    return permission !== false;
  };

  const canAccess = (componentKey) => {
    const permission = permissions[componentKey];
    // Handle both old (boolean) and new (object) permission formats
    if (typeof permission === 'object') {
      return permission?.can_access !== false;
    }
    return true; // Always accessible in old format
  };

  return {
    canPerformActions,
    canAccess,
    permissions,
    user
  };
};

export default usePermissions;
