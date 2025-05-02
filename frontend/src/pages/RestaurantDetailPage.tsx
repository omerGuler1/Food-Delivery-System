import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Skeleton,
  List,
  ListItem,
  Badge,
  Avatar,
  useTheme,
  useMediaQuery,
  Tooltip,
  alpha
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { getRestaurantById } from '../services/restaurantService';
import { getRestaurantMenuItems, MenuItem as MenuServiceItem } from '../services/menuService';
import { Restaurant } from '../interfaces';
import { useCart } from '../contexts/CartContext';

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

// Represent a cart item with quantity
interface CartItem extends ComponentMenuItem {
  quantity: number;
}

const RestaurantDetailPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addToCart: addItemToCart, removeFromCart: removeItemFromCart, updateQuantity } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<ComponentMenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [menuLoading, setMenuLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Constants for delivery and service fees
  const DELIVERY_FEE = 15;
  const SERVICE_FEE = 5;

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const restaurantData = await getRestaurantById(Number(id));
        // Ensure restaurant is open by default
        if (restaurantData) {
          setRestaurant({
            ...restaurantData,
            isOpen: true
          });
        }
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

  // Add to cart using the context
  const handleAddToCart = (item: ComponentMenuItem) => {
    if (restaurant) {
      const menuItem = {
        ...item,
        restaurantId: restaurant.restaurantId,
        restaurantName: restaurant.name
      };
      addItemToCart(menuItem as any, restaurant.restaurantId, restaurant.name);
    }
  };

  // Remove from cart using the context
  const handleRemoveFromCart = (item: ComponentMenuItem) => {
    removeItemFromCart(item.menuItemId);
  };

  // Remove item completely using the context
  const removeItemCompletely = (menuItemId: number) => {
    removeItemFromCart(menuItemId);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Handle checkout button click
  const handleCheckout = () => {
    navigate('/checkout');
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

  // Calculate total with fees
  const subtotal = cart.totalPrice;
  const deliveryFee = cart.items.length > 0 ? DELIVERY_FEE : 0;
  const serviceFee = cart.items.length > 0 ? SERVICE_FEE : 0;
  const orderTotal = subtotal + deliveryFee + serviceFee;

  return (
    <Box sx={{ bgcolor: '#F8F9FA', minHeight: '100vh', pb: 10 }}>
      {/* Hero Section with Restaurant Image */}
      <Box 
        sx={{ 
          position: 'relative',
          height: { xs: 200, sm: 300, md: 400 },
          width: '100%',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <Box
          component="img"
          src={restaurantImage}
          alt={restaurant.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7)',
          }}
        />
        
        {/* Restaurant name overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: { xs: 2, md: 4 },
            color: 'white',
            backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)'
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold">
                  {restaurant.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={restaurant.rating || 0} precision={0.1} readOnly sx={{ color: 'white' }} />
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {restaurant.rating?.toFixed(1) || 'No ratings'}
                  </Typography>
                  <Chip 
                    label={restaurant.cuisineType} 
                    size="small" 
                    sx={{ ml: 2, bgcolor: alpha('#fff', 0.2), color: 'white' }}
                  />
                  
                  {restaurant.isOpen ? (
                    <Chip 
                      label="Open" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 1 }}
                    />
                  ) : (
                    <Chip 
                      label="Closed" 
                      size="small" 
                      color="error" 
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </Box>
              <IconButton 
                sx={{ 
                  bgcolor: alpha('#fff', 0.2),
                  color: isFavorite ? 'error.main' : 'white',
                  '&:hover': { bgcolor: alpha('#fff', 0.3) }
                }}
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
          </Container>
        </Box>
      </Box>
      
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Left Column - Restaurant Info & Menu */}
          <Grid item xs={12} md={8}>
            {/* Restaurant Details Card */}
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1]
              }}
              elevation={0}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationOnIcon color="action" sx={{ mr: 1, mt: 0.3 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body2">
                        {fullAddress}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                    <PhoneIcon color="action" sx={{ mr: 1, mt: 0.3 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2">
                        {restaurant.phoneNumber}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {restaurant.estimatedDeliveryTime && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <AccessTimeIcon color="action" sx={{ mr: 1, mt: 0.3 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Delivery Time
                        </Typography>
                        <Typography variant="body2">
                          {restaurant.estimatedDeliveryTime}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {restaurant.deliveryRangeKm && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
                      <DeliveryDiningIcon color="action" sx={{ mr: 1, mt: 0.3 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Delivery Range
                        </Typography>
                        <Typography variant="body2">
                          {restaurant.deliveryRangeKm} km
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
            
            {/* Menu Section */}
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                boxShadow: theme.shadows[1]
              }}
              elevation={0}
            >
              <Typography variant="h5" component="h2" fontWeight="500" gutterBottom>
                Menu
              </Typography>
              
              {/* Category filters */}
              {categories.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, my: 2, flexWrap: 'wrap', pb: 1, overflowX: 'auto' }}>
                  <Chip 
                    label="All"
                    onClick={() => setSelectedCategory('')}
                    color={selectedCategory === '' ? 'primary' : 'default'}
                    variant={selectedCategory === '' ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 500 }}
                  />
                  {categories.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => handleCategoryClick(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      variant={selectedCategory === category ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Box>
              )}
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Menu Items */}
              {menuLoading ? (
                <Grid container spacing={2}>
                  {[1, 2, 3, 4].map((item) => (
                    <Grid item xs={12} key={item}>
                      <Card 
                        sx={{ 
                          display: 'flex', 
                          height: 120, 
                          boxShadow: 'none',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Skeleton variant="rectangular" width={120} height={120} animation="wave" />
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', p: 2 }}>
                          <Skeleton animation="wave" height={24} width="60%" sx={{ mb: 1 }} />
                          <Skeleton animation="wave" height={16} width="80%" />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 1 }}>
                            <Skeleton animation="wave" width={60} height={24} />
                            <Skeleton animation="wave" width={100} height={36} />
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : filteredMenuItems.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography>No menu items found in this category.</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredMenuItems.map(item => (
                    <Grid item xs={12} key={item.menuItemId}>
                      <Card 
                        sx={{ 
                          display: 'flex', 
                          boxShadow: 'none',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: `0px 0px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                          }
                        }}
                      >
                        {item.imageUrl ? (
                          <CardMedia
                            component="img"
                            sx={{ width: 120, height: 120 }}
                            image={item.imageUrl}
                            alt={item.name}
                          />
                        ) : (
                          <CardMedia
                            component="img"
                            sx={{ width: 120, height: 120 }}
                            image={`https://source.unsplash.com/random/120x120/?food,${item.category.toLowerCase()}`}
                            alt={item.name}
                          />
                        )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, mt: 0.5 }}>
                                  {item.description.length > 120 
                                    ? `${item.description.substring(0, 120)}...` 
                                    : item.description}
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={item.category} 
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1), 
                                    color: 'primary.main',
                                    fontWeight: 500,
                                    height: 24
                                  }}
                                />
                                
                                {!item.availability && (
                                  <Chip 
                                    size="small" 
                                    label="Out of stock" 
                                    color="error" 
                                    sx={{ ml: 1, height: 24 }}
                                  />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <Typography 
                                  variant="h6" 
                                  color="primary" 
                                  sx={{ fontWeight: 600 }}
                                >
                                  {formatCurrency(item.price)}
                                </Typography>
                                
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  color="primary" 
                                  startIcon={<AddIcon />}
                                  disabled={!restaurant.isOpen || !item.availability}
                                  onClick={() => {
                                    if (restaurant) {
                                      const menuItem = {
                                        ...item,
                                        restaurantId: restaurant.restaurantId,
                                        restaurantName: restaurant.name
                                      };
                                      addItemToCart(menuItem as any, restaurant.restaurantId, restaurant.name);
                                    }
                                  }}
                                  sx={{ 
                                    mt: 1,
                                    fontWeight: 600,
                                    minWidth: 120
                                  }}
                                >
                                  Add to Cart
                                </Button>
                              </Box>
                            </Box>
                          </CardContent>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
          
          {/* Right Column - Cart */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                position: 'sticky', 
                top: 24,
                boxShadow: theme.shadows[1]
              }}
              elevation={0}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Badge badgeContent={cart.items.length} color="primary" sx={{ mr: 1.5 }}>
                  <ShoppingCartIcon fontSize="large" color="primary" />
                </Badge>
                <Typography variant="h5" fontWeight="600" color="primary">
                  Your Order
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {cart.items.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Your cart is empty
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, px: 2 }}>
                    Add items from the menu to start your order
                  </Typography>
                  {!restaurant.isOpen && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      This restaurant is currently closed
                    </Alert>
                  )}
                </Box>
              ) : (
                <>
                  <List sx={{ 
                    maxHeight: isMobile ? 'auto' : 320, 
                    overflow: 'auto',
                    pb: 0,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      borderRadius: '6px',
                    }
                  }}>
                    {cart.items.map((item) => (
                      <ListItem 
                        key={item.menuItemId} 
                        disableGutters
                        sx={{ 
                          py: 1.5, 
                          px: 0, 
                          borderBottom: '1px solid', 
                          borderColor: alpha(theme.palette.divider, 0.7)
                        }}
                      >
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              {formatCurrency(item.price * item.quantity)}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mt: 1 
                          }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              height: 32
                            }}>
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    updateQuantity(item.menuItemId, item.quantity - 1);
                                  } else {
                                    removeItemFromCart(item.menuItemId);
                                  }
                                }}
                                sx={{ p: 0.5 }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ mx: 1.5, fontWeight: 500, minWidth: 18, textAlign: 'center' }}>
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                sx={{ p: 0.5 }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Tooltip title="Remove item">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => removeItemFromCart(item.menuItemId)}
                                sx={{ p: 0.5 }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal</Typography>
                      <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">Delivery Fee</Typography>
                        <Tooltip title="Standard delivery fee">
                          <InfoOutlinedIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary', fontSize: 16 }} />
                        </Tooltip>
                      </Box>
                      <Typography variant="body2">{formatCurrency(deliveryFee)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Service Fee</Typography>
                      <Typography variant="body2">{formatCurrency(serviceFee)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight="600">Total</Typography>
                      <Typography variant="subtitle1" fontWeight="600" color="primary">
                        {formatCurrency(orderTotal)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      size="large"
                      disabled={!restaurant.isOpen || cart.items.length === 0}
                      startIcon={<ShoppingCartIcon />}
                      onClick={handleCheckout}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      {restaurant.isOpen ? 'Checkout' : 'Restaurant Closed'}
                    </Button>
                    
                    {!restaurant.isOpen && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        This restaurant is currently closed. You can't place orders at this time.
                      </Alert>
                    )}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Mobile cart footer (visible only on mobile) */}
      {cart.items.length > 0 && (
        <Paper 
          sx={{ 
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            zIndex: 10,
            boxShadow: theme.shadows[3],
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
          elevation={0}
        >
          <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Badge badgeContent={cart.items.length} color="primary" sx={{ mr: 1 }}>
                  <ShoppingCartIcon color="primary" />
                </Badge>
                <Typography variant="subtitle1" fontWeight="600" color="primary" display="inline" sx={{ ml: 1 }}>
                  {formatCurrency(orderTotal)}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="primary" 
                disabled={!restaurant.isOpen || cart.items.length === 0}
                onClick={handleCheckout}
                sx={{ fontWeight: 600 }}
              >
                {restaurant.isOpen ? 'Checkout' : 'Closed'}
              </Button>
            </Box>
          </Container>
        </Paper>
      )}
    </Box>
  );
};

export default RestaurantDetailPage; 