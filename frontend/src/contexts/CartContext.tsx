import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, MenuItem } from '../interfaces';

interface CartContextType {
  cart: Cart;
  addToCart: (item: MenuItem, restaurantId: number, restaurantName: string) => void;
  removeFromCart: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  isFromSameRestaurant: (restaurantId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    // Initialize cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    // Default empty cart
    return {
      items: [],
      restaurantId: null,
      restaurantName: null,
      totalPrice: 0
    };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Calculate total price
  const calculateTotalPrice = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Check if item is from the same restaurant
  const isFromSameRestaurant = (restaurantId: number): boolean => {
    return cart.restaurantId === null || cart.restaurantId === restaurantId;
  };

  // Add item to cart
  const addToCart = (item: MenuItem, restaurantId: number, restaurantName: string) => {
    setCart(prevCart => {
      // If cart is empty or from the same restaurant
      if (prevCart.items.length === 0 || prevCart.restaurantId === restaurantId) {
        // Check if item already exists in cart
        const existingItemIndex = prevCart.items.findIndex(cartItem => cartItem.menuItemId === item.menuItemId);
        
        let newItems: CartItem[];
        
        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          newItems = [...prevCart.items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + 1
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            ...item,
            quantity: 1,
            restaurantId,
            restaurantName
          };
          newItems = [...prevCart.items, newItem];
        }
        
        return {
          ...prevCart,
          items: newItems,
          restaurantId,
          restaurantName,
          totalPrice: calculateTotalPrice(newItems)
        };
      } else {
        // If items are from different restaurant, confirm with user
        if (window.confirm('Your cart contains items from another restaurant. Would you like to clear your cart and add this item?')) {
          const newItem: CartItem = {
            ...item,
            quantity: 1,
            restaurantId,
            restaurantName
          };
          
          return {
            items: [newItem],
            restaurantId,
            restaurantName,
            totalPrice: item.price
          };
        }
        return prevCart;
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (menuItemId: number) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.menuItemId !== menuItemId);
      
      // If cart becomes empty, reset restaurant info
      const newRestaurantId = newItems.length > 0 ? prevCart.restaurantId : null;
      const newRestaurantName = newItems.length > 0 ? prevCart.restaurantName : null;
      
      return {
        ...prevCart,
        items: newItems,
        restaurantId: newRestaurantId,
        restaurantName: newRestaurantName,
        totalPrice: calculateTotalPrice(newItems)
      };
    });
  };

  // Update item quantity
  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => {
      const newItems = prevCart.items.map(item => 
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      );
      
      return {
        ...prevCart,
        items: newItems,
        totalPrice: calculateTotalPrice(newItems)
      };
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart({
      items: [],
      restaurantId: null,
      restaurantName: null,
      totalPrice: 0
    });
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        isFromSameRestaurant
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 