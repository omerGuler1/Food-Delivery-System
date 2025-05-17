import api from './api';
import { Customer, Restaurant, Courier } from '../interfaces';

// Generic profile fetch function
export const getProfile = async (): Promise<Customer | Restaurant | Courier> => {
  const response = await api.get('/profile');
  return response.data;
};

// Type-specific profile fetch functions
export const getCustomerProfile = async (): Promise<Customer> => {
  const response = await api.get('/profile/customer');
  return response.data;
};

export const getRestaurantProfile = async (): Promise<Restaurant> => {
  const response = await api.get('/profile/restaurant');
  return response.data;
};

export const getCourierProfile = async (courierId: number): Promise<Courier> => {
  const response = await api.get(`/courier/profile/${courierId}`);
  return response.data;
};

// Update restaurant profile
export const updateRestaurantProfile = async (profileData: Partial<Restaurant>): Promise<Restaurant> => {
  const response = await api.put('/profile/restaurant', profileData);
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData: Partial<Customer | Restaurant | Courier>): Promise<Customer | Restaurant | Courier> => {
  const response = await api.put('/profile', profileData);
  return response.data;
};

// Update password
export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const updatePassword = async (passwordData: PasswordUpdateRequest): Promise<any> => {
  const response = await api.put('/profile/password', passwordData);
  return response.data;
};

// Delete account
export interface DeleteAccountRequest {
  userId: number;
  confirmation: boolean;
}

export const deleteAccount = async (deleteData: DeleteAccountRequest): Promise<any> => {
  const response = await api.delete('/profile', { data: deleteData });
  return response.data;
};

// Address management (for customers only)
export interface Address {
  id?: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get('/profile/addresses');
  return response.data;
};

export const addAddress = async (addressData: Address): Promise<Address> => {
  const response = await api.post('/profile/addresses', addressData);
  return response.data;
};

export const updateAddress = async (addressId: number, addressData: Address): Promise<Address> => {
  const response = await api.put(`/profile/addresses/${addressId}`, addressData);
  return response.data;
};

export const deleteAddress = async (addressId: number): Promise<any> => {
  const response = await api.delete(`/profile/addresses/${addressId}`);
  return response.data;
};

// Upload profile image
export const uploadProfileImage = async (formData: FormData): Promise<{ imageUrl: string }> => {
  const response = await api.post('/profile/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateCourierProfile = async (courierId: number, profileData: Partial<Courier>): Promise<Courier> => {
  const response = await api.put(`/courier/profile/${courierId}`, profileData);
  return response.data;
};

export const updateCourierPassword = async (courierId: number, passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
  const response = await api.put(`/courier/profile/${courierId}/password`, passwordData);
  return response.data;
};

export const deleteCourierAccount = async (courierId: number) => {
  const response = await api.delete(`/courier/profile/${courierId}`);
  return response.data;
};

export const uploadRestaurantProfileImage = async (formData: FormData): Promise<{ imageUrl: string }> => {
  const response = await api.post('/profile/restaurant/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}; 