# BBM384 Backend API Documentation

## Authentication Endpoints

### Customer Authentication
- `POST /api/customer/auth/register` - Register a new customer account
  - Required fields: email, password, name, phoneNumber
  - Email must be unique and valid format
  - Password must be at least 8 characters with:
    - At least one digit
    - At least one lowercase letter
    - At least one uppercase letter
    - At least one special character (!@#$%^&*()-_=+{};:,<.>?)
  - Phone number must match format: +[1-9][0-9]{1,14}

  ```json
  // Request (CustomerRegisterDTO)
  POST /api/customer/auth/register
  {
    "email": "customer@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "phoneNumber": "+905551234567"
  }

  // Response (CustomerResponseDTO)
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customerId": 1,
    "name": "John Doe",
    "email": "customer@example.com",
    "phoneNumber": "+905551234567"
  }
  ```

- `POST /api/customer/auth/login` - Login to customer account
  - Required fields: email, password
  - Returns JWT token for authentication

  ```json
  // Request (CustomerLoginDTO)
  POST /api/customer/auth/login
  {
    "email": "customer@example.com",
    "password": "SecurePass123!"
  }

  // Response (CustomerResponseDTO)
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "customerId": 1,
    "name": "John Doe",
    "email": "customer@example.com",
    "phoneNumber": "+905551234567"
  }
  ```

### Restaurant Authentication
- `POST /api/restaurant/auth/register` - Register a new restaurant account
  - Required fields: email, password, name, phoneNumber, cuisineType
  - Email must be unique and valid format
  - Password must be at least 8 characters with:
    - At least one digit
    - At least one lowercase letter
    - At least one uppercase letter
    - At least one special character (@#$%^&+=)
  - Phone number must match format: +[1-9][0-9]{1,14}
  - Cuisine type must be from predefined list

  ```json
  // Request (RestaurantRegisterDTO)
  POST /api/restaurant/auth/register
  {
    "email": "restaurant@example.com",
    "password": "SecurePass123@",
    "name": "Tasty Bites",
    "phoneNumber": "+905551234567",
    "cuisineType": "ITALIAN"
  }

  // Response (RestaurantResponseDTO)
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "restaurantId": 1,
    "name": "Tasty Bites",
    "email": "restaurant@example.com",
    "phoneNumber": "+905551234567",
    "cuisineType": "ITALIAN",
    "rating": 0.0
  }
  ```

### Courier Authentication
- `POST /api/courier/auth/register` - Register a new courier account
  - Required fields: email, password, name, phoneNumber, vehicleType
  - Email must be unique and valid format
  - Password must be at least 8 characters with:
    - At least one digit
    - At least one lowercase letter
    - At least one uppercase letter
    - At least one special character (!@#$%^&*()-_=+{};:,<.>?)
  - Phone number must match format: +[1-9][0-9]{1,14}
  - Vehicle type must be from predefined list

  ```json
  // Request (CourierRegisterDTO)
  POST /api/courier/auth/register
  {
    "email": "courier@example.com",
    "password": "SecurePass123!",
    "name": "Mike Courier",
    "phoneNumber": "+905551234567",
    "vehicleType": "MOTORCYCLE"
  }

  // Response (CourierResponseDTO)
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "courierId": 1,
    "name": "Mike Courier",
    "email": "courier@example.com",
    "phoneNumber": "+905551234567",
    "vehicleType": "MOTORCYCLE",
    "status": "AVAILABLE",
    "earnings": 0.00
  }
  ```

### Admin Authentication
- `POST /api/admin/register` - Register a new admin account
  - Required fields: email, password, name, phoneNumber
  - Email must be unique and valid format
  - Password must be at least 8 characters
  - Phone number must match format: +[1-9][0-9]{1,14}
  - Admin registration requires special authorization

  ```json
  // Request (AdminRegisterDTO)
  POST /api/admin/register
  {
    "email": "admin@example.com",
    "password": "AdminPass123",
    "name": "Admin User",
    "phoneNumber": "+905551234567"
  }

  // Response (AdminResponseDTO)
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminId": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  }
  ```

### General Authentication
- `POST /api/auth/logout` - Logout from any account type
  - Requires valid JWT token in Authorization header
  - Blacklists the current token

  ```json
  // Request
  POST /api/auth/logout
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

  // Response (LogoutResponseDTO)
  {
    "message": "Logout successful",
    "success": true
  }
  ```

## Customer Profile Management
- `GET /api/profile` - Get current user profile
  - Requires authentication
  - Returns user details including email, name, phone number

  ```json
  // Request
  GET /api/profile
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

  // Response (CustomerResponseDTO)
  {
    "customerId": 1,
    "name": "John Doe",
    "email": "customer@example.com",
    "phoneNumber": "+905551234567"
  }
  ```

- `PUT /api/profile` - Update user profile
  - Requires authentication
  - Can update: name, phoneNumber
  - Email cannot be changed
  - Phone number must match format if provided

  ```json
  // Request (ProfileUpdateDTO)
  PUT /api/profile
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  {
    "name": "John Updated",
    "phoneNumber": "+905559876543"
  }
  ```

- `PUT /api/profile/password` - Update user password
  - Requires authentication
  - Required fields: currentPassword, newPassword
  - New password must meet same requirements as registration

- `DELETE /api/profile` - Delete user account (soft delete)
  - Requires authentication
  - Required fields: userId, confirmation
  - Account can be reactivated by admin

  ```json
  // Request (AccountDeletionDTO)
  DELETE /api/profile
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  {
    "userId": 1,
    "confirmation": true
  }
  ```

### Address Management
- `GET /api/profile/addresses` - Get all addresses for current user
  - Requires authentication
  - Returns list of saved addresses

- `POST /api/profile/addresses` - Add new address
  - Requires authentication
  - Required fields: street, city, state, country, zipCode, isDefault
  - Optional: latitude, longitude

  ```json
  // Request (AddressDTO)
  POST /api/profile/addresses
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  {
    "street": "456 Oak Street",
    "city": "Istanbul",
    "state": "Marmara",
    "country": "Turkey",
    "zipCode": "34000",
    "isDefault": true,
    "latitude": 41.0082,
    "longitude": 28.9784
  }

  // Response (AddressDTO)
  {
    "addressId": 1,
    "street": "456 Oak Street",
    "city": "Istanbul",
    "state": "Marmara",
    "country": "Turkey",
    "zipCode": "34000",
    "isDefault": true,
    "latitude": 41.0082,
    "longitude": 28.9784
  }
  ```

## Restaurant Menu Management
- `POST /api/restaurant/menu-items` - Create new menu item
  - Requires restaurant authentication
  - Required fields: name, description, price, category
  - Optional fields: imageUrl, preparationTime
  - Price must be positive

  ```json
  // Request (MenuItemDTO)
  POST /api/restaurant/menu-items
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  {
    "name": "Margherita Pizza",
    "description": "Classic tomato and mozzarella pizza",
    "price": 89.90,
    "category": "PIZZA",
    "imageUrl": "https://example.com/pizza.jpg",
    "preparationTime": 15
  }

  // Response (MenuItem)
  {
    "id": 1,
    "name": "Margherita Pizza",
    "description": "Classic tomato and mozzarella pizza",
    "price": 89.90,
    "category": "PIZZA",
    "imageUrl": "https://example.com/pizza.jpg",
    "preparationTime": 15,
    "isAvailable": true
  }
  ```

- `GET /api/restaurant/menu-items` - Get all menu items
  - Requires restaurant authentication
  - Query parameters:
    - `availableOnly` - Filter only available items
    - `category` - Filter by category
  - Returns list of menu items

- `GET /api/restaurant/menu-items/{menuItemId}` - Get specific menu item
  - Requires restaurant authentication
  - Menu item must belong to the restaurant

- `PUT /api/restaurant/menu-items/{menuItemId}` - Update menu item
  - Requires restaurant authentication
  - Can update all fields except ID
  - Menu item must belong to the restaurant

- `DELETE /api/restaurant/menu-items/{menuItemId}` - Delete menu item
  - Requires restaurant authentication
  - Menu item must belong to the restaurant
  - Returns 204 No Content on success

- `PATCH /api/restaurant/menu-items/{menuItemId}/availability` - Toggle item availability
  - Requires restaurant authentication
  - Menu item must belong to the restaurant
  - Toggles between available and unavailable

## Order Management
- `POST /api/orders` - Place new order
  - Requires customer authentication
  - Required fields: restaurantId, addressId, items (list of menuItemId and quantity)
  - Items must be available and belong to the restaurant
  - Customer must have at least one address

  ```json
  // Request (PlaceOrderRequestDTO)
  POST /api/orders
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  {
    "restaurantId": 1,
    "addressId": 1,
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2
      },
      {
        "menuItemId": 3,
        "quantity": 1
      }
    ]
  }

  // Response (OrderDTO)
  {
    "orderId": 1,
    "restaurantId": 1,
    "userId": 1,
    "orderItems": [
      {
        "menuItemId": 1,
        "quantity": 2,
        "price": 89.90,
        "specialInstructions": null
      },
      {
        "menuItemId": 3,
        "quantity": 1,
        "price": 89.90,
        "specialInstructions": null
      }
    ],
    "status": "PENDING",
    "totalAmount": 269.70,
    "deliveryAddress": "456 Oak Street, Istanbul, Turkey",
    "orderTime": "2024-03-15T11:30:00Z",
    "deliveryTime": null,
    "specialInstructions": null
  }
  ```

- `GET /api/orders/{id}` - Get order details
  - Requires authentication
  - Customer can view their own orders
  - Restaurant can view orders for their restaurant
  - Courier can view assigned orders

- `PUT /api/orders/{id}/status` - Update order status (Restaurant/Courier only)
  - Requires restaurant or courier authentication
  - Required fields: status
  - Optional: statusUpdateReason
  - Status transitions must follow the workflow:
    - PENDING → ACCEPTED → PREPARING → READY → PICKED_UP → DELIVERED
    - Can be CANCELLED at any point by customer

  ```json
  // Request (OrderStatusUpdateDTO)
  PUT /api/orders/1/status
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  {
    "status": "ACCEPTED",
    "statusUpdateReason": "Order accepted and will be prepared"
  }
  ```

- `PUT /api/orders/{id}/cancel` - Cancel order (Customer only)
  - Requires customer authentication
  - Can only cancel orders in PENDING or ACCEPTED status
  - Order must belong to the customer

## Rating System
- `POST /api/ratings` - Create new rating for an order
  - Requires customer authentication
  - Required fields: orderId, rating (1-5)
  - Optional: comment
  - Order must be in DELIVERED status
  - Customer can only rate their own orders
  - One rating per order

  ```json
  // Request (RatingDTO)
  POST /api/ratings
  Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  {
    "orderId": 1,
    "rating": 5,
    "comment": "Great service and delicious food!"
  }

  // Response (RatingResponseDTO)
  {
    "id": 1,
    "orderId": 1,
    "customerId": 1,
    "restaurantId": 1,
    "rating": 5,
    "comment": "Great service and delicious food!",
    "createdAt": "2024-03-15T12:30:00Z",
    "customerName": "John Doe",
    "restaurantName": "Tasty Bites"
  }
  ```

- `GET /api/ratings/restaurant/{restaurantId}` - Get all ratings for a restaurant
  - Public endpoint
  - Returns list of ratings with customer comments

- `GET /api/ratings/restaurant/{restaurantId}/average` - Get average rating for a restaurant
  - Public endpoint
  - Returns average rating (1-5)

- `GET /api/ratings/customer` - Get all ratings given by current customer
  - Requires customer authentication
  - Returns list of ratings given by the customer

- `GET /api/ratings/can-rate/{orderId}` - Check if customer can rate an order
  - Requires customer authentication
  - Returns boolean indicating if order can be rated
  - Order must be DELIVERED and not already rated

## Search Functionality

### Restaurant Search
- `GET /api/restaurants/search` - Search restaurants with filters
  - Public endpoint
  - All filters are optional:
    - name
    - cuisineType
    - city
    - state
    - country
    - minPrice
    - maxPrice
    - deliveryTime
    - latitude
    - longitude
    - maxDistanceKm

  ```json
  // Request
  GET /api/restaurants/search?cuisineType=ITALIAN&city=Istanbul&minPrice=50&maxPrice=200

  // Response (RestaurantSearchResultDTO)
  {
    "restaurants": [
      {
        "restaurantId": 1,
        "name": "Tasty Bites",
        "cuisineType": "ITALIAN",
        "phoneNumber": "+905551234567",
        "rating": 4.5,
        "street": "123 Main St",
        "city": "Istanbul",
        "state": "Marmara",
        "zipCode": "34000",
        "country": "Turkey",
        "latitude": 41.0082,
        "longitude": 28.9784,
        "deliveryRangeKm": 5,
        "estimatedDeliveryTime": "30:00",
        "averagePrice": 89.90,
        "isOpen": true
      }
    ],
    "total": 1
  }
  ```

### Menu Item Search
- `GET /api/menu-items/search` - Search menu items with filters
  - Public endpoint
  - All filters are optional:
    - name
    - category
    - minPrice
    - maxPrice
    - isAvailable
    - restaurantId

  ```json
  // Request
  GET /api/menu-items/search?category=PIZZA&minPrice=50&maxPrice=100&restaurantId=1

  // Response (MenuItemSearchResultDTO)
  {
    "menuItems": [
      {
        "id": 1,
        "name": "Margherita Pizza",
        "description": "Classic tomato and mozzarella pizza",
        "price": 89.90,
        "category": "PIZZA",
        "imageUrl": "https://example.com/pizza.jpg",
        "isAvailable": true,
        "restaurantId": 1,
        "restaurantName": "Tasty Bites"
      }
    ],
    "total": 1
  }
  ```

- `POST /api/menu-items/search` - Advanced menu item search
  - Public endpoint
  - Accepts complex search criteria

  ```json
  // Request (MenuItemSearchDTO)
  POST /api/menu-items/search
  {
    "name": "Pizza",
    "category": "PIZZA",
    "minPrice": 50.00,
    "maxPrice": 100.00,
    "isAvailable": true,
    "restaurantId": 1
  }

  // Response (MenuItemSearchResultDTO)
  {
    "menuItems": [
      {
        "id": 1,
        "name": "Margherita Pizza",
        "description": "Classic tomato and mozzarella pizza",
        "price": 89.90,
        "category": "PIZZA",
        "imageUrl": "https://example.com/pizza.jpg",
        "isAvailable": true,
        "restaurantId": 1,
        "restaurantName": "Tasty Bites"
      }
    ],
    "total": 1
  }
  ``` 