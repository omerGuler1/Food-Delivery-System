// User interfaces
export interface User {
  name: string;
  email: string;
  phoneNumber: string;
  token: string;
}

export interface Admin extends User {
  adminId: number;
}

export interface Address {
  addressId: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  fullAddress?: string;
}

export interface Customer extends User {
  customerId: number;
  addresses?: Address[];
}

export interface Restaurant extends User {
  restaurantId: number;
  cuisineType?: string;
  rating?: number;
  profileImageUrl?: string;
  isOpen?: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  latitude?: number;
  longitude?: number;
  deliveryRangeKm?: number;
  estimatedDeliveryTime?: string;
  averagePrice?: number;
  approvalStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface Courier extends User {
  courierId: string;
  vehicleType: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  approvalStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface CustomerRegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RestaurantRegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  cuisineType: string;
}

export interface CourierRegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  vehicleType: string;
}

// Restaurant and Menu interfaces
export enum FoodCategory {
  STARTERS = 'Starters',
  MAIN_COURSES = 'Main Courses',
  SIDES = 'Sides',
  DESSERTS = 'Desserts',
  DRINKS = 'Drinks',
  SALADS = 'Salads',
  SOUPS = 'Soups',
  APPETIZERS = 'Appetizers',
  FAST_FOOD = 'Fast Food'
}

export interface MenuItemType {
  menuItemId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  restaurantId?: number;
  imageUrl?: string;
}

export interface MenuItem extends MenuItemType {
  allergens?: string[];
  preparationTime?: number; // in minutes
  calories?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  specialOffer?: boolean;
  discountPercentage?: number;
}

export interface RestaurantDetails extends Restaurant {
  description?: string;
  openingHours?: string;
  menuItems?: MenuItem[];
}

// Cart interfaces
export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: number;
  restaurantName: string;
}

export interface Cart {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string | null;
  totalPrice: number;
}

// Order interfaces
export interface CustomerInfo {
  customerId: number;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface CourierInfo {
  courierId: number;
  name: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  status: string;
  earnings?: number;
}

export interface OrderItem {
  orderItemId: number;
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  address: Address;
  totalPrice: number;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
  payment: any | null;
  orderItems: OrderItem[];
  restaurant?: Restaurant;
  customer?: CustomerInfo;
}

export interface OrderResponseDTO {
  orderId: number;
  address: Address;
  totalPrice: number;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
  payment: any | null;
  orderItems: OrderItem[];
  courierAssignments: any[];
  customer: CustomerInfo;
  restaurant: Restaurant;
}

// CourierAssignment interface
export interface CourierAssignment {
  assignmentId: number;
  assignedAt: string;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  status: 'REQUESTED' | 'ACCEPTED' | 'REJECTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED' | 'EXPIRED';
  order?: Order;
  courier?: Courier;
}

// Courier Order History DTO
export interface CourierOrderHistoryDTO {
  orderId: number;
  assignmentId: number;
  restaurantName: string;
  customerName: string;
  deliveryAddress: string;
  totalPrice: number;
  orderStatus: string;
  assignmentStatus: string;
  assignedAt: string;
  pickedUpAt: string | null;
  deliveredAt: string | null;
}

// ActiveDeliveryOrder interface to match the API response
export interface ActiveDeliveryOrder {
  orderId: number;
  address: Address;
  totalPrice: number;
  status: string;
  createdAt: string;
  deliveredAt: string | null;
  payment: any | null;
  orderItems: OrderItem[];
  courierAssignments: CourierAssignment[];
  restaurant?: Restaurant;
  customer?: Customer;
}

// PendingDeliveryRequest interface
export interface PendingDeliveryRequest extends CourierAssignment {
  order: Order;
}

// Admin Edit DTOs
export interface AdminEditCustomerRequest {
  customerId: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  newPassword?: string;
}

export interface AdminEditRestaurantRequest {
  restaurantId: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  cuisineType?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  newPassword?: string;
}

export interface AdminEditCourierRequest {
  courierId: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  vehicleType?: string;
  newPassword?: string;
} 