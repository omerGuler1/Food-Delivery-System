import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Card,
  CardContent,
  Rating
} from '@mui/material';
import {
  LocalShipping as DeliveryIcon,
  DeliveryDining,
  Person as PersonIcon,
  History as HistoryIcon,
  ReceiptLong as ReceiptIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  DoubleArrow as DoubleArrowIcon,
  StarRate as StarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getActiveDeliveries, 
  getPendingDeliveryRequests, 
  acceptDeliveryRequest, 
  rejectDeliveryRequest, 
  updateAssignmentStatus, 
  getCourierOrderHistory,
  updateCourierStatus,
  getCourierProfile
} from '../services/courierService';
import { 
  ActiveDeliveryOrder, 
  PendingDeliveryRequest, 
  CourierOrderHistoryDTO,
  CourierAssignment,
  Courier,
  ReviewRole,
  ReviewResponseDTO
} from '../interfaces';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { getTargetReviews, canRespondToReview } from '../services/reviewService';
import ReviewList from '../components/ReviewList';
import ReviewResponse from '../components/ReviewResponse';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CourierDashboard: React.FC = () => {
  const { user } = useAuth();
  const courierUser = user as Courier; // Type assertion since we know this is a courier dashboard
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDeliveryOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<PendingDeliveryRequest[]>([]);
  const [pastDeliveries, setPastDeliveries] = useState<CourierOrderHistoryDTO[]>([]);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [pastDeliveriesPage, setPastDeliveriesPage] = useState(1);
  const [availableOrdersPage, setAvailableOrdersPage] = useState(1);
  const itemsPerPage = 10;
  const [reviews, setReviews] = useState<ReviewResponseDTO[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [canRespondToReviews, setCanRespondToReviews] = useState<{[key: number]: boolean}>({});

  // Toggle courier availability
  const handleToggleAvailability = async () => {
    try {
      if (!courierUser?.courierId) {
        throw new Error('Courier ID not available');
      }

      const courierId = courierUser.courierId;
      // Toggle the status - if currently available, set to unavailable and vice versa
      const newStatus = isAvailable ? 'UNAVAILABLE' : 'AVAILABLE';
      
      // Call the API to update the courier status
      await updateCourierStatus(courierId, newStatus);
      
      // Update the local state
      setIsAvailable(!isAvailable);
      setSuccessMessage(`Status updated to ${newStatus.toLowerCase()}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating availability:', error);
      setError(error.message || 'Failed to update availability status');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Accept an order
  const handleAcceptOrder = async (assignment: PendingDeliveryRequest) => {
    try {
      setLoading(true);
      await acceptDeliveryRequest(assignment.assignmentId);
      
      // Remove from available orders
      setAvailableOrders(availableOrders.filter(o => o.assignmentId !== assignment.assignmentId));
      
      // Refresh active deliveries
      fetchActiveDeliveries();
      
      // Show success message
      setSuccessMessage(`Order #${assignment.order.orderId} accepted`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error accepting order:', error);
      setError(error.response?.data?.message || 'Failed to accept order');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Reject an order
  const handleRejectOrder = async (assignment: PendingDeliveryRequest) => {
    try {
      setLoading(true);
      await rejectDeliveryRequest(assignment.assignmentId);
      
      // Remove from available orders
      setAvailableOrders(availableOrders.filter(o => o.assignmentId !== assignment.assignmentId));
      
      // Show success message
      setSuccessMessage(`Order #${assignment.order.orderId} rejected`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error rejecting order:', error);
      setError(error.response?.data?.message || 'Failed to reject order');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle picking up an order
  const handlePickupOrder = async (order: ActiveDeliveryOrder) => {
    try {
      setLoading(true);
      
      // Find the active assignment for this order
      const assignment = order.courierAssignments.find(a => 
        a.status === 'ACCEPTED');
      
      if (!assignment) {
        throw new Error('No active assignment found for this order');
      }
      
      await updateAssignmentStatus(assignment.assignmentId, 'PICKED_UP');
      
      // Refresh active deliveries
      fetchActiveDeliveries();
      
      // Show success message
      setSuccessMessage(`Order #${order.orderId} picked up`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error picking up order:', error);
      setError(error.response?.data?.message || 'Failed to update order status');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Complete delivery
  const handleCompleteDelivery = async (order: ActiveDeliveryOrder) => {
    try {
      setLoading(true);
      
      // Find the active assignment for this order
      const assignment = order.courierAssignments.find(a => a.status === 'PICKED_UP');
      
      if (!assignment) {
        throw new Error('No active assignment found for this order');
      }
      
      await updateAssignmentStatus(assignment.assignmentId, 'DELIVERED');
      
      // Refresh active deliveries and delivery history
      fetchActiveDeliveries();
      fetchDeliveryHistory();
      
      // Show success message
      setSuccessMessage(`Order #${order.orderId} delivered successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error completing delivery:', error);
      setError(error.response?.data?.message || 'Failed to complete delivery');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cancel delivery
  const handleCancelDelivery = async (order: ActiveDeliveryOrder) => {
    try {
      setLoading(true);
      
      // Find the active assignment for this order
      const assignment = order.courierAssignments.find(a => 
        a.status === 'ACCEPTED' || a.status === 'PICKED_UP');
      
      if (!assignment) {
        throw new Error('No active assignment found for this order');
      }
      
      await updateAssignmentStatus(assignment.assignmentId, 'CANCELLED');
      
      // Refresh active deliveries
      fetchActiveDeliveries();
      
      // Show success message
      setSuccessMessage(`Order #${order.orderId} cancelled`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error cancelling delivery:', error);
      setError(error.response?.data?.message || 'Failed to cancel delivery');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // View order details
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Close order details
  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
  };

  // Handle pagination change
  const handlePastDeliveriesPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPastDeliveriesPage(value);
  };

  const handleAvailableOrdersPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setAvailableOrdersPage(value);
  };

  // Fetch active deliveries
  const fetchActiveDeliveries = async () => {
    try {
      if (!courierUser?.courierId) {
        throw new Error('Courier ID not available');
      }
      
      const courierId = courierUser.courierId;
      const deliveries = await getActiveDeliveries(courierId);
      setActiveDeliveries(deliveries);
    } catch (error: any) {
      console.error('Error fetching active deliveries:', error);
      setError(error.message || 'Failed to fetch active deliveries');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Fetch available orders (pending requests)
  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      console.log('Courier availability status:', isAvailable);
      const pendingRequests = await getPendingDeliveryRequests();
      console.log('DEBUG: pendingRequests raw:', pendingRequests);
      pendingRequests.forEach((req: PendingDeliveryRequest, idx: number) => {
        console.log(`DEBUG: req[${idx}]`, req, 'order:', req.order, 'typeof order:', typeof req.order);
      });
      
      // More detailed validation of each request
      const validRequests = pendingRequests.filter((req: PendingDeliveryRequest) => {
        if (!req) {
          console.warn('Request is null:', req);
          return false;
        }
        if (!req.order || typeof req.order !== 'object') {
          console.warn('Order is missing or not an object:', req, req.order);
          return false;
        }
        return true;
      });
      
      if (validRequests.length !== pendingRequests.length) {
        console.warn('Filtered out invalid requests:', {
          total: pendingRequests.length,
          valid: validRequests.length,
          invalid: pendingRequests.length - validRequests.length
        });
      }
      
      console.log('Setting available orders with valid requests:', validRequests);
      setAvailableOrders(validRequests);
    } catch (error: any) {
      console.error('Error fetching available orders:', error);
      setError(error.response?.data?.message || 'Failed to load available orders');
      setAvailableOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery history
  const fetchDeliveryHistory = async () => {
    try {
      setLoading(true);
      const history = await getCourierOrderHistory();
      setPastDeliveries(history);
    } catch (error: any) {
      console.error('Error fetching delivery history:', error);
      setError(error.response?.data?.message || 'Failed to load delivery history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch courier profile to get current status
  const fetchCourierProfile = useCallback(async () => {
    try {
      if (!courierUser?.courierId) {
        throw new Error('Courier ID not available');
      }

      const courierId = courierUser.courierId;
      const profile = await getCourierProfile(courierId);
      
      // Update availability state based on profile status
      setIsAvailable(profile.status === 'AVAILABLE');
    } catch (error: any) {
      console.error('Error fetching courier profile:', error);
      setError(error.message || 'Failed to fetch courier profile');
      setTimeout(() => setError(null), 3000);
    }
  }, [courierUser]);

  // Fetch courier profile when component mounts
  useEffect(() => {
    if (courierUser && 'courierId' in courierUser) {
      fetchCourierProfile();
    }
  }, [courierUser, fetchCourierProfile]);

  // Load data based on active tab
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    if (activeTab === 0) {
      fetchActiveDeliveries();
    } else if (activeTab === 1) {
      console.log('Fetching available orders for tab 1');
      fetchAvailableOrders();
    } else if (activeTab === 2) {
      fetchDeliveryHistory();
    }
  }, [activeTab]); // Only depend on activeTab

  // Set up polling for pending requests
  useEffect(() => {
    // Only poll if on the pending requests tab
    if (activeTab === 1) {
      console.log('Setting up polling for available orders tab');
      // Immediate fetch to avoid waiting for interval
      fetchAvailableOrders();
      // Set up polling every 30 seconds
      const intervalId = setInterval(fetchAvailableOrders, 30000);
      
      // Clean up
      return () => {
        console.log('Cleaning up polling for available orders');
        clearInterval(intervalId);
      };
    }
  }, [activeTab]); // Only depend on activeTab

  // Set up polling for active deliveries
  useEffect(() => {
    // Only poll if on the active deliveries tab
    if (activeTab === 0) {
      console.log('Setting up polling for active deliveries tab');
      // Immediate fetch
      fetchActiveDeliveries();
      // Set up polling every 30 seconds
      const intervalId = setInterval(fetchActiveDeliveries, 30000);
      
      // Clean up
      return () => {
        console.log('Cleaning up polling for active deliveries');
        clearInterval(intervalId);
      };
    }
  }, [activeTab]);

  // Fetch courier reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!courierUser?.courierId) return;
      
      setLoadingReviews(true);
      
      try {
        // Get reviews for this courier
        const courierReviews = await getTargetReviews(parseInt(courierUser.courierId), ReviewRole.COURIER);
        setReviews(courierReviews);
        
        // Check which reviews the courier can respond to
        const respondableReviews: {[key: number]: boolean} = {};
        for (const review of courierReviews) {
          if (!review.response) {
            try {
              const canRespond = await canRespondToReview(review.reviewId);
              respondableReviews[review.reviewId] = canRespond;
            } catch (error) {
              console.error(`Error checking if courier can respond to review ${review.reviewId}:`, error);
            }
          }
        }
        
        setCanRespondToReviews(respondableReviews);
      } catch (error) {
        console.error('Error fetching courier reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [courierUser?.courierId]);
  
  // Handle review response submission
  const handleReviewResponseSubmitted = async () => {
    // Refresh reviews after response is submitted
    if (courierUser?.courierId) {
      try {
        const updatedReviews = await getTargetReviews(parseInt(courierUser.courierId), ReviewRole.COURIER);
        setReviews(updatedReviews);
        
        // Update which reviews can be responded to
        const updatedRespondableReviews: {[key: number]: boolean} = {};
        for (const review of updatedReviews) {
          if (!review.response) {
            try {
              const canRespond = await canRespondToReview(review.reviewId);
              updatedRespondableReviews[review.reviewId] = canRespond;
            } catch (error) {
              console.error(`Error checking if courier can respond to review ${review.reviewId}:`, error);
            }
          }
        }
        
        setCanRespondToReviews(updatedRespondableReviews);
      } catch (error) {
        console.error('Error refreshing reviews:', error);
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 3, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        {/* Dashboard Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 3, 
              p: 1, 
              borderRadius: 2,
              bgcolor: isAvailable ? 'success.light' : 'error.light',
              color: 'white',
              transition: 'background-color 0.3s ease'
            }}>
              <Typography sx={{ mr: 1, fontWeight: 'medium' }}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Typography>
              <Tooltip title={isAvailable ? "Set as Unavailable" : "Set as Available"}>
                <Switch
                  checked={isAvailable}
                  onChange={handleToggleAvailability}
                  color="primary"
                  inputProps={{ 'aria-label': 'Toggle availability' }}
                />
              </Tooltip>
            </Box>
            <Avatar 
              sx={{ 
                width: 50, 
                height: 50, 
                bgcolor: 'primary.main',
                mr: 2
              }}
            >
              <DeliveryIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" fontWeight="bold">
                Courier Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your deliveries and orders
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge 
              badgeContent={activeDeliveries.length} 
              color="primary"
              sx={{ mr: 2 }}
            >
              <DeliveryDining />
            </Badge>
            <Typography sx={{ fontWeight: 'medium' }}>
              {activeDeliveries.length}/3 Deliveries
            </Typography>
          </Box>
        </Box>

        {/* Success and Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Dashboard Tabs */}
        <Paper sx={{ mb: 2, borderRadius: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Active Deliveries" icon={<DeliveryDining />} iconPosition="start" />
            <Tab label="Available Orders" icon={<ReceiptIcon />} iconPosition="start" />
            <Tab label="Past Deliveries" icon={<HistoryIcon />} iconPosition="start" />
            <Tab label="Reviews" icon={<StarIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Active Deliveries Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Your Active Deliveries
          </Typography>
          
          {loading && activeDeliveries.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : activeDeliveries.length === 0 ? (
            <Alert severity="info">
              You don't have any active deliveries. Go to the "Available Orders" tab to accept new orders.
            </Alert>
          ) : (
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.light' }}>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Restaurant</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Order Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeDeliveries.map((delivery) => {
                    // Find the active assignment for this delivery
                    const activeAssignment = delivery.courierAssignments.find(
                      a => a.status === 'ACCEPTED' || a.status === 'PICKED_UP'
                    );
                    
                    // If no active assignment, skip this delivery
                    if (!activeAssignment) return null;
                    
                    return (
                      <TableRow key={delivery.orderId} hover>
                        <TableCell>#{delivery.orderId}</TableCell>
                        <TableCell>{delivery.restaurant ? delivery.restaurant.name : 'Unknown'}</TableCell>
                        <TableCell>{delivery.customer ? delivery.customer.name : 'Unknown'}</TableCell>
                        <TableCell>
                          {delivery.address ? 
                            (delivery.address.fullAddress || 
                             `${delivery.address.street || ''}, ${delivery.address.city || ''}`) 
                            : 'Unknown'}
                        </TableCell>
                        <TableCell>{formatDateTime(delivery.createdAt)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={activeAssignment.status} 
                            color={
                              activeAssignment.status === 'PICKED_UP' ? 'primary' : 
                              activeAssignment.status === 'ACCEPTED' ? 'warning' : 'default'
                            } 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${delivery.totalPrice.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewOrderDetails(delivery)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {activeAssignment.status === 'ACCEPTED' && (
                              <Tooltip title="Pick Up Order">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handlePickupOrder(delivery)}
                                >
                                  <DeliveryDining fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {activeAssignment.status === 'PICKED_UP' && (
                              <Tooltip title="Mark as Delivered">
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleCompleteDelivery(delivery)}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Cancel Delivery">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleCancelDelivery(delivery)}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Available Orders Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Available Orders for Pickup
            </Typography>
            {activeDeliveries.length >= 3 && (
              <Alert severity="warning" sx={{ maxWidth: 'fit-content' }}>
                You have reached the maximum of 3 active deliveries
              </Alert>
            )}
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading available orders...</Typography>
            </Box>
          ) : availableOrders.length === 0 ? (
            <Alert severity="info">
              There are no orders available for pickup at the moment.
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Debug info - Orders array length: {availableOrders.length}
                </Typography>
              </Box>
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Found {availableOrders.length} order(s) available for pickup
              </Typography>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>Assignment ID</TableCell>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Restaurant</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Order Time</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableOrders
                      .slice((availableOrdersPage - 1) * itemsPerPage, availableOrdersPage * itemsPerPage)
                      .filter((assignment: PendingDeliveryRequest) => assignment && assignment.order)
                      .map((assignment: PendingDeliveryRequest) => (
                      <TableRow key={assignment.assignmentId} hover>
                        <TableCell>#{assignment.assignmentId}</TableCell>
                        <TableCell>#{assignment.order.orderId}</TableCell>
                        <TableCell>{assignment.order.restaurant?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          {assignment.order?.address ? 
                            (assignment.order.address.fullAddress || 
                             `${assignment.order.address.street || ''}, ${assignment.order.address.city || ''}`) 
                            : 'Unknown'}
                        </TableCell>
                        <TableCell>{assignment.order.createdAt ? formatDateTime(assignment.order.createdAt) : 'Unknown'}</TableCell>
                        <TableCell>${assignment.order.totalPrice ? assignment.order.totalPrice.toFixed(2) : '0.00'}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewOrderDetails(assignment)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<DoubleArrowIcon />}
                              onClick={() => handleAcceptOrder(assignment)}
                              disabled={activeDeliveries.length >= 3}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleRejectOrder(assignment)}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={Math.ceil(availableOrders.length / itemsPerPage)} 
                  page={availableOrdersPage}
                  onChange={handleAvailableOrdersPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </TabPanel>

        {/* Past Deliveries Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Your Delivery History
          </Typography>
          
          {loading && pastDeliveries.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : pastDeliveries.length === 0 ? (
            <Alert severity="info">
              You don't have any past deliveries yet.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Restaurant</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Address</TableCell>
                      <TableCell>Assigned At</TableCell>
                      <TableCell>Delivered At</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pastDeliveries
                      .slice((pastDeliveriesPage - 1) * itemsPerPage, pastDeliveriesPage * itemsPerPage)
                      .map((delivery) => (
                      <TableRow key={delivery.orderId} hover>
                        <TableCell>#{delivery.orderId}</TableCell>
                        <TableCell>{delivery.restaurantName}</TableCell>
                        <TableCell>{delivery.customerName}</TableCell>
                        <TableCell>{delivery.deliveryAddress}</TableCell>
                        <TableCell>{formatDateTime(delivery.assignedAt)}</TableCell>
                        <TableCell>{delivery.deliveredAt ? formatDateTime(delivery.deliveredAt) : 'N/A'}</TableCell>
                        <TableCell>${delivery.totalPrice.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={delivery.assignmentStatus} 
                            color={delivery.assignmentStatus === 'DELIVERED' ? 'success' : 
                                  delivery.assignmentStatus === 'CANCELLED' ? 'error' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={Math.ceil(pastDeliveries.length / itemsPerPage)} 
                  page={pastDeliveriesPage}
                  onChange={handlePastDeliveriesPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </TabPanel>

        {/* Reviews tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            My Reviews
          </Typography>

          {loadingReviews ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {reviews.length > 0 ? (
                <Paper sx={{ p: 3 }}>
                  {reviews.map(review => (
                    <Box key={review.reviewId} sx={{ mb: 3 }}>
                      {/* Display review */}
                      <Box>
                        <Card sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              Order #{review.orderId}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating value={review.rating} readOnly precision={0.5} />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {review.rating}/5
                              </Typography>
                            </Box>
                            {review.comment && (
                              <Typography variant="body1" gutterBottom>
                                "{review.comment}"
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              - {review.customerName}, {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                            
                            {/* Show response if it exists */}
                            {review.response && (
                              <Box sx={{ 
                                mt: 2, 
                                pt: 2, 
                                pl: 2, 
                                borderLeft: '3px solid #f0f0f0',
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                borderRadius: 1
                              }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Your Response:
                                </Typography>
                                <Typography variant="body2">
                                  {review.response}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                      
                      {/* Response form if courier can respond */}
                      {canRespondToReviews[review.reviewId] && (
                        <ReviewResponse 
                          review={review}
                          onResponseSubmitted={handleReviewResponseSubmitted}
                        />
                      )}
                    </Box>
                  ))}
                </Paper>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    You haven't received any reviews yet.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </TabPanel>

        {/* Order Details Dialog */}
        <Dialog
          open={orderDetailsOpen}
          onClose={handleCloseOrderDetails}
          maxWidth="sm"
          fullWidth
        >
          {selectedOrder && (
            <>
              <DialogTitle>
                {selectedOrder.orderId 
                  ? `Order #${selectedOrder.orderId} Details` 
                  : selectedOrder.order 
                    ? `Order #${selectedOrder.order.orderId} Details`
                    : 'Order Details'
                }
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                  {selectedOrder.assignmentStatus ? (
                    <Chip 
                      label={selectedOrder.assignmentStatus} 
                      color={
                        selectedOrder.assignmentStatus === 'DELIVERED' ? "success" : 
                        selectedOrder.assignmentStatus === 'CANCELLED' ? "error" : "primary"
                      }
                      sx={{ mb: 2 }}
                    />
                  ) : selectedOrder.status ? (
                    <Chip 
                      label={selectedOrder.status} 
                      color={
                        selectedOrder.status === 'DELIVERED' ? "success" : 
                        selectedOrder.status === 'OUT_FOR_DELIVERY' ? "primary" : "warning"
                      }
                      sx={{ mb: 2 }}
                    />
                  ) : selectedOrder.order ? (
                    <Chip 
                      label={selectedOrder.status} 
                      color="warning"
                      sx={{ mb: 2 }}
                    />
                  ) : null}
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Order Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Restaurant</Typography>
                      <Typography variant="body1">
                        {selectedOrder.restaurantName || 
                         (selectedOrder.restaurant && selectedOrder.restaurant.name) ||
                         (selectedOrder.order && selectedOrder.order.restaurant && selectedOrder.order.restaurant.name) ||
                         'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                      <Typography variant="body1">
                        ${(selectedOrder.totalPrice || 
                           (selectedOrder.order && selectedOrder.order.totalPrice) || 
                           0).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Order Time</Typography>
                      <Typography variant="body1">
                        {selectedOrder.createdAt 
                          ? formatDateTime(selectedOrder.createdAt)
                          : selectedOrder.order && selectedOrder.order.createdAt
                            ? formatDateTime(selectedOrder.order.createdAt)
                            : selectedOrder.assignedAt
                              ? formatDateTime(selectedOrder.assignedAt)
                              : 'N/A'}
                      </Typography>
                    </Box>
                    {selectedOrder.deliveredAt && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Delivery Time</Typography>
                        <Typography variant="body1">{formatDateTime(selectedOrder.deliveredAt)}</Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">
                        {selectedOrder.customerName ||
                         (selectedOrder.customer && selectedOrder.customer.name) ||
                         (selectedOrder.order && selectedOrder.order.customer && selectedOrder.order.customer.name) ||
                         'Unknown'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">
                        {selectedOrder.deliveryAddress ||
                         (selectedOrder.address && (selectedOrder.address.fullAddress || 
                                                   `${selectedOrder.address.street}, ${selectedOrder.address.city}`)) ||
                         (selectedOrder.order && selectedOrder.order.address && 
                          (selectedOrder.order.address.fullAddress || 
                           `${selectedOrder.order.address.street}, ${selectedOrder.order.address.city}`)) ||
                         'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                {selectedOrder.courierAssignments && selectedOrder.courierAssignments.some((a: any) => a.status === 'ACCEPTED') && (
                  <Button 
                    onClick={() => {
                      handlePickupOrder(selectedOrder);
                      handleCloseOrderDetails();
                    }}
                    color="warning" 
                    variant="contained"
                    startIcon={<DeliveryDining />}
                  >
                    Pick Up Order
                  </Button>
                )}
                {selectedOrder.courierAssignments && selectedOrder.courierAssignments.some((a: any) => a.status === 'PICKED_UP') && (
                  <Button 
                    onClick={() => {
                      handleCompleteDelivery(selectedOrder);
                      handleCloseOrderDetails();
                    }}
                    color="success" 
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                  >
                    Mark as Delivered
                  </Button>
                )}
                {selectedOrder.status === 'REQUESTED' && selectedOrder.order && (
                  <>
                    <Button 
                      onClick={() => {
                        handleRejectOrder(selectedOrder);
                        handleCloseOrderDetails();
                      }}
                      color="error" 
                      variant="outlined"
                      startIcon={<CancelIcon />}
                    >
                      Reject Order
                    </Button>
                    <Button 
                      onClick={() => {
                        handleAcceptOrder(selectedOrder);
                        handleCloseOrderDetails();
                      }}
                      color="primary" 
                      variant="contained"
                      startIcon={<DoubleArrowIcon />}
                      disabled={activeDeliveries.length >= 3}
                    >
                      Accept Order
                    </Button>
                  </>
                )}
                <Button onClick={handleCloseOrderDetails} color="inherit">
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default CourierDashboard; 