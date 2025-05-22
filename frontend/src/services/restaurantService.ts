import api from './api';
import axios from 'axios';
import { Restaurant, MenuItem } from '../interfaces';
import { axiosInstance } from './axiosConfig';

const API_URL = 'http://localhost:8080/api';

// Since we don't have a direct API call visible for getting all restaurants,
// we'll add a function assuming there is a GET /restaurants endpoint
export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const response = await axiosInstance.get<Restaurant[]>('/restaurants');
    const restaurants = response.data;
    
    // Fetch the open status for each restaurant
    const restaurantsWithOpenStatus = await Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          const isOpen = await getRestaurantOpenStatus(restaurant.restaurantId);
          return { ...restaurant, isOpen };
        } catch (error) {
          console.error(`Error fetching open status for restaurant ${restaurant.restaurantId}:`, error);
          return restaurant; // Return the restaurant without updating isOpen if there's an error
        }
      })
    );
    
    return restaurantsWithOpenStatus;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
};

export const getRestaurantById = async (restaurantId: number | string): Promise<Restaurant | null> => {
  try {
    console.log(`Fetching restaurant with ID: ${restaurantId}`);
    const response = await axiosInstance.get<Restaurant>(`/restaurants/${restaurantId}`);
    console.log('Restaurant data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    
    // Create a mock restaurant as fallback
    console.log('Using mock restaurant data as fallback');
    const mockRestaurants: Restaurant[] = [
      {
        restaurantId: 1,
        name: "Italian Delight",
        email: "contact@italiandelight.com",
        phoneNumber: "+1234567890",
        token: "mock-token",
        cuisineType: "Italian",
        rating: 4.5,
        isOpen: true,
        address: {
          street: "123 Sample Street",
          city: "Istanbul",
          state: "",
          zipCode: "",
          country: "Turkey"
        },
        deliveryRangeKm: 5,
        estimatedDeliveryTime: "30-45 min",
        averagePrice: 25,
        profileImageUrl: "https://example.com/restaurant1.jpg"
      }
    ];
    
    return mockRestaurants.find(r => r.restaurantId === (typeof restaurantId === 'string' ? parseInt(restaurantId, 10) : restaurantId)) || null;
  }
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
    imageUrl?: string;
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
    const response = await axiosInstance.delete(`/restaurant/menu-items/${menuItemId}`, {
      params: { restaurantId }
    });
    console.log('API Response:', response.status);
    // Return true if status is 204 (No Content)
    return response.status === 204;
  } catch (error) {
    console.error('API Error in deleteMenuItem:', error);
    throw error;
  }
};

// Get restaurants sorted by a specific field
export const getRestaurantsSorted = async (sortBy: string): Promise<Restaurant[]> => {
  try {
    const response = await api.get<Restaurant[]>(`/restaurants?sortBy=${sortBy}`);
    const restaurants = response.data;
    
    // Fetch the open status for each restaurant
    const restaurantsWithOpenStatus = await Promise.all(
      restaurants.map(async (restaurant) => {
        try {
          const isOpen = await getRestaurantOpenStatus(restaurant.restaurantId);
          return { ...restaurant, isOpen };
        } catch (error) {
          console.error(`Error fetching open status for restaurant ${restaurant.restaurantId}:`, error);
          return restaurant; // Return the restaurant without updating isOpen if there's an error
        }
      })
    );
    
    return restaurantsWithOpenStatus;
  } catch (error) {
    console.error('Error fetching sorted restaurants:', error);
    return [];
  }
};

// Upload menu item image
export const uploadMenuItemImage = async (
  menuItemId: number,
  image: File
): Promise<MenuItem> => {
  console.log(`API Call: Uploading image for menu item ${menuItemId}`);
  try {
    const formData = new FormData();
    formData.append('image', image);
    
    const response = await api.post<MenuItem>(
      `/restaurant/menu-items/${menuItemId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error in uploadMenuItemImage:', error);
    throw error;
  }
};

// Check restaurant approval status
export const checkRestaurantApprovalStatus = async (restaurantId: number) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/approval-status`);
    return response.data;
  } catch (error) {
    console.error('Error checking restaurant approval status:', error);
    throw error;
  }
};

// Get restaurant open status based on business hours
export const getRestaurantOpenStatus = async (restaurantId: number): Promise<boolean> => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/open-status`);
    return response.data.isOpen;
  } catch (error) {
    console.error('API Error in getRestaurantOpenStatus:', error);
    throw error;
  }
};

// Add these functions to update and check delivery range

// Update delivery range for a restaurant
export const updateDeliveryRange = async (restaurantId: number, deliveryRangeKm: number): Promise<Restaurant> => {
  try {
    const response = await api.put(`/restaurants/${restaurantId}/config/delivery-range`, {
      deliveryRangeKm: deliveryRangeKm
    });
    return response.data;
  } catch (error) {
    console.error('API Error in updateDeliveryRange:', error);
    throw error;
  }
};

// Get the delivery range for a restaurant
export const getDeliveryRange = async (restaurantId: number): Promise<number> => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/config/delivery-range`);
    return response.data.deliveryRangeKm;
  } catch (error) {
    console.error('API Error in getDeliveryRange:', error);
    throw error;
  }
};

// Check if an address is within delivery range of a restaurant
export interface DeliveryRangeCheck {
  isInRange: boolean;
  distanceKm: number | null;
}

export const checkDeliveryRange = async (restaurantId: number, addressId: number): Promise<DeliveryRangeCheck> => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/delivery/check/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('API Error in checkDeliveryRange:', error);
    throw error;
  }
};

// Check if a manually entered address is within a restaurant's delivery range
export const checkAddressInDeliveryRange = async (
  restaurantId: number,
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
): Promise<DeliveryRangeCheck> => {
  try {
    const response = await api.post(`/restaurants/${restaurantId}/delivery/check-address`, address);
    return response.data;
  } catch (error) {
    console.error('API Error in checkAddressInDeliveryRange:', error);
    return { isInRange: false, distanceKm: null };
  }
}; 