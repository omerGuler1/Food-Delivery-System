import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Rating,
  Avatar,
  Divider,
  Chip,
  Stack,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import { ReviewResponseDTO, ReviewRole } from '../interfaces';
import { formatDate } from '../utils/dateUtils';

interface ReviewListProps {
  reviews: ReviewResponseDTO[];
  showTitle?: boolean;
  emptyMessage?: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  reviews, 
  showTitle = true,
  emptyMessage = "No reviews yet" 
}) => {
  const theme = useTheme();
  
  useEffect(() => {
    console.log('ReviewList received reviews:', reviews);
  }, [reviews]);

  // Display a message if there are no reviews
  if (!reviews || reviews.length === 0) {
    console.log('No reviews to display');
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center', 
        borderRadius: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        border: '1px dashed',
        borderColor: alpha(theme.palette.primary.main, 0.15)
      }}>
        <Typography color="text.secondary" variant="subtitle1">{emptyMessage}</Typography>
      </Box>
    );
  }

  // Calculate average rating, ensuring we don't divide by zero
  const calculateAverageRating = (reviews: ReviewResponseDTO[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const avgRating = calculateAverageRating(reviews);

  return (
    <Box>
      {showTitle && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="500">
            Reviews ({reviews.length})
          </Typography>
          <Chip 
            label={`${avgRating.toFixed(1)}/5 average`} 
            color="primary" 
            size="small" 
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )}
      
      <Grid container spacing={2}>
        {reviews.map((review, index) => (
          <Grid item xs={12} key={review.reviewId}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[2],
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              {/* Header - customer name and date */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: `${getAvatarColor(review.customerName)}`,
                    fontWeight: 'bold'
                  }}>
                    {review.customerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {review.customerName}
                    </Typography>
                    <Rating 
                      value={review.rating} 
                      readOnly 
                      precision={0.5} 
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(review.createdAt)}
                  </Typography>
                  <Chip 
                    label={`${review.rating}/5`} 
                    size="small" 
                    sx={{ 
                      mt: 0.5, 
                      fontWeight: 'bold', 
                      bgcolor: getRatingColor(review.rating),
                      color: 'white',
                      height: 20,
                      fontSize: '0.7rem'
                    }} 
                  />
                </Box>
              </Box>
              
              {/* Comment */}
              {review.comment && (
                <Typography variant="body1" sx={{ my: 2, color: 'text.primary', lineHeight: 1.6 }}>
                  "{review.comment}"
                </Typography>
              )}
              
              {/* Response section if exists */}
              {review.response && (
                <Box sx={{ 
                  mt: 3, 
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: theme.shape.borderRadius,
                  border: '1px solid',
                  borderLeft: '4px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderLeftColor: theme.palette.primary.main
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      color="primary.dark" 
                      sx={{ fontWeight: 600 }}
                    >
                      {review.role === ReviewRole.RESTAURANT ? 'Restaurant' : 'Courier'} Response to {review.customerName}'s Review:
                    </Typography>
                    {review.respondedAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Responded {formatDate(review.respondedAt)})
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                    "{review.response}"
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Helper functions
const getAvatarColor = (name: string): string => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
  ];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#388E3C'; // Green
  if (rating >= 3.5) return '#689F38'; // Light green
  if (rating >= 2.5) return '#FFA000'; // Amber
  if (rating >= 1.5) return '#F57C00'; // Orange
  return '#D32F2F'; // Red
};

export default ReviewList; 