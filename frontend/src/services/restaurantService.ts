import api from './api';
import { Restaurant, RestaurantDetails, MenuItem } from '../interfaces';

// Since we don't have a direct API call visible for getting all restaurants,
// we'll add a function assuming there is a GET /restaurants endpoint
export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  const response = await api.get<Restaurant[]>('/restaurants');
  return response.data;
};

export const getRestaurantById = async (id: number): Promise<RestaurantDetails> => {
  const response = await api.get<RestaurantDetails>(`/restaurants/${id}`);
  return response.data;
};

export const searchRestaurants = async (query: string): Promise<Restaurant[]> => {
  const response = await api.get<Restaurant[]>(`/restaurants/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const getRestaurantMenuItems = async (restaurantId: number): Promise<MenuItem[]> => {
  console.log(`API Call: Getting menu items for restaurant ID ${restaurantId}`);
  try {
    const response = await api.get<MenuItem[]>(`/restaurant/menu-items?restaurantId=${restaurantId}`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error in getRestaurantMenuItems:', error);
    throw error;
  }
};

// Add a menu item
export const addMenuItem = async (menuItem: {
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  availability: boolean;
  category: string;
}): Promise<MenuItem> => {
  console.log('API Call: Adding menu item', menuItem);
  try {
    const response = await api.post<MenuItem>(`/restaurant/menu-items`, menuItem);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error in addMenuItem:', error);
    throw error;
  }
};

// Update a menu item
export const updateMenuItem = async (
  menuItemId: number,
  menuItem: {
    restaurantId: number;
    name: string;
    description: string;
    price: number;
    availability: boolean;
    category: string;
  }
): Promise<MenuItem> => {
  console.log(`API Call: Updating menu item ${menuItemId}`, menuItem);
  try {
    const response = await api.put<MenuItem>(`/restaurant/menu-items/${menuItemId}`, menuItem);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error in updateMenuItem:', error);
    throw error;
  }
};

// Delete a menu item
export const deleteMenuItem = async (menuItemId: number, restaurantId: number): Promise<boolean> => {
  console.log(`API Call: Deleting menu item ${menuItemId} for restaurant ${restaurantId}`);
  try {
    const response = await api.delete(`/restaurant/menu-items/${menuItemId}?restaurantId=${restaurantId}`);
    console.log('API Response:', response.data);
    return response.data?.success || false;
  } catch (error) {
    console.error('API Error in deleteMenuItem:', error);
    throw error;
  }
};

// Update restaurant status (open/closed)
export const updateRestaurantStatus = async (restaurantId: number, isOpen: boolean): Promise<{ isOpen: boolean }> => {
  console.log(`API Call: Updating restaurant status to ${isOpen ? 'open' : 'closed'} for restaurant ${restaurantId}`);
  try {
    const response = await api.put(`/restaurants/${restaurantId}/status`, { isOpen });
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error in updateRestaurantStatus:', error);
    throw error;
  }
};

// Get restaurants sorted by a specific field
export const getRestaurantsSorted = async (sortBy: string): Promise<Restaurant[]> => {
  const response = await api.get<Restaurant[]>(`/restaurants?sortBy=${sortBy}`);
  return response.data;
}; 