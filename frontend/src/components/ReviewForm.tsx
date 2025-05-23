import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Rating,
  TextField,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { ReviewRole, CreateReviewDTO } from '../interfaces';
import { createReview } from '../services/reviewService';

interface ReviewFormProps {
  orderId: number;
  role: ReviewRole;
  targetName: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  orderId,
  role,
  targetName,
  onReviewSubmitted
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const reviewData: CreateReviewDTO = {
        orderId,
        role,
        rating,
        comment: comment.trim() || undefined
      };
      
      await createReview(reviewData);
      
      setSuccess(true);
      setRating(null);
      setComment('');
      
      // Notify parent component that review was submitted
      onReviewSubmitted();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Review {role === ReviewRole.RESTAURANT ? 'Restaurant' : 'Delivery'}
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        {role === ReviewRole.RESTAURANT ? 'Restaurant' : 'Courier'}: {targetName}
      </Typography>
      
      {success ? (
        <Alert severity="success" sx={{ my: 2 }}>
          Thank you for your review!
        </Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography component="legend">Rating*</Typography>
            <Rating
              name="review-rating"
              value={rating}
              onChange={(_event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              precision={1}
            />
          </Box>
          
          <TextField
            fullWidth
            label="Comment (optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !rating}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Submit Review
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ReviewForm; 