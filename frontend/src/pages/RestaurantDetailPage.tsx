import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Divider, 
  Paper, 
  List, 
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Rating,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Badge
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  ShoppingCart as ShoppingCartIcon, 
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { RestaurantDetails, MenuItem as MenuItemType, FoodCategory } from '../interfaces';
import { getRestaurantById, getRestaurantMenuItems } from '../services/restaurantService';

// Food category image paths
const categoryImagePaths: Record<string, string> = {
  [FoodCategory.STARTERS]: '/images/Mozzarella-Sticks.jpg',
  [FoodCategory.MAIN_COURSES]: '/images/huge-burger-with-fried-meat-vegetables.jpg',
  [FoodCategory.SIDES]: '/images/side-salad.jpg',
  [FoodCategory.DESSERTS]: '/images/chocolate-cake.jpg',
  [FoodCategory.DRINKS]: '/images/fresh-juice.jpg',
  'default': '/images/huge-burger-with-fried-meat-vegetables.jpg'
};

// Menu item image paths
const menuItemImagePaths: Record<string, string> = {
  'Garlic Bread': '/images/garlic-bread.jpg',
  'Mozzarella Sticks': '/images/Mozzarella-Sticks.jpg',
  'Mixed Kebab': '/images/mixed-kebap.jpg',
  'Chicken Kebab': '/images/Chicken_kebab-.jpg',
  'Vegetarian Platter': '/images/mezze-platter.jpg',
  'French Fries': '/images/French-Fries.jpg',
  'Side Salad': '/images/side-salad.jpg',
  'Chocolate Cake': '/images/chocolate-cake.jpg',
  'Soft Drink': '/images/soft-drinks.jpg',
  'Fresh Juice': '/images/fresh-juice.jpg',
  'Margherita Pizza': '/images/pizza-pizza-filled-with-tomatoes-salami-olives.jpg',
  'Pepperoni Pizza': '/images/pizza-pizza-filled-with-tomatoes-salami-olives.jpg',
  'Vegetarian Pizza': '/images/pizza-pizza-filled-with-tomatoes-salami-olives.jpg',
  'Classic Burger': '/images/huge-burger-with-fried-meat-vegetables.jpg',
  'Cheeseburger': '/images/huge-burger-with-fried-meat-vegetables.jpg',
  'Veggie Burger': '/images/huge-burger-with-fried-meat-vegetables.jpg',
  'Sushi Combo': '/images/sushi.jpg',
  'Salmon Roll': '/images/sushi.jpg',
  'Vegetable Roll': '/images/sushi.jpg'
};

