import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Grid,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  MonetizationOn as MoneyIcon,
  Save as SaveIcon,
  LocalShipping as DeliveryIcon
} from '@mui/icons-material';
import axiosInstance from '../services/axiosConfig';

interface Fee {
  id: number;
  fee: number;
}

const AdminFees: React.FC = () => {
  const [deliveryFee, setDeliveryFee] = useState<Fee | null>(null);
  const [newFeeValue, setNewFeeValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveryFee();
  }, []);

  const fetchDeliveryFee = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/fees/delivery');
      setDeliveryFee(response.data);
      setNewFeeValue(response.data.fee);
    } catch (err) {
      console.error('Error fetching delivery fee:', err);
      setError('Failed to fetch delivery fee. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFee = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.put(`/fees/delivery`, { value: newFeeValue });
      
      // Update the delivery fee in state
      if (deliveryFee) {
        setDeliveryFee({
          ...deliveryFee,
          fee: newFeeValue
        });
      }
      
      setSuccessMessage('Delivery fee updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating delivery fee:', err);
      setError('Failed to update delivery fee. Please try again later.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 3, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 50, 
              height: 50, 
              bgcolor: 'primary.main',
              mr: 2
            }}
          >
            <MoneyIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Fees Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage system fees and charges
            </Typography>
          </Box>
        </Box>
        
        {/* Success and Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {isLoading && !deliveryFee ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                      <DeliveryIcon />
                    </Avatar>
                    <Typography variant="h6">Delivery Fee</Typography>
                  </Box>
                  
                  {deliveryFee && (
                    <>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Current Delivery Fee
                        </Typography>
                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                          ${deliveryFee.fee.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <TextField
                        fullWidth
                        label="New Delivery Fee"
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{
                          min: 0,
                          step: 0.01
                        }}
                        value={newFeeValue}
                        onChange={(e) => setNewFeeValue(parseFloat(e.target.value))}
                        margin="normal"
                      />
                    </>
                  )}
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleUpdateFee}
                    disabled={isLoading || (deliveryFee ? newFeeValue === deliveryFee.fee : false)}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Update Fee'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AdminFees; 