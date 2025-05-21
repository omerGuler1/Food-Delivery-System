import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  Badge,
  ListItemIcon,
  ListItemText,
  Divider,
  List,
  ListItem
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, userType, logout } = useAuth();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElCart, setAnchorElCart] = useState<null | HTMLElement>(null);
  
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleOpenCartMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCart(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseCartMenu = () => {
    setAnchorElCart(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleCloseUserMenu();
  };

  // Check if current route is dashboard
  const isDashboardPage = location.pathname.includes('/dashboard');

  // Navigation items based on user type
  let pages = [];
  
  if (isAuthenticated && userType === 'restaurant') {
    // For restaurant users, show dashboard only
    pages = [
      { title: 'Dashboard', path: '/restaurant/dashboard', icon: <DashboardIcon sx={{ mr: 0.5 }} /> }
    ];
  } else if (isAuthenticated && userType === 'courier') {
    // For courier users, show dashboard only
    pages = [
      { title: 'Dashboard', path: '/courier/dashboard', icon: <DashboardIcon sx={{ mr: 0.5 }} /> }
    ];
  } else if (isAuthenticated && userType === 'admin') {
    // For admin users, show dashboard and promotions
    pages = [
      { title: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon sx={{ mr: 0.5 }} /> },
      { title: 'Promotions & Coupons', path: '/admin/promotions', icon: <LocalOfferIcon sx={{ mr: 0.5 }} /> }
    ];
  } else if (isAuthenticated && userType === 'customer') {
    // For customers, show regular navigation plus favorites
    pages = [
      { title: 'Home', path: '/', icon: null },
      { title: 'Restaurants', path: '/restaurants', icon: null },
      { title: 'Favorites', path: '/favorites', icon: null }
    ];
  } else {
    // For non-authenticated users, show regular navigation
    pages = [
      { title: 'Home', path: '/', icon: null },
      { title: 'Restaurants', path: '/restaurants', icon: null }
    ];
  }

  // User menu based on authentication state
  const settings = isAuthenticated 
    ? [
        { title: 'Profile', path: '/profile', icon: <PersonIcon fontSize="small" />, onClick: () => { 
          // Navigate to appropriate profile page based on user type
          if (userType === 'restaurant') {
            navigate('/restaurant/profile');
          } else if (userType === 'courier') {
            navigate('/courier/profile');
          } else if (userType === 'admin') {
            navigate('/admin/profile');
          } else {
            navigate('/profile');
          }
          handleCloseUserMenu(); 
        }},
        ...(userType === 'customer' ? [
          { title: 'My Orders', path: '/orders', icon: <ReceiptIcon fontSize="small" />, onClick: () => { navigate('/orders'); handleCloseUserMenu(); } },
          { title: 'Favorite Restaurants', path: '/favorites', icon: <FavoriteIcon fontSize="small" />, onClick: () => { navigate('/favorites'); handleCloseUserMenu(); } }
        ] : []),
        { title: 'Logout', icon: <ExitToAppIcon fontSize="small" />, onClick: handleLogout }
      ]
    : [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleCheckout = () => {
    handleCloseCartMenu();
    navigate('/checkout');
  };

  // Calculate total quantity of items in cart
  const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Constants for delivery and service fees
  const DELIVERY_FEE = 15;
  const SERVICE_FEE = 5;

  // Calculate total with fees
  const subtotal = cart.totalPrice || 0;
  const deliveryFee = cart.items.length > 0 ? DELIVERY_FEE : 0;
  const serviceFee = cart.items.length > 0 ? SERVICE_FEE : 0;
  const orderTotal = subtotal + deliveryFee + serviceFee;

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for larger screens */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HUFDS
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={() => {
                  handleCloseNavMenu();
                  navigate(page.path);
                }}>
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
          {/* Logo for mobile */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HUFDS
          </Typography>
          
          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                component={Link}
                to={page.path}
                onClick={handleCloseNavMenu}
                startIcon={page.icon || undefined}
                sx={{ 
                  my: 2, 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* Authentication buttons or user menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                {/* Shopping cart icon (only for customers) */}
                {userType === 'customer' && (
                  <IconButton 
                    size="large" 
                    color="inherit"
                    sx={{ mr: 1 }}
                    onClick={handleOpenCartMenu}
                  >
                    <Badge badgeContent={totalQuantity} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                )}
                
                {/* User menu */}
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name} src={userType === 'restaurant' && 'profileImageUrl' in (user || {}) ? (user as any).profileImageUrl : undefined}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting.title} onClick={setting.onClick}>
                      <ListItemIcon>
                        {setting.icon}
                      </ListItemIcon>
                      <ListItemText primary={setting.title} />
                    </MenuItem>
                  ))}
                </Menu>

                {/* Cart Menu */}
                <Menu
                  sx={{ mt: '45px' }}
                  id="cart-menu"
                  anchorEl={anchorElCart}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElCart)}
                  onClose={handleCloseCartMenu}
                >
                  <Box sx={{ width: 320, maxHeight: 400, overflow: 'auto', p: 2 }}>
                    {cart.items.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <ShoppingCartIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          Your cart is empty
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Your Cart
                        </Typography>
                        <List sx={{ mb: 2 }}>
                          {cart.items.map((item) => (
                            <ListItem key={item.menuItemId} sx={{ px: 0, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
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
                                          removeFromCart(item.menuItemId);
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
                                      onClick={() => removeFromCart(item.menuItemId)}
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
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Order Summary */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Subtotal
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrency(subtotal)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Delivery Fee
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrency(deliveryFee)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Service Fee
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrency(serviceFee)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            Total
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="600" color="primary">
                            {formatCurrency(orderTotal)}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleCheckout}
                          startIcon={<ShoppingCartIcon />}
                        >
                          Checkout
                        </Button>
                      </>
                    )}
                  </Box>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="outlined" 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    mr: 1
                  }}
                >
                  Login
                </Button>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  sx={{ 
                    bgcolor: 'secondary.main',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 