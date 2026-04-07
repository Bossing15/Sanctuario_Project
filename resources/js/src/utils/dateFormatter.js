/**
 * Format date to "Month Day, Year" format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "November 6, 2025")
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
