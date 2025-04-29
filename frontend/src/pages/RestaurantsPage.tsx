import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box, 
  Rating, 
  Chip, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Alert,
  Divider,
  CardActions,
  SelectChangeEvent
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { getAllRestaurants, getRestaurantsSorted } from '../services/restaurantService';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlaceIcon from '@mui/icons-material/Place';
import { Restaurant } from '../interfaces';

const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('rating');
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');
  const searchQuery = queryParams.get('search');

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        let data;
        
        try {
          // Try to use backend sorting first
          data = await getRestaurantsSorted(sortBy);
        } catch (err) {
          // Fallback to client-side sorting if the backend endpoint doesn't support sorting
          console.log('Falling back to client-side sorting:', err);
          data = await getAllRestaurants();
          
          // Sort data based on the selected criteria
          data = [...data].sort((a, b) => {
            if (sortBy === 'rating') {
              return (b.rating || 0) - (a.rating || 0);
            } else if (sortBy === 'name') {
              return a.name.localeCompare(b.name);
            } else if (sortBy === 'cuisine') {
              return (a.cuisineType || '').localeCompare(b.cuisineType || '');
            }
            return 0;
          });
        }
        
        // Filter by category if needed
        if (categoryFilter) {
          data = data.filter(restaurant => 
            restaurant.cuisineType?.toLowerCase().includes(categoryFilter.toLowerCase())
          );
        }
        
        // Filter by search query if needed
        if (searchQuery) {
          data = data.filter(restaurant => 
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisineType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.city?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setRestaurants(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [sortBy, categoryFilter, searchQuery]);

  // Get a placeholder image based on restaurant name
  const getRestaurantImage = (name: string) => {
    return `https://source.unsplash.com/500x300/?food,${name.replace(' ', ',')}`;
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Browse Restaurants
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {categoryFilter 
            ? `Showing restaurants with ${categoryFilter} cuisine` 
            : searchQuery
              ? `Search results for "${searchQuery}"`
              : 'Discover the best food from our partner restaurants'
          }
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2">
            {restaurants.length} restaurants found
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              onChange={handleSortChange}
              label="Sort By"
            >
              <MenuItem value="rating">Highest Rating</MenuItem>
              <MenuItem value="name">Name (A-Z)</MenuItem>
              <MenuItem value="cuisine">Cuisine Type</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : restaurants.length === 0 ? (
        <Alert severity="info">No restaurants found. Check back later!</Alert>
      ) : (
        <Grid container spacing={3}>
          {restaurants.map((restaurant) => (
            <Grid item xs={12} sm={6} md={4} key={restaurant.restaurantId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={getRestaurantImage(restaurant.name)}
                  alt={restaurant.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {restaurant.name}
                    </Typography>
                    <Chip 
                      label={restaurant.isOpen ? "Open" : "Closed"} 
                      size="small" 
                      color={restaurant.isOpen ? "success" : "default"}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                      value={restaurant.rating || 0} 
                      precision={0.5} 
                      readOnly 
                      size="small" 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {restaurant.rating?.toFixed(1) || 'No ratings'}
                    </Typography>
                  </Box>
                  
                  {restaurant.cuisineType && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <RestaurantIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.cuisineType}
                      </Typography>
                    </Box>
                  )}
                  
                  {restaurant.city && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PlaceIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''}
                      </Typography>
                    </Box>
                  )}
                  
                  {restaurant.deliveryRangeKm && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DeliveryDiningIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Delivers up to {restaurant.deliveryRangeKm} km
                      </Typography>
                    </Box>
                  )}
                  
                  {restaurant.estimatedDeliveryTime && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Delivery in {restaurant.estimatedDeliveryTime}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link} 
                    to={`/restaurants/${restaurant.restaurantId}`} 
                    variant="contained" 
                    fullWidth
                  >
                    View Menu
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RestaurantsPage; 