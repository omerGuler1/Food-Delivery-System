# HU-FDS API Usage Guide

This document provides example cURL requests for two critical use cases in the Hungry Users Food Delivery System.

---

## 1. Restaurant Menu Management

### 1.1 Add a New Menu Item

```bash
curl -X POST http://localhost:8080/api/restaurant/1/menu-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kremalı Makarna",
    "description": "Kremalı tavuklu makarna",
    "price": 49.99,
    "availability": true
  }'
```

### 1.2 List All Menu Items

```bash
curl -X GET http://localhost:8080/api/restaurant/1/menu-items
```

### 1.3 Update a Menu Item

```bash
curl -X PUT http://localhost:8080/api/restaurant/1/menu-items/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kremalı Makarna",
    "description": "Kremalı, baharatlı tavuklu makarna",
    "price": 20.99,
    "availability": true
  }'
```

### 1.4 Delete a Menu Item

```bash
curl -X DELETE http://localhost:8080/api/restaurant/1/menu-items/2
```

---

## 2. Order Management

### 2.1 Place a New Order

```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "restaurantId": 1,
    "addressId": 1,
    "items": [
      { "menuItemId": 1, "quantity": 2 },
      { "menuItemId": 3, "quantity": 1 }
    ]
  }'
```

### 2.2 Get an Order by ID

```bash
curl -X GET http://localhost:8080/api/orders/1
```

### 2.3 Cancel an Order (Only if status is PENDING)

```bash
curl -X PUT http://localhost:8080/api/orders/1/cancel
```