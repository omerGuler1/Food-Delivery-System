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
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Restaurant as RestaurantIcon,
  DeliveryDining as CourierIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import api from '../services/api';

const API_URL = 'http://localhost:8080/api';

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
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
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

interface Restaurant {
  restaurantId: number;
  name: string;
  email: string;
  phoneNumber: string;
  cuisineType: string;
  approvalStatus: string;
  createdAt: string;
}

interface Courier {
  courierId: number;
  name: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  approvalStatus: string;
  createdAt: string;
}

const AdminApprovalPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingRestaurants, setPendingRestaurants] = useState<Restaurant[]>([]);
  const [pendingCouriers, setPendingCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [processingIds, setProcessingIds] = useState<{ [key: string]: boolean }>({});

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch pending restaurants
      const restaurantsResponse = await axios.get(`${API_URL}/admin/restaurants/pending-approval`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPendingRestaurants(restaurantsResponse.data || []);

      // Fetch pending couriers
      const couriersResponse = await axios.get(`${API_URL}/admin/couriers/pending-approval`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPendingCouriers(couriersResponse.data || []);
    } catch (err: any) {
      console.error('Error fetching pending approvals:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending approval requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApproval = async (type: 'restaurant' | 'courier', id: number, status: 'ACCEPTED' | 'REJECTED') => {
    const key = `${type}-${id}`;
    setProcessingIds(prev => ({ ...prev, [key]: true }));
    
    try {
      if (type === 'restaurant') {
        await axios.put(`${API_URL}/admin/restaurants/${id}/approval-status?status=${status}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPendingRestaurants(pendingRestaurants.filter(r => r.restaurantId !== id));
      } else {
        await axios.put(`${API_URL}/admin/couriers/${id}/approval-status?status=${status}`, {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setPendingCouriers(pendingCouriers.filter(c => c.courierId !== id));
      }
      
      setSnackbarMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} ${status === 'ACCEPTED' ? 'approved' : 'rejected'} successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error(`Error ${status.toLowerCase()}ing ${type}:`, err);
      setSnackbarMessage(`Failed to ${status.toLowerCase()} ${type}: ${err.response?.data?.message || 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setProcessingIds(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          Pending Approval Requests
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Review and manage pending restaurant and courier registration requests.
        </Typography>
      </Paper>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RestaurantIcon sx={{ mr: 1 }} />
                <Typography>Restaurants</Typography>
                <Chip 
                  label={pendingRestaurants.length} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CourierIcon sx={{ mr: 1 }} />
                <Typography>Couriers</Typography>
                <Chip 
                  label={pendingCouriers.length} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1 }} 
                />
              </Box>
            } 
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <>
            <TabPanel value={activeTab} index={0}>
              {pendingRestaurants.length === 0 ? (
                <Alert severity="info">No pending restaurant approval requests</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Cuisine Type</TableCell>
                        <TableCell>Registration Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingRestaurants.map((restaurant) => (
                        <TableRow key={restaurant.restaurantId}>
                          <TableCell>{restaurant.name}</TableCell>
                          <TableCell>{restaurant.email}</TableCell>
                          <TableCell>{restaurant.phoneNumber}</TableCell>
                          <TableCell>{restaurant.cuisineType}</TableCell>
                          <TableCell>{formatDate(restaurant.createdAt)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Approve">
                                <IconButton 
                                  color="success" 
                                  disabled={processingIds[`restaurant-${restaurant.restaurantId}`]}
                                  onClick={() => handleApproval('restaurant', restaurant.restaurantId, 'ACCEPTED')}
                                >
                                  {processingIds[`restaurant-${restaurant.restaurantId}`] ? 
                                    <CircularProgress size={24} /> : <CheckIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton 
                                  color="error"
                                  disabled={processingIds[`restaurant-${restaurant.restaurantId}`]}
                                  onClick={() => handleApproval('restaurant', restaurant.restaurantId, 'REJECTED')}
                                >
                                  <CloseIcon />
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
            <TabPanel value={activeTab} index={1}>
              {pendingCouriers.length === 0 ? (
                <Alert severity="info">No pending courier approval requests</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Phone</TableCell>
                        <TableCell>Vehicle Type</TableCell>
                        <TableCell>Registration Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingCouriers.map((courier) => (
                        <TableRow key={courier.courierId}>
                          <TableCell>{courier.name}</TableCell>
                          <TableCell>{courier.email}</TableCell>
                          <TableCell>{courier.phoneNumber}</TableCell>
                          <TableCell>{courier.vehicleType}</TableCell>
                          <TableCell>{formatDate(courier.createdAt)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Approve">
                                <IconButton 
                                  color="success"
                                  disabled={processingIds[`courier-${courier.courierId}`]}
                                  onClick={() => handleApproval('courier', courier.courierId, 'ACCEPTED')}
                                >
                                  {processingIds[`courier-${courier.courierId}`] ? 
                                    <CircularProgress size={24} /> : <CheckIcon />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton 
                                  color="error"
                                  disabled={processingIds[`courier-${courier.courierId}`]}
                                  onClick={() => handleApproval('courier', courier.courierId, 'REJECTED')}
                                >
                                  <CloseIcon />
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
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminApprovalPage; 