import api from './api';
import { Address } from '../interfaces';

// Get all addresses for the current user
export const getUserAddresses = async (): Promise<Address[]> => {
  const response = await api.get<Address[]>('/profile/addresses');
  return response.data;
};

// Add a new address
export const addAddress = async (addressData: Omit<Address, 'addressId'>): Promise<Address> => {
  const response = await api.post<Address>('/profile/addresses', addressData);
  return response.data;
};

// Update an existing address
export const updateAddress = async (addressId: number, addressData: Omit<Address, 'addressId'>): Promise<Address> => {
  const response = await api.put<Address>(`/profile/addresses/${addressId}`, addressData);
  return response.data;
};

// Delete an address
export const deleteAddress = async (addressId: number): Promise<void> => {
  await api.delete(`/profile/addresses/${addressId}`);
}; 