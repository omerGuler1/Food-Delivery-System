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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  TableSortLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  LocalShipping as DeliveryIcon,
  Restaurant as RestaurantIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
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
  editCustomer,
  editRestaurant,
  editCourier,
  CustomerListItem,
  CourierListItem,
  RestaurantListItem
} from '../services/adminService';
import { AdminEditCustomerRequest, AdminEditRestaurantRequest, AdminEditCourierRequest } from '../interfaces';

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
  
  // Search and filter states
  const [customerSearch, setCustomerSearch] = useState('');
  const [courierSearch, setCourierSearch] = useState('');
  const [restaurantSearch, setRestaurantSearch] = useState('');
  
  // Sorting states
  const [customerOrder, setCustomerOrder] = useState<'asc' | 'desc'>('asc');
  const [customerOrderBy, setCustomerOrderBy] = useState<keyof CustomerListItem>('customerId');
  
  const [courierOrder, setCourierOrder] = useState<'asc' | 'desc'>('asc');
  const [courierOrderBy, setCourierOrderBy] = useState<keyof CourierListItem>('courierId');
  
  const [restaurantOrder, setRestaurantOrder] = useState<'asc' | 'desc'>('asc');
  const [restaurantOrderBy, setRestaurantOrderBy] = useState<keyof RestaurantListItem>('restaurantId');
  
  // Edit modal states
  const [customerEditOpen, setCustomerEditOpen] = useState(false);
  const [courierEditOpen, setCourierEditOpen] = useState(false);
  const [restaurantEditOpen, setRestaurantEditOpen] = useState(false);
  
  // Selected entity for editing
  const [selectedCustomer, setSelectedCustomer] = useState<AdminEditCustomerRequest | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<AdminEditCourierRequest | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<AdminEditRestaurantRequest | null>(null);

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

  // Action handlers for deleting users
  const handleDeleteCustomer = async (customerId: number) => {
    try {
      await deleteCustomer(customerId);
      setSuccessMessage(`Customer successfully deleted`);
      // Refresh the customer list
      fetchCustomers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to delete customer');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Modal handling functions
  const handleOpenCustomerEdit = (customer: CustomerListItem) => {
    setSelectedCustomer({
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    });
    setCustomerEditOpen(true);
  };

  const handleOpenCourierEdit = (courier: CourierListItem) => {
    setSelectedCourier({
      courierId: courier.courierId,
      name: courier.name,
      email: courier.email,
      phoneNumber: courier.phoneNumber,
      vehicleType: courier.vehicleType
    });
    setCourierEditOpen(true);
  };

  const handleOpenRestaurantEdit = (restaurant: RestaurantListItem) => {
    setSelectedRestaurant({
      restaurantId: restaurant.restaurantId,
      name: restaurant.name,
      email: restaurant.email,
      phoneNumber: restaurant.phoneNumber,
      cuisineType: restaurant.cuisineType
    });
    setRestaurantEditOpen(true);
  };

  const handleCloseModals = () => {
    setCustomerEditOpen(false);
    setCourierEditOpen(false);
    setRestaurantEditOpen(false);
  };

  // Ban handlers
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
      setSuccessMessage(`Courier successfully deleted`);
      // Refresh the courier list
      fetchCouriers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to delete courier');
      setTimeout(() => setError(null), 3000);
    }
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
      setSuccessMessage(`Restaurant successfully deleted`);
      // Refresh the restaurant list
      fetchRestaurants();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError('Failed to delete restaurant');
      setTimeout(() => setError(null), 3000);
    }
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

  // Handle customer edit
  const handleEditCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      setLoading(true);
      await editCustomer(selectedCustomer);
      setCustomerEditOpen(false);
      setSuccessMessage('Customer updated successfully');
      fetchCustomers(); // Listeyi yenile
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update customer');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle courier edit
  const handleEditCourier = async () => {
    if (!selectedCourier) return;
    
    try {
      setLoading(true);
      await editCourier(selectedCourier);
      setCourierEditOpen(false);
      setSuccessMessage('Courier updated successfully');
      fetchCouriers(); // Listeyi yenile
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update courier');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle restaurant edit
  const handleEditRestaurant = async () => {
    if (!selectedRestaurant) return;
    
    try {
      setLoading(true);
      await editRestaurant(selectedRestaurant);
      setRestaurantEditOpen(false);
      setSuccessMessage('Restaurant updated successfully');
      fetchRestaurants(); // Listeyi yenile
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update restaurant');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Data fetching functions
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      // ID'ye göre sıralama yap
      const sortedData = [...data].sort((a, b) => a.customerId - b.customerId);
      setCustomers(sortedData);
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
      // ID'ye göre sıralama yap
      const sortedData = [...data].sort((a, b) => a.courierId - b.courierId);
      setCouriers(sortedData);
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
      // ID'ye göre sıralama yap
      const sortedData = [...data].sort((a, b) => a.restaurantId - b.restaurantId);
      setRestaurants(sortedData);
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

  // Sorting functions
  function getComparator<Key extends keyof any>(
    order: 'asc' | 'desc',
    orderBy: Key,
  ): (a: { [key in Key]?: any }, b: { [key in Key]?: any }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  
  function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
    if (!a[orderBy] || !b[orderBy]) {
      return 0;
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  // Handle sorting requests
  const handleRequestSort = (
    entity: 'customer' | 'courier' | 'restaurant',
    property: string,
  ) => {
    if (entity === 'customer') {
      const isAsc = customerOrderBy === property && customerOrder === 'asc';
      setCustomerOrder(isAsc ? 'desc' : 'asc');
      setCustomerOrderBy(property as keyof CustomerListItem);
    } else if (entity === 'courier') {
      const isAsc = courierOrderBy === property && courierOrder === 'asc';
      setCourierOrder(isAsc ? 'desc' : 'asc');
      setCourierOrderBy(property as keyof CourierListItem);
    } else if (entity === 'restaurant') {
      const isAsc = restaurantOrderBy === property && restaurantOrder === 'asc';
      setRestaurantOrder(isAsc ? 'desc' : 'asc');
      setRestaurantOrderBy(property as keyof RestaurantListItem);
    }
  };

  // Filter functions
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.phoneNumber.toLowerCase().includes(customerSearch.toLowerCase())
    )
    .sort(getComparator(customerOrder, customerOrderBy));

  const filteredCouriers = couriers
    .filter(courier => 
      courier.name.toLowerCase().includes(courierSearch.toLowerCase()) ||
      courier.email.toLowerCase().includes(courierSearch.toLowerCase()) ||
      courier.phoneNumber.toLowerCase().includes(courierSearch.toLowerCase()) ||
      (courier.vehicleType && courier.vehicleType.toLowerCase().includes(courierSearch.toLowerCase()))
    )
    .sort(getComparator(courierOrder, courierOrderBy));

  const filteredRestaurants = restaurants
    .filter(restaurant => 
      restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
      restaurant.email.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
      restaurant.phoneNumber.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
      (restaurant.cuisineType && restaurant.cuisineType.toLowerCase().includes(restaurantSearch.toLowerCase())) ||
      (restaurant.city && restaurant.city.toLowerCase().includes(restaurantSearch.toLowerCase()))
    )
    .sort(getComparator(restaurantOrder, restaurantOrderBy));

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

        {/* Customer Edit Dialog */}
        <Dialog open={customerEditOpen} onClose={handleCloseModals} fullWidth maxWidth="sm">
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogContent>
            {selectedCustomer && (
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Name"
                  value={selectedCustomer.name || ''}
                  onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedCustomer.email || ''}
                  onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone Number"
                  value={selectedCustomer.phoneNumber || ''}
                  onChange={(e) => setSelectedCustomer({...selectedCustomer, phoneNumber: e.target.value})}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="New Password (leave empty to keep current)"
                  type="password"
                  value={selectedCustomer.newPassword || ''}
                  onChange={(e) => setSelectedCustomer({...selectedCustomer, newPassword: e.target.value})}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModals}>Cancel</Button>
            <Button 
              onClick={handleEditCustomer} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Courier Edit Dialog */}
        <Dialog open={courierEditOpen} onClose={handleCloseModals} fullWidth maxWidth="sm">
          <DialogTitle>Edit Courier</DialogTitle>
          <DialogContent>
            {selectedCourier && (
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Name"
                  value={selectedCourier.name || ''}
                  onChange={(e) => setSelectedCourier({...selectedCourier, name: e.target.value})}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedCourier.email || ''}
                  onChange={(e) => setSelectedCourier({...selectedCourier, email: e.target.value})}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone Number"
                  value={selectedCourier.phoneNumber || ''}
                  onChange={(e) => setSelectedCourier({...selectedCourier, phoneNumber: e.target.value})}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                  <Select
                    labelId="vehicle-type-label"
                    value={selectedCourier.vehicleType || ''}
                    label="Vehicle Type"
                    onChange={(e) => setSelectedCourier({...selectedCourier, vehicleType: e.target.value})}
                  >
                    <MenuItem value="Bicycle">Bicycle</MenuItem>
                    <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                    <MenuItem value="Car">Car</MenuItem>
                    <MenuItem value="Van">Van</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  margin="normal"
                  fullWidth
                  label="New Password (leave empty to keep current)"
                  type="password"
                  value={selectedCourier.newPassword || ''}
                  onChange={(e) => setSelectedCourier({...selectedCourier, newPassword: e.target.value})}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModals}>Cancel</Button>
            <Button 
              onClick={handleEditCourier} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Restaurant Edit Dialog */}
        <Dialog open={restaurantEditOpen} onClose={handleCloseModals} fullWidth maxWidth="sm">
          <DialogTitle>Edit Restaurant</DialogTitle>
          <DialogContent>
            {selectedRestaurant && (
              <Box component="form" sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Name"
                  value={selectedRestaurant.name || ''}
                  onChange={(e) => setSelectedRestaurant({...selectedRestaurant, name: e.target.value})}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedRestaurant.email || ''}
                  onChange={(e) => setSelectedRestaurant({...selectedRestaurant, email: e.target.value})}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone Number"
                  value={selectedRestaurant.phoneNumber || ''}
                  onChange={(e) => setSelectedRestaurant({...selectedRestaurant, phoneNumber: e.target.value})}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Cuisine Type"
                  value={selectedRestaurant.cuisineType || ''}
                  onChange={(e) => setSelectedRestaurant({...selectedRestaurant, cuisineType: e.target.value})}
                />
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Address Information</Typography>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Street"
                  value={selectedRestaurant.street || ''}
                  onChange={(e) => setSelectedRestaurant({...selectedRestaurant, street: e.target.value})}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="City"
                    value={selectedRestaurant.city || ''}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, city: e.target.value})}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="State"
                    value={selectedRestaurant.state || ''}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, state: e.target.value})}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Zip Code"
                    value={selectedRestaurant.zipCode || ''}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, zipCode: e.target.value})}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Country"
                    value={selectedRestaurant.country || ''}
                    onChange={(e) => setSelectedRestaurant({...selectedRestaurant, country: e.target.value})}
                  />
                </Box>
                <TextField
                  margin="normal"
                  fullWidth
                  label="New Password (leave empty to keep current)"
                  type="password"
                  value={selectedRestaurant.newPassword || ''}
                  onChange={(e) => setSelectedRestaurant({...selectedRestaurant, newPassword: e.target.value})}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModals}>Cancel</Button>
            <Button 
              onClick={handleEditRestaurant} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Customers
            </Typography>
            
            <TextField
              variant="outlined"
              placeholder="Search customers..."
              size="small"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredCustomers.length === 0 ? (
            customerSearch ? (
              <Alert severity="info">
                No customers found matching your search criteria.
              </Alert>
            ) : (
              <Alert severity="info">
                No customers found in the system.
              </Alert>
            )
          ) : (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={customerOrderBy === 'customerId'}
                          direction={customerOrderBy === 'customerId' ? customerOrder : 'asc'}
                          onClick={() => handleRequestSort('customer', 'customerId')}
                        >
                          ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={customerOrderBy === 'name'}
                          direction={customerOrderBy === 'name' ? customerOrder : 'asc'}
                          onClick={() => handleRequestSort('customer', 'name')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={customerOrderBy === 'email'}
                          direction={customerOrderBy === 'email' ? customerOrder : 'asc'}
                          onClick={() => handleRequestSort('customer', 'email')}
                        >
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={customerOrderBy === 'phoneNumber'}
                          direction={customerOrderBy === 'phoneNumber' ? customerOrder : 'asc'}
                          onClick={() => handleRequestSort('customer', 'phoneNumber')}
                        >
                          Phone
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={customerOrderBy === 'createdAt'}
                          direction={customerOrderBy === 'createdAt' ? customerOrder : 'asc'}
                          onClick={() => handleRequestSort('customer', 'createdAt')}
                        >
                          Created At
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers
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
                                  onClick={() => handleOpenCustomerEdit(customer)}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredCustomers.length} customers found
                </Typography>
                <Pagination 
                  count={Math.ceil(filteredCustomers.length / itemsPerPage)} 
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Couriers
            </Typography>
            
            <TextField
              variant="outlined"
              placeholder="Search couriers..."
              size="small"
              value={courierSearch}
              onChange={(e) => setCourierSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredCouriers.length === 0 ? (
            courierSearch ? (
              <Alert severity="info">
                No couriers found matching your search criteria.
              </Alert>
            ) : (
              <Alert severity="info">
                No couriers found in the system.
              </Alert>
            )
          ) : (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={courierOrderBy === 'courierId'}
                          direction={courierOrderBy === 'courierId' ? courierOrder : 'asc'}
                          onClick={() => handleRequestSort('courier', 'courierId')}
                        >
                          ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={courierOrderBy === 'name'}
                          direction={courierOrderBy === 'name' ? courierOrder : 'asc'}
                          onClick={() => handleRequestSort('courier', 'name')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={courierOrderBy === 'email'}
                          direction={courierOrderBy === 'email' ? courierOrder : 'asc'}
                          onClick={() => handleRequestSort('courier', 'email')}
                        >
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={courierOrderBy === 'phoneNumber'}
                          direction={courierOrderBy === 'phoneNumber' ? courierOrder : 'asc'}
                          onClick={() => handleRequestSort('courier', 'phoneNumber')}
                        >
                          Phone
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={courierOrderBy === 'vehicleType'}
                          direction={courierOrderBy === 'vehicleType' ? courierOrder : 'asc'}
                          onClick={() => handleRequestSort('courier', 'vehicleType')}
                        >
                          Vehicle Type
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={courierOrderBy === 'status'}
                          direction={courierOrderBy === 'status' ? courierOrder : 'asc'}
                          onClick={() => handleRequestSort('courier', 'status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={courierOrderBy === 'earnings'}
                          direction={courierOrderBy === 'earnings' ? courierOrder : 'asc'}
                          onClick={() => handleRequestSort('courier', 'earnings')}
                        >
                          Earnings
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCouriers
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
                                  onClick={() => handleOpenCourierEdit(courier)}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredCouriers.length} couriers found
                </Typography>
                <Pagination 
                  count={Math.ceil(filteredCouriers.length / itemsPerPage)} 
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              All Restaurants
            </Typography>
            
            <TextField
              variant="outlined"
              placeholder="Search restaurants..."
              size="small"
              value={restaurantSearch}
              onChange={(e) => setRestaurantSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredRestaurants.length === 0 ? (
            restaurantSearch ? (
              <Alert severity="info">
                No restaurants found matching your search criteria.
              </Alert>
            ) : (
              <Alert severity="info">
                No restaurants found in the system.
              </Alert>
            )
          ) : (
            <>
              <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={restaurantOrderBy === 'restaurantId'}
                          direction={restaurantOrderBy === 'restaurantId' ? restaurantOrder : 'asc'}
                          onClick={() => handleRequestSort('restaurant', 'restaurantId')}
                        >
                          ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={restaurantOrderBy === 'name'}
                          direction={restaurantOrderBy === 'name' ? restaurantOrder : 'asc'}
                          onClick={() => handleRequestSort('restaurant', 'name')}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={restaurantOrderBy === 'email'}
                          direction={restaurantOrderBy === 'email' ? restaurantOrder : 'asc'}
                          onClick={() => handleRequestSort('restaurant', 'email')}
                        >
                          Email
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={restaurantOrderBy === 'phoneNumber'}
                          direction={restaurantOrderBy === 'phoneNumber' ? restaurantOrder : 'asc'}
                          onClick={() => handleRequestSort('restaurant', 'phoneNumber')}
                        >
                          Phone
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={restaurantOrderBy === 'cuisineType'}
                          direction={restaurantOrderBy === 'cuisineType' ? restaurantOrder : 'asc'}
                          onClick={() => handleRequestSort('restaurant', 'cuisineType')}
                        >
                          Cuisine
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={restaurantOrderBy === 'rating'}
                          direction={restaurantOrderBy === 'rating' ? restaurantOrder : 'asc'}
                          onClick={() => handleRequestSort('restaurant', 'rating')}
                        >
                          Rating
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={restaurantOrderBy === 'city'}
                          direction={restaurantOrderBy === 'city' ? restaurantOrder : 'asc'}
                          onClick={() => handleRequestSort('restaurant', 'city')}
                        >
                          City
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRestaurants
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
                                  onClick={() => handleOpenRestaurantEdit(restaurant)}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredRestaurants.length} restaurants found
                </Typography>
                <Pagination 
                  count={Math.ceil(filteredRestaurants.length / itemsPerPage)} 
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