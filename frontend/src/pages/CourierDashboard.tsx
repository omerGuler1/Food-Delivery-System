import React, { useState, useEffect } from 'react';
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
  Badge
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
  DoubleArrow as DoubleArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Dummy data for active deliveries
const activeDeliveriesData = [
  {
    orderId: 1001,
    restaurantName: 'Pizza Palace',
    customerName: 'John Doe',
    address: '123 Main St, Anytown',
    orderTime: '2023-07-15T14:30:00',
    estimatedDeliveryTime: '2023-07-15T15:15:00',
    status: 'On the way',
    amount: 24.99
  },
  {
    orderId: 1002,
    restaurantName: 'Burger King',
    customerName: 'Jane Smith',
    address: '456 Oak Ave, Somewhere',
    orderTime: '2023-07-15T15:00:00',
    estimatedDeliveryTime: '2023-07-15T15:45:00',
    status: 'On the way',
    amount: 18.50
  }
];

// Dummy data for available orders
const availableOrdersData = [
  {
    orderId: 1003,
    restaurantName: 'Taco Bell',
    customerName: 'Mike Johnson',
    address: '789 Pine St, Nowhere',
    orderTime: '2023-07-15T15:20:00',
    status: 'Ready for pickup',
    amount: 15.75,
    distance: 3.2
  },
  {
    orderId: 1004,
    restaurantName: 'Subway',
    customerName: 'Lisa Brown',
    address: '321 Elm St, Anywhere',
    orderTime: '2023-07-15T15:25:00',
    status: 'Ready for pickup',
    amount: 12.49,
    distance: 2.7
  },
  {
    orderId: 1005,
    restaurantName: 'KFC',
    customerName: 'David Wilson',
    address: '654 Maple St, Somewhere',
    orderTime: '2023-07-15T15:30:00',
    status: 'Ready for pickup',
    amount: 22.99,
    distance: 4.5
  },
  {
    orderId: 1006,
    restaurantName: 'Pizza Hut',
    customerName: 'Sarah Green',
    address: '987 Cedar St, Anywhere',
    orderTime: '2023-07-15T15:35:00',
    status: 'Ready for pickup',
    amount: 27.99,
    distance: 3.8
  }
];

