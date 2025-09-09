# HU-FDS (Hacettepe University Food Delivery System)

A comprehensive full-stack food delivery platform built with Spring Boot backend and React.js frontend, designed to serve university communities with features for customers, restaurants, couriers, and administrators.

## System Architecture

The system follows a microservices-inspired architecture with clear separation between frontend and backend:

- **Backend**: RESTful API built with Spring Boot
- **Frontend**: Modern React.js SPA with TypeScript
- **Database**: PostgreSQL with Flyway migrations
- **Authentication**: JWT-based security system
- **File Storage**: Local file system with configurable upload directories

## Technologies Used

### Backend Technologies
- **Java 17** - Programming language
- **Spring Boot 3.2.3** - Application framework
  - Spring Security - Authentication and authorization
  - Spring Data JPA - Database operations
  - Spring Web - REST API development
  - Spring Validation - Input validation
- **PostgreSQL** - Primary database
- **Flyway 10.8.1** - Database migration tool
- **JWT (JSON Web Tokens)** - Authentication mechanism
- **Lombok** - Java boilerplate reduction
- **Maven** - Dependency management and build tool
- **JUnit 5 & Mockito** - Testing frameworks

### Frontend Technologies
- **React 18.2.0** - UI library
- **TypeScript 4.9.5** - Type-safe JavaScript
- **Material-UI 5.17.1** - Component library
  - @mui/material - Core components
  - @mui/icons-material - Icon set
  - @emotion/react & @emotion/styled - Styling
- **React Router DOM 6.30.1** - Client-side routing
- **Axios 1.4.0** - HTTP client
- **Date-fns 4.1.0** - Date manipulation

## Key Features

### Multi-Role User System

#### **Customer Features**
- User registration and authentication
- Browse restaurants by cuisine type, location, rating
- Advanced search and filtering capabilities
- Menu item browsing with detailed information
- Shopping cart management
- Multiple delivery address management
- Order placement with various payment methods (Credit Card, Cash on Delivery)
- Real-time order tracking
- Order history and reordering
- Restaurant favorites system
- Rating and review system for restaurants and couriers
- Promotional code and coupon application
- Personal profile management
- Notification system for order updates
- Feedback submission system

#### **Restaurant Features**
- Restaurant registration with approval workflow
- Comprehensive restaurant profile management
- Menu item management (CRUD operations)
- Image upload for restaurant and menu items
- Order management and status updates
- Real-time order notifications
- Courier assignment requests
- Revenue analytics and reporting
- Customer review management with response capability
- Business hours and availability settings
- Delivery range configuration
- Promotional offers management

#### **Courier Features**
- Courier registration with approval workflow
- Vehicle type specification
- Real-time delivery request notifications
- Order assignment acceptance/rejection
- Delivery status updates (Picked up, Delivered)
- Delivery history and earnings tracking
- Availability status management
- Customer rating and review system
- Route and delivery management

#### **Admin Features**
- Complete system oversight and management
- User approval workflows (Restaurants & Couriers)
- User management (Create, Read, Update, Delete, Ban)
- Analytics dashboard with business insights
  - Restaurant performance metrics
  - Customer analytics
  - Revenue tracking
  - Order statistics
- Promotion and coupon management
- Fee structure configuration
- System-wide messaging and notifications
- Content moderation and user behavior monitoring
- Platform configuration and settings

### **Technical Features**

#### **Security & Authentication**
- JWT-based authentication with role-based access control
- Secure password handling with encryption
- Token blacklisting for logout
- User existence verification
- Session management with configurable expiration
- CORS configuration for cross-origin requests
- Input validation and sanitization

#### **Payment System**
- Multiple payment methods support
- Credit card processing simulation
- Cash on delivery option
- Payment status tracking
- Refund management
- Order-payment relationship validation

#### **Order Management System**
- Comprehensive order lifecycle management
- Status transitions: PENDING → PROCESSING → OUT_FOR_DELIVERY → DELIVERED
- Courier assignment and management system
- Real-time order tracking
- Order modification and cancellation
- Automated order processing workflows

#### **Promotion & Discount System**
- Coupon code system with usage limits
- Percentage-based promotional discounts
- Minimum order amount validation
- Expiration date management
- Usage tracking and analytics

#### **Notification & Messaging System**
- Real-time notification system
- Inter-user messaging (Admin ↔ Users)
- Message categorization (Request, Suggestion, Complaint, Warning)
- Read/unread status tracking
- Message history management

#### **Search & Discovery**
- Restaurant search by name, cuisine, location
- Menu item search across restaurants
- Advanced filtering options
- Distance-based delivery range calculation
- Rating and review-based sorting

#### **Analytics & Reporting**
- Restaurant performance analytics
- Customer behavior analysis
- Revenue and order statistics
- User engagement metrics
- Business intelligence dashboards

## Project Structure

```
gpt-plus/
├── backend/                    # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hufds/
│   │   │   │   ├── config/     # Configuration classes
│   │   │   │   ├── controller/ # REST controllers
│   │   │   │   ├── dto/        # Data Transfer Objects
│   │   │   │   ├── entity/     # JPA entities
│   │   │   │   ├── exception/  # Custom exceptions
│   │   │   │   ├── repository/ # Data repositories
│   │   │   │   ├── service/    # Business logic
│   │   │   │   └── utils/      # Utility classes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── schema.sql
│   │   │       └── db/migration/ # Flyway migrations
│   │   └── test/               # Unit and integration tests
│   ├── uploads/                # File upload directory
│   │   ├── menu-items/         # Menu item images
│   │   └── restaurant-profiles/ # Restaurant profile images
│   └── pom.xml                 # Maven dependencies
├── frontend/                   # React.js frontend
│   ├── public/                 # Static assets
│   │   ├── images/             # Public images
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React contexts
│   │   ├── interfaces/         # TypeScript interfaces
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layers
│   │   ├── types/              # Type definitions
│   │   ├── utils/              # Utility functions
│   │   ├── App.tsx             # Main application component
│   │   └── index.tsx           # Entry point
│   ├── package.json            # NPM dependencies
│   └── tsconfig.json           # TypeScript configuration
└── README.md                   # This file
```

