import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  Alert,
  Divider,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  LocalOffer as OfferIcon,
  CardGiftcard as GiftIcon,
  Info as InfoIcon
} from '@mui/icons-material';

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
      id={`promotions-tabpanel-${index}`}
      aria-labelledby={`promotions-tab-${index}`}
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

const AdminPromotions: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Sample data for UI demonstration - would come from API in real implementation
  const samplePromotions = [
    {
      id: 1,
      name: "Summer Sale",
      description: "Get 20% off on all orders",
      discountPercentage: 20,
      startDate: "2023-07-01",
      endDate: "2023-08-31",
      active: true
    },
    {
      id: 2,
      name: "New User Welcome",
      description: "First time users get 30% off",
      discountPercentage: 30,
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      active: true
    }
  ];
  
  const sampleCoupons = [
    {
      id: 1,
      code: "SUMMER23",
      description: "Summer special discount",
      discountAmount: 10,
      minimumOrderAmount: 25,
      expirationDate: "2023-08-31",
      usageLimit: 1000,
      usedCount: 432,
      active: true
    },
    {
      id: 2,
      code: "WELCOME15",
      description: "New customer welcome",
      discountAmount: 15,
      minimumOrderAmount: 30,
      expirationDate: "2023-12-31",
      usageLimit: 500,
      usedCount: 123,
      active: true
    }
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleCreatePromotion = () => {
    setSuccessMessage("Promotion creation feature will be implemented soon.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const handleCreateCoupon = () => {
    setSuccessMessage("Coupon creation feature will be implemented soon.");
    setTimeout(() => setSuccessMessage(null), 3000);
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
            <OfferIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Promotions & Coupons
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage promotional offers and discount coupons
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
        
        {/* Implementation notice */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1.5 }} />
            <Typography>
              This feature is currently under development. The backend implementation will be available soon.
            </Typography>
          </Box>
        </Alert>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Promotions" icon={<OfferIcon />} iconPosition="start" />
            <Tab label="Coupons" icon={<GiftIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Promotions Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Active Promotions</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePromotion}
            >
              Create Promotion
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {samplePromotions.map((promotion) => (
              <Grid item xs={12} md={6} key={promotion.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {promotion.name}
                      </Typography>
                      <Box 
                        sx={{ 
                          bgcolor: promotion.active ? 'success.light' : 'error.light',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                          {promotion.active ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {promotion.description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Discount
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {promotion.discountPercentage}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Valid Until
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {promotion.endDate}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ px: 2, py: 1.5 }}>
                    <Button size="small" color="primary">
                      Edit
                    </Button>
                    <Button size="small" color="error">
                      {promotion.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="small" color="info">
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Coupons Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Available Coupons</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCoupon}
            >
              Create Coupon
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {sampleCoupons.map((coupon) => (
              <Grid item xs={12} md={6} key={coupon.id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {coupon.code}
                      </Typography>
                      <Box 
                        sx={{ 
                          bgcolor: coupon.active ? 'success.light' : 'error.light',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {coupon.description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Discount Amount
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          ${coupon.discountAmount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Min Order
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          ${coupon.minimumOrderAmount}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Usage
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Expires
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {coupon.expirationDate}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ px: 2, py: 1.5 }}>
                    <Button size="small" color="primary">
                      Edit
                    </Button>
                    <Button size="small" color="error">
                      {coupon.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="small" color="info">
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AdminPromotions; 