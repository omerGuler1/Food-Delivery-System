import api from './api';
import { 
  LoginRequest, 
  AdminLoginRequest,
  CustomerRegisterRequest,
  RestaurantRegisterRequest,
  CourierRegisterRequest,
  Customer,
  Restaurant, 
  Courier,
  Admin
} from '../interfaces';

// Customer authentication
export const customerLogin = async (data: LoginRequest) => {
  try {
    const response = await api.post<Customer>('/customer/auth/login', data);
    if (response.status === 200) {
      // Save auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userType', 'customer');
    }
    return response.data;
  } catch (error: any) {
    console.error('Customer login error:', error);
    throw error;
  }
};

export const customerRegister = async (data: CustomerRegisterRequest) => {
  try {
    const response = await api.post<Customer>('/customer/auth/register', data);
    if (response.status === 200) {
      // Save auth data after successful registration
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userType', 'customer');
    }
    return response.data;
  } catch (error: any) {
    console.error('Customer register error:', error);
    throw error;
  }
};

// Restaurant authentication
export const restaurantLogin = async (data: LoginRequest) => {
  try {
    const response = await api.post<Restaurant>('/restaurant/auth/login', data);
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userType', 'restaurant');
      
      // Check approval status
      if (response.data.approvalStatus === 'PENDING' || response.data.approvalStatus === 'REJECTED') {
        // Still allow login but the protected route will redirect to pending approval page
      }
    }
    return response.data;
  } catch (error: any) {
    console.error('Restaurant login error:', error);
    throw error;
  }
};

export const restaurantRegister = async (data: RestaurantRegisterRequest) => {
  try {
    const response = await api.post<Restaurant>('/restaurant/auth/register', data);
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userType', 'restaurant');
    }
    return response.data;
  } catch (error: any) {
    console.error('Restaurant register error:', error);
    throw error;
  }
};

// Courier authentication
export const courierLogin = async (data: LoginRequest) => {
  try {
    const response = await api.post<Courier>('/courier/auth/login', data);
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userType', 'courier');
      
      // Check approval status
      if (response.data.approvalStatus === 'PENDING' || response.data.approvalStatus === 'REJECTED') {
        // Still allow login but the protected route will redirect to pending approval page
      }
    }
    return response.data;
  } catch (error: any) {
    console.error('Courier login error:', error);
    throw error;
  }
};

export const courierRegister = async (data: CourierRegisterRequest) => {
  try {
    const response = await api.post<Courier>('/courier/auth/register', data);
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userType', 'courier');
    }
    return response.data;
  } catch (error: any) {
    console.error('Courier register error:', error);
    throw error;
  }
};

// Admin authentication
export const adminLogin = async (data: AdminLoginRequest) => {
  try {
    const response = await api.post<Admin>('/admin/login', data);
    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('userType', 'admin');
    }
    return response.data;
  } catch (error: any) {
    console.error('Admin login error:', error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    // Call the logout endpoint
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always clear local storage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Get the current user data
export const getCurrentUser = (): Customer | Restaurant | Courier | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get the current user type
export const getUserType = (): string | null => {
  return localStorage.getItem('userType');
}; 