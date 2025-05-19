import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Helper function to get authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get active delivery orders for a courier
export const getActiveDeliveries = async (courierId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/courier/orders/active/${courierId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching active deliveries:', error);
    throw error;
  }
};

// Get pending delivery requests
export const getPendingDeliveryRequests = async () => {
  const apiEndpoint = `${API_URL}/courier-assignments/pending-requests`;
  console.log('Calling pending requests API at:', apiEndpoint);
  
  try {
    const response = await axios.get(
      apiEndpoint,
      { headers: getAuthHeader() }
    );
    console.log('Pending Delivery Requests API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching pending delivery requests:', error);
    throw error;
  }
};

// Accept a delivery request
export const acceptDeliveryRequest = async (assignmentId: number) => {
  try {
    const response = await axios.post(
      `${API_URL}/courier-assignments/${assignmentId}/accept`,
      {}, // empty body
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error accepting delivery request:', error);
    throw error;
  }
};

// Reject a delivery request
export const rejectDeliveryRequest = async (assignmentId: number) => {
  try {
    const response = await axios.post(
      `${API_URL}/courier-assignments/${assignmentId}/reject`,
      {}, // empty body
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting delivery request:', error);
    throw error;
  }
};

// Update assignment status (PICKED_UP, DELIVERED, CANCELLED)
export const updateAssignmentStatus = async (assignmentId: number, status: string) => {
  try {
    const response = await axios.put(
      `${API_URL}/courier-assignments/${assignmentId}/status?status=${status}`,
      {}, // empty body
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating assignment status to ${status}:`, error);
    throw error;
  }
};

// Get all past deliveries (delivery history)
export const getCourierOrderHistory = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/courier-assignments/courier/history`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching courier order history:', error);
    throw error;
  }
};

// Update courier availability status (AVAILABLE or UNAVAILABLE)
export const updateCourierStatus = async (courierId: string, status: 'AVAILABLE' | 'UNAVAILABLE'): Promise<void> => {
  try {
    const response = await axios.put(
      `${API_URL}/courier/status/${courierId}?status=${status}`,
      {}, // empty body
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating courier status:', error);
    throw error;
  }
};

// Get courier profile information
export const getCourierProfile = async (courierId: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/courier/profile/${courierId}`,
      { headers: getAuthHeader() }
    );
    console.log('Courier profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching courier profile:', error);
    throw error;
  }
}; 