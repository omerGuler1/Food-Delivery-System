import { MenuItem, FoodCategory } from '../interfaces';

export const mockMenuItems: MenuItem[] = [
  {
    menuItemId: 1,
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    price: 12.99,
    category: FoodCategory.MAIN_COURSES,
    imageUrl: '/images/margherita-pizza.jpg',
    available: true,
    restaurantId: 1,
    allergens: ['Gluten', 'Dairy'],
    preparationTime: 15,
    calories: 840,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    specialOffer: false,
    discountPercentage: 0
  },
  {
    menuItemId: 2,
    name: 'Caesar Salad',
    description: 'Romaine lettuce with Caesar dressing, croutons, and parmesan cheese',
    price: 8.99,
    category: FoodCategory.SALADS,
    imageUrl: '/images/caesar-salad.jpg',
    available: true,
    restaurantId: 1,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    preparationTime: 8,
    calories: 350,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    specialOffer: false,
    discountPercentage: 0
  },
  {
    menuItemId: 3,
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce',
    price: 14.99,
    category: FoodCategory.MAIN_COURSES,
    imageUrl: '/images/beef-burger.jpg',
    available: true,
    restaurantId: 1,
    allergens: ['Gluten', 'Dairy'],
    preparationTime: 12,
    calories: 780,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    specialOffer: true,
    discountPercentage: 10
  },
  {
    menuItemId: 4,
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with a layer of ganache',
    price: 6.99,
    category: FoodCategory.DESSERTS,
    imageUrl: '/images/chocolate-cake.jpg',
    available: true,
    restaurantId: 1,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    preparationTime: 5,
    calories: 420,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    specialOffer: false,
    discountPercentage: 0
  },
  {
    menuItemId: 5,
    name: 'Mozzarella Sticks',
    description: 'Breaded and fried mozzarella sticks with marinara sauce',
    price: 7.99,
    category: FoodCategory.STARTERS,
    imageUrl: '/images/Mozzarella-Sticks.jpg',
    available: true,
    restaurantId: 1,
    allergens: ['Gluten', 'Dairy'],
    preparationTime: 10,
    calories: 560,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    specialOffer: false,
    discountPercentage: 0
  },
  {
    menuItemId: 6,
    name: 'Spaghetti Carbonara',
    description: 'Spaghetti with creamy egg sauce, pancetta, and parmesan cheese',
    price: 13.99,
    category: FoodCategory.MAIN_COURSES,
    imageUrl: '/images/spaghetti-carbonara.jpg',
    available: true,
    restaurantId: 1,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    preparationTime: 15,
    calories: 720,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    specialOffer: false,
    discountPercentage: 0
  },
  {
    menuItemId: 7,
    name: 'French Fries',
    description: 'Crispy golden french fries with ketchup',
    price: 4.99,
    category: FoodCategory.SIDES,
    imageUrl: '/images/french-fries.jpg',
    available: true,
    restaurantId: 1,
    allergens: ['Gluten'],
    preparationTime: 8,
    calories: 420,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    specialOffer: false,
    discountPercentage: 0
  },
  {
    menuItemId: 8,
    name: 'Coca Cola',
    description: 'Refreshing cola drink',
    price: 2.99,
    category: FoodCategory.DRINKS,
    imageUrl: '/images/coca-cola.jpg',
    available: true,
    restaurantId: 1,
    allergens: [],
    preparationTime: 1,
    calories: 140,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    specialOffer: false,
    discountPercentage: 0
  }
];

// Categories for filtering
export const foodCategories = Object.values(FoodCategory);

// Restaurant information
export const restaurantInfo = {
  name: "Your Restaurant",
  description: "Serving delicious food since 2023",
  openHours: "10:00 - 22:00",
  address: "123 Restaurant St, Foodville",
  phoneNumber: "+1 (555) 123-4567",
  email: "info@yourrestaurant.com",
};

// Mock promotions for checkout page
export const mockPromotions = [
  {
    id: 1,
    name: "Summer Special",
    description: "10% off your order this summer",
    discountAmount: 10.00,
    minOrderAmount: 30.00,
    startDate: "2023-06-01",
    endDate: "2023-09-30",
    isActive: true
  },
  {
    id: 2,
    name: "Weekend Deal",
    description: "15% off on weekend orders",
    discountAmount: 15.00,
    minOrderAmount: 40.00,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    isActive: true
  },
  {
    id: 3,
    name: "New Customer Special",
    description: "20% off your first order",
    discountAmount: 20.00,
    minOrderAmount: 25.00,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    isActive: true
  }
];

// Mock coupons for checkout page
export const mockCoupons = [
  {
    id: 1,
    name: "WELCOME10",
    description: "10% off your first order",
    discountAmount: 10.00,
    minOrderAmount: 20.00,
    quota: 100,
    usageCount: 45,
    isActive: true
  },
  {
    id: 2,
    name: "SUMMER25",
    description: "25% off summer promotion",
    discountAmount: 25.00,
    minOrderAmount: 50.00,
    quota: 50,
    usageCount: 30,
    isActive: true
  },
  {
    id: 3,
    name: "FREESHIP",
    description: "Free delivery on your order",
    discountAmount: 15.00,
    minOrderAmount: 35.00,
    quota: 200,
    usageCount: 150,
    isActive: true
  }
];