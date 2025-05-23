import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Rating,
  Avatar,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { ReviewResponseDTO, ReviewRole } from '../interfaces';
import { respondToReview } from '../services/reviewService';
import { formatDate } from '../utils/dateUtils';

interface ReviewResponseProps {
  review: ReviewResponseDTO;
  onResponseSubmitted: () => void;
}

const ReviewResponse: React.FC<ReviewResponseProps> = ({
  review,
  onResponseSubmitted
}) => {
  const theme = useTheme();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response.trim()) {
      setError('Please enter a response');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await respondToReview(review.reviewId, { response: response.trim() });
      
      setSuccess(true);
      setResponse('');
      onResponseSubmitted();
    } catch (err: any) {
      console.error('Error submitting response:', err);
      setError(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show success message if response submitted successfully
  if (success) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        Your response has been submitted successfully!
      </Alert>
    );
  }

  // Get the responder type based on review role
  const getResponderType = () => {
    return review.role === ReviewRole.RESTAURANT ? 'Restaurant' : 'Courier';
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mt: 3, 
        p: 3,
        borderRadius: 2,
        border: '2px solid',
        borderColor: alpha(theme.palette.primary.main, 0.2)
      }}
    >
      {/* Original review display */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
          Responding to Customer Review:
        </Typography>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.background.paper, 0.5),
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          {/* Review header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: theme.palette.grey[500],
              mr: 1.5,
              fontSize: '0.875rem'
            }}>
              {review.customerName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={500}>
                {review.customerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(review.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Rating value={review.rating} readOnly size="small" />
            </Box>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          {/* Review comment */}
          <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
            "{review.comment}"
          </Typography>
        </Paper>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
        Your Response:
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          multiline
          rows={4}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response here..."
          fullWidth
          variant="outlined"
          error={!!error}
          helperText={error}
          disabled={loading}
          InputProps={{
            sx: { borderRadius: 1 }
          }}
        />
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !response.trim()}
            sx={{ fontWeight: 500 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Response'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ReviewResponse; 