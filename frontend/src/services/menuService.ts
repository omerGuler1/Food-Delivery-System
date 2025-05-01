import { axiosInstance } from './axiosConfig';

// Define types for menu items
export interface MenuItem {
  menuItemId: number;
  category: string;
  name: string;
  description: string;
  price: number;
  availability: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Define query options type
export interface MenuQueryOptions {
  availableOnly?: boolean;
  category?: string;
}

// Mock data for development and testing
const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    menuItemId: 1,
    category: "Burgers",
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, cheese, and our special sauce",
    price: 75,
    availability: true,
    imageUrl: "https://source.unsplash.com/random/300x200/?burger",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    menuItemId: 2,
    category: "Pizza",
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella cheese, and basil on our homemade dough",
    price: 85,
    availability: true,
    imageUrl: "https://source.unsplash.com/random/300x200/?pizza",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    menuItemId: 3,
    category: "Salads",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce, croutons, parmesan cheese, and Caesar dressing",
    price: 45,
    availability: true,
    imageUrl: "https://source.unsplash.com/random/300x200/?salad",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    menuItemId: 4,
    category: "Appetizers",
    name: "Chicken Wings",
    description: "Crispy chicken wings tossed in your choice of sauce: BBQ, Buffalo, or Honey Mustard",
    price: 65,
    availability: true,
    imageUrl: "https://source.unsplash.com/random/300x200/?wings",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    menuItemId: 5,
    category: "Pasta",
    name: "Spaghetti Bolognese",
    description: "Al dente spaghetti with rich meat sauce and parmesan cheese",
    price: 70,
    availability: true,
    imageUrl: "https://source.unsplash.com/random/300x200/?pasta",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  },
  {
    menuItemId: 6,
    category: "Wraps",
    name: "Veggie Wrap",
    description: "Grilled vegetables, hummus, and feta cheese wrapped in a tortilla",
    price: 55,
    availability: true,
    imageUrl: "https://source.unsplash.com/random/300x200/?wrap",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
  }
];

// Flag to determine if we should use mock data - set to false to use real API
const USE_MOCK_DATA = false;

/**
 * Fetches menu items for a specific restaurant
 * @param restaurantId The ID of the restaurant
 * @param options Additional query options
 * @returns Promise with menu items array
 */
export const getRestaurantMenuItems = async (
  restaurantId: number | string,
  options: MenuQueryOptions = {}
): Promise<MenuItem[]> => {
  // Use mock data when in development or testing
  if (USE_MOCK_DATA) {
    console.log('Using mock menu data');
    // Apply filters to mock data
    let filteredItems = [...MOCK_MENU_ITEMS];
    
    if (options.availableOnly) {
      filteredItems = filteredItems.filter(item => item.availability);
    }
    
    if (options.category) {
      filteredItems = filteredItems.filter(item => item.category === options.category);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return filteredItems;
  }
  
  try {
    console.log(`Fetching real menu data for restaurant ID: ${restaurantId}`);
    // Build query parameters
    const params: Record<string, string | boolean> = {};
    
    if (options.availableOnly !== undefined) {
      params.availableOnly = options.availableOnly;
    }
    
    if (options.category) {
      params.category = options.category;
    }
    
    // Use the correct API endpoint for fetching public menu items
    const response = await axiosInstance.get(`/restaurant/menu-items/public/${restaurantId}`, { params });
    console.log('API response:', response.data);
    
    // If no items are returned, fallback to mock data
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('No menu items returned from API, using mock data as fallback');
      return MOCK_MENU_ITEMS;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant menu items:', error);
    console.log('Using mock data as fallback due to API error');
    return MOCK_MENU_ITEMS;
  }
}; 