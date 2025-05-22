import axios from 'axios';
import { Message } from '../interfaces';
import { axiosInstance } from './axiosConfig';

// Send a new message
export const sendMessage = async (message: Message): Promise<Message> => {
  try {
    const response = await axiosInstance.post<Message>('/messages', message);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages sent by a user
export const getUserSentMessages = async (userId: number): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get<Message[]>(`/messages/sent/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    throw error;
  }
};

// Get messages received by a user
export const getUserReceivedMessages = async (userId: number): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get<Message[]>(`/messages/received/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching received messages:', error);
    throw error;
  }
};

// Get messages received by a user with userType
export const getUserReceivedMessagesByType = async (userId: number, userType: string): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get<Message[]>(`/messages/received/${userId}/${userType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching received messages by type:', error);
    throw error;
  }
};

// Get messages received by an admin (special endpoint for admins)
export const getAdminReceivedMessages = async (adminId: number): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get<Message[]>(`/messages/admin/received/${adminId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin received messages:', error);
    throw error;
  }
};

// Get messages received by a restaurant (special endpoint for restaurants)
export const getRestaurantReceivedMessages = async (restaurantId: number): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get<Message[]>(`/messages/restaurant/received/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant received messages:', error);
    throw error;
  }
};

// Get unread messages for an admin (special endpoint for admins)
export const getAdminUnreadMessages = async (adminId: number): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get<Message[]>(`/messages/admin/unread/${adminId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin unread messages:', error);
    throw error;
  }
};

// Get unread messages for a restaurant (special endpoint for restaurants)
export const getRestaurantUnreadMessages = async (restaurantId: number): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get<Message[]>(`/messages/restaurant/unread/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant unread messages:', error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (messageId: number): Promise<Message> => {
  try {
    const response = await axiosInstance.put<Message>(`/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/messages/${messageId}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}; 