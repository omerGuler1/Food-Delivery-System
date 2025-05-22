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
  Checkbox, 
  FormControlLabel, 
  Link as MuiLink,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Home, AdminPanelSettings } from '@mui/icons-material';
import { LoginRequest, AdminLoginRequest } from '../interfaces';
import { 
  customerLogin, 
  restaurantLogin, 
  courierLogin, 
  adminLogin, 
  setBanState 
} from '../services/authService';
import { checkCourierApprovalStatus } from '../services/courierService';
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
      id={`login-tabpanel-${index}`}
      aria-labelledby={`login-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Helper function to get tab aria properties
const a11yProps = (index: number) => {
  return {
    id: `login-tab-${index}`,
    'aria-controls': `login-tabpanel-${index}`,
  };
};

// User types for tabs
const USER_TYPES = ['customer', 'restaurant', 'courier'];

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // State for the tab panel
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });

  // Admin modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState<AdminLoginRequest>({
    email: '',
    password: ''
  });
  const [adminShowPassword, setAdminShowPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  
  // UI state
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setFormData({ email: '', password: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const userType = USER_TYPES[activeTab];
      let response;
      
      switch (userType) {
        case 'customer':
          response = await customerLogin(formData);
          break;
        case 'restaurant':
          response = await restaurantLogin(formData);
          break;
        case 'courier':
          response = await courierLogin(formData);
          // Debug: Konsola kurye yanıtını yazdır
          console.log("Courier login response:", response);
          break;
        default:
          throw new Error('Invalid user type');
      }
      
      // Update context with user data
      login(response, userType as any);
      
      if (userType === 'courier') {
        // Kurye girişi başarılı - doğrudan dashboard'a yönlendir
        // approvalStatus eksik veya "ACCEPTED" ise erişime izin ver
        const courierResponse = response as any;
        
        // Gerçek zamanlı onay durumunu kontrol et
        try {
          if (courierResponse.courierId) {
            const statusCheck = await checkCourierApprovalStatus(courierResponse.courierId);
            if (statusCheck && statusCheck.approvalStatus === 'ACCEPTED') {
              // Kullanıcı onay durumunu güncelle
              courierResponse.approvalStatus = 'ACCEPTED';
              // localStorage'daki bilgileri güncelle
              localStorage.setItem('user', JSON.stringify(courierResponse));
              navigate('/courier/dashboard');
              return;
            } else if (statusCheck && statusCheck.approvalStatus === 'PENDING') {
              // Kullanıcı hala beklemede
              navigate('/pending-approval');
              return;
            }
          }
        } catch (err) {
          console.error("Error checking courier approval status:", err);
        }
        
        // Backend'den güncel durumu alamadıysak, normal yönlendirme mantığına devam et
        if (!courierResponse.approvalStatus || courierResponse.approvalStatus === 'ACCEPTED') {
          navigate('/courier/dashboard');
        } else {
          navigate('/pending-approval');
        }
        return; // Diğer yönlendirmeleri engelle
      }
      
      // Restoran için onay kontrolü
      if (userType === 'restaurant') {
        if ('approvalStatus' in response && 
            (response.approvalStatus === 'PENDING' || response.approvalStatus === 'REJECTED')) {
          navigate('/pending-approval');
          return;
        }
        navigate('/restaurant/dashboard');
        return;
      }
      
      // Customer için doğrudan ana sayfaya yönlendir
      if (userType === 'customer') {
        navigate('/');
        return;
      }
      
    } catch (err: any) {
      // Check for ban error and redirect to banned page
      if (err.isBanError) {
        // Make sure ban info is stored properly
        if (err.banInfo) {
          setBanState(err.banInfo);
        }
        
        // Redirect to banned page with ban information
        navigate('/banned', { 
          state: { 
            banInfo: err.banInfo 
          }
        });
        return;
      }
      
      let message = 'Login failed. Please try again.';
      
      // Use the enhanced userMessage if available
      if (err.userMessage) {
        message = err.userMessage;
      } else if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      // Special handling for 401 errors (invalid credentials)
      if (err.response && err.response.status === 401) {
        message = 'Invalid email or password. Please try again.';
      }
      
      setError(message);
      // Scroll to the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminModalOpen = () => {
    setAdminModalOpen(true);
    setAdminError(null);
    setAdminFormData({ email: '', password: '' });
  };

  const handleAdminModalClose = () => {
    setAdminModalOpen(false);
  };

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminFormData({
      ...adminFormData,
      [e.target.name]: e.target.value
    });
  };

  const toggleAdminPasswordVisibility = () => {
    setAdminShowPassword(!adminShowPassword);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError(null);
    
    try {
      const response = await adminLogin(adminFormData);
      
      // Update context with admin data
      login(response, 'admin');
      
      // Close modal and redirect to admin dashboard
      setAdminModalOpen(false);
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      let message = 'Admin login failed. Please try again.';
      
      if (err.userMessage) {
        message = err.userMessage;
      } else if (err.response && err.response.data && err.response.data.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      if (err.response && err.response.status === 401) {
        message = 'Invalid email or password. Please try again.';
      }
      
      setAdminError(message);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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

      {/* Admin Button - moved to the right of Home button */}
      <Button
        startIcon={<AdminPanelSettings />}
        variant="contained"
        onClick={handleAdminModalOpen}
        sx={{
          position: 'absolute',
          top: 20,
          left: 220,
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
        aria-label="Admin Login"
      >
        Admin
      </Button>

      {/* Admin Login Modal */}
      <Dialog open={adminModalOpen} onClose={handleAdminModalClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="div" fontWeight="bold" color="primary" align="center">
            Admin Login
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAdminSubmit} noValidate sx={{ mt: 1 }}>
            {adminError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {adminError}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="adminEmail"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={adminFormData.email}
              onChange={handleAdminInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={adminShowPassword ? 'text' : 'password'}
              id="adminPassword"
              autoComplete="current-password"
              value={adminFormData.password}
              onChange={handleAdminInputChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleAdminPasswordVisibility}
                      edge="end"
                    >
                      {adminShowPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleAdminModalClose}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAdminSubmit}
            variant="contained"
            color="primary"
            disabled={adminLoading}
          >
            {adminLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </DialogActions>
      </Dialog>

      <Container maxWidth="sm" sx={{ position: 'relative', py: 4, zIndex: 1, mb: 10 }}>
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
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Login to access your account
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

          {[0, 1, 2].map((tabIndex) => (
            <TabPanel key={tabIndex} value={activeTab} index={tabIndex}>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 3, pb: 2, pt: 1 }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  size="small"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  size="small"
                  value={formData.password}
                  onChange={handleInputChange}
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
                
                <Grid container sx={{ mt: 1, mb: 1 }}>
                  <Grid item xs>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          value="remember" 
                          color="primary" 
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">Remember me</Typography>}
                    />
                  </Grid>
                  <Grid item>
                    <MuiLink component={Link} to="/forgot-password" variant="body2">
                      Forgot password?
                    </MuiLink>
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="medium"
                  disabled={loading}
                  sx={{ 
                    mt: 1, 
                    mb: 1, 
                    py: 1,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(255, 112, 67, 0.3)'
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Log In'}
                </Button>
                
                <Grid container justifyContent="center" sx={{ mt: 0.5 }}>
                  <Grid item>
                    <MuiLink component={Link} to="/register" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </MuiLink>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          ))}
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 