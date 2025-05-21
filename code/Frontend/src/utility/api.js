import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND,
  headers: {
    'Content-Type': 'application/json',
  },
  maxRedirects: 0,  
});

// Add a request interceptor to add the auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access detected');
      
      // Handle different 401 scenarios
      const errorMsg = error.response.data?.message || '';
      
      if (errorMsg.includes('User account has been deactivated') || 
          errorMsg.includes('Your admin privileges have been revoked')) {
        // Clear local storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('organizationid');
        
        // Show a message to the user before redirecting
        alert('Your session has expired or your access has been revoked. Please log in again.');
        
        // Redirect to the login page
        window.location.href = '/auth';
        return Promise.reject(new Error('Session expired'));
      }
    }
    
    // Handle 403 Forbidden errors (no permission)
    if (error.response && error.response.status === 403) {
      console.log('Forbidden access detected');
      
      // If it's specifically about admin privileges being revoked
      const errorMsg = error.response.data?.message || '';
      if (errorMsg.includes('admin privileges') || 
          errorMsg.includes('not authorized as an admin')) {
        // Clear local storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('organizationid');
        
        // Show a message to the user before redirecting
        alert('Your admin privileges have been revoked.');
        
        // Redirect to the login page
        window.location.href = '/auth';
        return Promise.reject(new Error('Admin privileges revoked'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 