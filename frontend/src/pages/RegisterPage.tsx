import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Tab, 
  Tabs, 
  Box, 
  Link as MuiLink,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Home } from '@mui/icons-material';
import { 
  CustomerRegisterRequest, 
  RestaurantRegisterRequest, 
  CourierRegisterRequest 
} from '../interfaces';
import { 
  customerRegister, 
  restaurantRegister, 
  courierRegister 
} from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

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
      id={`register-tabpanel-${index}`}
      aria-labelledby={`register-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Helper function to get tab aria properties
const a11yProps = (index: number) => {
  return {
    id: `register-tab-${index}`,
    'aria-controls': `register-tabpanel-${index}`,
  };
};

const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // State for the tab panel
  const [activeTab, setActiveTab] = useState(0);
  
  // Customer registration form
  const [customerForm, setCustomerForm] = useState<CustomerRegisterRequest>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  // Restaurant registration form
  const [restaurantForm, setRestaurantForm] = useState<RestaurantRegisterRequest>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    cuisineType: ''
  });
  
  // Courier registration form
  const [courierForm, setCourierForm] = useState<CourierRegisterRequest>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    vehicleType: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let formData;
    
    switch (activeTab) {
      case 0: // Customer
        formData = customerForm;
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
      case 1: // Restaurant
        formData = restaurantForm;
        if (!formData.cuisineType) {
          errors.cuisineType = 'Cuisine type is required';
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
      case 2: // Courier
        formData = courierForm;
        if (!formData.vehicleType) {
          errors.vehicleType = 'Vehicle type is required';
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
      default:
        return false;
    }
    
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Phone number is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>?])(?=\S+$).{8,}$/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerForm({
      ...customerForm,
      [e.target.name]: e.target.value
    });
    // Clear error for this field if it exists
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleRestaurantTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestaurantForm({
      ...restaurantForm,
      [e.target.name]: e.target.value
    });
    // Clear error for this field if it exists
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleRestaurantSelectChange = (e: SelectChangeEvent) => {
    setRestaurantForm({
      ...restaurantForm,
      [e.target.name]: e.target.value
    });
    // Clear error for this field if it exists
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const handleCourierTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourierForm({
      ...courierForm,
      [e.target.name]: e.target.value
    });
    // Clear error for this field if it exists
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleCourierSelectChange = (e: SelectChangeEvent) => {
    setCourierForm({
      ...courierForm,
      [e.target.name]: e.target.value
    });
    // Clear error for this field if it exists
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case 0: // Customer
          const customerResponse = await customerRegister(customerForm);
          login(customerResponse, 'customer');
          // Redirect to home page for customers
          navigate('/');
          break;
        case 1: // Restaurant
          const restaurantResponse = await restaurantRegister(restaurantForm);
          // Set approval status to PENDING for new restaurant registrations
          restaurantResponse.approvalStatus = 'PENDING';
          login(restaurantResponse, 'restaurant');
          // Redirect to pending approval page
          navigate('/pending-approval');
          break;
        case 2: // Courier
          const courierResponse = await courierRegister(courierForm);
          // Set approval status to PENDING for new courier registrations
          courierResponse.approvalStatus = 'PENDING';
          login(courierResponse, 'courier');
          // Redirect to pending approval page
          navigate('/pending-approval');
          break;
        default:
          throw new Error('Invalid user type');
      }
    } catch (err: any) {
      let message = 'Registration failed. Please try again.';
      
      // Use the enhanced userMessage if available
      if (err.userMessage) {
        message = err.userMessage;
      } else if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      // Special handling for common registration errors
      if (err.response) {
        if (err.response.status === 409) {
          message = 'This email is already registered. Please use a different email or login.';
        } else if (err.response.status === 400) {
          message = 'Invalid registration data. Please check your information and try again.';
        }
      }
      
      setError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        py: 5,
        pb: 15,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("/images/login-register-background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
          zIndex: -1
        }
      }}
    >
      {/* Home Button */}
      <Button
        component={Link}
        to="/"
        startIcon={<Home />}
        variant="contained"
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'white',
            transform: 'translateY(-2px)'
          },
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: 'bold',
          py: 1,
          px: 2,
          transition: 'all 0.2s ease-in-out'
        }}
        aria-label="Return to home"
      >
        Return to Home
      </Button>
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, mb: 10 }}>
        <Paper 
          elevation={6} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Box 
            sx={{ 
              pt: 2, 
              pb: 1, 
              px: 3,
              textAlign: 'center',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              mb: 1
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color="primary"
              sx={{ mb: 0.5 }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join our community today
            </Typography>
          </Box>
          
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            mx: 2
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth" 
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Customer" {...a11yProps(0)} />
              <Tab label="Restaurant" {...a11yProps(1)} />
              <Tab label="Courier" {...a11yProps(2)} />
            </Tabs>
          </Box>
          
          {/* Customer Registration Form */}
          <TabPanel value={activeTab} index={0}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="h6" align="center" gutterBottom fontWeight="bold">
                Create Customer Account
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1.5 }}>
                Join our platform to order delicious food from local restaurants
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                size="small"
                value={customerForm.name}
                onChange={handleCustomerInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                size="small"
                value={customerForm.email}
                onChange={handleCustomerInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                autoComplete="tel"
                size="small"
                value={customerForm.phoneNumber}
                onChange={handleCustomerInputChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber || "Format: +1234567890"}
              />
              
              <TextField
                margin="dense"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                size="small"
                value={customerForm.password}
                onChange={handleCustomerInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                Password must contain uppercase, lowercase, number, and special character
              </Typography>
              
              <TextField
                margin="dense"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                size="small"
                value={customerForm.confirmPassword}
                onChange={handleCustomerInputChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="medium"
                sx={{ mt: 2, mb: 1, py: 1 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Sign Up'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <MuiLink component={Link} to="/login" variant="body2">
                      Sign in
                    </MuiLink>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          
          {/* Restaurant Registration Form */}
          <TabPanel value={activeTab} index={1}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="h6" align="center" gutterBottom fontWeight="bold">
                Register Your Restaurant
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1.5 }}>
                Join our platform to reach more customers
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="restaurant-name"
                label="Restaurant Name"
                name="name"
                autoComplete="organization"
                autoFocus
                size="small"
                value={restaurantForm.name}
                onChange={handleRestaurantTextChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="restaurant-email"
                label="Email Address"
                name="email"
                autoComplete="email"
                size="small"
                value={restaurantForm.email}
                onChange={handleRestaurantTextChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="restaurant-phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                autoComplete="tel"
                size="small"
                value={restaurantForm.phoneNumber}
                onChange={handleRestaurantTextChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber || "Format: +1234567890"}
              />
              
              <FormControl 
                fullWidth 
                margin="dense" 
                required
                size="small"
                error={!!formErrors.cuisineType}
              >
                <InputLabel id="cuisineType-label">Cuisine Type</InputLabel>
                <Select
                  labelId="cuisineType-label"
                  id="cuisineType"
                  name="cuisineType"
                  value={restaurantForm.cuisineType}
                  label="Cuisine Type"
                  onChange={handleRestaurantSelectChange}
                >
                  <MenuItem value="Italian">Italian</MenuItem>
                  <MenuItem value="American">American</MenuItem>
                  <MenuItem value="Japanese">Japanese</MenuItem>
                  <MenuItem value="Chinese">Chinese</MenuItem>
                  <MenuItem value="Indian">Indian</MenuItem>
                  <MenuItem value="Mexican">Mexican</MenuItem>
                  <MenuItem value="Turkish">Turkish</MenuItem>
                  <MenuItem value="Thai">Thai</MenuItem>
                  <MenuItem value="Lebanese">Lebanese</MenuItem>
                  <MenuItem value="Mediterranean">Mediterranean</MenuItem>
                  <MenuItem value="Fast Food">Fast Food</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {formErrors.cuisineType && <FormHelperText>{formErrors.cuisineType}</FormHelperText>}
              </FormControl>
              
              <TextField
                margin="dense"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="restaurant-password"
                autoComplete="new-password"
                size="small"
                value={restaurantForm.password}
                onChange={handleRestaurantTextChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                Password must contain uppercase, lowercase, number, and special character
              </Typography>
              
              <TextField
                margin="dense"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                id="restaurant-confirmPassword"
                autoComplete="new-password"
                size="small"
                value={restaurantForm.confirmPassword}
                onChange={handleRestaurantTextChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="medium"
                sx={{ mt: 2, mb: 1, py: 1 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Register Restaurant'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <MuiLink component={Link} to="/login" variant="body2">
                      Sign in
                    </MuiLink>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          
          {/* Courier Registration Form */}
          <TabPanel value={activeTab} index={2}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography variant="h6" align="center" gutterBottom fontWeight="bold">
                Join as a Courier
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1.5 }}>
                Deliver food and earn money with flexible hours
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  {error}
                </Alert>
              )}
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="courier-name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                size="small"
                value={courierForm.name}
                onChange={handleCourierTextChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="courier-email"
                label="Email Address"
                name="email"
                autoComplete="email"
                size="small"
                value={courierForm.email}
                onChange={handleCourierTextChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              
              <TextField
                margin="dense"
                required
                fullWidth
                id="courier-phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                autoComplete="tel"
                size="small"
                value={courierForm.phoneNumber}
                onChange={handleCourierTextChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber || "Format: +1234567890"}
              />
              
              <FormControl 
                fullWidth 
                margin="dense" 
                required
                size="small"
                error={!!formErrors.vehicleType}
              >
                <InputLabel id="vehicleType-label">Vehicle Type</InputLabel>
                <Select
                  labelId="vehicleType-label"
                  id="vehicleType"
                  name="vehicleType"
                  value={courierForm.vehicleType}
                  label="Vehicle Type"
                  onChange={handleCourierSelectChange}
                >
                  <MenuItem value="Bicycle">Bicycle</MenuItem>
                  <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                  <MenuItem value="Car">Car</MenuItem>
                  <MenuItem value="Scooter">Scooter</MenuItem>
                  <MenuItem value="Walking">Walking</MenuItem>
                </Select>
                {formErrors.vehicleType && <FormHelperText>{formErrors.vehicleType}</FormHelperText>}
              </FormControl>
              
              <TextField
                margin="dense"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="courier-password"
                autoComplete="new-password"
                size="small"
                value={courierForm.password}
                onChange={handleCourierTextChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                Password must contain uppercase, lowercase, number, and special character
              </Typography>
              
              <TextField
                margin="dense"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                id="courier-confirmPassword"
                autoComplete="new-password"
                size="small"
                value={courierForm.confirmPassword}
                onChange={handleCourierTextChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="medium"
                sx={{ mt: 2, mb: 1, py: 1 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Join as Courier'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <MuiLink component={Link} to="/login" variant="body2">
                      Sign in
                    </MuiLink>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;