// Dummy data for past deliveries
const pastDeliveriesData = Array.from({ length: 50 }, (_, i) => ({
  orderId: 900 + i,
  restaurantName: ['Pizza Palace', 'Burger King', 'Taco Bell', 'Subway', 'KFC', 'McDonald\'s'][Math.floor(Math.random() * 6)],
  customerName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Lisa Brown', 'David Wilson', 'Sarah Green'][Math.floor(Math.random() * 6)],
  address: ['123 Main St', '456 Oak Ave', '789 Pine St', '321 Elm St', '654 Maple St', '987 Cedar St'][Math.floor(Math.random() * 6)] + [', Anytown', ', Somewhere', ', Nowhere', ', Anywhere'][Math.floor(Math.random() * 4)],
  orderTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  deliveryTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
  status: 'Delivered',
  amount: parseFloat((Math.random() * 30 + 10).toFixed(2))
}));

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeDeliveries, setActiveDeliveries] = useState(activeDeliveriesData);
  const [availableOrders, setAvailableOrders] = useState(availableOrdersData);
  const [pastDeliveries, setPastDeliveries] = useState(pastDeliveriesData);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [pastDeliveriesPage, setPastDeliveriesPage] = useState(1);
  const [availableOrdersPage, setAvailableOrdersPage] = useState(1);
  const itemsPerPage = 10;

  // Toggle courier availability
  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    setSuccessMessage(`You are now ${!isAvailable ? 'available' : 'unavailable'} for deliveries`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Accept an order
  const handleAcceptOrder = (order: any) => {
    if (activeDeliveries.length >= 3) {
      setError('You can accept maximum 3 orders at a time');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Remove from available orders
    setAvailableOrders(availableOrders.filter(o => o.orderId !== order.orderId));

    // Add to active deliveries
    const newOrder = {
      ...order,
      status: 'On the way',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString()
    };
    setActiveDeliveries([...activeDeliveries, newOrder]);

    // Show success message
    setSuccessMessage(`Order #${order.orderId} accepted`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Complete delivery
  const handleCompleteDelivery = (orderId: number) => {
    // Find the order
    const order = activeDeliveries.find(o => o.orderId === orderId);
    if (!order) return;

    // Remove from active deliveries
    setActiveDeliveries(activeDeliveries.filter(o => o.orderId !== orderId));

    // Add to past deliveries
    const completedOrder = {
      ...order,
      status: 'Delivered',
      deliveryTime: new Date().toISOString()
    };
    setPastDeliveries([completedOrder, ...pastDeliveries]);

    // Show success message
    setSuccessMessage(`Order #${orderId} delivered successfully`);
    setTimeout(() => setSuccessMessage(null), 3000);
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
              <Tooltip title={isAvailable ? "Set as unavailable" : "Set as available"}>
                <Switch
                  checked={isAvailable}
                  onChange={toggleAvailability}
                  color="default"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#fff',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#fff',
                      opacity: 0.5
                    },
                  }}
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
          </Tabs>
        </Paper>

        {/* Active Deliveries Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            Your Active Deliveries
          </Typography>
          
          {activeDeliveries.length === 0 ? (
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
                    <TableCell>Delivery By</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeDeliveries.map((delivery) => (
                    <TableRow key={delivery.orderId} hover>
                      <TableCell>#{delivery.orderId}</TableCell>
                      <TableCell>{delivery.restaurantName}</TableCell>
                      <TableCell>{delivery.customerName}</TableCell>
                      <TableCell>{delivery.address}</TableCell>
                      <TableCell>{formatDate(delivery.orderTime)}</TableCell>
                      <TableCell>{formatDate(delivery.estimatedDeliveryTime)}</TableCell>
                      <TableCell>${delivery.amount.toFixed(2)}</TableCell>
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
                          <Tooltip title="Mark as Delivered">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleCompleteDelivery(delivery.orderId)}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
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
          
          {availableOrders.length === 0 ? (
            <Alert severity="info">
              There are no orders available for pickup at the moment.
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
                      <TableCell>Order Time</TableCell>
                      <TableCell>Distance</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableOrders
                      .slice((availableOrdersPage - 1) * itemsPerPage, availableOrdersPage * itemsPerPage)
                      .map((order) => (
                      <TableRow key={order.orderId} hover>
                        <TableCell>#{order.orderId}</TableCell>
                        <TableCell>{order.restaurantName}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.address}</TableCell>
                        <TableCell>{formatDate(order.orderTime)}</TableCell>
                        <TableCell>{order.distance} km</TableCell>
                        <TableCell>${order.amount.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<DoubleArrowIcon />}
                              onClick={() => handleAcceptOrder(order)}
                              disabled={activeDeliveries.length >= 3}
                            >
                              Accept
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
          
          {pastDeliveries.length === 0 ? (
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
                      <TableCell>Order Time</TableCell>
                      <TableCell>Delivery Time</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
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
                        <TableCell>{delivery.address}</TableCell>
                        <TableCell>{formatDate(delivery.orderTime)}</TableCell>
                        <TableCell>{formatDate(delivery.deliveryTime)}</TableCell>
                        <TableCell>${delivery.amount.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewOrderDetails(delivery)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
                Order #{selectedOrder.orderId} Details
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={selectedOrder.status} 
                    color={selectedOrder.status === 'Delivered' ? "success" : "primary"}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Order Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Restaurant</Typography>
                      <Typography variant="body1">{selectedOrder.restaurantName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                      <Typography variant="body1">${selectedOrder.amount.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Order Time</Typography>
                      <Typography variant="body1">{formatDate(selectedOrder.orderTime)}</Typography>
                    </Box>
                    {selectedOrder.deliveryTime && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Delivery Time</Typography>
                        <Typography variant="body1">{formatDate(selectedOrder.deliveryTime)}</Typography>
                      </Box>
                    )}
                    {selectedOrder.estimatedDeliveryTime && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Estimated Delivery</Typography>
                        <Typography variant="body1">{formatDate(selectedOrder.estimatedDeliveryTime)}</Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1">{selectedOrder.customerName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">{selectedOrder.address}</Typography>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                {activeDeliveries.some(d => d.orderId === selectedOrder.orderId) && (
                  <Button 
                    onClick={() => {
                      handleCompleteDelivery(selectedOrder.orderId);
                      handleCloseOrderDetails();
                    }}
                    color="success" 
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                  >
                    Mark as Delivered
                  </Button>
                )}
                {availableOrders.some(o => o.orderId === selectedOrder.orderId) && activeDeliveries.length < 3 && (
                  <Button 
                    onClick={() => {
                      handleAcceptOrder(selectedOrder);
                      handleCloseOrderDetails();
                    }}
                    color="primary" 
                    variant="contained"
                    startIcon={<DoubleArrowIcon />}
                  >
                    Accept Order
                  </Button>
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