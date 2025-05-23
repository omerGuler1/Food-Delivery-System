import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  ArrowBack,
  LocalShipping as DeliveryIcon,
  History as HistoryIcon,
  Cancel as CancelIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OrderResponseDTO, ReviewRole } from '../interfaces';
import { getCustomerOrders, cancelOrder } from '../services/orderService';
import { canCustomerReview, getReviewsByOrderId } from '../services/reviewService';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CustomerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  
  // Review States
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<OrderResponseDTO | null>(null);
  const [selectedReviewRole, setSelectedReviewRole] = useState<ReviewRole | null>(null);
  const [canReviewRestaurant, setCanReviewRestaurant] = useState<{[key: number]: boolean}>({});
  const [canReviewCourier, setCanReviewCourier] = useState<{[key: number]: boolean}>({});
  const [orderReviews, setOrderReviews] = useState<{[key: number]: any[]}>({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const customerOrders = await getCustomerOrders();
        setOrders(customerOrders);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Check if customer can leave reviews for completed orders
  useEffect(() => {
    const checkReviewEligibility = async () => {
      const restaurantEligibility: {[key: number]: boolean} = {};
      const courierEligibility: {[key: number]: boolean} = {};
      
      for (const order of orders) {
        if (order.status === 'DELIVERED') {
          try {
            // Check if customer can review restaurant
            const canReviewRest = await canCustomerReview(order.orderId, ReviewRole.RESTAURANT);
            restaurantEligibility[order.orderId] = canReviewRest;
            
            // Check if customer can review courier (if there was a courier)
            if (order.courier) {
              const canReviewCour = await canCustomerReview(order.orderId, ReviewRole.COURIER);
              courierEligibility[order.orderId] = canReviewCour;
            }
            
            // Load existing reviews for this order
            const reviews = await getReviewsByOrderId(order.orderId);
            setOrderReviews(prev => ({ ...prev, [order.orderId]: reviews }));
          } catch (err) {
            console.error(`Error checking review eligibility for order ${order.orderId}:`, err);
          }
        }
      }
      
      setCanReviewRestaurant(restaurantEligibility);
      setCanReviewCourier(courierEligibility);
    };
    
    if (orders.length > 0) {
      checkReviewEligibility();
    }
  }, [orders]);

  const handleOrderClick = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'OUT_FOR_DELIVERY':
        return 'primary';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const isActiveOrder = (status: string) => {
    return ['PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY'].includes(status);
  };

  const activeOrders = orders.filter(order => isActiveOrder(order.status));
  const pastOrders = orders.filter(order => !isActiveOrder(order.status));

  const handleCancelOrder = async (orderId: number) => {
    try {
      setProcessingOrder(orderId);
      setError(null);
      
      await cancelOrder(orderId);
      
      // Update the orders state to reflect the new status
      setOrders(orders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'CANCELLED' }
          : order
      ));
      
      setSuccessMessage(`Order #${orderId} has been cancelled`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      
      let errorMessage = 'Failed to cancel order.';
      
      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response && error.response.status === 403) {
        errorMessage = 'You do not have permission to cancel this order.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingOrder(null);
    }
  };

  // Handle opening the review dialog
  const handleOpenReviewDialog = (order: OrderResponseDTO, role: ReviewRole) => {
    setSelectedReviewOrder(order);
    setSelectedReviewRole(role);
    setReviewDialogOpen(true);
  };

  // Handle closing the review dialog
  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedReviewOrder(null);
    setSelectedReviewRole(null);
  };

  // Handle successful submission of a review
  const handleReviewSubmitted = async () => {
    if (selectedReviewOrder) {
      // Refresh reviews for this order
      try {
        const reviews = await getReviewsByOrderId(selectedReviewOrder.orderId);
        setOrderReviews(prev => ({ ...prev, [selectedReviewOrder.orderId]: reviews }));
        
        // Update eligibility
        if (selectedReviewRole === ReviewRole.RESTAURANT) {
          setCanReviewRestaurant(prev => ({ ...prev, [selectedReviewOrder.orderId]: false }));
        } else if (selectedReviewRole === ReviewRole.COURIER) {
          setCanReviewCourier(prev => ({ ...prev, [selectedReviewOrder.orderId]: false }));
        }
      } catch (err) {
        console.error('Error refreshing reviews:', err);
      }
    }
    
    // Close dialog after a short delay to show success message
    setTimeout(() => {
      handleCloseReviewDialog();
    }, 1500);
  };

  const renderOrderList = (orderList: OrderResponseDTO[]) => {
    if (orderList.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === 0 
              ? "You don't have any active orders at the moment."
              : "You don't have any past orders."}
          </Typography>
        </Paper>
      );
    }

    return (
      <List>
        {orderList.map((order) => (
          <React.Fragment key={order.orderId}>
            <Paper 
              elevation={2} 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              <ListItem
                button
                onClick={() => handleOrderClick(order.orderId)}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  p: 2
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 2 }}>
                      Order #{order.orderId}
                    </Typography>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mt: { xs: 1, sm: 0 }
                }}>
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    ${order.totalPrice.toFixed(2)}
                  </Typography>
                  {order.status === 'PENDING' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelOrder(order.orderId);
                      }}
                      disabled={processingOrder === order.orderId}
                      sx={{ mr: 1 }}
                    >
                      {processingOrder === order.orderId ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
                  {expandedOrder === order.orderId ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
              </ListItem>

              <Collapse in={expandedOrder === order.orderId}>
                <Divider />
                <Box sx={{ p: 2 }}>
                  {/* Restaurant Information */}
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {order.restaurant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {order.restaurant.address?.street}, {order.restaurant.address?.city}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Order items */}
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  
                  {order.orderItems.map((item) => (
                    <Box 
                      key={item.orderItemId} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 1 
                      }}
                    >
                      <Typography>
                        {item.quantity} x {item.menuItem.name}
                      </Typography>
                      <Typography fontWeight="bold">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Total</Typography>
                    <Typography fontWeight="bold">${order.totalPrice.toFixed(2)}</Typography>
                  </Box>

                  {/* Delivery Address */}
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Delivery Address
                  </Typography>
                  <Typography variant="body1">
                    {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}
                  </Typography>
                  
                  {/* Reviews section for completed orders */}
                  {order.status === 'DELIVERED' && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Reviews
                      </Typography>
                      
                      {/* Display existing reviews */}
                      {orderReviews[order.orderId] && orderReviews[order.orderId].length > 0 ? (
                        <ReviewList 
                          reviews={orderReviews[order.orderId]} 
                          showTitle={false}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No reviews yet for this order.
                        </Typography>
                      )}
                      
                      {/* Add review buttons */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        {canReviewRestaurant[order.orderId] && (
                          <Button 
                            variant="outlined" 
                            startIcon={<StarIcon />}
                            onClick={() => handleOpenReviewDialog(order, ReviewRole.RESTAURANT)}
                          >
                            Review Restaurant
                          </Button>
                        )}
                        
                        {order.courier && canReviewCourier[order.orderId] && (
                          <Button 
                            variant="outlined" 
                            startIcon={<StarIcon />}
                            onClick={() => handleOpenReviewDialog(order, ReviewRole.COURIER)}
                          >
                            Review Courier
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Paper>
          </React.Fragment>
        ))}
      </List>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          My Orders
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab 
                icon={<DeliveryIcon />} 
                label={`Active (${activeOrders.length})`} 
                id="orders-tab-0"
                aria-controls="orders-tabpanel-0"
              />
              <Tab 
                icon={<HistoryIcon />} 
                label={`Past (${pastOrders.length})`} 
                id="orders-tab-1"
                aria-controls="orders-tabpanel-1"
              />
            </Tabs>
          </Paper>

          <TabPanel value={activeTab} index={0}>
            {renderOrderList(activeOrders)}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderOrderList(pastOrders)}
          </TabPanel>
        </>
      )}
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={handleCloseReviewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReviewRole === ReviewRole.RESTAURANT ? 'Restaurant Review' : 'Courier Review'}
        </DialogTitle>
        <DialogContent>
          {selectedReviewOrder && selectedReviewRole && (
            <ReviewForm
              orderId={selectedReviewOrder.orderId}
              role={selectedReviewRole}
              targetName={
                selectedReviewRole === ReviewRole.RESTAURANT
                  ? selectedReviewOrder.restaurant.name
                  : selectedReviewOrder.courier ? selectedReviewOrder.courier.name : ''
              }
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CustomerOrdersPage; 