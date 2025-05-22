import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Rating,
  Divider,
  Avatar,
  Button,
  Grid
} from '@mui/material';
import { ArrowBack, Comment as CommentIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRestaurantRatings, getRestaurantAverageRating, RatingResponse } from '../services/ratingService';
import { Restaurant } from '../interfaces';

const RestaurantReviewsPage: React.FunctionComponent = (): JSX.Element => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<RatingResponse[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Check if the user is a restaurant
        if (userType === 'restaurant' && (user as Restaurant).restaurantId) {
          const restaurantId = (user as Restaurant).restaurantId;
          const [reviewsData, avgRating] = await Promise.all([
            getRestaurantRatings(restaurantId),
            getRestaurantAverageRating(restaurantId)
          ]);
          
          setReviews(reviewsData);
          setAverageRating(avgRating);
        } else {
          setError('You do not have a restaurant associated with your account');
        }
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user, userType]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/restaurant/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom>
        Restaurant Reviews
      </Typography>

      {/* Summary Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>Overall Rating</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating 
                value={averageRating} 
                precision={0.1} 
                readOnly 
                size="large"
              />
              <Typography variant="h4" sx={{ ml: 1, fontWeight: 'bold' }}>
                {averageRating.toFixed(1)}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Based on {reviews.length} reviews
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
              <Typography variant="body1">
                Ratings Breakdown:
              </Typography>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => Math.round(r.rating) === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ minWidth: '60px' }}>
                      {star} {star === 1 ? 'star' : 'stars'}:
                    </Typography>
                    <Box
                      sx={{
                        width: '150px',
                        height: '8px',
                        bgcolor: 'grey.200',
                        mx: 1,
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: '100%',
                          bgcolor: star > 3 ? 'success.main' : star > 1 ? 'warning.main' : 'error.main',
                        }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {count} ({percentage.toFixed(0)}%)
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Customer Reviews
      </Typography>

      {reviews.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CommentIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No reviews yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When customers rate your restaurant, their reviews will appear here.
          </Typography>
        </Paper>
      ) : (
        reviews.map((review) => (
          <Card key={review.id} sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {review.customerName.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {review.customerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={review.rating} precision={0.5} readOnly />
              </Box>

              <Divider sx={{ my: 2 }} />

              {review.comment ? (
                <Typography variant="body1" paragraph>
                  {review.comment}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No comment provided.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default RestaurantReviewsPage; 