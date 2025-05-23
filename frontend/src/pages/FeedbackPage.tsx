import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../interfaces';
import { sendMessage } from '../services/messageService';

const FeedbackPage: React.FC = () => {
  const { user, userType } = useAuth();
  const [messageType, setMessageType] = useState<'REQUEST' | 'SUGGESTION' | 'COMPLAINT'>('REQUEST');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim()) {
      setError('Please enter a message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Kullanıcı bilgilerini alıyoruz
      // userType 'customer' olduğunda user'ın customerId'si var
      const userId = userType === 'customer' && user ? (user as any).customerId : 0;
      
      const message: Message = {
        senderId: userId,
        receiverId: 1, // Default admin ID
        senderName: user?.name || '',
        receiverName: 'Admin', // Default admin name
        senderType: 'CUSTOMER',
        receiverType: 'ADMIN',
        messageContent,
        messageType,
        isRead: false
      };

      await sendMessage(message);
      setSuccess(true);
      setMessageContent('');
      setMessageType('REQUEST');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Feedback Form
        </Typography>
        
        <Typography variant="body1" paragraph align="center" color="text.secondary">
          Share your feedback, suggestions, and complaints. We will review them as soon as possible.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Message Type</FormLabel>
            <RadioGroup
              row
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'REQUEST' | 'SUGGESTION' | 'COMPLAINT')}
            >
              <FormControlLabel value="REQUEST" control={<Radio />} label="Request" />
              <FormControlLabel value="SUGGESTION" control={<Radio />} label="Suggestion" />
              <FormControlLabel value="COMPLAINT" control={<Radio />} label="Complaint" />
            </RadioGroup>
          </FormControl>
          
          <TextField
            fullWidth
            label="Your Name"
            variant="outlined"
            value={user?.name || ''}
            disabled
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={user?.email || ''}
            disabled
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Your Message"
            variant="outlined"
            multiline
            rows={6}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            sx={{ mb: 3 }}
            placeholder="Please write your message in detail..."
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
        </Box>
      </Paper>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Your message has been sent successfully. Thank you!
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default FeedbackPage; 