import api from './api';
import { Customer, Courier, Restaurant, AdminEditCustomerRequest, AdminEditRestaurantRequest, AdminEditCourierRequest } from '../interfaces';

export interface CustomerListItem {
  customerId: number;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isBanned?: boolean;
  banOpenDate?: string;
}

export interface CourierListItem {
  courierId: number;
  name: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  status: string;
  earnings: number;
  createdAt: string;
  approvalStatus: string;
  isBanned?: boolean;
  banOpenDate?: string;
}

export interface RestaurantListItem {
  restaurantId: number;
  name: string;
  email: string;
  phoneNumber: string;
  cuisineType: string;
  rating: number;
  city: string;
  createdAt: string;
  approvalStatus: string;
  deleted?: boolean;
  deletedAt?: string | null;
  isBanned?: boolean;
  banOpenDate?: string;
}

/**
 * Get all customers in the system
 * Requires admin role
 */
export const getAllCustomers = async (): Promise<CustomerListItem[]> => {
  try {
    const response = await api.get<CustomerListItem[]>('/admin/customers');
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get all couriers in the system
 * Requires admin role
 */
export const getAllCouriers = async (): Promise<CourierListItem[]> => {
  try {
    const response = await api.get<CourierListItem[]>('/admin/couriers');
    return response.data;
  } catch (error) {
    console.error('Error fetching couriers:', error);
    throw error;
  }
};

/**
 * Get all restaurants in the system
 * Requires admin role
 */
export const getAllRestaurants = async (): Promise<RestaurantListItem[]> => {
  try {
    const response = await api.get<RestaurantListItem[]>('/admin/restaurants');
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

/**
 * Delete a customer by ID
 * Requires admin role
 */
export const deleteCustomer = async (customerId: number): Promise<void> => {
  try {
    await api.delete(`/admin/customers/${customerId}`);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

/**
 * Delete a courier by ID
 * Requires admin role
 */
export const deleteCourier = async (courierId: number): Promise<void> => {
  try {
    await api.delete(`/admin/couriers/${courierId}`);
  } catch (error) {
    console.error('Error deleting courier:', error);
    throw error;
  }
};

/**
 * Delete a restaurant by ID
 * Requires admin role
 */
export const deleteRestaurant = async (restaurantId: number): Promise<void> => {
  try {
    await api.delete(`/admin/restaurants/${restaurantId}`);
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
};

/**
 * Ban a customer for a specified number of days
 * @param customerId Customer ID to ban
 * @param days Number of days to ban the customer (can be decimal for hours/seconds)
 */
export const banCustomer = async (customerId: number, days: number = 7): Promise<void> => {
  try {
    await api.post(`/admin/customers/${customerId}/ban?days=${days}`);
  } catch (error) {
    console.error('Error banning customer:', error);
    throw error;
  }
};

/**
 * Ban a courier for a specified number of days
 * @param courierId Courier ID to ban
 * @param days Number of days to ban the courier (can be decimal for hours/seconds)
 */
export const banCourier = async (courierId: number, days: number = 7): Promise<void> => {
  try {
    await api.post(`/admin/couriers/${courierId}/ban?days=${days}`);
  } catch (error) {
    console.error('Error banning courier:', error);
    throw error;
  }
};

/**
 * Ban a restaurant for a specified number of days
 * @param restaurantId Restaurant ID to ban
 * @param days Number of days to ban the restaurant (can be decimal for hours/seconds)
 */
export const banRestaurant = async (restaurantId: number, days: number = 7): Promise<void> => {
  try {
    await api.post(`/admin/restaurants/${restaurantId}/ban?days=${days}`);
  } catch (error) {
    console.error('Error banning restaurant:', error);
    throw error;
  }
};

/**
 * Unban a customer
 * @param customerId Customer ID to unban
 */
export const unbanCustomer = async (customerId: number): Promise<void> => {
  try {
    await api.post(`/admin/customers/${customerId}/unban`);
  } catch (error) {
    console.error('Error unbanning customer:', error);
    throw error;
  }
};

/**
 * Unban a courier
 * @param courierId Courier ID to unban
 */
export const unbanCourier = async (courierId: number): Promise<void> => {
  try {
    await api.post(`/admin/couriers/${courierId}/unban`);
  } catch (error) {
    console.error('Error unbanning courier:', error);
    throw error;
  }
};

/**
 * Unban a restaurant
 * @param restaurantId Restaurant ID to unban
 */
export const unbanRestaurant = async (restaurantId: number): Promise<void> => {
  try {
    await api.post(`/admin/restaurants/${restaurantId}/unban`);
  } catch (error) {
    console.error('Error unbanning restaurant:', error);
    throw error;
  }
};

/**
 * Edit a customer by admin
 * @param data Customer data to update
 * @returns Updated customer object
 */
export const editCustomer = async (data: AdminEditCustomerRequest): Promise<Customer> => {
  try {
    const response = await api.put<Customer>('/admin/customers', data);
    return response.data;
  } catch (error) {
    console.error('Error editing customer:', error);
    throw error;
  }
};

/**
 * Edit a restaurant by admin
 * @param data Restaurant data to update
 * @returns Updated restaurant object
 */
export const editRestaurant = async (data: AdminEditRestaurantRequest): Promise<Restaurant> => {
  try {
    const response = await api.put<Restaurant>('/admin/restaurants', data);
    return response.data;
  } catch (error) {
    console.error('Error editing restaurant:', error);
    throw error;
  }
};

/**
 * Edit a courier by admin
 * @param data Courier data to update
 * @returns Updated courier object
 */
export const editCourier = async (data: AdminEditCourierRequest): Promise<Courier> => {
  try {
    const response = await api.put<Courier>('/admin/couriers', data);
    return response.data;
  } catch (error) {
    console.error('Error editing courier:', error);
    throw error;
  }
}; 