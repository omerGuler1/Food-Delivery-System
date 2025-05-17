import api from './api';
import { Customer, Courier, Restaurant, AdminEditCustomerRequest, AdminEditRestaurantRequest, AdminEditCourierRequest } from '../interfaces';

export interface CustomerListItem {
  customerId: number;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
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
 * Placeholder for future implementation: Ban a customer
 */
export const banCustomer = async (customerId: number): Promise<void> => {
  console.log(`Ban customer functionality not implemented yet for ID: ${customerId}`);
  // Implementation will be added later
  // await api.put(`/admin/customers/${customerId}/ban`);
};

/**
 * Placeholder for future implementation: Ban a courier
 */
export const banCourier = async (courierId: number): Promise<void> => {
  console.log(`Ban courier functionality not implemented yet for ID: ${courierId}`);
  // Implementation will be added later
  // await api.put(`/admin/couriers/${courierId}/ban`);
};

/**
 * Placeholder for future implementation: Ban a restaurant
 */
export const banRestaurant = async (restaurantId: number): Promise<void> => {
  console.log(`Ban restaurant functionality not implemented yet for ID: ${restaurantId}`);
  // Implementation will be added later
  // await api.put(`/admin/restaurants/${restaurantId}/ban`);
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