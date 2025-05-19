import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Paper,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  Divider,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Switch,
  Tooltip,
  Snackbar,
  Badge,
  ListItem,
  ListItemText,
  ListItemAvatar,
  List,
  Backdrop,
  CircularProgress as FullPageCircularProgress,
  Collapse,
  Modal,
  Radio,
  RadioGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as RestaurantIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Image as ImageIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
  LocalOffer as LocalOfferIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Person,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ReceiptLong as ReceiptIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ShoppingBasket as ShoppingBasketIcon,
  LocalShipping as LocalShippingIcon,
  DirectionsBike as DirectionsBikeIcon,
  TwoWheeler as TwoWheelerIcon,
  DirectionsCar as DirectionsCarIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { mockMenuItems, foodCategories, restaurantInfo } from '../data/mockData';
import { MenuItem as MenuItemType, FoodCategory, OrderResponseDTO, CourierInfo } from '../interfaces';
import { addMenuItem, updateMenuItem, deleteMenuItem, getRestaurantMenuItems, updateRestaurantStatus, uploadMenuItemImage } from '../services/restaurantService';
import { getRestaurantOrders, updateOrderStatus, getAvailableCouriers, requestCourierForOrder, checkOrderAssignmentsExpired, getOrdersNeedingCouriers, cancelOrder } from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateTime } from '../utils/dateUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [showStatusWarning, setShowStatusWarning] = useState(false);
  const [orders, setOrders] = useState<OrderResponseDTO[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [availableCouriers, setAvailableCouriers] = useState<CourierInfo[]>([]);
  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);
  const [isAssigningCourier, setIsAssigningCourier] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Helper function to map API response to our MenuItem type
  const mapApiMenuItemToLocal = (apiItem: any): MenuItemType => {
    return {
      menuItemId: apiItem.menuItemId || 0,
      name: apiItem.name || '',
      description: apiItem.description || '',
      price: apiItem.price || 0,
      category: apiItem.category || FoodCategory.MAIN_COURSES,
      available: apiItem.availability !== undefined ? apiItem.availability : true,
      restaurantId: apiItem.restaurantId || 1,
      imageUrl: apiItem.imageUrl || undefined // Include imageUrl in the mapping
    };
  };

  // Load menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get restaurant ID from user context or default to 1
        const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
        
        // Fetch menu items from API
        console.log(`Fetching menu items for restaurant ID: ${restaurantId}`);
        const apiItems = await getRestaurantMenuItems(restaurantId);
        console.log('Menu items loaded from API:', apiItems);
        
        if (apiItems && apiItems.length > 0) {
          // Map API items to our local MenuItem structure
          const mappedItems = apiItems.map(mapApiMenuItemToLocal);
          console.log('Mapped menu items:', mappedItems);
          
          setMenuItems(mappedItems);
          setFilteredItems(mappedItems);
          setSuccessMessage('Menu items loaded successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          console.log('No menu items found or empty response');
          // If no items found, set empty arrays
          setMenuItems([]);
          setFilteredItems([]);
        }

        // Fetch restaurant status (in a real app, this would be a separate API call)
        // For now, we're just simulating it
        if (user && 'isOpen' in user) {
          setIsRestaurantOpen(user.isOpen as boolean);
        } else if (process.env.NODE_ENV === 'development') {
          // Default to closed in development
          setIsRestaurantOpen(false);
        }
        
      } catch (error: any) {
        console.error('Error fetching menu items:', error);
        
        let errorMessage = 'Failed to load menu items.';
        
        // Check for authentication issues
        if (error.response && error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response && error.response.status === 403) {
          errorMessage = 'You do not have permission to view these menu items.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        setError(errorMessage);
        
        // Fallback to mock data if API fails - ONLY for development
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data as fallback');
          setMenuItems(mockMenuItems);
          setFilteredItems(mockMenuItems);
        } else {
          setMenuItems([]);
          setFilteredItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [user]);

  // Filter menu items based on category and search query
  useEffect(() => {
    let filtered = [...menuItems];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(filtered);
  }, [menuItems, selectedCategory, searchQuery]);

  // Load restaurant orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoadingOrders(true);
        setError(null);
        
        // Get restaurant ID from user context or default to 1
        const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
        
        // Fetch orders from API
        console.log(`Fetching orders for restaurant ID: ${restaurantId}`);
        const fetchedOrders = await getRestaurantOrders(restaurantId);
        console.log('Orders loaded from API:', fetchedOrders);
        
        setOrders(fetchedOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        
        let errorMessage = 'Failed to load orders.';
        
        // Check for authentication issues
        if (error.response && error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response && error.response.status === 403) {
          errorMessage = 'You do not have permission to view these orders.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    // Only fetch orders when the active tab is for orders (index 1)
    if (activeTab === 1) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleAddItem = () => {
    // Get restaurant ID from user context
    const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
    
    // Create a new menu item with only the required fields for the API
    const newItem: MenuItemType = {
      menuItemId: 0, // Will be replaced by the server-generated ID
      name: '',
      description: '',
      price: 0,
      category: FoodCategory.MAIN_COURSES,
      available: true,
      restaurantId: restaurantId
    };
    
    console.log(`Creating new menu item for restaurant ID: ${restaurantId}`);
    setEditingItem(newItem);
    setOpenDialog(true);
  };

  const handleEditItem = (item: MenuItemType) => {
    setEditingItem({...item});
    setOpenDialog(true);
  };

  const handleDeleteItem = async (id: number) => {
    try {
      setLoading(true);
      
      // Get restaurant ID from user context
      const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
      
      console.log(`Deleting menu item ${id} from restaurant ${restaurantId}`);
      const success = await deleteMenuItem(id, restaurantId);
      
      if (success) {
        // Filter out the deleted item
        const updatedItems = menuItems.filter(item => item.menuItemId !== id);
        setMenuItems(updatedItems);
        setSuccessMessage('Menu item deleted successfully');
      } else {
        setError('Failed to delete menu item. Please try again.');
      }
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSaveItem = async () => {
    if (editingItem) {
      try {
        setLoading(true);
        
        // Get restaurant ID from user context
        const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
        
        // Prepare the data structure according to the API requirements
        const menuItemData = {
          restaurantId: restaurantId,
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          availability: editingItem.available,
          category: editingItem.category,
          imageUrl: editingItem.imageUrl // Include the imageUrl in the update
        };

        console.log(`Saving menu item for restaurant ID: ${restaurantId}`);
        
        // Check if it's a new item or updating an existing one
        if (editingItem.menuItemId !== 0) {
          // Update existing item
          const apiResult = await updateMenuItem(editingItem.menuItemId, menuItemData);
          const updatedItem = mapApiMenuItemToLocal(apiResult);
          setMenuItems(prevItems =>
            prevItems.map(item =>
              item.menuItemId === editingItem.menuItemId ? updatedItem : item
            )
          );
          setSuccessMessage('Menu item updated successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
          setOpenDialog(false);
          setEditingItem(null);
        } else {
          // Add new item
          const apiResult = await addMenuItem(menuItemData);
          const newItem = mapApiMenuItemToLocal(apiResult);
          setMenuItems(prevItems => [...prevItems, newItem]);
          setEditingItem(newItem); // Stay in dialog for image upload
          setSuccessMessage('Menu item added! Now you can upload an image.');
          setTimeout(() => setSuccessMessage(null), 3000);
          // Do NOT close the dialog yet
          setLoading(false);
          return;
        }
      } catch (error: any) {
        console.error('Error saving menu item:', error);
        
        let errorMessage = 'Failed to save menu item.';
        
        if (error.response && error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response && error.response.status === 403) {
          errorMessage = 'You do not have permission to update this menu.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        setError(errorMessage);
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    if (editingItem) {
      const { name, value } = e.target;
      if (name) {
        setEditingItem({
          ...editingItem,
          [name]: value
        });
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingItem) {
      const { name, checked } = e.target;
      setEditingItem({
        ...editingItem,
        [name]: checked
      });
    }
  };

  const handleToggleAvailability = async (id: number) => {
    try {
      setLoading(true);
      const itemToUpdate = menuItems.find(item => item.menuItemId === id);
      
      if (!itemToUpdate) {
        setError('Menu item not found');
        return;
      }
      
      // Get restaurant ID from user context
      const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
      
      // Create the update data with the availability toggled
      const menuItemData = {
        restaurantId: restaurantId, // Always use current restaurant ID
        name: itemToUpdate.name,
        description: itemToUpdate.description,
        price: itemToUpdate.price,
        availability: !itemToUpdate.available, // Toggle the availability
        category: itemToUpdate.category
      };
      
      console.log(`Toggling availability for menu item ${id} of restaurant ${restaurantId}`);
      
      // Call the API to update the item
      const result = await updateMenuItem(id, menuItemData);
      
      // Update local state
      setMenuItems(menuItems.map(item => 
        item.menuItemId === id ? { 
          ...item, 
          available: !item.available 
        } : item
      ));
      
      setSuccessMessage(`Menu item ${result.name} is now ${!itemToUpdate.available ? 'available' : 'unavailable'}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError('Failed to update menu item availability. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Toggle restaurant open/closed status
  const toggleRestaurantStatus = async () => {
    // If trying to open restaurant but no menu items exist, show warning
    if (!isRestaurantOpen && menuItems.length === 0) {
      setShowStatusWarning(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get restaurant ID from user context
      const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
      
      // Call API to update restaurant status
      const newStatus = !isRestaurantOpen;
      
      // If in development mode or API call is not available yet, skip the actual API call
      if (process.env.NODE_ENV !== 'development') {
        await updateRestaurantStatus(restaurantId, newStatus);
      }
      
      // Update local state
      setIsRestaurantOpen(newStatus);
      
      // In a real implementation, we would also update the user context
      // For example:
      // updateUser({...user, isOpen: newStatus});
      
      setSuccessMessage(`Restaurant is now ${newStatus ? 'open' : 'closed'} for orders`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating restaurant status:', error);
      setError('Failed to update restaurant status. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Close the warning dialog
  const handleCloseWarning = () => {
    setShowStatusWarning(false);
  };

  // Handle approving an order (changing status from PENDING to PROCESSING)
  const handleApproveOrder = async (orderId: number) => {
    try {
      setProcessingOrder(orderId);
      setError(null);
      
      console.log(`Approving order ${orderId}, changing status to PROCESSING`);
      const updatedOrder = await updateOrderStatus(orderId, 'PROCESSING');
      
      // Update the orders state to reflect the new status
      setOrders(orders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'PROCESSING' }
          : order
      ));
      
      setSuccessMessage(`Order #${orderId} has been approved and is now processing`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error approving order:', error);
      
      let errorMessage = 'Failed to approve order.';
      
      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response && error.response.status === 403) {
        errorMessage = 'You do not have permission to approve this order.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingOrder(null);
    }
  };

  // Handle cancelling an order
  const handleCancelOrder = async (orderId: number) => {
    try {
      setProcessingOrder(orderId);
      setError(null);
      
      console.log(`Cancelling order ${orderId}`);
      await cancelOrder(orderId);
      
      // Update the orders state to reflect the new status
      setOrders(orders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'CANCELLED' }
          : order
      ));
      
      setSuccessMessage(`Order #${orderId} has been cancelled`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      
      let errorMessage = 'Failed to cancel order.';
      
      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response && error.response.status === 403) {
        errorMessage = 'You do not have permission to cancel this order.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setProcessingOrder(null);
    }
  };

  // Toggle order details expansion
  const handleToggleOrderDetails = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Handle opening courier selection modal
  const handleOpenCourierModal = async (orderId: number) => {
    try {
      // First check if any existing assignments for this order have expired
      const anyExpired = await checkOrderAssignmentsExpired(orderId);
      
      if (anyExpired) {
        console.log(`Some assignments for order ${orderId} have expired and been handled`);
      }
      
      setSelectedOrderId(orderId);
      setCourierModalOpen(true);
      await fetchAvailableCouriers();
    } catch (error) {
      console.error("Error checking expired assignments:", error);
      setError("Failed to check courier assignment status. Please try again.");
      
      // Still proceed with opening the modal
      setSelectedOrderId(orderId);
      setCourierModalOpen(true);
      await fetchAvailableCouriers();
    }
  };

  // Handle closing courier selection modal
  const handleCloseCourierModal = () => {
    setCourierModalOpen(false);
    setSelectedOrderId(null);
    setSelectedCourierId(null);
  };

  // Fetch available couriers
  const fetchAvailableCouriers = async () => {
    try {
      setIsLoadingCouriers(true);
      setError(null);
      
      // Get restaurant ID from user context or default to 1
      const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
      
      // Fetch available couriers
      console.log(`Fetching available couriers for restaurant ID: ${restaurantId}`);
      const couriers = await getAvailableCouriers(restaurantId);
      console.log('Available couriers:', couriers);
      
      setAvailableCouriers(couriers);
      
      if (couriers.length === 0) {
        setError('No available couriers found. Please try again later.');
      }
    } catch (error: any) {
      console.error('Error fetching available couriers:', error);
      setError('Failed to load available couriers. Please try again.');
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  // Handle courier selection
  const handleCourierChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCourierId(Number(event.target.value));
  };

  // Handle courier assignment
  const handleAssignCourier = async () => {
    if (!selectedOrderId || !selectedCourierId) {
      setError('Please select a courier.');
      return;
    }
    
    try {
      setIsAssigningCourier(true);
      setError(null);
      
      // Get restaurant ID from user context or default to 1
      const currentRestaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
      
      // Assign courier to order
      console.log(`Assigning courier ${selectedCourierId} to order ${selectedOrderId}`);
      await requestCourierForOrder(currentRestaurantId, selectedOrderId, selectedCourierId);
      
      // Show success message
      setSuccessMessage(`Courier request sent successfully for order #${selectedOrderId}`);
      
      // Close modal
      handleCloseCourierModal();
      
      // Refresh orders to update UI
      const updatedOrders = await getRestaurantOrders(currentRestaurantId);
      setOrders(updatedOrders);
      
    } catch (error: any) {
      console.error('Error assigning courier:', error);
      
      let errorMessage = 'Failed to assign courier.';
      
      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response && error.response.status === 403) {
        errorMessage = 'You do not have permission to assign couriers.';
      } else if (error.response && error.response.status === 404) {
        errorMessage = 'Courier or order not found.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsAssigningCourier(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Helper function to render vehicle type icon
  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toUpperCase()) {
      case 'BICYCLE':
        return <DirectionsBikeIcon fontSize="small" />;
      case 'MOTORCYCLE':
        return <TwoWheelerIcon fontSize="small" />;
      case 'CAR':
        return <DirectionsCarIcon fontSize="small" />;
      default:
        return <LocalShippingIcon fontSize="small" />;
    }
  };

  // Periodically check for orders needing couriers (due to expired or rejected assignments)
  useEffect(() => {
    // Only run this when the orders tab is active
    if (activeTab !== 1) return;
    
    const restaurantId = user && 'restaurantId' in user ? user.restaurantId : 1;
    
    // Function to check for orders needing couriers and update UI
    const checkOrdersNeedingCouriers = async () => {
      try {
        // Get list of orders that need new courier assignments
        const orderIds = await getOrdersNeedingCouriers(restaurantId);
        
        if (orderIds.length > 0) {
          console.log("Orders needing new courier assignments:", orderIds);
          
          // Refresh orders to update UI
          const updatedOrders = await getRestaurantOrders(restaurantId);
          setOrders(updatedOrders);
        }
      } catch (error) {
        console.error("Error checking orders needing couriers:", error);
      }
    };
    
    // Check immediately on first load
    checkOrdersNeedingCouriers();
    
    // Set up interval to check every 30 seconds
    const intervalId = setInterval(checkOrdersNeedingCouriers, 30000);
    
    // Clean up interval on unmount or tab change
    return () => clearInterval(intervalId);
  }, [activeTab, user]);

  const handlePriceChange = (newPrice: number) => {
    if (editingItem) {
      // Ensure price is not negative and has max 2 decimal places
      const validPrice = Math.max(0, Number(newPrice.toFixed(2)));
      setEditingItem({
        ...editingItem,
        price: validPrice
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingItem) return;

    try {
      setUploadingImage(true);
      const updatedItem = await uploadMenuItemImage(editingItem.menuItemId, file);
      
      // Update the menu items list with the new image URL
      setMenuItems(prevItems => 
        prevItems.map(item => 
          item.menuItemId === editingItem.menuItemId 
            ? { ...item, imageUrl: updatedItem.imageUrl }
            : item
        )
      );
      
      // Update the editing item with the new image URL
      setEditingItem(prev => prev ? { ...prev, imageUrl: updatedItem.imageUrl } : null);
      
      setSuccessMessage('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 3, bgcolor: '#f8f9fa' }}>
      {/* Full page loading indicator when processing an order */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={processingOrder !== null}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FullPageCircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Processing Order...</Typography>
        </Box>
      </Backdrop>
      
      <Container maxWidth="lg">
        {/* Dashboard Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 3, 
              p: 1, 
              borderRadius: 2,
              bgcolor: isRestaurantOpen ? 'success.light' : 'error.light',
              color: 'white',
              transition: 'background-color 0.3s ease'
            }}>
              <Typography sx={{ mr: 1, fontWeight: 'medium' }}>
                {isRestaurantOpen ? 'Open' : 'Closed'}
              </Typography>
              <Tooltip title={isRestaurantOpen ? "Set restaurant as closed" : "Set restaurant as open"}>
                <Switch
                  checked={isRestaurantOpen}
                  onChange={toggleRestaurantStatus}
                  color="default"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#fff',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#fff',
                      opacity: 0.5
                    },
                  }}
                />
              </Tooltip>
            </Box>
            <Avatar 
              sx={{ 
                width: 50, 
                height: 50, 
                bgcolor: 'primary.main',
                mr: 2
              }}
            >
              <RestaurantIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h1" fontWeight="bold">
                {restaurantInfo.name} Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your restaurant and menu items
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />} 
              onClick={handleAddItem}
              size="small"
              disabled={loading}
            >
              Add New Item
            </Button>
          </Box>
        </Box>

        {/* Success and Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Initial Loading State */}
        {loading && menuItems.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No items message */}
        {!loading && menuItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No menu items found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your menu is empty. Click on "Add New Item" to add your first menu item.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Add New Item
            </Button>
          </Box>
        )}

        {/* Dashboard Tabs */}
        {menuItems.length > 0 && (
          <Paper sx={{ mb: 2, borderRadius: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Menu Items" icon={<RestaurantIcon />} iconPosition="start" />
              <Tab label="Orders" icon={<AccessTimeIcon />} iconPosition="start" />
              <Tab label="Restaurant Info" icon={<InfoIcon />} iconPosition="start" />
            </Tabs>
          </Paper>
        )}

        {/* Menu Items Tab */}
        {menuItems.length > 0 && (
          <TabPanel value={activeTab} index={0}>
            {/* Menu Item Management Actions */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Left side - Search */}
              <TextField
                size="small"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton edge="start">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Right side - Filter */}
              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel id="category-filter-label">Filter by Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Filter by Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {foodCategories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Menu Items Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.menuItemId}>
                        <TableCell>
                          {item.imageUrl ? (
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.name}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 1
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: 'grey.100',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1
                              }}
                            >
                              <ImageIcon sx={{ color: 'grey.400' }} />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="primary">
                            ${item.price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.available ? 'Available' : 'Unavailable'}
                            color={item.available ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditItem(item)}
                                disabled={loading}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={item.available ? 'Make Unavailable' : 'Make Available'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleAvailability(item.menuItemId)}
                                disabled={loading}
                                color={item.available ? 'error' : 'success'}
                              >
                                {item.available ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteItem(item.menuItemId)}
                                disabled={loading}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No items found matching your filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        )}

        {/* Orders Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>Orders Management</Typography>
          
          {isLoadingOrders && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {!isLoadingOrders && orders.length === 0 && (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No orders found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any orders yet. When customers place orders, they will appear here.
              </Typography>
            </Paper>
          )}
          
          {!isLoadingOrders && orders.length > 0 && (
            <>
              {/* Pending Orders */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Pending Orders
                  <Badge 
                    badgeContent={orders.filter(order => order.status === 'PENDING').length} 
                    color="error" 
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Paper sx={{ borderRadius: 2 }}>
                  <List sx={{ width: '100%' }}>
                    {orders.filter(order => order.status === 'PENDING').length > 0 ? (
                      orders
                        .filter(order => order.status === 'PENDING')
                        .map((order) => (
                          <ListItem>
                            <ListItemText
                              primary={`Order #${order.orderId}`}
                              secondary={
                                <>
                                  <Typography variant="body2" color="textSecondary">
                                    Status: {order.status}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Total: ${order.totalPrice.toFixed(2)}
                                  </Typography>
                                </>
                              }
                            />
                            {order.status === 'PENDING' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleApproveOrder(order.orderId)}
                                  disabled={processingOrder === order.orderId}
                                >
                                  Approve Order
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleCancelOrder(order.orderId)}
                                  disabled={processingOrder === order.orderId}
                                >
                                  Cancel Order
                                </Button>
                              </Box>
                            )}
                          </ListItem>
                        ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary="No pending orders"
                          secondary="All orders have been processed"
                          sx={{ textAlign: 'center', py: 2 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Box>
              
              {/* Processing Orders */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Processing Orders
                  <Badge 
                    badgeContent={orders.filter(order => order.status === 'PROCESSING').length} 
                    color="primary" 
                    sx={{ ml: 2 }}
                  />
                </Typography>
                
                <Paper sx={{ borderRadius: 2 }}>
                  <List sx={{ width: '100%' }}>
                    {orders.filter(order => order.status === 'PROCESSING').length > 0 ? (
                      orders
                        .filter(order => order.status === 'PROCESSING')
                        .map((order) => (
                          <ListItem>
                            <ListItemText
                              primary={`Order #${order.orderId}`}
                              secondary={
                                <>
                                  <Typography variant="body2" color="textSecondary">
                                    Status: {order.status}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Total: ${order.totalPrice.toFixed(2)}
                                  </Typography>
                                </>
                              }
                            />
                            {order.status === 'PROCESSING' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenCourierModal(order.orderId)}
                                  disabled={processingOrder === order.orderId}
                                >
                                  Assign Courier
                                </Button>
                              </Box>
                            )}
                          </ListItem>
                        ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary="No processing orders"
                          secondary="There are no orders currently being processed"
                          sx={{ textAlign: 'center', py: 2 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Box>
            </>
          )}
        </TabPanel>

        {/* Restaurant Info Tab */}
        {menuItems.length > 0 && (
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>Restaurant Information</Typography>
            <Alert severity="info">
              Restaurant information management will be implemented in a future update.
            </Alert>
          </TabPanel>
        )}
      </Container>

      {/* Menu Item Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem && editingItem.menuItemId && menuItems.some(item => item.menuItemId === editingItem.menuItemId) 
            ? 'Edit Menu Item' 
            : 'Add New Menu Item'
          }
        </DialogTitle>
        <DialogContent dividers>
          {editingItem && (
            <Grid container spacing={2}>
              {/* Image Upload Section */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}>
                  {editingItem.imageUrl ? (
                    <Box sx={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                      <img
                        src={editingItem.imageUrl}
                        alt={editingItem.name}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: 200,
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'background.paper' }
                        }}
                        onClick={() => {
                          setEditingItem(prev => prev ? { ...prev, imageUrl: undefined } : null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        No image uploaded
                      </Typography>
                    </Box>
                  )}
                  
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    disabled={uploadingImage || !editingItem?.menuItemId}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {!editingItem?.menuItemId && (
                    <Typography variant="caption" color="text.secondary">
                      Save the item first to upload an image.
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Existing form fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  margin="dense"
                  name="name"
                  label="Item Name"
                  fullWidth
                  required
                  value={editingItem.name}
                  onChange={handleItemChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl margin="dense" fullWidth required size="small">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={editingItem.category}
                    onChange={handleItemChange}
                    label="Category"
                  >
                    {foodCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="description"
                  label="Description"
                  multiline
                  rows={2}
                  fullWidth
                  required
                  value={editingItem.description}
                  onChange={handleItemChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl margin="dense" fullWidth required>
                  <InputLabel shrink>Price</InputLabel>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mt: 2
                  }}>
                    <Typography>$</Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      border: '1px solid rgba(0, 0, 0, 0.23)',
                      borderRadius: 1,
                      p: 1,
                      gap: 1
                    }}>
                      {/* Dollars part */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            const currentPrice = editingItem.price;
                            const dollars = Math.floor(currentPrice);
                            const cents = (currentPrice - dollars) * 100;
                            handlePriceChange(Math.max(0, dollars - 1) + (cents / 100));
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          type="number"
                          value={Math.floor(editingItem.price).toString()}
                          onChange={(e) => {
                            let inputValue = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                            const newDollars = Math.max(0, Number(inputValue) || 0);
                            const cents = Math.round((editingItem.price % 1) * 100);
                            handlePriceChange(Number(newDollars.toFixed(0)) + (cents / 100));
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              const cents = Math.round((editingItem.price % 1) * 100);
                              handlePriceChange(0 + (cents / 100));
                            }
                          }}
                          inputProps={{
                            min: 0,
                            style: { 
                              width: '65px',
                              textAlign: 'center',
                              padding: '4px'
                            }
                          }}
                          variant="standard"
                          sx={{ mx: 1 }}
                        />
                        <IconButton 
                          size="small"
                          onClick={() => {
                            const currentPrice = editingItem.price;
                            const dollars = Math.floor(currentPrice);
                            const cents = Math.round((currentPrice - dollars) * 100);
                            handlePriceChange(Number((dollars + 1).toFixed(0)) + (cents / 100));
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography sx={{ mx: 1, userSelect: 'none' }}>.</Typography>
                      {/* Cents part */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            const currentPrice = editingItem.price;
                            const dollars = Math.floor(currentPrice);
                            const cents = Math.round((currentPrice - dollars) * 100);
                            handlePriceChange(dollars + (Math.max(0, cents - 1) / 100));
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          type="number"
                          value={String(Math.round((editingItem.price % 1) * 100)).padStart(2, '0')}
                          onChange={(e) => {
                            const newCents = Math.min(99, Math.max(0, parseInt(e.target.value) || 0));
                            const dollars = Math.floor(editingItem.price);
                            handlePriceChange(Number(dollars.toFixed(0)) + (newCents / 100));
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              const dollars = Math.floor(editingItem.price);
                              handlePriceChange(dollars);
                            }
                          }}
                          inputProps={{
                            min: 0,
                            max: 99,
                            style: { 
                              width: '45px',
                              textAlign: 'center',
                              padding: '4px'
                            }
                          }}
                          variant="standard"
                          sx={{ mx: 1 }}
                        />
                        <IconButton 
                          size="small"
                          onClick={() => {
                            const currentPrice = editingItem.price;
                            const dollars = Math.floor(currentPrice);
                            const cents = Math.round((currentPrice - dollars) * 100);
                            handlePriceChange(dollars + (Math.min(99, cents + 1) / 100));
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editingItem.available}
                      onChange={handleCheckboxChange}
                      name="available"
                      color="primary"
                      size="small"
                    />
                  }
                  label="Available"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSaveItem} 
            color="primary" 
            startIcon={loading ? null : <SaveIcon />}
            disabled={loading || !editingItem?.name || !editingItem?.description || editingItem?.price <= 0}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog when trying to open restaurant without menu items */}
      <Dialog
        open={showStatusWarning}
        onClose={handleCloseWarning}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Cannot Open Restaurant
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WarningIcon color="error" sx={{ mr: 1, fontSize: 30 }} />
            <Typography variant="body1">
              Your restaurant menu is empty. You need to add at least one menu item before opening your restaurant for orders.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Customers need to see what food your restaurant offers. Please add some menu items first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddItem}
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Menu Item
          </Button>
          <Button onClick={handleCloseWarning} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Courier Selection Modal */}
      <Modal
        open={courierModalOpen}
        onClose={handleCloseCourierModal}
        aria-labelledby="courier-selection-modal"
        aria-describedby="select-courier-for-delivery"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Typography id="courier-selection-modal" variant="h6" component="h2" gutterBottom>
            Select a Courier for Order #{selectedOrderId}
          </Typography>
          
          {isLoadingCouriers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : availableCouriers.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No couriers are currently available. Please try again later.
            </Alert>
          ) : (
            <>
              <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                <RadioGroup
                  aria-label="courier"
                  name="courier-selection"
                  value={selectedCourierId || ''}
                  onChange={handleCourierChange}
                >
                  {availableCouriers.map((courier) => (
                    <Paper
                      key={courier.courierId}
                      elevation={selectedCourierId === courier.courierId ? 3 : 1}
                      sx={{
                        mb: 2,
                        p: 2,
                        border: selectedCourierId === courier.courierId ? 2 : 1,
                        borderColor: selectedCourierId === courier.courierId ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FormControlLabel
                        value={courier.courierId}
                        control={<Radio />}
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {courier.name}
                              </Typography>
                              <Chip
                                icon={getVehicleIcon(courier.vehicleType)}
                                label={courier.vehicleType}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {courier.phoneNumber}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          width: '100%', 
                          m: 0,
                          alignItems: 'flex-start'
                        }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button
                  onClick={handleCloseCourierModal}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignCourier}
                  variant="contained"
                  disabled={!selectedCourierId || isAssigningCourier}
                  startIcon={isAssigningCourier ? <CircularProgress size={20} /> : <LocalShippingIcon />}
                >
                  {isAssigningCourier ? 'Sending Request...' : 'Request Courier'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default RestaurantDashboard; 