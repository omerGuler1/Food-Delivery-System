import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBanInfo, clearBanState } from '../services/authService';

const BannedPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get ban info from state or localStorage
  const locationBanInfo = location.state?.banInfo;
  const storedBanInfo = getBanInfo();
  const banInfo = locationBanInfo || storedBanInfo || {};
  
  useEffect(() => {
    // If no ban info is available, redirect to home
    if (!locationBanInfo && !storedBanInfo) {
      navigate('/');
    }
  }, [locationBanInfo, storedBanInfo, navigate]);
  
  // Default values in case no state is passed
  const userType = banInfo.userType || 'Account';
  const banUntil = banInfo.banUntil || 'a certain period';
  const message = banInfo.message || 'Your account has been banned by the administrator.';
  
  const handleGoHome = () => {
    // Clear the ban state when user manually chooses to go home
    clearBanState();
    navigate('/');
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      bgcolor: '#f8f9fa',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            borderTop: 6,
            borderColor: 'error.main',
          }}
        >
          <BlockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom align="center" color="error.main">
            Account Banned
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {message}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            Your {userType.toLowerCase()} is banned until <strong>{banUntil}</strong>.
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            If you believe this is a mistake, please contact our support team for assistance.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleGoHome}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default BannedPage; 