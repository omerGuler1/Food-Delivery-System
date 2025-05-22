import React, { useState, useEffect } from 'react';
import { Box, Typography, Tab, Tabs, Container, Paper, CircularProgress } from '@mui/material';
import RestaurantAnalytics from '../components/analytics/RestaurantAnalytics';
import CustomerAnalytics from '../components/analytics/CustomerAnalytics';
import api from '../services/api';

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
}

const AdminAnalytics: React.FC = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch restaurant analytics
        const restaurantsResponse = await api.get('/admin/analytics/restaurants');
        setRestaurantData(restaurantsResponse.data);
        
        // Fetch customer analytics
        const customersResponse = await api.get('/admin/analytics/customers');
        setCustomerData(customersResponse.data);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="analytics tabs"
            variant="fullWidth"
          >
            <Tab label="Restaurant Analytics" {...a11yProps(0)} />
            <Tab label="Customer Analytics" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        {error && (
          <Box sx={{ p: 2, color: 'error.main' }}>
            <Typography>{error}</Typography>
          </Box>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={value} index={0}>
              <RestaurantAnalytics data={restaurantData} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <CustomerAnalytics data={customerData} />
            </TabPanel>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AdminAnalytics; 