# 🍽️ Hungry Users Food Delivery System (HU-FDS)

This project is a backend system for a food delivery application built with **Java Spring Boot** and **PostgreSQL**. It allows restaurants to manage their food menu through full CRUD operations.

---

## 🔧 Use Case Implemented: Restaurant Manage Menu Item (Crit-UC-1)

This use-case allows **restaurant users** to:

- ✅ Add Food to Menu
- ✅ List All Menu Items
- ✅ Update Existing Menu Items
- ✅ Delete Menu Items

---

## 🧩 Tech Stack

- **Backend**: Spring Boot (Java 17+)
- **Database**: PostgreSQL
- **ORM**: Hibernate / JPA
- **Build Tool**: Maven
- **API Testing**: Postman / Curl

---

## 📂 Project Structure

```plaintext
src/main/java/com/hufds
│
├── controller/
│   └── MenuItemController.java
│
├── service/
│   └── MenuItemService.java
│
├── repository/
│   ├── MenuItemRepository.java
│   └── RestaurantRepository.java
│
├── dto/
│   ├── CreateMenuItemDTO.java
│   └── UpdateMenuItemDTO.java
│
├── entity/
│   ├── MenuItem.java
│   └── Restaurant.java
│    └── 
```

---

## 🔗 API Endpoints

All endpoints require the `restaurant_id` as a path variable.

### ➕ Add a Menu Item
```http
POST /api/restaurant/{restaurantId}/menu-items
```
**Body:**
```json
{
  "name": "Pizza Margherita",
  "description": "Classic with tomato and mozzarella",
  "price": 11.99,
  "availability": true
}
```

---

### 📄 List All Menu Items
```http
GET /api/restaurant/{restaurantId}/menu-items
```

---

### ✏️ Update a Menu Item
```http
PUT /api/restaurant/{restaurantId}/menu-items/{menuItemId}
```
**Body:**
```json
{
  "name": "Updated Pizza",
  "description": "Updated description",
  "price": 12.49,
  "availability": false
}
```

---

### ❌ Delete a Menu Item
```http
DELETE /api/restaurant/{restaurantId}/menu-items/{menuItemId}
```

---

## 🗃️ Sample SQL for Restaurant Setup

To test the menu item features, insert a test restaurant manually:

```sql
INSERT INTO restaurant (
    name, email, password, phone_number, cuisine_type, delivery_range_km,
    street, city, state, zip_code, country, latitude, longitude
) VALUES (
    'Testaurant', 'testaurant@example.com', 'hashedpassword', '555-1234',
    'Pizza', 5, '123 Main St', 'Testville', 'TestState', '12345', 'Testland',
    39.9334, 32.8597
);
```

---

## 📌 Notes

- Ensure `restaurant_id` exists before testing the menu item endpoints.
- All data is persisted using JPA and mapped to PostgreSQL tables.
- Responses currently return full entity objects — in production, use DTOs to limit exposure.

---

## 🚀 Getting Started

```bash
# 1. Build and run the project
./mvnw spring-boot:run

# 2. Hit endpoints via Postman or Curl
```

