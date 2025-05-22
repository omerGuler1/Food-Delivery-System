import api from './api';

export interface RatingRequest {
  orderId: number;
  rating: number;
  comment?: string;
}

export interface RatingResponse {
  id: number;
  orderId: number;
  customerId: number;
  restaurantId: number;
  rating: number;
  comment: string;
  createdAt: string;
  customerName: string;
  restaurantName: string;
}

// Create a new rating
export const createRating = async (ratingData: RatingRequest): Promise<RatingResponse> => {
  // İlk olarak siparişin puanlanabilir olup olmadığını kontrol et
  const canRate = await canRateOrder(ratingData.orderId);
  
  if (!canRate) {
    throw new Error('You have already rated this order or the order is not eligible for rating.');
  }
  
  const response = await api.post('/ratings', ratingData);
  return response.data;
};

// Get ratings for a restaurant
export const getRestaurantRatings = async (restaurantId: number): Promise<RatingResponse[]> => {
  const response = await api.get(`/ratings/restaurant/${restaurantId}`);
  return response.data;
};

// Get average rating for a restaurant
export const getRestaurantAverageRating = async (restaurantId: number): Promise<number> => {
  const response = await api.get(`/ratings/restaurant/${restaurantId}/average`);
  return response.data;
};

// Get ratings made by the current customer
export const getCustomerRatings = async (): Promise<RatingResponse[]> => {
  const response = await api.get('/ratings/customer');
  return response.data;
};

// Check if a customer can rate a specific order
export const canRateOrder = async (orderId: number): Promise<boolean> => {
  const response = await api.get(`/ratings/can-rate/${orderId}`);
  return response.data;
}; 