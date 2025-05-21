import api from './api';

export interface FavoriteStatusResponse {
  isFavorite: boolean;
}

export const favoriteService = {
  // Get all favorite restaurants for the current user
  getFavoriteRestaurants: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  // Add a restaurant to favorites
  addFavoriteRestaurant: async (restaurantId: number) => {
    const response = await api.post(`/favorites/${restaurantId}`);
    return response.data;
  },

  // Remove a restaurant from favorites
  removeFavoriteRestaurant: async (restaurantId: number) => {
    const response = await api.delete(`/favorites/${restaurantId}`);
    return response.data;
  },

  // Check if a restaurant is in favorites
  checkFavoriteStatus: async (restaurantId: number): Promise<boolean> => {
    try {
      const response = await api.get<FavoriteStatusResponse>(`/favorites/${restaurantId}/status`);
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }
}; 