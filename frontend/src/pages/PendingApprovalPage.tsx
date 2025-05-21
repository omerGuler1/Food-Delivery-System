import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Refresh } from '@mui/icons-material';
import { checkRestaurantApprovalStatus } from '../services/restaurantService';
import { checkCourierApprovalStatus } from '../services/courierService';

const PendingApprovalPage: React.FC = () => {
  const { user, userType, logout, setUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user should be on this page
  useEffect(() => {
    if (!user || !userType || (userType !== 'restaurant' && userType !== 'courier')) {
      navigate('/');
    }
  }, [user, userType, navigate]);

  const handleRefresh = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    setError(null);
    
    try {
      let updatedStatus;
      
      if (userType === 'restaurant' && 'restaurantId' in user) {
        updatedStatus = await checkRestaurantApprovalStatus(user.restaurantId);
        
        if (updatedStatus && updatedStatus.approvalStatus === 'ACCEPTED') {
          // Update user in context with new status
          const updatedUser = { 
            ...user, 
            approvalStatus: 'ACCEPTED' as 'ACCEPTED' 
          };
          setUser(updatedUser);
          
          // Save to localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Redirect to dashboard
          navigate('/restaurant/dashboard');
          return;
        } else if (updatedStatus && updatedStatus.approvalStatus === 'REJECTED') {
          // If rejected, show message and logout user
          setError('Your restaurant account has been rejected by the administrator. Please contact customer support for more details or register again with correct information.');
          setTimeout(() => {
            logout();
            navigate('/');
          }, 5000);
          return;
        }
      } else if (userType === 'courier' && 'courierId' in user) {
        updatedStatus = await checkCourierApprovalStatus(user.courierId);
        
        if (updatedStatus && updatedStatus.approvalStatus === 'ACCEPTED') {
          // Update user in context with new status
          const updatedUser = { 
            ...user, 
            approvalStatus: 'ACCEPTED' as 'ACCEPTED' 
          };
          setUser(updatedUser);
          
          // Save to localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Redirect to dashboard
          navigate('/courier/dashboard');
          return;
        } else if (updatedStatus && updatedStatus.approvalStatus === 'REJECTED') {
          // If rejected, show message and logout user
          setError('Your courier account has been rejected by the administrator. Please contact customer support for more details or register again with correct information.');
          setTimeout(() => {
            logout();
            navigate('/');
          }, 5000);
          return;
        }
      }
      
      // If we get here, the status hasn't changed or there was an issue
      setError('Your account is still pending approval. Please check back later.');
    } catch (err) {
      console.error('Error checking approval status:', err);
      setError('Failed to check approval status. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'warning.light',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h4" color="warning.contrastText">
              !
            </Typography>
          </Box>

          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" textAlign="center">
            Account Pending Approval
          </Typography>

          <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
            Thank you for registering with Hungry Users Food Delivery System! Your {userType} account has been created successfully.
          </Typography>

          <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
            An administrator needs to review and approve your account before you can access the dashboard. This process may take up to 24 hours.
          </Typography>

          <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
            You will receive an email notification once your account is approved.
          </Typography>

          {error && (
            <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <CircularProgress size={24} color="inherit" /> : 'Check Status'}
            </Button>
            
            <Button
              variant="outlined"
              component={Link}
              to="/"
              startIcon={<Home />}
            >
              Return to Home
            </Button>
            
            <Button
              variant="text"
              color="error"
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PendingApprovalPage; 