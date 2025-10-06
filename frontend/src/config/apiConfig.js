// API Configuration
const getApiBaseUrl = () => {
  // In production, use the environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || 'https://your-render-backend-url.onrender.com';
  }
  
  // In development, use localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_ENDPOINTS = {
  cases: `${API_BASE_URL}/api/cases`,
  upload: (caseId) => `${API_BASE_URL}/api/cases/${caseId}/upload`,
  download: (caseId, fileId) => `${API_BASE_URL}/api/cases/${caseId}/files/${fileId}/download`,
  health: `${API_BASE_URL}/api/health`
};

export default {
  API_BASE_URL,
  API_ENDPOINTS
};