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
  Badge
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
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Restaurant } from '../interfaces';
import { getRestaurantProfile, updateProfile, uploadProfileImage } from '../services/profileService';

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
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantProfile();
        setProfileData(data);
        
        // Set form values from profile data
        setFormValues({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          cuisineType: data.cuisineType || '',
          street: '', // These would come from a nested address object in real data
          city: '',
          state: '',
          zipCode: '',
          country: ''
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
      
      // Create update data object
      const updateData = {
        name: formValues.name,
        phoneNumber: formValues.phoneNumber,
        cuisineType: formValues.cuisineType,
        // Address would be included in a nested object
      };
      
      const updatedProfile = await updateProfile(updateData);
      setProfileData(updatedProfile as Restaurant);
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
              <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 4 }}>
                Restaurant Location
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Your location information is used to help customers find your restaurant.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="street"
                    value={formValues.street}
                    onChange={handleInputChange}
                    disabled={!editMode}
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
                  />
                </Grid>
                
                {/* Map Component Placeholder */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent>
                      <Typography variant="body1" color="text.secondary">
                        Map will be displayed here when location is set
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Save Button - only shown in edit mode */}
                {editMode && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleProfileSubmit}
                      >
                        Save Location
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
            
            {/* Restaurant Details Tab */}
            <TabPanel value={activeTab} index={2}>
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
    </Container>
  );
};

export default RestaurantProfile; 