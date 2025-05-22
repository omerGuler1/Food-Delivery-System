import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  Typography,
  Box
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface ErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, message, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
    >
      <DialogTitle id="error-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
        <ErrorIcon color="error" sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          Error
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="error-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog; 