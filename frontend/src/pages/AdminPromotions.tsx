import React, { useState, useEffect } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  LocalOffer as OfferIcon,
  CardGiftcard as GiftIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axiosInstance from '../services/axiosConfig';
import * as couponService from '../services/couponService';
import { Coupon, CouponRequest } from '../services/couponService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Promotion {
  id?: number;
  name: string;
  description: string;
  discountPercentage: number;
  endDate: string | null;
  isActive: boolean;
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

const initialPromotionState: Promotion = {
  name: '',
  description: '',
  discountPercentage: 0,
  endDate: null,
  isActive: true
};

const initialCouponState: CouponRequest = {
  name: '',
  description: '',
  discountAmount: 0,
  minOrderAmount: 0,
  quota: 1,
  endDate: null,
  isActive: true
};

const AdminPromotions: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Promotion states
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [inactivePromotions, setInactivePromotions] = useState<Promotion[]>([]);
  const [openPromotionModal, setOpenPromotionModal] = useState(false);
  const [promotionData, setPromotionData] = useState<Promotion>(initialPromotionState);
  
  // Coupon states
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [inactiveCoupons, setInactiveCoupons] = useState<Coupon[]>([]);
  const [openCouponModal, setOpenCouponModal] = useState(false);
  const [couponData, setCouponData] = useState<CouponRequest>(initialCouponState);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  useEffect(() => {
    if (activeTab === 0) {
      fetchPromotions();
    } else {
      fetchCoupons();
    }
  }, [activeTab]);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const activeResponse = await axiosInstance.get('/promotions/active');
      setActivePromotions(activeResponse.data);
      
      const inactiveResponse = await axiosInstance.get('/promotions/inactive');
      setInactivePromotions(inactiveResponse.data);
    } catch (err) {
      setError('Failed to fetch promotions. Please try again later.');
      console.error('Error fetching promotions:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const activeResponse = await couponService.getActiveCoupons();
      setActiveCoupons(activeResponse);
      
      const inactiveResponse = await couponService.getInactiveCoupons();
      setInactiveCoupons(inactiveResponse);
    } catch (err) {
      setError('Failed to fetch coupons. Please try again later.');
      console.error('Error fetching coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  const handleOpenPromotionModal = () => {
    setPromotionData(initialPromotionState);
    setOpenPromotionModal(true);
  };
  
  const handleClosePromotionModal = () => {
    setOpenPromotionModal(false);
  };
  
  const handlePromotionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPromotionData(prev => ({
      ...prev,
      [name]: name === 'discountPercentage' ? parseFloat(value) : value
    }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromotionData(prev => ({
      ...prev,
      endDate: e.target.value
    }));
  };
  
  const handleCreatePromotion = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/promotions', promotionData);
      fetchPromotions();
      setSuccessMessage('Promotion created successfully');
      setOpenPromotionModal(false);
    } catch (err) {
      setError('Failed to create promotion. Please try again.');
      console.error('Error creating promotion:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const handleTogglePromotionStatus = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await axiosInstance.patch(`/promotions/${id}/toggle-status`);
      fetchPromotions();
      setSuccessMessage('Promotion status updated successfully');
    } catch (err) {
      setError('Failed to update promotion status. Please try again.');
      console.error('Error updating promotion status:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const handleDeletePromotion = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/promotions/${id}`);
      fetchPromotions();
      setSuccessMessage('Promotion deleted successfully');
    } catch (err) {
      setError('Failed to delete promotion. Please try again.');
      console.error('Error deleting promotion:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const handleCreateCoupon = () => {
    setSuccessMessage("Coupon creation feature will be implemented soon.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No end date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };
  
  const renderPromotionCards = (promotions: Promotion[], isActive: boolean) => {
    if (isLoading && promotions.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (promotions.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No {isActive ? 'active' : 'inactive'} promotions found.
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {promotions.map((promotion) => (
          <Grid item xs={12} md={6} key={promotion.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {promotion.name}
                  </Typography>
                  <Box 
                    sx={{ 
                      bgcolor: promotion.isActive ? 'success.light' : 'error.light',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                      {promotion.isActive ? 'Active' : 'Inactive'}
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
                      {formatDate(promotion.endDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <CardActions sx={{ px: 2, py: 1.5 }}>
                <Button 
                  size="small" 
                  color="error"
                  onClick={() => handleTogglePromotionStatus(promotion.id)}
                  disabled={isLoading}
                >
                  {promotion.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  size="small" 
                  color="warning"
                  onClick={() => handleDeletePromotion(promotion.id)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  // Coupon handlers
  const handleOpenCouponModal = (editMode: boolean = false, coupon: Coupon | null = null) => {
    setIsEditMode(editMode);
    if (editMode && coupon) {
      setSelectedCoupon(coupon);
      setCouponData({
        name: coupon.name,
        description: coupon.description || '',
        discountAmount: coupon.discountAmount,
        minOrderAmount: coupon.minOrderAmount,
        quota: coupon.quota,
        endDate: coupon.endDate,
        isActive: coupon.isActive
      });
    } else {
      setSelectedCoupon(null);
      setCouponData(initialCouponState);
    }
    setOpenCouponModal(true);
  };
  
  const handleCloseCouponModal = () => {
    setOpenCouponModal(false);
    setIsEditMode(false);
    setSelectedCoupon(null);
  };
  
  const handleCouponInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCouponData(prev => ({
      ...prev,
      [name]: ['discountAmount', 'minOrderAmount', 'quota'].includes(name) 
        ? parseFloat(value) 
        : value
    }));
  };
  
  const handleCouponDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponData(prev => ({
      ...prev,
      endDate: e.target.value || null
    }));
  };
  
  const handleCreateNewCoupon = async () => {
    try {
      setIsLoading(true);
      await couponService.createCoupon(couponData);
      fetchCoupons();
      setSuccessMessage('Coupon created successfully');
      setOpenCouponModal(false);
    } catch (err) {
      setError('Failed to create coupon. Please try again.');
      console.error('Error creating coupon:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const handleUpdateCoupon = async () => {
    if (!selectedCoupon?.id) return;
    
    try {
      setIsLoading(true);
      await couponService.updateCoupon(selectedCoupon.id, couponData);
      fetchCoupons();
      setSuccessMessage('Coupon updated successfully');
      setOpenCouponModal(false);
    } catch (err) {
      setError('Failed to update coupon. Please try again.');
      console.error('Error updating coupon:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const handleToggleCouponStatus = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await couponService.toggleCouponStatus(id);
      fetchCoupons();
      setSuccessMessage('Coupon status updated successfully');
    } catch (err) {
      setError('Failed to update coupon status. Please try again.');
      console.error('Error updating coupon status:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const handleDeleteCoupon = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      await couponService.deleteCoupon(id);
      fetchCoupons();
      setSuccessMessage('Coupon deleted successfully');
    } catch (err) {
      setError('Failed to delete coupon. Please try again.');
      console.error('Error deleting coupon:', err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  const renderCouponCards = (coupons: Coupon[], isActive: boolean) => {
    if (isLoading && coupons.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (coupons.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          No {isActive ? 'active' : 'inactive'} coupons found.
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {coupons.map((coupon) => (
          <Grid item xs={12} md={6} key={coupon.id}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {coupon.name}
                  </Typography>
                  <Box 
                    sx={{ 
                      bgcolor: coupon.isActive ? 'success.light' : 'error.light',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
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
                      {formatCurrency(coupon.discountAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Min. Order Amount
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(coupon.minOrderAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Quota / Used
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {coupon.quota} / {coupon.usageCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Valid Until
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(coupon.endDate)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <Divider />
              <CardActions sx={{ px: 2, py: 1.5 }}>
                <Button 
                  size="small" 
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenCouponModal(true, coupon)}
                  disabled={isLoading}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color={coupon.isActive ? 'error' : 'success'}
                  startIcon={coupon.isActive ? <ClearIcon /> : <CheckIcon />}
                  onClick={() => handleToggleCouponStatus(coupon.id)}
                  disabled={isLoading}
                >
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  size="small" 
                  color="warning"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
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
              onClick={handleOpenPromotionModal}
              disabled={isLoading}
            >
              Create Promotion
            </Button>
          </Box>
          
          {renderPromotionCards(activePromotions, true)}
          
          <Box sx={{ mt: 5, mb: 3 }}>
            <Typography variant="h6">Inactive Promotions</Typography>
          </Box>
          
          {renderPromotionCards(inactivePromotions, false)}
        </TabPanel>

        {/* Coupons Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Active Coupons</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCouponModal()}
              disabled={isLoading}
            >
              Create Coupon
            </Button>
          </Box>
          
          {renderCouponCards(activeCoupons, true)}
          
          <Box sx={{ mt: 5, mb: 3 }}>
            <Typography variant="h6">Inactive Coupons</Typography>
          </Box>
          
          {renderCouponCards(inactiveCoupons, false)}
        </TabPanel>
      </Container>
      
      {/* Create Promotion Modal */}
      <Dialog open={openPromotionModal} onClose={handleClosePromotionModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Create New Promotion
            <IconButton edge="end" color="inherit" onClick={handleClosePromotionModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Promotion Name"
                name="name"
                value={promotionData.name}
                onChange={handlePromotionInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={promotionData.description}
                onChange={handlePromotionInputChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount Percentage"
                name="discountPercentage"
                type="number"
                value={promotionData.discountPercentage}
                onChange={handlePromotionInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 1
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={promotionData.endDate || ''}
                onChange={handleDateChange}
                InputLabelProps={{ 
                  shrink: true 
                }}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePromotionModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreatePromotion} 
            variant="contained" 
            disabled={!promotionData.name || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create Promotion'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Coupon Modal */}
      <Dialog open={openCouponModal} onClose={handleCloseCouponModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
            <IconButton edge="end" color="inherit" onClick={handleCloseCouponModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Coupon Name"
                name="name"
                value={couponData.name}
                onChange={handleCouponInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={couponData.description}
                onChange={handleCouponInputChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount Amount"
                name="discountAmount"
                type="number"
                value={couponData.discountAmount}
                onChange={handleCouponInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Order Amount"
                name="minOrderAmount"
                type="number"
                value={couponData.minOrderAmount}
                onChange={handleCouponInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quota"
                name="quota"
                type="number"
                value={couponData.quota}
                onChange={handleCouponInputChange}
                inputProps={{
                  min: 1,
                  step: 1
                }}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={couponData.endDate || ''}
                onChange={handleCouponDateChange}
                InputLabelProps={{ 
                  shrink: true 
                }}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCouponModal} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={isEditMode ? handleUpdateCoupon : handleCreateNewCoupon} 
            variant="contained" 
            disabled={!couponData.name || couponData.discountAmount <= 0 || couponData.quota < 1 || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : isEditMode ? 'Update Coupon' : 'Create Coupon'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPromotions; 