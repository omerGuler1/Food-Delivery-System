import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Rating,
  Chip,
  Button,
  CircularProgress,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import { Restaurant } from '../interfaces';
import { favoriteService } from '../services/favoriteService';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';

const FavoriteRestaurantsPage: React.FC = () => {
  const theme = useTheme();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteRestaurants = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const favoriteRestaurants = await favoriteService.getFavoriteRestaurants();
        setRestaurants(favoriteRestaurants);
      } catch (error) {
        console.error('Error fetching favorite restaurants:', error);
        setError('Failed to load favorite restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavoriteRestaurants();
  }, []);

  const handleRemoveFavorite = async (restaurantId: number, event: React.MouseEvent) => {
    event.preventDefault(); // Prevent navigation to restaurant detail
    event.stopPropagation(); // Stop event propagation
    
    try {
      await favoriteService.removeFavoriteRestaurant(restaurantId);
      // Update the UI by removing the restaurant from the list
      setRestaurants(prev => prev.filter(restaurant => restaurant.restaurantId !== restaurantId));
    } catch (error) {
      console.error('Error removing restaurant from favorites:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Your Favorite Restaurants
      </Typography>
      
      {restaurants.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't added any restaurants to your favorites yet
          </Typography>
          <Button 
            component={RouterLink} 
            to="/" 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
          >
            Discover Restaurants
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {restaurants.map((restaurant) => {
            const restaurantImage = restaurant.profileImageUrl || 
              `https://source.unsplash.com/random/300x200/?restaurant,${restaurant.name.replace(/ /g, ',')}`;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={restaurant.restaurantId}>
                <Card 
                  component={RouterLink}
                  to={`/restaurants/${restaurant.restaurantId}`}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    textDecoration: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={restaurantImage}
                      alt={restaurant.name}
                    />
                    <Button
                      onClick={(e) => handleRemoveFavorite(restaurant.restaurantId, e)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        minWidth: 'auto',
                        borderRadius: '50%',
                        p: 1,
                        bgcolor: alpha('#fff', 0.8),
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: alpha('#fff', 0.9),
                        }
                      }}
                    >
                      <FavoriteIcon />
                    </Button>
                    {restaurant.isOpen !== undefined && !restaurant.isOpen && (
                      <Chip 
                        label="Closed" 
                        size="small" 
                        color="error" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: 8, 
                          left: 8,
                          fontWeight: 'bold'
                        }} 
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {restaurant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {restaurant.rating !== undefined && (
                        <>
                          <Rating value={restaurant.rating} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {restaurant.rating.toFixed(1)}
                          </Typography>
                        </>
                      )}
                    </Box>
                    <Chip 
                      label={restaurant.cuisineType}
                      size="small"
                      sx={{ mb: 1, mr: 1 }}
                    />
                    {restaurant.address && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, mt: 0.3, color: 'text.secondary', mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {[
                            restaurant.address.street,
                            restaurant.address.city,
                            restaurant.address.state,
                          ].filter(Boolean).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default FavoriteRestaurantsPage; 