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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  DirectionsBike as BikeIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  ArrowBack,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Courier } from '../interfaces';
import { getCourierProfile, updateProfile } from '../services/profileService';
import { updateCourierStatus } from '../services/courierService';

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

const CourierProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState<Courier | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  
  // Form values
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    vehicleType: ''
  });
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getCourierProfile();
        console.log('Profile data from API:', data);
        setProfileData(data);
        setIsAvailable(data.isAvailable || false);
        
        // Set form values from profile data
        setFormValues({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          vehicleType: data.vehicleType || ''
        });
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

  const handleAvailabilityChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!profileData?.courierId) {
        throw new Error('Courier ID not available');
      }

      const newStatus = event.target.checked ? 'AVAILABLE' : 'UNAVAILABLE';
      await updateCourierStatus(profileData.courierId, newStatus);
      setIsAvailable(event.target.checked);
      setSuccessMessage(`Status updated to ${newStatus.toLowerCase()}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error updating availability:', err);
      setError(err.message || 'Failed to update availability status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Create update data object
      const updateData = {
        name: formValues.name,
        phoneNumber: formValues.phoneNumber,
        vehicleType: formValues.vehicleType
      };
      
      const updatedProfile = await updateProfile(updateData);
      setProfileData(updatedProfile as Courier);
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

  if (loading && !profileData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button */}
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
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              p: 3,
              pt: 4,
              pb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Box 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 3, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                  fontSize: '3rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  border: '4px solid rgba(255, 255, 255, 0.2)'
                }}
              >
              <BikeIcon sx={{ fontSize: 60 }} />
            </Box>
            
            <Typography variant="h5" sx={{ mb: 1 }}>
              {profileData?.name}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
              {profileData?.email}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={isAvailable}
                  onChange={handleAvailabilityChange}
                  color="default"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {isAvailable ? 'Available for Delivery' : 'Not Available'}
                </Typography>
              }
              sx={{ mb: 3 }}
            />
            
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
                <Tab icon={<AccessTimeIcon />} label="Delivery History" iconPosition="start" />
                <Tab icon={<InfoIcon />} label="Account Details" iconPosition="start" />
              </Tabs>
            </Box>
          </Box>
          
          {/* Main Content */}
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* Profile Information Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Courier Profile
                </Typography>
                <Button 
                  variant={editMode ? "outlined" : "contained"}
                  color={editMode ? "error" : "primary"}
                  startIcon={editMode ? <EditIcon /> : <EditIcon />}
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
                      label="Name"
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
                    <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!editMode}>
                        <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                        <Select
                        labelId="vehicle-type-label"
                          name="vehicleType"
                          value={formValues.vehicleType}
                          onChange={handleSelectChange}
                          label="Vehicle Type"
                        startAdornment={<BikeIcon color="action" sx={{ mr: 1 }} />}
                      >
                        {vehicleTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
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
            
            {/* Delivery History Tab */}
            <TabPanel value={activeTab} index={1}>
              <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 4 }}>
                Delivery History
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Your delivery history will be displayed here. This feature is coming soon.
              </Alert>
            </TabPanel>
            
            {/* Account Details Tab */}
            <TabPanel value={activeTab} index={2}>
              <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 4 }}>
                Account Details
              </Typography>
              
              <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                    Account Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Account Type
                      </Typography>
                      <Typography variant="body1">
                        Courier
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1">
                        {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Status
                      </Typography>
                      <Typography variant="body1" color={isAvailable ? 'success.main' : 'error.main'}>
                        {isAvailable ? 'Available' : 'Not Available'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Vehicle Type
                    </Typography>
                      <Typography variant="body1">
                        {profileData?.vehicleType || 'Not specified'}
                    </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CourierProfile; 