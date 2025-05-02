import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  TextField, 
  InputAdornment, 
  Paper,
  CircularProgress,
  Rating
} from '@mui/material';
import { Search as SearchIcon, LocalPizza, Fastfood, Restaurant, Cake } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { Restaurant as RestaurantType } from '../interfaces';
import { getAllRestaurants, searchRestaurants } from '../services/restaurantService';

// Hero section background image
const heroImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80';

// Restaurant images mapping using public path
const restaurantImages: Record<string, string> = {
  'Pizza Palace': '/assets/images/pizza-pizza-filled-with-tomatoes-salami-olives.jpg',
  'Burger World': '/assets/images/huge-burger-with-fried-meat-vegetables.jpg',
  'Sushi Express': '/assets/images/sushi.jpg',
  'Kebab House': '/assets/images/kebab.jpg',
  // Add fallback for any new restaurants
  'default': '/assets/images/huge-burger-with-fried-meat-vegetables.jpg'
};

const HomePage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // Fetch restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getAllRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        // If API isn't available, use mock data
        setRestaurants([
          {
            restaurantId: 1,
            name: 'Pizza Palace',
            email: 'info@pizzapalace.com',
            phoneNumber: '+905551234567',
            token: '',
            cuisineType: 'Italian',
            rating: 4.8
          },
          {
            restaurantId: 2,
            name: 'Burger World',
            email: 'info@burgerworld.com',
            phoneNumber: '+905557654321',
            token: '',
            cuisineType: 'American',
            rating: 4.5
          },
          {
            restaurantId: 3,
            name: 'Sushi Express',
            email: 'info@sushiexpress.com',
            phoneNumber: '+905559876543',
            token: '',
            cuisineType: 'Japanese',
            rating: 4.7
          },
          {
            restaurantId: 4,
            name: 'Kebab House',
            email: 'info@kebabhouse.com',
            phoneNumber: '+905553456789',
            token: '',
            cuisineType: 'Turkish',
            rating: 4.6
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;
    navigate(`/restaurants?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const categories = [
    { name: 'Pizza', icon: <LocalPizza fontSize="large" color="primary" /> },
    { name: 'Burgers', icon: <Fastfood fontSize="large" color="primary" /> },
    { name: 'Main Course', icon: <Restaurant fontSize="large" color="primary" /> },
    { name: 'Desserts', icon: <Cake fontSize="large" color="primary" /> }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: 10,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Delicious Food Delivered To Your Doorstep
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Order from your favorite restaurants with just a few clicks
          </Typography>
          
          <Paper
            component="form"
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              maxWidth: 600,
              mx: 'auto',
              mb: 2
            }}
          >
            <TextField
              fullWidth
              placeholder="Search for restaurants or cuisines..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { py: 1 }
              }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={handleSearch}
              sx={{ ml: 1, height: '100%', px: 4 }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          Popular Categories
        </Typography>
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
          {categories.map((category, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  py: 3,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    cursor: 'pointer'
                  }
                }}
                component={Link}
                to={`/restaurants?cuisineType=${category.name}`}
              >
                <Box sx={{ mb: 2 }}>
                  {category.icon}
                </Box>
                <Typography variant="h6" component="h3">
                  {category.name}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Restaurants Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold">
            Featured Restaurants
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4} sx={{ mt: 2 }}>
              {restaurants.slice(0, 4).map((restaurant) => (
                <Grid item xs={12} sm={6} md={3} key={restaurant.restaurantId}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6
                      }
                    }}
                    component={Link}
                    to={`/restaurants/${restaurant.restaurantId}`}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={restaurantImages[restaurant.name] || restaurantImages.default}
                      alt={restaurant.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3">
                        {restaurant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {restaurant.cuisineType}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={restaurant.rating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {restaurant.rating}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link}
              to="/restaurants"
            >
              Browse All Restaurants
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight="bold">
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  mx: 'auto',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                1
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Choose a Restaurant
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Browse through our extensive list of top-quality restaurants near you.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  mx: 'auto',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                2
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Select Your Favorites
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose from delicious meals and add them to your cart.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  mx: 'auto',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                3
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Enjoy Your Meal
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Pay securely and we'll deliver your food right to your doorstep.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage; 