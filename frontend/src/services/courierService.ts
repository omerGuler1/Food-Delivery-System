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
export const getActiveDeliveries = async (courierId: number) => {
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
    
    // Validate response structure
    if (Array.isArray(response.data)) {
      console.log(`Received ${response.data.length} items from API`);
      
      // Problem: The API response doesn't include order details due to @JsonBackReference in the backend
      // Temporary solution: Get each assignment's order details separately 
      const assignmentsWithOrders = await Promise.all(
        response.data.map(async (assignment) => {
          try {
            // Get assignment details with order
            const detailsResponse = await axios.get(
              `${API_URL}/courier-assignments/${assignment.assignmentId}`,
              { headers: getAuthHeader() }
            );
            return detailsResponse.data;
          } catch (error) {
            console.error(`Error fetching details for assignment ${assignment.assignmentId}:`, error);
            // Create a dummy order to avoid UI errors
            return {
              ...assignment,
              order: {
                orderId: 0,
                restaurant: { name: 'Loading...' },
                address: { street: 'Loading...', city: 'Loading...', fullAddress: 'Loading...' },
                createdAt: new Date().toISOString(),
                totalPrice: 0
              }
            };
          }
        })
      );
      
      console.log('Assignments with orders:', assignmentsWithOrders);
      return assignmentsWithOrders;
    } else {
      console.warn('API response is not an array as expected:', response.data);
      return [];
    }
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
export const updateCourierStatus = async (courierId: number, status: string) => {
  try {
    console.log(`Updating courier status for courier ${courierId} to ${status}`);
    const response = await axios.put(
      `${API_URL}/courier/status/${courierId}?status=${status}`,
      {}, // empty body
      { headers: getAuthHeader() }
    );
    console.log('Courier status update response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating courier status to ${status}:`, error);
    throw error;
  }
};

// Get courier profile information
export const getCourierProfile = async (courierId: number) => {
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