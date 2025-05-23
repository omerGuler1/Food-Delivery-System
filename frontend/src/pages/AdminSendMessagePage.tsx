import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Chip,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../interfaces';
import { sendMessage } from '../services/messageService';
import { searchUsers, UserSearchResult } from '../services/adminService';
import { axiosInstance } from '../services/axiosConfig';

const AdminSendMessagePage: React.FC = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [messageType, setMessageType] = useState<'REQUEST' | 'SUGGESTION' | 'COMPLAINT' | 'WARNING'>('REQUEST');
  const [messageContent, setMessageContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search users based on type and search term
  const handleSearchUsers = async () => {
    if (!userType) {
      setError('Please select a user type first');
      return;
    }
    
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    setSearchLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchUsers(userType, searchTerm);
      setUsers(searchResults);
      
      if (searchResults.length === 0) {
        setError('No users found with the given criteria');
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle search when user presses Enter
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchUsers();
    }
  };
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedUser) {
      setError('Please select a recipient');
      return;
    }
    
    if (!messageContent.trim()) {
      setError('Please enter a message');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get admin information
      const adminId = (user as any)?.adminId || 0;
      
      const message: Message = {
        senderId: adminId,
        receiverId: selectedUser.id,
        senderType: 'ADMIN',
        receiverType: selectedUser.type as 'CUSTOMER' | 'RESTAURANT' | 'COURIER' | 'ADMIN',
        senderName: user?.name || 'Admin',
        receiverName: selectedUser.name,
        messageType,
        messageContent,
        isRead: false
      };
      
      await sendMessage(message);
      
      // Reset form
      setMessageContent('');
      setSuccess(true);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Send Message to Users
        </Typography>
        
        <Typography variant="body1" paragraph align="center" color="text.secondary">
          Send notifications, information, or warnings to specific users.
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Find Recipient
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>User Type</InputLabel>
                <Select
                  value={userType}
                  label="User Type"
                  onChange={(e) => {
                    setUserType(e.target.value);
                    setUsers([]);
                    setSelectedUser(null);
                  }}
                >
                  <MenuItem value="CUSTOMER">Customer</MenuItem>
                  <MenuItem value="RESTAURANT">Restaurant</MenuItem>
                  <MenuItem value="COURIER">Courier</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search by Name or Email"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                disabled={!userType}
                InputProps={{
                  endAdornment: searchLoading ? <CircularProgress size={20} /> : null
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSearchUsers}
                disabled={!userType || searchLoading || !searchTerm.trim()}
                startIcon={<PersonSearchIcon />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUser}
              onChange={(event, newValue) => {
                setSelectedUser(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Recipient"
                  variant="outlined"
                  helperText="Search and select the user to send message to"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </li>
              )}
              loading={searchLoading}
              loadingText="Searching users..."
              noOptionsText="No users found"
              disabled={users.length === 0}
            />
          </Box>
          
          {selectedUser && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Selected recipient:
              </Typography>
              <Chip 
                label={`${selectedUser.name} (${selectedUser.type.toLowerCase()})`} 
                color="primary" 
                variant="outlined"
                onDelete={() => setSelectedUser(null)}
              />
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h6" gutterBottom>
            Message Details
          </Typography>
          
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Message Type</FormLabel>
            <RadioGroup
              row
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as 'REQUEST' | 'SUGGESTION' | 'COMPLAINT' | 'WARNING')}
            >
              <FormControlLabel value="REQUEST" control={<Radio />} label="Request" />
              <FormControlLabel value="SUGGESTION" control={<Radio />} label="Suggestion" />
              <FormControlLabel value="COMPLAINT" control={<Radio />} label="Complaint" />
              <FormControlLabel value="WARNING" control={<Radio />} label="Warning" />
            </RadioGroup>
          </FormControl>
          
          <TextField
            fullWidth
            label="Message Content"
            variant="outlined"
            multiline
            rows={6}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here..."
            required
            sx={{ mb: 3 }}
          />
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={loading || !selectedUser || !messageContent.trim()}
            sx={{ py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Message'}
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
          Message sent successfully!
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

export default AdminSendMessagePage; 