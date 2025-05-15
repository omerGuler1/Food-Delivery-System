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
  Tab
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  ArrowBack,
  LocalShipping as DeliveryIcon,
  History as HistoryIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OrderResponseDTO } from '../interfaces';
import { getCustomerOrders, cancelOrder } from '../services/orderService';

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
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Restaurant
                      </Typography>
                      <Typography variant="body1">
                        {order.restaurant.name}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Order Items */}
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Order Items
                  </Typography>
                  <List dense>
                    {order.orderItems.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={
                            <Typography variant="body1">
                              {item.quantity}x {item.menuItem.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {item.menuItem.description}
                            </Typography>
                          }
                        />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          ${item.subtotal.toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>

                  {/* Delivery Address */}
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Delivery Address
                      </Typography>
                      <Typography variant="body1">
                        {order.address.fullAddress || 
                         `${order.address.street}, ${order.address.city}`}
                      </Typography>
                    </CardContent>
                  </Card>
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            icon={<DeliveryIcon />} 
            label={`Active Orders (${activeOrders.length})`} 
            iconPosition="start"
          />
          <Tab 
            icon={<HistoryIcon />} 
            label={`Past Orders (${pastOrders.length})`} 
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {renderOrderList(activeOrders)}
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          {renderOrderList(pastOrders)}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default CustomerOrdersPage; 