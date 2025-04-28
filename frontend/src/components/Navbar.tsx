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
  ListItemText
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
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
  } else {
    // For other users, show regular navigation
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
          } else {
            navigate('/profile');
          }
          handleCloseUserMenu(); 
        }},
        ...(userType === 'customer' ? [{ title: 'My Orders', path: '/orders', icon: <ReceiptIcon fontSize="small" />, onClick: () => { navigate('/orders'); handleCloseUserMenu(); } }] : []),
        { title: 'Logout', icon: <ExitToAppIcon fontSize="small" />, onClick: handleLogout }
      ]
    : [];

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
                    component={Link} 
                    to="/cart" 
                    size="large" 
                    color="inherit"
                    sx={{ mr: 1 }}
                  >
                    <Badge badgeContent={0} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                )}
                
                {/* User menu */}
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name}>
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