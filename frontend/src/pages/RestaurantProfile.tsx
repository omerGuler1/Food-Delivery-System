import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Grid,
  Avatar,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  CameraAlt as CameraIcon,
  Restaurant as RestaurantIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  ArrowBack,
  AccessTime as AccessTimeIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Restaurant } from '../interfaces';
import { getRestaurantProfile, updateRestaurantProfile, uploadProfileImage } from '../services/profileService';

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

// Sample cuisine types for dropdown
const cuisineTypes = [
  'Italian',
  'Mexican',
  'Chinese',
  'Japanese',
  'Indian',
  'American',
  'Mediterranean',
  'Thai',
  'French',
  'Turkish',
  'Greek',
  'Middle Eastern',
  'Korean',
  'Vietnamese'
];

interface BusinessHours {
  id?: number;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
];

const RestaurantProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState<Restaurant | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    cuisineType: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Profile Image
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  
  // Business Hours
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [openTime, setOpenTime] = useState<string>('');
  const [closeTime, setCloseTime] = useState<string>('');
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [openBusinessHoursDialog, setOpenBusinessHoursDialog] = useState(false);
  const [editingHoursId, setEditingHoursId] = useState<number | null>(null);
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantProfile();
        console.log('Profile data from API:', data);
        
        // Get restaurant ID from user object in localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('No user data found');
        }
        
        const userData = JSON.parse(userStr);
        console.log('User data from localStorage:', userData);
        
        if (!userData.restaurantId) {
          throw new Error('No restaurant ID found in user data');
        }
        
        // Set profile data with restaurant ID
        const profileWithId = {
          ...data,
          restaurantId: userData.restaurantId
        };
        console.log('Profile data with ID:', profileWithId);
        setProfileData(profileWithId);
        
        // Set form values from profile data
        setFormValues({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          cuisineType: data.cuisineType || '',
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          zipCode: data.address?.zipCode || '',
          country: data.address?.country || ''
        });
        
        // Set profile image URL if it exists
        if (data.profileImageUrl) {
          setProfileImageUrl(data.profileImageUrl);
        }
        
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Update the fetch URL in useEffect
  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        console.log('Fetching business hours for restaurant:', profileData?.restaurantId);
        const url = `http://localhost:8080/api/restaurants/${profileData?.restaurantId}/business-hours`;
        console.log('Fetch URL:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched business hours:', data);
          setBusinessHours(data);
        } else {
          const errorData = await response.json().catch(() => null);
          console.error('Failed to fetch business hours:', response.status, errorData);
          throw new Error('Failed to fetch business hours');
        }
      } catch (err) {
        console.error('Error fetching business hours:', err);
        setError('Failed to load business hours');
      }
    };

    if (profileData?.restaurantId) {
      console.log('Profile data loaded, restaurant ID:', profileData.restaurantId);
      fetchBusinessHours();
    } else {
      console.log('No restaurant ID available yet');
    }
  }, [profileData?.restaurantId]);

  // Handlers
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    // Reset form values if canceling edit
    if (editMode && profileData) {
      setFormValues({
        name: profileData.name || '',
        email: profileData.email || '',
        phoneNumber: profileData.phoneNumber || '',
        cuisineType: profileData.cuisineType || '',
        street: '', // Reset address fields
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Always include the required fields
      const updateData = {
        name: formValues.name,
        email: formValues.email,
        phoneNumber: formValues.phoneNumber,
        cuisineType: formValues.cuisineType,
        // Add address fields if we're on the location tab
        ...(activeTab === 1 && {
          address: {
            street: formValues.street,
            city: formValues.city,
            state: formValues.state,
            zipCode: formValues.zipCode,
            country: formValues.country
          }
        })
      };
      
      const updatedProfile = await updateRestaurantProfile(updateData);
      setProfileData(updatedProfile as Restaurant);
      setEditMode(false);
      setSuccessMessage(activeTab === 1 ? 'Address updated successfully' : 'Profile updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageClick = () => {
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
  };

  const handleImageUploadClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPEG, JPG and PNG images are supported');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
      setOpenImageDialog(false);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImage) return;
    
    try {
      setLoading(true);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      // Upload the image using the API service
      const response = await uploadProfileImage(formData);
      
      // Update profile image URL with the returned URL from the server
      setProfileImageUrl(response.imageUrl);
      
      // Update local state
      if (profileData) {
        setProfileData({
          ...profileData,
          profileImageUrl: response.imageUrl
        });
      }
      
      setSuccessMessage('Profile image uploaded successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Close the dialog
      setOpenImageDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload profile image. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBusinessHoursDialog = (hours?: BusinessHours) => {
    if (hours) {
      setSelectedDay(hours.dayOfWeek);
      setOpenTime(hours.openTime);
      setCloseTime(hours.closeTime);
      setIsClosed(hours.isClosed);
      setEditingHoursId(hours.id ?? null);
    } else {
      setSelectedDay('');
      setOpenTime('');
      setCloseTime('');
      setIsClosed(false);
      setEditingHoursId(null);
    }
    setOpenBusinessHoursDialog(true);
  };

  const handleCloseBusinessHoursDialog = () => {
    setOpenBusinessHoursDialog(false);
    setSelectedDay('');
    setOpenTime('');
    setCloseTime('');
    setIsClosed(false);
    setEditingHoursId(null);
  };

  const handleSaveBusinessHours = async () => {
    try {
      if (!profileData?.restaurantId) {
        throw new Error('Restaurant ID not available');
      }

      if (!selectedDay) {
        throw new Error('Please select a day of the week');
      }

      if (!openTime || !closeTime) {
        throw new Error('Please select both open and close times');
      }

      // Format times to match LocalTime format (HH:mm:ss)
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
      };

      const hoursData = {
        dayOfWeek: selectedDay,
        openTime: formatTime(openTime),
        closeTime: formatTime(closeTime),
        isClosed
      };

      console.log('Sending business hours data:', hoursData);

      const url = editingHoursId
        ? `http://localhost:8080/api/restaurants/${profileData.restaurantId}/business-hours/${editingHoursId}`
        : `http://localhost:8080/api/restaurants/${profileData.restaurantId}/business-hours`;

      console.log('Sending request to:', url);
      console.log('With data:', hoursData);
      console.log('Restaurant ID:', profileData.restaurantId);

      const response = await fetch(url, {
        method: editingHoursId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(hoursData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Server response:', response.status, errorData);
        throw new Error(errorData?.message || `Failed to update business hours: ${response.status}`);
      }

      const updatedHours = await response.json();
      console.log('Updated hours:', updatedHours);
      
      setBusinessHours(prev => {
        if (editingHoursId) {
          return prev.map(h => h.id === editingHoursId ? updatedHours : h);
        }
        return [...prev, updatedHours];
      });
      setSuccessMessage('Business hours updated successfully');
      handleCloseBusinessHoursDialog();
    } catch (err: any) {
      console.error('Error updating business hours:', err);
      setError(err.message || 'Failed to update business hours');
    }
  };

  const handleDeleteBusinessHours = async (hoursId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/restaurants/${profileData?.restaurantId}/business-hours/${hoursId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.ok) {
        setBusinessHours(prev => prev.filter(h => h.id !== hoursId));
        setSuccessMessage('Business hours deleted successfully');
      } else {
        throw new Error('Failed to delete business hours');
      }
    } catch (err) {
      setError('Failed to delete business hours');
    }
  };

  if (loading && !profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button at the top left */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ 
            fontWeight: 'medium',
            '&:hover': { bgcolor: 'rgba(255, 112, 67, 0.08)' }
          }}
        >
          Back
        </Button>
      </Box>

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
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Profile Sidebar */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '300px' }, 
              minWidth: { xs: '100%', md: '300px' },
              flexShrink: 0,
              background: 'linear-gradient(135deg, #ff7043 0%, #c63f17 100%)',
              color: 'white',
              p: 3,
              pt: 4,
              pb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.main' } 
                  }}
                  size="small"
                  onClick={handleProfileImageClick}
                >
                  <CameraIcon fontSize="small" />
                </IconButton>
              }
            >
              <Avatar 
                src={profileImageUrl || undefined}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 3, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  fontSize: '3rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  border: '4px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {profileData?.name.charAt(0).toUpperCase()}
              </Avatar>
            </Badge>
            
            <Typography variant="h5" sx={{ mb: 1 }}>
              {profileData?.name}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              {profileData?.email}
            </Typography>
            
            <Box sx={{ width: '100%' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                orientation="vertical"
                variant="scrollable"
                sx={{
                  '.MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-selected': {
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      borderLeft: '3px solid white'
                    }
                  }
                }}
              >
                <Tab icon={<Person />} label="Profile Information" iconPosition="start" />
                <Tab icon={<LocationIcon />} label="Location" iconPosition="start" />
                <Tab icon={<AccessTimeIcon />} label="Business Hours" iconPosition="start" />
                <Tab icon={<InfoIcon />} label="Restaurant Details" iconPosition="start" />
              </Tabs>
            </Box>
          </Box>
          
          {/* Main Content */}
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* Profile Information Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Restaurant Profile
                </Typography>
                <Button 
                  variant={editMode ? "outlined" : "contained"}
                  color={editMode ? "error" : "primary"}
                  startIcon={editMode ? <DeleteIcon /> : <EditIcon />}
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
                      label="Restaurant Name"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                      InputProps={{
                        startAdornment: <RestaurantIcon color="action" sx={{ mr: 1 }} />
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
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!editMode}>
                      <InputLabel id="cuisine-type-label">Cuisine Type</InputLabel>
                      <Select
                        labelId="cuisine-type-label"
                        name="cuisineType"
                        value={formValues.cuisineType}
                        onChange={handleSelectChange}
                        label="Cuisine Type"
                        startAdornment={<RestaurantIcon color="action" sx={{ mr: 1 }} />}
                      >
                        {cuisineTypes.map((cuisine) => (
                          <MenuItem key={cuisine} value={cuisine}>{cuisine}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {/* Save Button - only shown in edit mode */}
                  {editMode && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={loading}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </TabPanel>
            
            {/* Location Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Restaurant Location
                </Typography>
                <Button 
                  variant={editMode ? "outlined" : "contained"}
                  color={editMode ? "error" : "primary"}
                  startIcon={editMode ? <DeleteIcon /> : <EditIcon />}
                  onClick={handleEditToggle}
                >
                  {editMode ? 'Cancel' : 'Edit Location'}
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Your location information is used to help customers find your restaurant.
              </Alert>
              
              <form onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="street"
                      value={formValues.street}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                      InputProps={{
                        startAdornment: <LocationIcon color="action" sx={{ mr: 1 }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="State/Province"
                      name="state"
                      value={formValues.state}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Postal Code"
                      name="zipCode"
                      value={formValues.zipCode}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formValues.country}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  
                  {/* Save Button - only shown in edit mode */}
                  {editMode && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={loading}
                        >
                          Save Address
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </TabPanel>
            
            {/* Business Hours Tab */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Business Hours
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenBusinessHoursDialog()}
                >
                  Add Hours
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Open Time</TableCell>
                      <TableCell>Close Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {businessHours.map((hours) => (
                      <TableRow key={hours.id}>
                        <TableCell>{hours.dayOfWeek}</TableCell>
                        <TableCell>{hours.openTime}</TableCell>
                        <TableCell>{hours.closeTime}</TableCell>
                        <TableCell>{hours.isClosed ? 'Closed' : 'Open'}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenBusinessHoursDialog(hours)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => hours.id && handleDeleteBusinessHours(hours.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
            {/* Restaurant Details Tab */}
            <TabPanel value={activeTab} index={3}>
              <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 4 }}>
                Restaurant Details
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Additional restaurant details will be implemented in a future update.
              </Alert>
            </TabPanel>
          </Box>
        </Box>
      </Paper>
      
      {/* Hidden file input for profile image upload */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/jpeg, image/png, image/jpg"
        onChange={handleImageChange}
      />
      
      {/* Profile Image Dialog */}
      <Dialog open={openImageDialog} onClose={handleCloseImageDialog}>
        <DialogTitle>Update Profile Image</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Avatar
              src={profileImageUrl || undefined}
              sx={{ width: 150, height: 150, mb: 3 }}
            >
              {profileData?.name.charAt(0).toUpperCase()}
            </Avatar>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleImageUploadClick}
              startIcon={<CameraIcon />}
            >
              Choose Image
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Supported formats: JPEG, PNG, JPG (max. 5MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Cancel</Button>
          <Button
            onClick={handleUploadProfileImage}
            color="primary"
            variant="contained"
            disabled={!profileImage || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Business Hours Dialog */}
      <Dialog open={openBusinessHoursDialog} onClose={handleCloseBusinessHoursDialog}>
        <DialogTitle>
          {editingHoursId ? 'Edit Business Hours' : 'Add Business Hours'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                label="Day of Week"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Open Time"
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />

            <TextField
              label="Close Time"
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isClosed}
                  onChange={(e) => setIsClosed(e.target.checked)}
                />
              }
              label="Closed on this day"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBusinessHoursDialog}>Cancel</Button>
          <Button onClick={handleSaveBusinessHours} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RestaurantProfile; 