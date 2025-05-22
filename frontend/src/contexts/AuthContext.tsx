import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Restaurant, Courier, Admin } from '../interfaces';
import { 
  isAuthenticated as checkAuthenticated, 
  getCurrentUser, 
  getUserType as getAuthUserType, 
  logout as logoutService 
} from '../services/authService';
import api from '../services/api';

type UserType = 'customer' | 'restaurant' | 'courier' | 'admin' | null;
type User = Customer | Restaurant | Courier | Admin | null;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User;
  userType: UserType;
  login: (user: User, type: UserType) => void;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  getCurrentUserType: () => UserType;
  setUser: (user: User) => void;
  verifyUserExists: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(checkAuthenticated());
  const [user, setUser] = useState<User>(getCurrentUser());
  const [userType, setUserType] = useState<UserType>(getAuthUserType() as UserType);

  // Effect to check authentication on mount
  useEffect(() => {
    const authenticated = checkAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setUser(getCurrentUser());
      setUserType(getAuthUserType() as UserType);
      
      // Verify user exists on initial load
      verifyUserExists().catch(() => {
        // If verification fails, log out silently
        logoutService().then(() => {
          setUser(null);
          setUserType(null);
          setIsAuthenticated(false);
          window.location.href = '/';
        });
      });
    }
  }, []);

  const login = (user: User, type: UserType) => {
    setUser(user);
    setUserType(type);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    setUserType(null);
    setIsAuthenticated(false);
  };

  // Function to check if user is authenticated
  const checkAuth = () => {
    return isAuthenticated;
  };

  // Function to get user type
  const getCurrentUserType = () => {
    return userType;
  };
  
  // Function to verify if user still exists in the backend
  const verifyUserExists = async (): Promise<boolean> => {
    if (!isAuthenticated || !userType) {
      return false;
    }
    
    try {
      let endpoint = '';
      
      switch (userType) {
        case 'customer':
          endpoint = '/customers/verify';
          break;
        case 'restaurant':
          endpoint = '/restaurants/verify';
          break;
        case 'courier':
          endpoint = '/couriers/verify';
          break;
        case 'admin':
          endpoint = '/admin/verify';
          break;
      }
      
      if (endpoint) {
        await api.get(endpoint);
        return true;
      }
      
      return false;
    } catch (error: any) {
      // Special handling for admin verify endpoint
      if (userType === 'admin' && error.response && error.response.status === 404) {
        console.log('Admin verify endpoint not found, assuming admin still exists');
        return true;
      }
      
      // Check if this is a 404 error (user not found)
      if (error.response && error.response.status === 404) {
        console.log(`User of type ${userType} no longer exists in the system`);
        return false;
      }
      
      // For other errors, log but don't automatically log out
      console.error('Error verifying user existence:', error);
      // Return true for network errors to prevent unnecessary logouts
      return error.request && !error.response;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      userType, 
      login, 
      logout,
      checkAuth,
      getCurrentUserType,
      setUser,
      verifyUserExists
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 