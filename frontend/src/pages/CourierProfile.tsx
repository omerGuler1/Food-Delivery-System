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
  DirectionsBike as BikeIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Courier } from '../types/courier';
import { getCourierProfile, updateProfile, uploadProfileImage, updateCourierProfile, updateCourierPassword, deleteCourierAccount } from '../services/profileService';

// Define CourierWithProfileImage interface
interface CourierWithProfileImage extends Courier {
  profileImageUrl?: string;
}

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

// Vehicle types available for couriers
const vehicleTypes = [
  'Bicycle',
  'Motorcycle',
  'Car',
  'Scooter',
  'Electric Bike',
  'On Foot'
];

// Type guard for courier
function isCourier(user: any): user is { courierId: number } {
  return user && typeof user.courierId === 'number';
}

const CourierProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState<CourierWithProfileImage | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    vehicleType: ''
  });

  // Profile Image
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  
  // Add state for password change and delete dialog
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        if (!isCourier(user)) {
          setError('Courier ID not found');
          setLoading(false);
          return;
        }
        const courierId = user.courierId;
        const data = await getCourierProfile(courierId) as CourierWithProfileImage;
        setProfileData(data);
        setFormValues({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          vehicleType: data.vehicleType || ''
        });
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
  }, [user]);

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
        vehicleType: profileData.vehicleType || ''
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
      if (!isCourier(user)) {
        setError('Courier ID not found');
        setLoading(false);
        return;
      }
      const updateData = {
        name: formValues.name,
        phoneNumber: formValues.phoneNumber,
        vehicleType: formValues.vehicleType
      };
      const updatedProfile = await updateCourierProfile(user.courierId, updateData);
      setProfileData(updatedProfile as CourierWithProfileImage);
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

  // Add handlers for password change and account delete
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordValues({
      ...passwordValues,
      [name]: value
    });
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
      if (!isCourier(user)) {
        setError('Courier ID not found');
        setLoading(false);
        return;
      }
      // Call backend API for password update (implement in profileService if not present)
      await updateCourierPassword(user.courierId, passwordValues);
      setPasswordValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDelete = async () => {
    try {
      setLoading(true);
      if (!isCourier(user)) {
        setError('Courier ID not found');
        setLoading(false);
        return;
      }
      await deleteCourierAccount(user.courierId);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button at the top left */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="text"
          color="primary"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/courier/dashboard')}
          sx={{ 
            fontWeight: 'medium',
            '&:hover': { bgcolor: 'rgba(255, 112, 67, 0.08)' }
          }}
        >
          Back to Dashboard
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
                {profileData?.name ? profileData.name.charAt(0).toUpperCase() : ''}
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
                variant="fullWidth"
                sx={{
                  '.MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'left',
                    borderRadius: 1,
                    mb: 0.5,
                    pl: 2,
                    '&.Mui-selected': {
                      color: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      fontWeight: 'bold'
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    }
                  },
                  '.MuiTabs-indicator': {
                    display: 'none'
                  }
                }}
              >
                <Tab 
                  label="Personal Information" 
                  icon={<Person />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Account Settings" 
                  icon={<InfoIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </Box>
          
          {/* Main Content */}
          <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Typography variant="h5" fontWeight="bold">
                  Personal Information
                </Typography>
                <Button 
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  variant={editMode ? "contained" : "outlined"}
                  color={editMode ? "primary" : "inherit"}
                  onClick={editMode ? handleProfileSubmit : handleEditToggle}
                >
                  {editMode ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </Box>
              
              <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Full Name"
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <Person color="primary" sx={{ mr: 1 }} />,
                          readOnly: !editMode
                        }}
                        variant={editMode ? "outlined" : "filled"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email Address"
                        name="email"
                        value={formValues.email}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <Email color="primary" sx={{ mr: 1 }} />,
                          readOnly: true
                        }}
                        variant="filled"
                        helperText="Email cannot be changed"
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        value={formValues.phoneNumber}
                        onChange={handleInputChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                          startAdornment: <Phone color="primary" sx={{ mr: 1 }} />,
                          readOnly: !editMode
                        }}
                        variant={editMode ? "outlined" : "filled"}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                        <Select
                          name="vehicleType"
                          value={formValues.vehicleType}
                          onChange={handleSelectChange}
                          label="Vehicle Type"
                          inputProps={{ 
                            startAdornment: <BikeIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} /> 
                          }}
                          readOnly={!editMode}
                          disabled={!editMode}
                        >
                          <MenuItem value="Bicycle">Bicycle</MenuItem>
                          <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                          <MenuItem value="Car">Car</MenuItem>
                          <MenuItem value="Van">Van</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Account Settings
              </Typography>
              <Card elevation={0} sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Change Password
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <form onSubmit={handlePasswordSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={4}>
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
                        <Grid item xs={12} md={4}>
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
                          >
                            {loading ? <CircularProgress size={24} /> : 'Update Password'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="error" gutterBottom>
                      Delete Account
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Deleting your account will permanently remove all your data from our systems. This action cannot be undone.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Account
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
                <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
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
            </TabPanel>
          </Box>
        </Box>
      </Paper>
      
      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/jpg"
        style={{ display: 'none' }}
        onChange={handleImageChange}
      />
      
      {/* Profile image dialog */}
      <Dialog open={openImageDialog} onClose={handleCloseImageDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Avatar 
              src={profileImageUrl || undefined}
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto',
                mb: 2
              }}
            >
              {profileData?.name ? profileData.name.charAt(0).toUpperCase() : ''}
            </Avatar>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImageUploadClick}
              startIcon={<CameraIcon />}
            >
              Upload New Photo
            </Button>
            {profileImage && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Ready to upload: {profileImage.name}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleUploadProfileImage}
                >
                  Save Photo
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourierProfile; 