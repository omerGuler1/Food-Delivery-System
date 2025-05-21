import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Link } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantProfile from './pages/RestaurantProfile';
import CourierDashboard from './pages/CourierDashboard';
import CourierProfile from './pages/CourierProfile';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AdminPromotions from './pages/AdminPromotions';
import AdminApprovalPage from './pages/AdminApprovalPage';
import PendingApprovalPage from './pages/PendingApprovalPage';

// Protected route component
interface ProtectedRouteProps {
  userType: string;
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ userType, element }) => {
  const { checkAuth, getCurrentUserType, user } = useAuth();
  
  if (!checkAuth()) {
    return <Navigate to="/login" replace />;
  }
  
  const currentUserType = getCurrentUserType();
  if (currentUserType !== userType) {
    return <Navigate to="/" replace />;
  }
  
  // Check approval status for restaurant and courier
  if ((userType === 'restaurant' || userType === 'courier') && user) {
    const approvalStatus = 'approvalStatus' in user ? user.approvalStatus : undefined;
    if (approvalStatus === 'PENDING' || approvalStatus === 'REJECTED') {
      return <Navigate to="/pending-approval" replace />;
    }
  }
  
  return element;
};

// Layout wrapper that conditionally renders navbar based on route
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, userType } = useAuth();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardPage = location.pathname.includes('/dashboard');
  
  // If user is not a restaurant and trying to access restaurant dashboard, show an error or redirect
  if (isDashboardPage && location.pathname.includes('/restaurant/dashboard') && userType !== 'restaurant') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Typography variant="h4" color="error" gutterBottom>Access Denied</Typography>
        <Typography variant="body1" mb={3}>
          Only restaurant owners can access the restaurant dashboard.
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/"
        >
          Back to Home
        </Button>
      </Box>
    );
  }
  
  // If user is not a courier and trying to access courier dashboard, show an error or redirect
  if (isDashboardPage && location.pathname.includes('/courier/dashboard') && userType !== 'courier') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Typography variant="h4" color="error" gutterBottom>Access Denied</Typography>
        <Typography variant="body1" mb={3}>
          Only couriers can access the courier dashboard.
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/"
        >
          Back to Home
        </Button>
      </Box>
    );
  }
  
  // If user is not an admin and trying to access admin dashboard, show an error or redirect
  if (isDashboardPage && location.pathname.includes('/admin/dashboard') && userType !== 'admin') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3
      }}>
        <Typography variant="h4" color="error" gutterBottom>Access Denied</Typography>
        <Typography variant="body1" mb={3}>
          Only administrators can access the admin dashboard.
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/"
        >
          Back to Home
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      {!isAuthPage && <Navbar />}
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff7043', // Softer, more elegant orange
      light: '#ffa270',
      dark: '#c63f17',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3f51b5', // Indigo blue - more sophisticated
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    error: {
      main: '#e53935',
      light: '#ff6f60',
      dark: '#ab000d',
    },
    success: {
      main: '#43a047',
      light: '#76d275',
      dark: '#00701a',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/restaurants" element={<RestaurantsPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                <Route path="/pending-approval" element={<PendingApprovalPage />} />
                
                {/* Protected routes */}
                <Route path="/profile" element={
                  <ProtectedRoute userType="customer" element={<ProfilePage />} />
                } />
                
                {/* Restaurant owner routes */}
                <Route path="/restaurant/dashboard" element={
                  <ProtectedRoute userType="restaurant" element={<RestaurantDashboard />} />
                } />
                <Route path="/restaurant/profile" element={
                  <ProtectedRoute userType="restaurant" element={<RestaurantProfile />} />
                } />
                
                {/* Courier routes */}
                <Route path="/courier/dashboard" element={
                  <ProtectedRoute userType="courier" element={<CourierDashboard />} />
                } />
                <Route path="/courier/profile" element={
                  <ProtectedRoute userType="courier" element={<CourierProfile />} />
                } />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute userType="admin" element={<AdminDashboard />} />
                } />
                <Route path="/admin/profile" element={
                  <ProtectedRoute userType="admin" element={<AdminProfile />} />
                } />
                <Route path="/admin/promotions" element={
                  <ProtectedRoute userType="admin" element={<AdminPromotions />} />
                } />
                <Route path="/admin/approvals" element={
                  <ProtectedRoute userType="admin" element={<AdminApprovalPage />} />
                } />
                
                {/* Add the checkout route */}
                <Route path="/checkout" element={
                  <ProtectedRoute userType="customer" element={<CheckoutPage />} />
                } />

                {/* Add the customer orders route */}
                <Route path="/orders" element={
                  <ProtectedRoute userType="customer" element={<CustomerOrdersPage />} />
                } />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 