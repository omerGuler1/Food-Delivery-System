import React, { useState, useEffect } from 'react';
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
  CircularProgress
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
  Search as SearchIcon
} from '@mui/icons-material';
import { mockMenuItems, foodCategories, restaurantInfo } from '../data/mockData';
import { MenuItem as MenuItemType, FoodCategory } from '../interfaces';
import { addMenuItem, updateMenuItem, deleteMenuItem, getRestaurantMenuItems } from '../services/restaurantService';
import { useAuth } from '../contexts/AuthContext';

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

  // Helper function to map API response to our MenuItem type
  const mapApiMenuItemToLocal = (apiItem: any): MenuItemType => {
    return {
      menuItemId: apiItem.menuItemId || 0,
      name: apiItem.name || '',
      description: apiItem.description || '',
      price: apiItem.price || 0,
      category: apiItem.category || FoodCategory.MAIN_COURSES,
      available: apiItem.availability !== undefined ? apiItem.availability : true,
      restaurantId: apiItem.restaurantId || 1
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
          restaurantId: restaurantId, // Always use current restaurant ID
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          availability: editingItem.available,
          category: editingItem.category
        };

        console.log(`Saving menu item for restaurant ID: ${restaurantId}`);
        let result: MenuItemType;
        // Check if it's a new item or updating an existing one
        if (menuItems.some(item => item.menuItemId === editingItem.menuItemId)) {
          // Update existing item
          result = await updateMenuItem(editingItem.menuItemId, menuItemData) as MenuItemType;
          
          // Update local state
          setMenuItems(menuItems.map(item => 
            item.menuItemId === editingItem.menuItemId ? {
              ...item,
              name: result.name,
              description: result.description,
              price: result.price,
              available: result.available,
              category: result.category
            } : item
          ));
          setSuccessMessage('Menu item updated successfully');
        } else {
          // Add new item
          result = await addMenuItem(menuItemData);
          
          // Add to local state with the returned ID from the server
          setMenuItems([...menuItems, {
            menuItemId: result.menuItemId || 0,
            name: result.name,
            description: result.description,
            price: result.price,
            category: result.category,
            available: result.available,
            restaurantId: restaurantId // Use the current restaurantId
          }]);
          setSuccessMessage('Menu item added successfully');
        }
        
        setTimeout(() => setSuccessMessage(null), 3000);
        setOpenDialog(false);
        setEditingItem(null);
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
        
        setSuccessMessage(null);
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

  return (
    <Box sx={{ minHeight: '100vh', py: 3, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        {/* Dashboard Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          <Box>
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
              <Table sx={{ minWidth: 650 }} size="small">
                <TableHead sx={{ bgcolor: 'primary.light' }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.menuItemId} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{item.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 250, display: 'block' }}>
                            {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">
                            ${item.price.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.available ? 'Available' : 'Unavailable'}
                            color={item.available ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleToggleAvailability(item.menuItemId)}
                            >
                              {item.available ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditItem(item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteItem(item.menuItemId)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
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
        {menuItems.length > 0 && (
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom>Orders Management</Typography>
            <Alert severity="info">
              Orders management functionality will be implemented in a future update.
            </Alert>
          </TabPanel>
        )}

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
                  value={editingItem.description}
                  onChange={handleItemChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  name="price"
                  label="Price"
                  type="number"
                  fullWidth
                  required
                  value={editingItem.price}
                  onChange={handleItemChange}
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
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
    </Box>
  );
};

export default RestaurantDashboard; 