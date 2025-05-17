import api from './api';
import { Customer, Courier, Restaurant } from '../interfaces';

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
    const response = await api.get<CustomerListItem[]>('/customers');
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
    const response = await api.get<CourierListItem[]>('/couriers');
    return response.data;
  } catch (error) {
    console.error('Error fetching couriers:', error);
    throw error;
  }
};

/**
 * Get all restaurants in the system
 * Public endpoint, no authentication required
 */
export const getAllRestaurants = async (): Promise<RestaurantListItem[]> => {
  try {
    const response = await api.get<RestaurantListItem[]>('/restaurants');
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

/**
 * Placeholder for future implementation: Delete a customer
 */
export const deleteCustomer = async (customerId: number): Promise<void> => {
  console.log(`Delete customer functionality not implemented yet for ID: ${customerId}`);
  // Implementation will be added later
  // await api.delete(`/admin/customers/${customerId}`);
};

/**
 * Placeholder for future implementation: Delete a courier
 */
export const deleteCourier = async (courierId: number): Promise<void> => {
  console.log(`Delete courier functionality not implemented yet for ID: ${courierId}`);
  // Implementation will be added later
  // await api.delete(`/admin/couriers/${courierId}`);
};

/**
 * Placeholder for future implementation: Delete a restaurant
 */
export const deleteRestaurant = async (restaurantId: number): Promise<void> => {
  console.log(`Delete restaurant functionality not implemented yet for ID: ${restaurantId}`);
  // Implementation will be added later
  // await api.delete(`/admin/restaurants/${restaurantId}`);
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