/**
 * Utility to generate sequential table row IDs starting from 1
 * This ensures all tables display IDs from 1, 2, 3... regardless of database IDs
 */

/**
 * Add sequential ID to each item in an array
 * @param {Array} items - Array of items to add sequential IDs to
 * @returns {Array} - Array with sequential IDs added
 */
export const addSequentialIds = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    ...item,
    sequentialId: index + 1
  }));
};

/**
 * Get sequential ID for an item based on its position in filtered array
 * @param {Array} items - The filtered/displayed items
 * @param {*} itemId - The database ID of the item
 * @returns {number} - The sequential ID (1-based)
 */
export const getSequentialId = (items, itemId) => {
  const index = items.findIndex(item => item.id === itemId);
  return index >= 0 ? index + 1 : 0;
};

/**
 * Get sequential ID for an item based on its index
 * @param {number} index - The array index (0-based)
 * @returns {number} - The sequential ID (1-based)
 */
export const getSequentialIdFromIndex = (index) => {
  return index + 1;
};