// Helper function to get image URL from process.env.PUBLIC_URL
const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${process.env.PUBLIC_URL}${path}`;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const restaurantId = parseInt(id || '0');
  const { isAuthenticated } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, isFromSameRestaurant } = useCart();
  
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch restaurant details and menu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log(`Fetching data for restaurant ID: ${restaurantId}`);
      
      // Use mock data for now
      const mockRestaurantData: RestaurantDetails = {
        restaurantId: restaurantId,
        name: restaurantId === 1 ? 'Pizza Palace' : 
              restaurantId === 2 ? 'Burger World' : 
              restaurantId === 3 ? 'Sushi Express' : 'Kebab House',
        email: `info@restaurant${restaurantId}.com`,
        phoneNumber: '+90555123456' + restaurantId,
        token: '',
        cuisineType: restaurantId === 1 ? 'Italian' : 
                    restaurantId === 2 ? 'American' : 
                    restaurantId === 3 ? 'Japanese' : 'Turkish',
        rating: 4.5 + (restaurantId / 10),
        address: '123 Food Street, Istanbul',
        description: 'A wonderful restaurant serving delicious food.',
        openingHours: '10:00 - 22:00, Mon-Sun'
      };
      
      // Log mock restaurant data
      console.log('Mock restaurant data:', mockRestaurantData);
      
      setRestaurant(mockRestaurantData);
      
      // Mock menu items
      const mockMenuItems: MenuItemType[] = [
        // Starters
        {
          menuItemId: restaurantId * 100 + 1,
          name: 'Garlic Bread',
          description: 'Freshly baked bread with garlic butter and herbs',
          price: 5.99,
          category: FoodCategory.STARTERS,
          imageUrl: getImageUrl(menuItemImagePaths['Garlic Bread']),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 10,
          isVegetarian: true
        },
        {
          menuItemId: restaurantId * 100 + 2,
          name: 'Mozzarella Sticks',
          description: 'Crispy on the outside, melty on the inside',
          price: 7.99,
          category: FoodCategory.STARTERS,
          imageUrl: getImageUrl(menuItemImagePaths['Mozzarella Sticks']),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 15,
          allergens: ['Dairy']
        },
        // Main Courses
        {
          menuItemId: restaurantId * 100 + 3,
          name: restaurantId === 1 ? 'Margherita Pizza' : 
                restaurantId === 2 ? 'Classic Burger' : 
                restaurantId === 3 ? 'Sushi Combo' : 'Mixed Kebab',
          description: 'Our signature dish, made with premium ingredients',
          price: 14.99,
          category: FoodCategory.MAIN_COURSES,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.MAIN_COURSES]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 25,
          specialOffer: true,
          discountPercentage: 10
        },
        {
          menuItemId: restaurantId * 100 + 4,
          name: restaurantId === 1 ? 'Pepperoni Pizza' : 
                restaurantId === 2 ? 'Cheeseburger' : 
                restaurantId === 3 ? 'Salmon Roll' : 'Chicken Kebab',
          description: 'Customer favorite, highly recommended',
          price: 15.99,
          category: FoodCategory.MAIN_COURSES,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.MAIN_COURSES]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 20,
          allergens: ['Dairy']
        },
        {
          menuItemId: restaurantId * 100 + 5,
          name: restaurantId === 1 ? 'Vegetarian Pizza' : 
                restaurantId === 2 ? 'Veggie Burger' : 
                restaurantId === 3 ? 'Vegetable Roll' : 'Vegetarian Platter',
          description: 'Perfect plant-based option',
          price: 13.99,
          category: FoodCategory.MAIN_COURSES,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.MAIN_COURSES]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 20,
          isVegetarian: true
        },
        // Sides
        {
          menuItemId: restaurantId * 100 + 6,
          name: 'French Fries',
          description: 'Crispy golden fries with seasoning',
          price: 3.99,
          category: FoodCategory.SIDES,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.SIDES]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 5,
          isVegetarian: true
        },
        {
          menuItemId: restaurantId * 100 + 7,
          name: 'Side Salad',
          description: 'Fresh mixed greens with house dressing',
          price: 4.99,
          category: FoodCategory.SIDES,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.SIDES]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 5,
          isVegetarian: true
        },
        // Desserts
        {
          menuItemId: restaurantId * 100 + 8,
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake with ganache',
          price: 6.99,
          category: FoodCategory.DESSERTS,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.DESSERTS]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 15,
          isVegetarian: true
        },
        // Drinks
        {
          menuItemId: restaurantId * 100 + 9,
          name: 'Soft Drink',
          description: 'Various flavors available',
          price: 2.49,
          category: FoodCategory.DRINKS,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.DRINKS]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 0,
          isVegetarian: true
        },
        {
          menuItemId: restaurantId * 100 + 10,
          name: 'Fresh Juice',
          description: 'Freshly squeezed fruit juice',
          price: 4.49,
          category: FoodCategory.DRINKS,
          imageUrl: getImageUrl(categoryImagePaths[FoodCategory.DRINKS]),
          available: true,
          restaurantId: restaurantId,
          preparationTime: 0,
          isVegetarian: true
        }
      ];
      
      setMenuItems(mockMenuItems);
      setLoading(false);
    };

    if (restaurantId) {
      fetchData();
    } else {
      setError('Invalid restaurant ID');
      setLoading(false);
    }
  }, [restaurantId]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get cart quantity for a menu item
  const getCartQuantity = (menuItemId: number): number => {
    const cartItem = cart.items.find(item => item.menuItemId === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Group menu items by category
  const menuCategories = Array.from(new Set(menuItems.map(item => item.category)));
  
  // Handle add to cart
  const handleAddToCart = (item: MenuItemType) => {
    if (!isAuthenticated) return;
    
    if (restaurant) {
      addToCart(item, restaurant.restaurantId, restaurant.name);
    }
  };

  // Handle remove from cart
  const handleRemoveFromCart = (menuItemId: number) => {
    removeFromCart(menuItemId);
  };
  
  // Handle update quantity
  const handleUpdateQuantity = (menuItemId: number, newQuantity: number) => {
    updateQuantity(menuItemId, newQuantity);
  };

  // Loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '70vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || 'Restaurant not found'}
        </Alert>
        <Button 
          component={Link} 
          to="/"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Restaurant Header */}
      <Box mb={4}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardMedia
                component="img"
                height="250"
                image={restaurant.cuisineType === 'Italian' ? getImageUrl('/images/pizza-pizza-filled-with-tomatoes-salami-olives.jpg') : 
                        restaurant.cuisineType === 'American' ? getImageUrl('/images/huge-burger-with-fried-meat-vegetables.jpg') : 
                        restaurant.cuisineType === 'Japanese' ? getImageUrl('/images/sushi.jpg') : 
                        getImageUrl('/images/kebab.jpg')}
                alt={restaurant.name}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h4" component="h1" fontWeight="bold">
                    {restaurant.name}
                  </Typography>
                  <Chip 
                    label={restaurant.cuisineType} 
                    color="primary" 
                    sx={{ fontSize: '0.9rem', px: 1 }}
                  />
                </Box>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Rating value={restaurant.rating} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {restaurant.rating?.toFixed(1)}
                  </Typography>
                </Box>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                  {restaurant.description}
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={1} mt={2}>
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {restaurant.openingHours}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {restaurant.phoneNumber}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {restaurant.address}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Cart Container */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Your Order
                  </Typography>
                  <Badge badgeContent={cart.items.length} color="primary">
                    <ShoppingCartIcon />
                  </Badge>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {!isAuthenticated ? (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center', 
                      minHeight: '200px',
                      textAlign: 'center',
                      p: 2
                    }}
                  >
                    <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Login to Order
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Please sign in to add items to your cart
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      component={Link} 
                      to="/login"
                      sx={{ mt: 2 }}
                    >
                      Log In
                    </Button>
                  </Box>
                ) : cart.items.length === 0 ? (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      justifyContent: 'center', 
                      minHeight: '200px',
                      textAlign: 'center',
                      p: 2
                    }}
                  >
                    <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Your cart is empty
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add items from the menu to get started
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <List disablePadding>
                      {cart.items.map((item) => (
                        <ListItem 
                          key={item.menuItemId} 
                          disableGutters 
                          sx={{ 
                            py: 1, 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                            "&:last-child": {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          <ListItemText
                            primary={item.name}
                            secondary={`$${item.price.toFixed(2)}`}
                            primaryTypographyProps={{
                              variant: 'body1',
                              fontWeight: 'medium'
                            }}
                          />
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              ml: 2 
                            }}
                          >
                            <IconButton 
                              size="small" 
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1, minWidth: '24px', textAlign: 'center' }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={() => handleUpdateQuantity(item.menuItemId, item.quantity + 1)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveFromCart(item.menuItemId)}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ mt: 2 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          fontWeight: 'bold',
                          mb: 2
                        }}
                      >
                        <Typography variant="h6">Total</Typography>
                        <Typography variant="h6">${cart.totalPrice.toFixed(2)}</Typography>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        fullWidth
                      >
                        Checkout
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Menu Section */}
      <Typography variant="h4" component="h2" fontWeight="bold" mb={3}>
        Menu
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="All" />
          {menuCategories.map((category, index) => (
            <Tab key={index} label={category} />
          ))}
        </Tabs>
      </Box>
      
      {/* All Items Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.menuItemId}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={getImageUrl(menuItemImagePaths[item.name] || categoryImagePaths['default'])}
                  alt={item.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography gutterBottom variant="h6" component="h3" fontWeight="medium">
                      {item.name}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      ${item.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Chip 
                      label={item.category} 
                      size="small" 
                      sx={{ mb: 2 }} 
                    />
                    
                    {/* Display additional food information */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {item.preparationTime !== undefined && (
                        <Chip 
                          size="small" 
                          label={`${item.preparationTime} min`}
                          icon={<AccessTimeIcon fontSize="small" />}
                          variant="outlined"
                        />
                      )}
                      
                      {item.isVegetarian && (
                        <Chip 
                          size="small" 
                          label="Vegetarian"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      
                      {item.isVegan && (
                        <Chip 
                          size="small" 
                          label="Vegan"
                          color="success"
                          variant="outlined"
                        />
                      )}
                      
                      {item.isGlutenFree && (
                        <Chip 
                          size="small" 
                          label="Gluten Free"
                          color="info"
                          variant="outlined"
                        />
                      )}
                      
                      {item.specialOffer && (
                        <Chip 
                          size="small" 
                          label={`${item.discountPercentage}% OFF`}
                          color="error"
                        />
                      )}
                    </Box>
                    
                    {/* Display allergens if available */}
                    {item.allergens && item.allergens.length > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        <b>Allergens:</b> {item.allergens.join(', ')}
                      </Typography>
                    )}
                    
                    {isAuthenticated ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getCartQuantity(item.menuItemId) > 0 ? (
                          <>
                            <IconButton 
                              size="small" 
                              onClick={() => handleUpdateQuantity(item.menuItemId, getCartQuantity(item.menuItemId) - 1)}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 2 }}>
                              {getCartQuantity(item.menuItemId)}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={() => handleUpdateQuantity(item.menuItemId, getCartQuantity(item.menuItemId) + 1)}
                              color="primary"
                            >
                              <AddIcon />
                            </IconButton>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            fullWidth
                            onClick={() => handleAddToCart(item)}
                            disabled={!isFromSameRestaurant(restaurant.restaurantId)}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        component={Link}
                        to="/login"
                        fullWidth
                      >
                        Login to Order
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      
      {/* Category Tabs */}
      {menuCategories.map((category, index) => (
        <TabPanel key={index} value={activeTab} index={index + 1}>
          <Grid container spacing={3}>
            {menuItems
              .filter(item => item.category === category)
              .map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.menuItemId}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={getImageUrl(menuItemImagePaths[item.name] || categoryImagePaths['default'])}
                      alt={item.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography gutterBottom variant="h6" component="h3" fontWeight="medium">
                          {item.name}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          ${item.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {item.description}
                      </Typography>
                      
                      {/* Display additional food information */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {item.preparationTime !== undefined && (
                          <Chip 
                            size="small" 
                            label={`${item.preparationTime} min`}
                            icon={<AccessTimeIcon fontSize="small" />}
                            variant="outlined"
                          />
                        )}
                        
                        {item.isVegetarian && (
                          <Chip 
                            size="small" 
                            label="Vegetarian"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        
                        {item.isVegan && (
                          <Chip 
                            size="small" 
                            label="Vegan"
                            color="success"
                            variant="outlined"
                          />
                        )}
                        
                        {item.isGlutenFree && (
                          <Chip 
                            size="small" 
                            label="Gluten Free"
                            color="info"
                            variant="outlined"
                          />
                        )}
                        
                        {item.specialOffer && (
                          <Chip 
                            size="small" 
                            label={`${item.discountPercentage}% OFF`}
                            color="error"
                          />
                        )}
                      </Box>
                      
                      {/* Display allergens if available */}
                      {item.allergens && item.allergens.length > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          <b>Allergens:</b> {item.allergens.join(', ')}
                        </Typography>
                      )}
                      
                      {isAuthenticated ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          {getCartQuantity(item.menuItemId) > 0 ? (
                            <>
                              <IconButton 
                                size="small" 
                                onClick={() => handleUpdateQuantity(item.menuItemId, getCartQuantity(item.menuItemId) - 1)}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <Typography sx={{ mx: 2 }}>
                                {getCartQuantity(item.menuItemId)}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => handleUpdateQuantity(item.menuItemId, getCartQuantity(item.menuItemId) + 1)}
                                color="primary"
                              >
                                <AddIcon />
                              </IconButton>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<AddIcon />}
                              fullWidth
                              onClick={() => handleAddToCart(item)}
                              disabled={!isFromSameRestaurant(restaurant.restaurantId)}
                            >
                              Add to Cart
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          component={Link}
                          to="/login"
                          fullWidth
                          sx={{ mt: 2 }}
                        >
                          Login to Order
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
            ))}
          </Grid>
        </TabPanel>
      ))}
    </Container>
  );
};

export default RestaurantDetailPage; 