import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Restaurant, Courier } from '../interfaces';
import { 
  isAuthenticated as checkAuthenticated, 
  getCurrentUser, 
  getUserType as getAuthUserType, 
  logout as logoutService 
} from '../services/authService';

type UserType = 'customer' | 'restaurant' | 'courier' | null;
type User = Customer | Restaurant | Courier | null;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User;
  userType: UserType;
  login: (user: User, type: UserType) => void;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  getCurrentUserType: () => UserType;
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

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      userType, 
      login, 
      logout,
      checkAuth,
      getCurrentUserType
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 