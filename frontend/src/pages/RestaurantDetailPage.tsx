import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  Divider, 
  Chip,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { getRestaurantById } from '../services/restaurantService';
import { getRestaurantMenuItems, MenuItem as MenuServiceItem } from '../services/menuService';
import { Restaurant } from '../interfaces';

// Mock data for development and testing
const MOCK_RESTAURANT: Restaurant = {
  restaurantId: 1,
  name: "Delicious Kitchen",
  email: "contact@delicious.com",
  phoneNumber: "+90 555 123 4567",
  token: "",
  cuisineType: "International",
  rating: 4.7,
  isOpen: true,
  city: "Istanbul",
  street: "123 Main Street",
  state: "",
  country: "Turkey",
  deliveryRangeKm: 5,
  estimatedDeliveryTime: "30-45 min",
  averagePrice: 85
};

// For simplicity, use MenuServiceItem type for the component
type ComponentMenuItem = MenuServiceItem;

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<ComponentMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [menuLoading, setMenuLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const restaurantData = await getRestaurantById(Number(id));
        setRestaurant(restaurantData);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [id]);

  // Fetch menu items in a separate effect
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!id) return;
      
      setMenuLoading(true);
      
      try {
        // Get menu items from the API
        const menuData = await getRestaurantMenuItems(Number(id));
        setMenuItems(menuData);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(menuData.map(item => item.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setMenuLoading(false);
      }
    };
    
    if (restaurant) {
      fetchMenuItems();
    }
  }, [id, restaurant]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const filteredMenuItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
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

  if (!restaurant) {
    return (
      <Container>
        <Typography variant="h5" sx={{ my: 4 }}>
          Restaurant not found
        </Typography>
      </Container>
    );
  }

  // Get full address from restaurant data
  const fullAddress = [
    restaurant.street,
    restaurant.city,
    restaurant.state,
    restaurant.zipCode,
    restaurant.country
  ].filter(Boolean).join(', ');

  // Get restaurant image from profile or placeholder
  const restaurantImage = restaurant.profileImageUrl || 
    `https://source.unsplash.com/random/1200x400/?restaurant,${restaurant.name.replace(/ /g, ',')}`;

  return (
    <Container maxWidth="lg">
      {/* Restaurant Header */}
      <Paper 
        sx={{ 
          mt: 4, 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}
        elevation={2}
      >
        {/* Restaurant Image */}
        <Box 
          sx={{ 
            height: { xs: 200, md: 300 },
            width: '100%',
            position: 'relative',
            bgcolor: 'grey.200'
          }}
        >
          <Box
            component="img"
            src={restaurantImage}
            alt={restaurant.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          {/* Favorite button */}
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
            onClick={toggleFavorite}
          >
            {isFavorite ? 
              <FavoriteIcon color="error" /> : 
              <FavoriteBorderIcon />
            }
          </IconButton>
        </Box>
        
        {/* Restaurant Info */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" component="h1">
                  {restaurant.name}
                </Typography>
                {restaurant.isOpen ? (
                  <Chip 
                    label="Open" 
                    size="small" 
                    color="success" 
                    sx={{ ml: 2 }}
                  />
                ) : (
                  <Chip 
                    label="Closed" 
                    size="small" 
                    color="error" 
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={restaurant.rating || 0} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {restaurant.rating?.toFixed(1) || 'No ratings'}
                </Typography>
                <Chip 
                  label={restaurant.cuisineType} 
                  size="small" 
                  sx={{ ml: 2 }}
                  variant="outlined"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">{fullAddress}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">{restaurant.phoneNumber}</Typography>
                </Box>
                {restaurant.estimatedDeliveryTime && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">Delivery time: {restaurant.estimatedDeliveryTime}</Typography>
                  </Box>
                )}
                {restaurant.deliveryRangeKm && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DeliveryDiningIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">Delivery range: {restaurant.deliveryRangeKm} km</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Menu Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Menü
      </Typography>
      
      {/* Category filters */}
      {categories.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, my: 2, flexWrap: 'wrap' }}>
          <Chip 
            label="Tümü" 
            onClick={() => setSelectedCategory('')}
            color={selectedCategory === '' ? 'primary' : 'default'}
            variant={selectedCategory === '' ? 'filled' : 'outlined'}
          />
          {categories.map(category => (
            <Chip
              key={category}
              label={category}
              onClick={() => handleCategoryClick(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      )}
      
      <Divider sx={{ mb: 3 }} />
      
      {menuLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={140} animation="wave" />
                <CardContent>
                  <Skeleton animation="wave" height={30} sx={{ mb: 1 }} />
                  <Skeleton animation="wave" height={60} sx={{ mb: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton animation="wave" width={80} height={30} />
                    <Skeleton animation="wave" width={60} height={30} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filteredMenuItems.length === 0 ? (
        <Typography>No menu items found.</Typography>
      ) : (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filteredMenuItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.menuItemId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.imageUrl}
                    alt={item.name}
                  />
                ) : (
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://source.unsplash.com/random/300x200/?food,${item.category.toLowerCase()}`}
                    alt={item.name}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip size="small" label={item.category} />
                    <Typography variant="h6" color="primary">
                      {item.price.toFixed(2)} ₺
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add to Cart section */}
      <Paper 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          zIndex: 10,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
        elevation={3}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              disabled={!restaurant.isOpen || menuLoading}
            >
              {restaurant.isOpen ? (menuLoading ? 'Loading Menu...' : 'Start Order') : 'Restaurant Closed'}
            </Button>
          </Box>
        </Container>
      </Paper>
    </Container>
  );
};

export default RestaurantDetailPage; 