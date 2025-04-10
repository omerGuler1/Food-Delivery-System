# Hacettepe University Food Delivery System (HUFDS)

## 📋 About
HUFDS (Hacettepe University Food Delivery System) is a food delivery system developed for Hacettepe University. The system enables users to place food orders, restaurants to manage their menus and orders, and couriers to handle deliveries.

## 🛠 Technical Infrastructure
- **Java Version:** 17
- **Framework:** Spring Boot 3.2.3
- **Build Tool:** Maven
- **Database:** PostgreSQL
- **Connection Pool:** HikariCP

## 💾 Database Structure
### Core Entities
#### Users Table
| Field        | Type     | Properties                |
|-------------|----------|---------------------------|
| id          | Long     | Primary Key, Auto Inc     |
| email       | String   | Unique, Not Null          |
| password    | String   | Not Null                  |
| full_name   | String   | Not Null                  |
| role        | Enum     | Not Null                  |
| enabled     | Boolean  | Default: true             |
| phone_number| String   | -                         |

#### Restaurant Table
| Field           | Type     | Properties                |
|----------------|----------|---------------------------|
| id             | Long     | Primary Key, Auto Inc     |
| name           | String   | Not Null                  |
| description    | String   | -                         |
| cuisine_type   | String   | -                         |
| rating         | Double   | Default: 0.0              |
| address        | Address  | One-to-One                |
| business_hours | BusinessHours | One-to-One         |
| menu_items     | List     | One-to-Many               |

## 👥 User Roles
- 🧑‍💼 CUSTOMER
- 🏪 RESTAURANT
- 🚴 COURIER
- 👨‍💼 ADMIN

## 🔐 Security Features
- JWT (JSON Web Token) based authentication
- BCrypt encryption
- Role-based access control
- CSRF protection
- Stateless session management
- Remember-me functionality

## 🌟 Features
### Authentication
- User registration with email verification
- Secure login with JWT tokens
- Password encryption
- Role-based authorization
- Remember-me functionality

### Restaurant Management
- Restaurant registration and profile management
- Menu item management
- Business hours configuration
- Restaurant search and filtering
- Cuisine type categorization

## 🔧 Configuration
### Database Configuration
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hufds
spring.datasource.username=postgres
spring.datasource.password=admin
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### Connection Pool Configuration
```properties
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.maximum-pool-size=5
```

### JWT Configuration
```properties
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

## 📚 Technologies and Libraries
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Boot Starter Validation
- JWT (jjwt-api, jjwt-impl, jjwt-jackson)
- PostgreSQL
- Lombok
- Spring Boot Test

## 🔄 API Endpoints

### Authentication Endpoints
#### Register(TESTED)
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Description:** Register a new user
- **Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "confirmPassword": "string",
    "fullName": "string",
    "role": "CUSTOMER | RESTAURANT | COURIER | ADMIN",
    "phoneNumber": "string",
    "termsAccepted": boolean
}
```
- **Response:** `201 Created`
```json
{
    "token": "string",
    "email": "string",
    "role": "string",
    "fullName": "string"
}
```

#### Login(TESTED)
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Description:** Authenticate user and return JWT token
- **Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "rememberMe": boolean
}
```
- **Response:** `200 OK`
```json
{
    "token": "string",
    "email": "string",
    "role": "string",
    "fullName": "string"
}
```

### Restaurant Endpoints
#### Get All Restaurants(TESTED)
- **URL:** `/api/restaurants`
- **Method:** `GET`
- **Description:** Get all restaurants
- **Response:** `200 OK`
```json
[
    {
        "id": "number",
        "name": "string",
        "description": "string",
        "cuisineType": "string",
        "rating": "number"
    }
]
```

#### Get Restaurant by ID(TESTED)
- **URL:** `/api/restaurants/{id}`
- **Method:** `GET`
- **Description:** Get restaurant by ID
- **Response:** `200 OK`
```json
{
    "id": "number",
    "name": "string",
    "description": "string",
    "cuisineType": "string",
    "rating": "number"
}
```

#### Search Restaurants(TESTED)
- **URL:** `/api/restaurants/search`
- **Method:** `GET`
- **Description:** Search restaurants by name
- **Query Parameters:** `name`
- **Response:** `200 OK`
```json
[
    {
        "id": "number",
        "name": "string",
        "description": "string",
        "cuisineType": "string",
        "rating": "number"
    }
]
```

#### Get Restaurants by Cuisine(TESTED)
- **URL:** `/api/restaurants/cuisine/{type}`
- **Method:** `GET`
- **Description:** Get restaurants by cuisine type
- **Response:** `200 OK`
```json
[
    {
        "id": "number",
        "name": "string",
        "description": "string",
        "cuisineType": "string",
        "rating": "number"
    }
]
```

#### Create Restaurant(NOT TESTED)
- **URL:** `/api/restaurants`
- **Method:** `POST`
- **Description:** Create a new restaurant
- **Request Body:**
```json
{
    "name": "string",
    "description": "string",
    "cuisineType": "string"
}
```
- **Response:** `201 Created`

#### Update Restaurant(NOT TESTED)
- **URL:** `/api/restaurants/{id}`
- **Method:** `PUT`
- **Description:** Update restaurant information
- **Request Body:**
```json
{
    "name": "string",
    "description": "string",
    "cuisineType": "string"
}
```
- **Response:** `200 OK`

#### Delete Restaurant(NOT TESTED)
- **URL:** `/api/restaurants/{id}`
- **Method:** `DELETE`
- **Description:** Delete a restaurant
- **Response:** `200 OK`

### Error Responses
All endpoints may return the following error responses:

#### 400 Bad Request
```json
{
    "error": "string",
    "details": {
        "field": "error message"
    }
}
```

#### 401 Unauthorized
```json
{
    "error": "Unauthorized",
    "message": "Invalid or expired token"
}
```

#### 403 Forbidden
```json
{
    "error": "Forbidden",
    "message": "Insufficient permissions"
}
```

#### 404 Not Found
```json
{
    "error": "Not Found",
    "message": "Resource not found"
}
```

#### 500 Internal Server Error
```json
{
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
}
```

## 🚀 Development Status
The system currently has basic authentication and user management infrastructure. The main business logic modules related to food ordering and delivery are under development.

## 📦 Project Structure
```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── hufds/
│   │           ├── config/
│   │           ├── controller/
│   │           ├── dto/
│   │           ├── exception/
│   │           ├── model/
│   │           ├── repository/
│   │           ├── security/
│   │           ├── service/
│   │           └── HufdsApplication.java
│   └── resources/
│       └── application.properties
```

## 🛠 Installation and Running

### Requirements
- Java 17 JDK
- Maven 3.6+
- PostgreSQL (for Production)
- H2 Database (for Development)

### Development Environment Setup
1. Clone the project:
```bash
git clone [repository-url]
```

2. Navigate to project directory:
```bash
cd hu-fds
```

3. Install Maven dependencies:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

### Production Environment Setup
1. Configure `application.properties` for production environment
2. Create PostgreSQL database
3. Build and run the application

## 🔒 Security
- All passwords are hashed using BCrypt
- JWT tokens are valid for 24 hours
- Token validity can be extended to 7 days with remember-me feature
- All API endpoints (except auth endpoints) require authentication

## 🤝 Contributing
1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact
Project Manager - [@github_username](https://github.com/github_username)

Project Link: [https://github.com/github_username/hu-fds](https://github.com/github_username/hu-fds)
