import axios from 'axios';
import { axiosInstance } from './axiosConfig';

// Main API instance with interceptors for auth
const api = axiosInstance;

// Create a function for direct public API calls without authentication requirements
export const publicApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Create a more user-friendly error object
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.status === 400) {
        // Handle validation errors
        if (error.response.data && error.response.data.defaultMessage) {
          errorMessage = error.response.data.defaultMessage;
        } else if (error.response.data && Array.isArray(error.response.data)) {
          errorMessage = error.response.data[0]?.defaultMessage || 'Invalid input. Please check your data.';
        } else {
          errorMessage = 'Invalid input. Please check the form for errors.';
        }
      } else if (error.response.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
        
        // Clear auth data and redirect to login for unauthorized access
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
      } else if (error.response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      // Enhance error object
      error.userMessage = errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your internet connection.';
      error.userMessage = errorMessage;
    } else {
      // Something happened in setting up the request that triggered an Error
      error.userMessage = errorMessage;
    }
    
    // Add the user-friendly message to the error
    error.message = errorMessage;
    
    return Promise.reject(error);
  }
);

export default api; 