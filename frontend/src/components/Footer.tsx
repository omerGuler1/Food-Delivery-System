import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isDashboardPage = location.pathname.includes('/dashboard');
  const isCourierOrRestaurantTab = location.pathname === '/register' && 
    document.querySelector('[aria-selected="true"][id="register-tab-1"], [aria-selected="true"][id="register-tab-2"]');
  
  // Auth pages (login/register) need transparent footer
  if (isAuthPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'transparent',
          color: 'white',
          py: 2,
          zIndex: 5,
          textAlign: 'center',
        }}
        component="footer"
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 3
          }}>
            <Typography variant="body2" fontWeight="medium" sx={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              &copy; {new Date().getFullYear()} HUFDS. All rights reserved.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                color="inherit" 
                aria-label="Facebook" 
                size="small" 
                component="a" 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Twitter" 
                size="small" 
                component="a" 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Instagram" 
                size="small" 
                component="a" 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="LinkedIn" 
                size="small" 
                component="a" 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }
  
  // For dashboard pages - minimal footer
  if (isDashboardPage) {
    return (
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 0.75,
          mt: 'auto',
          width: '100%',
        }}
        component="footer"
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="caption">
              &copy; {new Date().getFullYear()} HUFDS. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }
  
  // For profile page
  if (isProfilePage) {
    return (
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          mt: 'auto',
          width: '100%',
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
        }}
        component="footer"
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mb: { xs: 1, sm: 0 } }}>
              &copy; {new Date().getFullYear()} HUFDS. All rights reserved.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" aria-label="Facebook" size="small" component="a" href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" size="small" component="a" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" size="small" component="a" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" size="small" component="a" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link component={RouterLink} to="/terms" color="inherit" underline="hover" variant="body2">Terms</Link>
              <Link component={RouterLink} to="/privacy" color="inherit" underline="hover" variant="body2">Privacy</Link>
              <Link component={RouterLink} to="/contact" color="inherit" underline="hover" variant="body2">Contact</Link>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }
  
  // Standard footer for other pages
  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 1.5,
        mt: 'auto',
        width: '100%',
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 0.5 }}>
              HUFDS
            </Typography>
            <Typography variant="caption">
              Your one-stop destination for ordering delicious food from the best restaurants in town.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 0.5 }}>
              Quick Links
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                '& a': {
                  color: 'white',
                  textDecoration: 'none',
                  mb: 0.25,
                  fontSize: '0.75rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
              }}
            >
              <Link component={RouterLink} to="/about">
                About Us
              </Link>
              <Link component={RouterLink} to="/contact">
                Contact Us
              </Link>
              <Link component={RouterLink} to="/faq">
                FAQ
              </Link>
              <Link component={RouterLink} to="/terms">
                Terms & Conditions
              </Link>
              <Link component={RouterLink} to="/privacy">
                Privacy Policy
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 0.5 }}>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <IconButton
                color="inherit"
                aria-label="Facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ p: 0.5 }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Twitter"
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ p: 0.5 }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ p: 0.5 }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="LinkedIn"
                component="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ p: 0.5 }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 1,
            pt: 0.5,
            pb: 0.5,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ mb: 0 }}>
            &copy; {new Date().getFullYear()} HUFDS. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 