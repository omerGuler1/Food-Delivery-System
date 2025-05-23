import api, { publicApi } from './api';
import { ReviewRole } from '../interfaces';

// Create a new review for an order
export const createReview = async (reviewData: {
  orderId: number;
  role: ReviewRole;
  rating: number;
  comment?: string;
}) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// Respond to a review
export const respondToReview = async (
  reviewId: number, 
  response: { response: string }
) => {
  const result = await api.post(`/reviews/${reviewId}/response`, response);
  return result.data;
};

// Get review by ID
export const getReviewById = async (reviewId: number) => {
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data;
};

// Get reviews for an order
export const getReviewsByOrderId = async (orderId: number) => {
  const response = await api.get(`/reviews/order/${orderId}`);
  return response.data;
};

// Get customer's reviews
export const getCustomerReviews = async () => {
  const response = await api.get('/reviews/customer');
  return response.data;
};

// Get reviews for a restaurant or courier
export const getTargetReviews = async (targetId: number, role: ReviewRole) => {
  console.log(`Fetching reviews for target ${targetId} with role ${role}`);
  try {
    // Use the public endpoint that doesn't require authentication
    const response = await publicApi.get(`/reviews/public/target/${targetId}?role=${role}`);
    console.log('Reviews fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching target reviews:', error);
    return [];
  }
};

// Get average rating for a restaurant or courier
export const getAverageRating = async (targetId: number, role: ReviewRole) => {
  console.log(`Fetching average rating for target ${targetId} with role ${role}`);
  try {
    // Use the public endpoint that doesn't require authentication
    const response = await publicApi.get(`/reviews/public/target/${targetId}/average?role=${role}`);
    console.log('Average rating fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching average rating:', error);
    return 0;
  }
};

// Check if a customer can review an order's restaurant or courier
export const canCustomerReview = async (orderId: number, role: ReviewRole) => {
  const response = await api.get(`/reviews/can-review?orderId=${orderId}&role=${role}`);
  return response.data;
};

// Check if a target (restaurant or courier) can respond to a review
export const canRespondToReview = async (reviewId: number) => {
  const response = await api.get(`/reviews/can-respond?reviewId=${reviewId}`);
  return response.data;
}; 