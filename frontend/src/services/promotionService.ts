import axiosInstance from './axiosConfig';
import { Promotion } from '../interfaces';

// Get all active promotions
export const getActivePromotions = async (): Promise<Promotion[]> => {
  try {
    const response = await axiosInstance.get('/promotions/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    throw error;
  }
};

// Get promotion by ID
export const getPromotionById = async (id: number): Promise<Promotion> => {
  try {
    const response = await axiosInstance.get(`/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching promotion:', error);
    throw error;
  }
}; 