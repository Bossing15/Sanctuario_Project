import { useMemo } from 'react';

export const usePermissions = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = user.permissions || {};

  /**
   * Simplified RBAC:
   * - Admin: Can perform all actions on all components
   * - Staff/Caretaker: Can perform actions only if component is enabled (true)
   *   If component is disabled (false), they can only view
   */
  const canPerformActions = (componentKey) => {
    // Admin can perform all actions
    if (user.access_level === 'admin' || user.role === 'admin') {
      return true;
    }

    // Staff/Caretaker can perform actions only if component is enabled (true)
    return permissions[componentKey] === true;
  };

  /**
   * Staff/Caretaker can view all components, even if disabled
   * Admin can view everything
   */
  const canView = (componentKey) => {
    // Admin can view everything
    if (user.access_level === 'admin' || user.role === 'admin') {
      return true;
    }

    // Staff/Caretaker can view all components
    return true;
  };

  /**
   * Check if component is disabled (view-only mode)
   * Returns true if component is disabled for this user
   */
  const isComponentDisabled = (componentKey) => {
    // Admin components are never disabled
    if (user.access_level === 'admin' || user.role === 'admin') {
      return false;
    }

    // Component is disabled if permission is false
    return permissions[componentKey] === false;
  };

  return {
    canPerformActions,
    canView,
    isComponentDisabled,
    permissions,
    user,
    isAdmin: user.access_level === 'admin' || user.role === 'admin',
    isStaff: user.access_level === 'staff' || user.role === 'staff',
    isCaretaker: user.access_level === 'caretaker' || user.role === 'caretaker',
  };
};

export default usePermissions;
