import React, { createContext, useContext, useState, ReactNode } from 'react';
import ErrorDialog from '../components/ErrorDialog';

interface ErrorContextType {
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <ErrorDialog 
        open={isDialogOpen} 
        message={errorMessage} 
        onClose={handleCloseDialog} 
      />
    </ErrorContext.Provider>
  );
}; 