## Database Schema

The system uses PostgreSQL with the following main entities:

### Core Entities
- **Customer**: User account information and addresses
- **Restaurant**: Restaurant profiles and business information
- **Courier**: Delivery personnel information and status
- **AdminUser**: System administrator accounts
- **MenuItem**: Restaurant menu items with categories
- **Order**: Order information and lifecycle management
- **OrderItem**: Individual items within orders
- **Payment**: Payment processing and tracking
- **Address**: Customer delivery addresses
- **CourierAssignment**: Delivery assignment management

### Supporting Entities
- **Review**: Customer reviews for restaurants and couriers
- **FavoriteRestaurant**: Customer restaurant preferences
- **Promotion**: System-wide promotional campaigns
- **Coupon**: Discount codes and usage tracking
- **Message**: Inter-user communication system
- **Fee**: Administrative fee structure

## Installation & Setup

### Prerequisites
- **Java 17+**
- **Node.js 16+**
- **PostgreSQL 12+**
- **Maven 3.6+**
- **npm 8+**

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd gpt-plus/backend
```

2. **Configure PostgreSQL Database**
```sql
CREATE DATABASE hufds;
CREATE USER postgres WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE hufds TO postgres;
```

3. **Update application.properties**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hufds
spring.datasource.username=postgres
spring.datasource.password=your_password
```

4. **Build and run the backend**
```bash
mvn clean install
mvn spring-boot:run
```

The backend API will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment configuration**
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

4. **Start the development server**
```bash
npm start
```

The frontend application will be available at `http://localhost:3000`

### Database Migration

The system uses Flyway for database migrations. Migrations are automatically executed on application startup. Migration files are located in `backend/src/main/resources/db/migration/`.

## Configuration

### Backend Configuration

Key configuration options in `application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/hufds
spring.jpa.hibernate.ddl-auto=update

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000
jwt.expiration.remember-me=604800000

# File Upload Configuration
spring.servlet.multipart.max-file-size=5MB
file.upload-dir=uploads
file.base-url=http://localhost:8080/uploads

# Flyway Configuration
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

### Frontend Configuration

Environment variables in `.env`:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## API Documentation

### Authentication Endpoints
- `POST /api/customer/auth/register` - Customer registration
- `POST /api/customer/auth/login` - Customer login
- `POST /api/restaurant/auth/register` - Restaurant registration  
- `POST /api/restaurant/auth/login` - Restaurant login
- `POST /api/courier/auth/register` - Courier registration
- `POST /api/courier/auth/login` - Courier login
- `POST /api/admin/register` - Admin registration
- `POST /api/admin/login` - Admin login
- `POST /api/auth/logout` - Universal logout

### Customer Endpoints
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/{id}` - Get restaurant details
- `POST /api/customer/orders` - Place new order
- `GET /api/customer/orders` - Get customer orders
- `POST /api/customer/addresses` - Add delivery address
- `GET /api/customer/favorites` - Get favorite restaurants

### Restaurant Endpoints
- `GET /api/restaurant/orders` - Get restaurant orders
- `PUT /api/restaurant/orders/{id}/status` - Update order status
- `POST /api/restaurant/menu-items` - Add menu item
- `PUT /api/restaurant/menu-items/{id}` - Update menu item
- `GET /api/restaurant/analytics` - Restaurant analytics

### Courier Endpoints
- `GET /api/courier/assignments/pending` - Get pending delivery requests
- `POST /api/courier/assignments/{id}/accept` - Accept delivery
- `PUT /api/courier/assignments/{id}/pickup` - Mark as picked up
- `PUT /api/courier/assignments/{id}/deliver` - Mark as delivered

### Admin Endpoints
- `GET /api/admin/analytics/restaurants` - Restaurant analytics
- `GET /api/admin/analytics/customers` - Customer analytics
- `GET /api/admin/approvals/restaurants` - Pending restaurant approvals
- `GET /api/admin/approvals/couriers` - Pending courier approvals
- `POST /api/admin/promotions` - Create promotion
- `GET /api/admin/users` - User management

## Testing

### Backend Testing
```bash
cd backend
mvn test
```

### Frontend Testing
```bash
cd frontend
npm test
```

The backend includes comprehensive unit tests for:
- Authentication services
- Order management
- Payment processing
- User management
- Business logic validation

## Deployment

### Production Deployment

1. **Backend Deployment**
```bash
mvn clean package
java -jar target/hu-fds-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

2. **Frontend Deployment**
```bash
npm run build
# Deploy build/ directory to web server
```

### Environment-Specific Configuration

Create production configuration files:
- `application-prod.properties` for backend
- Production `.env` file for frontend

## Performance Features

- **Lazy Loading**: Menu items and images loaded on demand
- **Caching**: Database query optimization with JPA caching
- **Connection Pooling**: HikariCP for database connections
- **Image Optimization**: Configurable file size limits
- **Responsive Design**: Mobile-first responsive UI
- **Error Handling**: Comprehensive error handling and user feedback

## Security Features

- **JWT Authentication**: Stateless authentication system
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: JPA/Hibernate query parameterization
- **XSS Protection**: Input sanitization and output encoding
- **CORS Configuration**: Controlled cross-origin access
- **Password Encryption**: Secure password hashing
- **Session Management**: Secure token handling

