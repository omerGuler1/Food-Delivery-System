import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Button,
  IconButton,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  TablePagination,
  Alert,
  Snackbar
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MailIcon from '@mui/icons-material/Mail';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoneIcon from '@mui/icons-material/Done';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerReceivedMessages, markMessageAsRead, deleteMessage } from '../services/messageService';
import { Message } from '../interfaces';
import { format } from 'date-fns';

const CustomerNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    console.log('Customer notifications page mounted');
    
    const fetchMessages = async () => {
      setLoading(true);
      console.log('Fetching customer messages, user:', user);
      
      try {
        const customerId = (user as any)?.customerId || (user as any)?.userId;
        
        console.log('Customer ID extracted:', customerId);
        
        if (customerId) {
          console.log('Making API call with ID:', customerId);
          // Backend tarafında zaten filtrelenmiş mesajları al
          const fetchedMessages = await getCustomerReceivedMessages(customerId);
          console.log('Fetched messages:', fetchedMessages);
          setMessages(fetchedMessages);
        } else {
          console.error('No customer ID found');
          setError('Could not identify your account. Please log in again.');
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [user]);
  
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setPage(0);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleMarkAsRead = async (messageId: number) => {
    try {
      await markMessageAsRead(messageId);
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.messageId === messageId 
            ? { ...message, isRead: true } 
            : message
        )
      );
      
      setSuccessMessage('Message marked as read.');
      setSuccess(true);
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError('Failed to mark message as read.');
    }
  };
  
  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId);
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.filter(message => message.messageId !== messageId)
      );
      
      setSuccessMessage('Message deleted.');
      setSuccess(true);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message.');
    }
  };
  
  // Filter messages based on current tab
  const filteredMessages = currentTab === 0 
    ? messages 
    : currentTab === 1 
      ? messages.filter(message => !message.isRead)
      : messages.filter(message => message.isRead);
  
  // Pagination
  const paginatedMessages = filteredMessages
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Message type to text
  const messageTypeToText = (type: string) => {
    switch (type) {
      case 'REQUEST':
        return 'Request';
      case 'SUGGESTION':
        return 'Suggestion';
      case 'COMPLAINT':
        return 'Complaint';
      case 'WARNING':
        return 'Warning';
      default:
        return type;
    }
  };
  
  // Message type to color
  const messageTypeToColor = (type: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (type) {
      case 'REQUEST':
        return 'primary';
      case 'SUGGESTION':
        return 'info';
      case 'COMPLAINT':
        return 'error';
      case 'WARNING':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View messages, notifications, and updates from the system.
        </Typography>
        
        <Tabs 
          value={currentTab} 
          onChange={handleChangeTab}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Read" />
        </Tabs>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : filteredMessages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <MailOutlineIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No messages found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentTab === 0 
                ? 'You have not received any messages yet.' 
                : currentTab === 1 
                  ? 'You have no unread messages.' 
                  : 'You have no read messages.'}
            </Typography>
          </Box>
        ) : (
          <>
            <List>
              {paginatedMessages.map((message) => (
                <React.Fragment key={message.messageId}>
                  <ListItem 
                    sx={{ 
                      px: 2, 
                      py: 2,
                      bgcolor: message.isRead ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.06)',
                      }
                    }}
                    alignItems="flex-start"
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {message.isRead ? (
                              <MailIcon color="disabled" fontSize="small" />
                            ) : (
                              <MailOutlineIcon color="primary" fontSize="small" />
                            )}
                          </ListItemIcon>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {message.senderName}
                          </Typography>
                          {message.messageType && (
                            <Chip 
                              label={messageTypeToText(message.messageType)} 
                              size="small" 
                              color={messageTypeToColor(message.messageType)}
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" sx={{ mt: 2, ml: 4.5 }}>
                        {message.messageContent}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        {!message.isRead && (
                          <Button 
                            size="small" 
                            startIcon={<DoneIcon />} 
                            onClick={() => message.messageId && handleMarkAsRead(message.messageId)}
                            sx={{ mr: 1 }}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button 
                          size="small"
                          color="error" 
                          startIcon={<DeleteOutlineIcon />} 
                          onClick={() => message.messageId && handleDeleteMessage(message.messageId)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredMessages.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Success notification */}
      <Snackbar 
        open={success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerNotificationsPage; 