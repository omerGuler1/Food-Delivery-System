import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  getUserType,
  logout
} from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token for authenticated requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Create a more user-friendly error object
    let errorMessage = 'Something went wrong. Please try again.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.data && (error.response.data as any).message) {
        errorMessage = (error.response.data as any).message;
      } else if (error.response.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.status === 400) {
        // Handle validation errors
        if (error.response.data && (error.response.data as any).defaultMessage) {
          errorMessage = (error.response.data as any).defaultMessage;
        } else if (error.response.data && Array.isArray(error.response.data)) {
          errorMessage = (error.response.data[0]?.defaultMessage) || 'Invalid input. Please check your data.';
        } else {
          errorMessage = 'Invalid input. Please check the form for errors.';
        }
      } else if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        
        // Handle unauthorized access (401)
        // Clear auth data using logout function
        logout();
        
        // Redirect based on user type
        const userType = getUserType();
        if (userType) {
          const loginRoute = 
            userType === 'customer' ? '/login' : 
            userType === 'restaurant' ? '/restaurant/login' : 
            userType === 'courier' ? '/courier/login' : '/login';
          
          window.location.href = loginRoute;
        } else {
          window.location.href = '/login';
        }
      } else if (error.response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.response.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      // Enhance error object
      (error as any).userMessage = errorMessage;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your internet connection.';
      (error as any).userMessage = errorMessage;
    } else {
      // Something happened in setting up the request that triggered an Error
      (error as any).userMessage = errorMessage;
    }
    
    // Add the user-friendly message to the error
    error.message = errorMessage;
    
    return Promise.reject(error);
  }
);

export { axiosInstance };
export default axiosInstance; 