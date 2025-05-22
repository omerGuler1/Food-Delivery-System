import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  Typography,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import { createRating } from '../services/ratingService';

interface RatingDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  restaurantName: string;
  onRatingSuccess: () => void;
}

const RatingDialog: React.FC<RatingDialogProps> = ({
  open,
  onClose,
  orderId,
  restaurantName,
  onRatingSuccess
}) => {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating before submitting");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createRating({
        orderId,
        rating,
        comment: comment.trim() || undefined
      });
      
      onRatingSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error submitting rating:', err);
      
      if (err.message && err.message.includes('already rated')) {
        setError('You have already submitted a rating for this order.');
      } else if (err.response && err.response.status === 400) {
        setError('Invalid rating submission. Please try again.');
      } else if (err.response && err.response.status === 401) {
        setError('You need to be logged in to submit a rating.');
      } else if (err.response && err.response.status === 403) {
        setError('You are not allowed to rate this order.');
      } else if (err.response && err.response.status === 404) {
        setError('The order was not found or cannot be rated.');
      } else {
        setError(err.message || 'An error occurred while submitting your rating. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Rate your experience</DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            How was your meal from {restaurantName}?
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating
              name="restaurant-rating"
              value={rating}
              onChange={(_, newValue) => {
                setRating(newValue);
                if (error) setError(null);
              }}
              size="large"
              precision={1}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {rating ? `${rating} stars` : 'Select rating'}
            </Typography>
          </Box>
          
          <TextField
            label="Comments (optional)"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
          />
        </Box>
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !rating}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog; 