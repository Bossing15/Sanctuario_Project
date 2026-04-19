// API Configuration
export const API_BASE_URL = 'http://localhost:8000';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
