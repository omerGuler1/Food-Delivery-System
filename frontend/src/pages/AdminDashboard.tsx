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
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Avatar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  LocalShipping as DeliveryIcon,
  Restaurant as RestaurantIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAllCustomers,
  getAllCouriers,
  getAllRestaurants,
  deleteCustomer,
  deleteCourier,
  deleteRestaurant,
  banCustomer,
  banCourier,
  banRestaurant,
  CustomerListItem,
  CourierListItem,
  RestaurantListItem
} from '../services/adminService';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Data state
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [couriers, setCouriers] = useState<CourierListItem[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
  
  // Pagination state
  const [customersPage, setCustomersPage] = useState(1);
  const [couriersPage, setCouriersPage] = useState(1);
  const [restaurantsPage, setRestaurantsPage] = useState(1);
  const itemsPerPage = 10;

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Pagination handlers
  const handleCustomersPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCustomersPage(value);
  };

  const handleCouriersPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCouriersPage(value);
  };

  const handleRestaurantsPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setRestaurantsPage(value);
  };

  // Action handlers - these are placeholders that will be implemented later
  const handleDeleteCustomer = async (customerId: number) => {
    try {
      await deleteCustomer(customerId);
      setSuccessMessage(`Customer deletion functionality will be implemented soon.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to delete customer');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditCustomer = (customerId: number) => {
    setSuccessMessage(`Customer edit functionality will be implemented soon.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleBanCustomer = async (customerId: number) => {
    try {
      await banCustomer(customerId);
      setSuccessMessage(`Customer ban functionality will be implemented soon.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to ban customer');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteCourier = async (courierId: number) => {
    try {
      await deleteCourier(courierId);
      setSuccessMessage(`Courier deletion functionality will be implemented soon.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to delete courier');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditCourier = (courierId: number) => {
    setSuccessMessage(`Courier edit functionality will be implemented soon.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleBanCourier = async (courierId: number) => {
    try {
      await banCourier(courierId);
      setSuccessMessage(`Courier ban functionality will be implemented soon.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to ban courier');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: number) => {
    try {
      await deleteRestaurant(restaurantId);
      setSuccessMessage(`Restaurant deletion functionality will be implemented soon.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to delete restaurant');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditRestaurant = (restaurantId: number) => {
    setSuccessMessage(`Restaurant edit functionality will be implemented soon.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleBanRestaurant = async (restaurantId: number) => {
    try {
      await banRestaurant(restaurantId);
      setSuccessMessage(`Restaurant ban functionality will be implemented soon.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to ban restaurant');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Data fetching functions
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const data = await getAllCouriers();
      setCouriers(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch couriers');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (activeTab === 0) {
      fetchCustomers();
    } else if (activeTab === 1) {
      fetchCouriers();
    } else if (activeTab === 2) {
      fetchRestaurants();
    }
  }, [activeTab]);

  return (
    <Box sx={{ minHeight: '100vh', py: 3, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        {/* Dashboard Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 50, 
              height: 50, 
              bgcolor: 'primary.main',
              mr: 2
            }}
          >
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Admin Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage users, couriers, and restaurants
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
            <Tab label="Customers" icon={<PersonIcon />} iconPosition="start" />
            <Tab label="Couriers" icon={<DeliveryIcon />} iconPosition="start" />
            <Tab label="Restaurants" icon={<RestaurantIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Customers Tab */}
        <TabPanel value={activeTab} index={0}>
          <Typography variant="h6" gutterBottom>
            All Customers
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : customers.length === 0 ? (
            <Alert severity="info">
              No customers found in the system.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customers
                      .slice((customersPage - 1) * itemsPerPage, customersPage * itemsPerPage)
                      .map((customer) => (
                        <TableRow key={customer.customerId} hover>
                          <TableCell>#{customer.customerId}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phoneNumber}</TableCell>
                          <TableCell>{customer.createdAt}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Edit Customer">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleEditCustomer(customer.customerId)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Customer">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteCustomer(customer.customerId)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Ban Customer">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleBanCustomer(customer.customerId)}
                                >
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={Math.ceil(customers.length / itemsPerPage)} 
                  page={customersPage}
                  onChange={handleCustomersPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </TabPanel>

        {/* Couriers Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            All Couriers
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : couriers.length === 0 ? (
            <Alert severity="info">
              No couriers found in the system.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Vehicle Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Earnings</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {couriers
                      .slice((couriersPage - 1) * itemsPerPage, couriersPage * itemsPerPage)
                      .map((courier) => (
                        <TableRow key={courier.courierId} hover>
                          <TableCell>#{courier.courierId}</TableCell>
                          <TableCell>{courier.name}</TableCell>
                          <TableCell>{courier.email}</TableCell>
                          <TableCell>{courier.phoneNumber}</TableCell>
                          <TableCell>{courier.vehicleType}</TableCell>
                          <TableCell>
                            <Chip 
                              label={courier.status} 
                              color={courier.status === 'AVAILABLE' ? 'success' : 'error'} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>${courier.earnings?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Edit Courier">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleEditCourier(courier.courierId)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Courier">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteCourier(courier.courierId)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Ban Courier">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleBanCourier(courier.courierId)}
                                >
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={Math.ceil(couriers.length / itemsPerPage)} 
                  page={couriersPage}
                  onChange={handleCouriersPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </TabPanel>

        {/* Restaurants Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            All Restaurants
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : restaurants.length === 0 ? (
            <Alert severity="info">
              No restaurants found in the system.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Cuisine</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {restaurants
                      .slice((restaurantsPage - 1) * itemsPerPage, restaurantsPage * itemsPerPage)
                      .map((restaurant) => (
                        <TableRow key={restaurant.restaurantId} hover>
                          <TableCell>#{restaurant.restaurantId}</TableCell>
                          <TableCell>{restaurant.name}</TableCell>
                          <TableCell>{restaurant.email}</TableCell>
                          <TableCell>{restaurant.phoneNumber}</TableCell>
                          <TableCell>{restaurant.cuisineType}</TableCell>
                          <TableCell>{restaurant.rating?.toFixed(1) || 'N/A'}</TableCell>
                          <TableCell>{restaurant.city || 'N/A'}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Edit Restaurant">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleEditRestaurant(restaurant.restaurantId)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Restaurant">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeleteRestaurant(restaurant.restaurantId)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Ban Restaurant">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => handleBanRestaurant(restaurant.restaurantId)}
                                >
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                  count={Math.ceil(restaurants.length / itemsPerPage)} 
                  page={restaurantsPage}
                  onChange={handleRestaurantsPageChange}
                  color="primary"
                />
              </Box>
            </>
          )}
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 