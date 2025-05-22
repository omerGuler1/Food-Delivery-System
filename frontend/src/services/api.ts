import axios from 'axios';
import { useError } from '../contexts/ErrorContext';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global error handler function
let showErrorMessage: ((message: string) => void) | null = null;

// Function to set the error handler from components
export const setErrorHandler = (handler: (message: string) => void) => {
  showErrorMessage = handler;
};

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
    let shouldRedirectToHome = false;
    
    // Special case for admin verify endpoint
    const isAdminVerifyRequest = error.config && error.config.url && 
                                error.config.url.includes('/admin/verify');
    
    // If this is the admin verify endpoint and it failed with 404, just return false instead of showing an error
    if (isAdminVerifyRequest && error.response && error.response.status === 404) {
      console.log('Admin verify endpoint not found, silently handling');
      return Promise.reject(error);
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
      
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
        // Check if this is due to a deleted account
        const responseData = error.response.data;
        const responseText = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
        
        if (responseText && 
            (responseText.includes('account has been deleted') || 
             responseText.includes('User account has been deleted'))) {
          errorMessage = 'Your account has been deleted. You will be redirected to the home page.';
          shouldRedirectToHome = true;
        } else {
          errorMessage = 'Your session has expired. Please log in again.';
        }
        
        // Clear auth data for unauthorized access
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
      } else if (error.response.status === 403) {
        // Handle forbidden access (could be a deleted account)
        errorMessage = 'Access denied. Your account may have been deleted or suspended.';
        
        // Clear auth data and set redirect flag
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        shouldRedirectToHome = true;
      } else if (error.response.status === 404) {
        // Check if this is a user not found error
        const responseData = error.response.data;
        const responseText = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
        
        if (responseText && 
            (responseText.includes('not found') || 
             responseText.includes('deleted'))) {
          errorMessage = 'Your account has been deleted. You will be redirected to the home page.';
          
          // Clear auth data and set redirect flag
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userType');
          shouldRedirectToHome = true;
        } else {
          errorMessage = 'Resource not found.';
        }
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
    
    // Display user-friendly error message
    console.error('API Error:', errorMessage);
    
    // Show error dialog if handler is set and not a verify endpoint
    if (showErrorMessage && !shouldRedirectToHome && !error.config?.url?.includes('/verify')) {
      showErrorMessage(errorMessage);
    }
    
    // Redirect to home page if needed
    if (shouldRedirectToHome) {
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;