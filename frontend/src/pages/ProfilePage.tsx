import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  FormControlLabel,
  Checkbox,
  Avatar
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Delete,
  LocationOn,
  Add,
  Restaurant as RestaurantIcon,
  LocalShipping as DeliveryIcon,
  Lock,
  Warning,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Customer, Restaurant, Courier, Address } from '../interfaces';
import {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  Address as ProfileAddress,
  PasswordUpdateRequest,
  DeleteAccountRequest
} from '../services/profileService';
import { getUserAddresses } from '../services/addressService';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const ProfilePage: React.FC = () => {
  const { userType, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [activeTab, setActiveTab] = useState(() => {
    // If coming from checkout page, open addresses tab
    return location.state?.fromCheckout ? 1 : 0;
  });
  const [profileData, setProfileData] = useState<Customer | Restaurant | Courier | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    cuisineType: '',
    vehicleType: '',
    isAvailable: false
  });

  // Password form values
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Address form values
  const [addressFormValues, setAddressFormValues] = useState<Omit<Address, 'addressId'>>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    latitude: 0,
    longitude: 0,
    isDefault: false
  });

  // Dialog states
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfileData(data);
        setFormValues({
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          cuisineType: 'cuisineType' in data ? data.cuisineType || '' : '',
          vehicleType: 'vehicleType' in data ? data.vehicleType || '' : '',
          isAvailable: 'isAvailable' in data ? data.isAvailable || false : false
        });

        // Load addresses for customers
        if (userType === 'customer') {
          try {
            const addressData = await getUserAddresses();
            setAddresses(addressData);
          } catch (addrErr) {
            console.error('Error fetching addresses:', addrErr);
            setAddresses([]);
          }
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userType]);

  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    // Reset form values if canceling edit
    if (editMode && profileData) {
      setFormValues({
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,
        cuisineType: 'cuisineType' in profileData ? profileData.cuisineType || '' : '',
        vehicleType: 'vehicleType' in profileData ? profileData.vehicleType || '' : '',
        isAvailable: 'isAvailable' in profileData ? profileData.isAvailable || false : false
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordValues({
      ...passwordValues,
      [name]: value
    });
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressFormValues({
      ...addressFormValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = await updateProfile({
        name: formValues.name,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        ...(userType === 'restaurant' && { cuisineType: formValues.cuisineType }),
        ...(userType === 'courier' && { 
          vehicleType: formValues.vehicleType,
          isAvailable: formValues.isAvailable
        })
      });

      setProfileData(updatedProfile);
      setEditMode(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      await updatePassword(passwordValues);
      setPasswordValues({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update password. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingAddressId) {
        const updatedAddress = await updateAddress(editingAddressId, addressFormValues);
        setAddresses(prevAddresses => 
          prevAddresses.map(addr => 
            addr.addressId === editingAddressId ? {
              ...updatedAddress,
              addressId: updatedAddress.id || editingAddressId
            } : addr
          )
        );
      } else {
        const newAddress = await addAddress(addressFormValues);
        setAddresses(prevAddresses => [...prevAddresses, {
          ...newAddress,
          addressId: newAddress.id || 0
        }]);
      }
      setShowAddressDialog(false);
      setEditingAddressId(null);
      setAddressFormValues({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        latitude: 0,
        longitude: 0,
        isDefault: false
      });
      setSuccessMessage('Address saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save address. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressEdit = (address: Address) => {
    setEditingAddressId(address.addressId);
    setAddressFormValues(address);
    setShowAddressDialog(true);
  };

  const handleAddressDelete = async (addressId: number) => {
    try {
      setLoading(true);
      await deleteAddress(addressId);
      setAddresses(addresses.filter(addr => addr.addressId !== addressId));
      setSuccessMessage('Address deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete address. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    if (!profileData) return;
    
    try {
      setLoading(true);
      const userId = 
        'customerId' in profileData ? profileData.customerId : 
        'restaurantId' in profileData ? profileData.restaurantId : 
        'courierId' in profileData ? profileData.courierId : 0;
        
      await deleteAccount({ userId, confirmation: true } as DeleteAccountRequest);
      await logout();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading && !profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !profileData) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          sx={{ mt: 2 }} 
          onClick={() => navigate(userType === 'restaurant' ? '/restaurant/dashboard' : '/')}
        >
          {userType === 'restaurant' ? 'Back to Dashboard' : 'Back to Home'}
        </Button>
      </Box>
    );
  }

  if (!profileData) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Alert severity="warning">No profile data available. Please log in again.</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          sx={{ mt: 2 }} 
          onClick={() => navigate(userType === 'restaurant' ? '/restaurant/dashboard' : '/')}
        >
          {userType === 'restaurant' ? 'Back to Dashboard' : 'Back to Home'}
        </Button>
      </Box>
    );
  }

  // Determine available tabs based on user type
  const tabs = [
    { label: 'Personal Information', icon: <Person /> },
    ...(userType === 'customer' ? [{ label: 'Addresses', icon: <LocationOn /> }] : []),
    { label: 'Settings', icon: <Lock /> }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
          background: '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Profile Sidebar */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '300px' }, 
              background: 'linear-gradient(135deg, #ff7043 0%, #c63f17 100%)',
              color: 'white',
              p: 3,
              pt: 4,
              pb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: { xs: 0, md: '0 0 0 12px' },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%)',
                zIndex: 0,
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 3, 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                fontSize: '3rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                zIndex: 1
              }}
            >
              {profileData.name.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h5" sx={{ mb: 1 }}>
              {profileData.name}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              {profileData.email}
            </Typography>
            
            <Box sx={{ width: '100%', mb: 2 }}>
              {userType === 'customer' && (
                <Chip 
                  icon={<Person />} 
                  label="Customer" 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    width: '100%'
                  }} 
                />
              )}
              {userType === 'restaurant' && (
                <Chip 
                  icon={<RestaurantIcon />} 
                  label="Restaurant" 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    width: '100%'
                  }} 
                />
              )}
              {userType === 'courier' && (
                <Chip 
                  icon={<DeliveryIcon />} 
                  label="Courier" 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    width: '100%'
                  }} 
                />
              )}
            </Box>

            {/* Mobile Tabs */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%', mt: 2, zIndex: 1 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  '& .MuiTab-root': { 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.85rem',
                    minHeight: 'auto',
                    py: 1.5,
                    minWidth: 'auto',
                    mx: 0.5
                  },
                  '& .Mui-selected': { 
                    color: 'white',
                    fontWeight: 'bold'
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: 1.5
                  }
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab key={index} icon={tab.icon} label={tab.label} />
                ))}
              </Tabs>
            </Box>
            
            {/* Desktop Tabs */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%', zIndex: 1 }}>
              <List component="nav" sx={{ width: '100%' }}>
                {tabs.map((tab, index) => (
                  <ListItem 
                    key={index}
                    button
                    selected={activeTab === index}
                    onClick={() => setActiveTab(index)}
                    sx={{ 
                      borderRadius: 2,
                      mb: 1.5,
                      py: 1,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          borderRadius: '0 4px 4px 0',
                          bgcolor: 'white',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        }
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
                      {tab.icon}
                    </ListItemIcon>
                    <ListItemText primary={tab.label} />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Button 
              startIcon={<ArrowBack />} 
              variant="text" 
              color="inherit"
              fullWidth
              sx={{ 
                mt: 'auto', 
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: 2,
                py: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'white',
                },
                zIndex: 1
              }}
              onClick={() => navigate(userType === 'restaurant' ? '/restaurant/dashboard' : '/')}
            >
              {userType === 'restaurant' ? 'Back to Dashboard' : 'Back to Home'}
            </Button>
          </Box>

          {/* Content Area */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Personal Information */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Personal Information
                  </Typography>
                  <Button 
                    variant={editMode ? "outlined" : "contained"}
                    color={editMode ? "error" : "primary"}
                    startIcon={editMode ? <Delete /> : <Edit />}
                    onClick={handleEditToggle}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>

                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                        InputProps={{
                          startAdornment: <Person color="action" sx={{ mr: 1 }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formValues.email}
                        disabled={true}
                        required
                        InputProps={{
                          startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                          readOnly: true
                        }}
                        helperText="Email address cannot be changed"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formValues.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        required
                        InputProps={{
                          startAdornment: <Phone color="action" sx={{ mr: 1 }} />
                        }}
                      />
                    </Grid>

                    {/* Restaurant-specific fields */}
                    {userType === 'restaurant' && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Cuisine Type"
                          name="cuisineType"
                          value={formValues.cuisineType}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          InputProps={{
                            startAdornment: <RestaurantIcon color="action" sx={{ mr: 1 }} />
                          }}
                        />
                      </Grid>
                    )}

                    {/* Courier-specific fields */}
                    {userType === 'courier' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Vehicle Type"
                            name="vehicleType"
                            value={formValues.vehicleType}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            InputProps={{
                              startAdornment: <DeliveryIcon color="action" sx={{ mr: 1 }} />
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formValues.isAvailable}
                                onChange={handleInputChange}
                                name="isAvailable"
                                disabled={!editMode}
                                color="primary"
                              />
                            }
                            label="Available for Deliveries"
                          />
                        </Grid>
                      </>
                    )}

                    {editMode && (
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<Save />}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </form>
              </Box>
            </TabPanel>

            {/* Addresses (Customer only) */}
            {userType === 'customer' && (
              <TabPanel value={activeTab} index={1}>
                <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold">
                      My Addresses
                    </Typography>
                    <Button 
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressFormValues({
                          street: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          country: '',
                          latitude: 0,
                          longitude: 0,
                          isDefault: false
                        });
                        setShowAddressDialog(true);
                      }}
                    >
                      Add New Address
                    </Button>
                  </Box>

                  {addresses.length === 0 ? (
                    <Alert severity="info">
                      You haven't added any addresses yet. Click "Add New Address" to add your first address.
                    </Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {addresses.map((address) => (
                        <Grid item xs={12} md={6} key={address.addressId}>
                          <Card>
                            <CardContent>
                              {address.isDefault && (
                                <Chip 
                                  label="Default" 
                                  color="primary" 
                                  size="small" 
                                  sx={{ mb: 1 }} 
                                />
                              )}
                              <Typography variant="h6" component="h3">
                                <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
                                {address.street}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {address.city}, {address.state} {address.zipCode}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {address.country}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <Button 
                                size="small" 
                                startIcon={<Edit />} 
                                onClick={() => handleAddressEdit(address)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="small" 
                                color="error" 
                                startIcon={<Delete />} 
                                onClick={() => handleAddressDelete(address.addressId)}
                              >
                                Delete
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </TabPanel>
            )}

            {/* Settings */}
            <TabPanel value={activeTab} index={userType === 'customer' ? 2 : 1}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                  <Box sx={{ mb: 5 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
                      Change Password
                    </Typography>
                    
                    <form onSubmit={handlePasswordSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwordValues.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwordValues.newPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={passwordValues.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{
                              px: 3,
                              py: 1,
                              boxShadow: '0 4px 10px rgba(255, 112, 67, 0.3)',
                            }}
                          >
                            {loading ? <CircularProgress size={24} /> : 'Update Password'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Box>

                  <Divider sx={{ my: 5 }} />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2, color: 'error.main' }}>
                      Danger Zone
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Once you delete your account, there is no going back. Please be certain.
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Warning />}
                      onClick={() => setShowDeleteDialog(true)}
                      sx={{
                        borderWidth: 2,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          borderWidth: 2,
                          bgcolor: 'rgba(229, 57, 53, 0.05)'
                        }
                      }}
                    >
                      Delete Account
                    </Button>
                  </Box>
                </Box>
              </Box>
            </TabPanel>
          </Box>
        </Box>
      </Paper>

      {/* Address Dialog */}
      <Dialog open={showAddressDialog} onClose={() => setShowAddressDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddressId ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <form onSubmit={handleAddressSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="street"
                  value={addressFormValues.street}
                  onChange={handleAddressInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={addressFormValues.city}
                  onChange={handleAddressInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State/Province"
                  name="state"
                  value={addressFormValues.state}
                  onChange={handleAddressInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP/Postal Code"
                  name="zipCode"
                  value={addressFormValues.zipCode}
                  onChange={handleAddressInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={addressFormValues.country}
                  onChange={handleAddressInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={addressFormValues.isDefault}
                      onChange={handleAddressInputChange}
                      name="isDefault"
                    />
                  }
                  label="Set as default address"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddressDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>
          <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleAccountDelete}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Type guards to determine the user type
const isCustomer = (user: any): user is Customer => {
  return 'customerId' in user;
};

const isRestaurant = (user: any): user is Restaurant => {
  return 'restaurantId' in user;
};

const isCourier = (user: any): user is Courier => {
  return 'courierId' in user;
};

export default ProfilePage; 