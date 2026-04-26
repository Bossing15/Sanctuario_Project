/**
 * CRUD Utility Functions for Admin Components
 */

export const crudUtils = {
  /**
   * Toggle status between Active and Inactive
   */
  toggleStatus: async (endpoint, id, currentStatus, token) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      
      const response = await fetch(`${window.location.protocol}//${window.location.host}${endpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data, newStatus };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update status' };
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete an item
   */
  deleteItem: async (endpoint, id, token) => {
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.host}${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        return { success: true, message: 'Item deleted successfully' };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to delete item' };
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update an item
   */
  updateItem: async (endpoint, id, data, token) => {
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.host}${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update item' };
      }
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create an item
   */
  createItem: async (endpoint, data, token) => {
    try {
      const response = await fetch(`${window.location.protocol}//${window.location.host}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, data: result };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to create item' };
      }
    } catch (error) {
      console.error('Error creating item:', error);
      return { success: false, error: error.message };
    }
  }
};

export default crudUtils;
