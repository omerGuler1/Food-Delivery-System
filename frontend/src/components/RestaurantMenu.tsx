import React, { useState, useEffect } from 'react';
import { getRestaurantMenuItems, MenuItem } from '../services/menuService';
import { 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  Chip, 
  Divider,
  CircularProgress
} from '@mui/material';

interface RestaurantMenuProps {
  restaurantId: number | string;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({ restaurantId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        const options: {
          availableOnly?: boolean;
          category?: string;
        } = {};
        
        // Only add category filter if one is selected
        if (selectedCategory) {
          options.category = selectedCategory;
        }
        
        // Always show available items to customers by default
        options.availableOnly = true;
        
        const data = await getRestaurantMenuItems(restaurantId, options);
        setMenuItems(data);
        
        // Extract unique categories if no category is selected
        if (!selectedCategory) {
          const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [restaurantId, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
        Menü
      </Typography>
      
      {/* Category filters */}
      {categories.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, my: 2, flexWrap: 'wrap' }}>
          <Chip 
            label="Tümü" 
            onClick={() => setSelectedCategory('')}
            color={selectedCategory === '' ? 'primary' : 'default'}
            variant={selectedCategory === '' ? 'filled' : 'outlined'}
          />
          {categories.map(category => (
            <Chip
              key={category}
              label={category}
              onClick={() => handleCategoryClick(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      )}
      
      <Divider sx={{ mb: 3 }} />
      
      {menuItems.length === 0 ? (
        <Typography>Menü öğesi bulunamadı.</Typography>
      ) : (
        <Grid container spacing={3}>
          {menuItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.menuItemId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={item.imageUrl}
                    alt={item.name}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip size="small" label={item.category} />
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                      ${item.price.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default RestaurantMenu; 