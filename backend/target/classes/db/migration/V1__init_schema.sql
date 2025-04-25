-- ============================================
-- Hungry Users Food Delivery System (HU-FDS)
-- Database Schema Setup Script
-- ============================================

-- ===========================
-- Customer & Address
-- ===========================

CREATE TABLE Customer (
                          customer_id SERIAL PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          email VARCHAR(255) UNIQUE NOT NULL,
                          password VARCHAR(255) NOT NULL,
                          phone_number VARCHAR(20),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          deleted_at TIMESTAMP NULL
);

CREATE TABLE Address (
                         address_id SERIAL PRIMARY KEY,
                         customer_id INT,
                         street VARCHAR(255),
                         city VARCHAR(100),
                         state VARCHAR(100),
                         zip_code VARCHAR(20),
                         country VARCHAR(100),
                         latitude DECIMAL(10,6),
                         longitude DECIMAL(10,6),
                         is_default BOOLEAN DEFAULT FALSE,
                         FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
                             ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================
-- Courier
-- ===========================

CREATE TABLE Courier (
                         courier_id SERIAL PRIMARY KEY,
                         name VARCHAR(100) NOT NULL,
                         email VARCHAR(255) UNIQUE NOT NULL,
                         password VARCHAR(255) NOT NULL,
                         phone_number VARCHAR(20),
                         vehicle_type VARCHAR(50),
                         status VARCHAR(20) CHECK (status IN ('Available', 'Unavailable')),
                         earnings DECIMAL(10,2) DEFAULT 0,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         deleted_at TIMESTAMP NULL
);

-- ===========================
-- Restaurant, Menu, Hours
-- ===========================

CREATE TABLE Restaurant (
                            restaurant_id SERIAL PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            email VARCHAR(255) UNIQUE NOT NULL,
                            password VARCHAR(255) NOT NULL,
                            phone_number VARCHAR(20),
                            cuisine_type VARCHAR(50),
                            rating FLOAT DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
                            delivery_range_km INT,
                            street VARCHAR(255),
                            city VARCHAR(100),
                            state VARCHAR(100),
                            zip_code VARCHAR(20),
                            country VARCHAR(100),
                            latitude DECIMAL(10,6),
                            longitude DECIMAL(10,6),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            deleted_at TIMESTAMP NULL
);

CREATE TABLE BusinessHours (
                               hours_id SERIAL PRIMARY KEY,
                               restaurant_id INT,
                               day_of_week VARCHAR(10) CHECK (day_of_week IN
                                                              ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
                               open_time TIME,
                               close_time TIME,
                               is_closed BOOLEAN,
                               FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id)
                                   ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE menuitem (
    menu_item_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL,
    category VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================
-- Orders & Related Tables
-- ===========================

CREATE TABLE Orders (
                        order_id SERIAL PRIMARY KEY,
                        customer_id INT,
                        restaurant_id INT,
                        courier_id INT NULL,
                        address_id INT,
                        total_price DECIMAL(10,2),
                        status VARCHAR(30) CHECK (status IN ('PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        delivered_at TIMESTAMP NULL,
                        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
                            ON DELETE SET NULL ON UPDATE CASCADE,
                        FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id)
                            ON DELETE SET NULL ON UPDATE CASCADE,
                        FOREIGN KEY (courier_id) REFERENCES Courier(courier_id)
                            ON DELETE SET NULL ON UPDATE CASCADE,
                        FOREIGN KEY (address_id) REFERENCES Address(address_id)
                            ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE OrderItem (
                           order_item_id SERIAL PRIMARY KEY,
                           order_id INT,
                           menu_item_id INT,
                           quantity INT NOT NULL CHECK (quantity > 0),
                           subtotal DECIMAL(10,2),
                           UNIQUE (order_id, menu_item_id),
                           FOREIGN KEY (order_id) REFERENCES Orders(order_id)
                               ON DELETE CASCADE ON UPDATE CASCADE,
                           FOREIGN KEY (menu_item_id) REFERENCES MenuItem(menu_item_id)
                               ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE CourierAssignment (
                                   assignment_id SERIAL PRIMARY KEY,
                                   order_id INT,
                                   courier_id INT,
                                   assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   picked_up_at TIMESTAMP NULL,
                                   delivered_at TIMESTAMP NULL,
                                   status VARCHAR(20) CHECK (status IN ('Assigned', 'Picked Up', 'Delivered', 'Cancelled')),
                                   FOREIGN KEY (order_id) REFERENCES Orders(order_id)
                                       ON DELETE CASCADE ON UPDATE CASCADE,
                                   FOREIGN KEY (courier_id) REFERENCES Courier(courier_id)
                                       ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Payment (
                         payment_id SERIAL PRIMARY KEY,
                         order_id INT UNIQUE,
                         customer_id INT,
                         amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
                         method VARCHAR(30) CHECK (method IN ('Credit Card', 'Cash on Delivery')),
                         status VARCHAR(20) CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
                         transaction_id VARCHAR(255) NULL,
                         paid_at TIMESTAMP NULL,
                         FOREIGN KEY (order_id) REFERENCES Orders(order_id)
                             ON DELETE CASCADE ON UPDATE CASCADE,
                         FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
                             ON DELETE SET NULL ON UPDATE CASCADE
);

-- ===========================
-- Reviews & Admin
-- ===========================

CREATE TABLE Review (
                        review_id SERIAL PRIMARY KEY,
                        customer_id INT,
                        target_id INT NOT NULL,
                        role VARCHAR(20) CHECK (role IN ('Courier', 'Restaurant')),
                        rating INT CHECK (rating BETWEEN 1 AND 5),
                        comment TEXT,
                        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE SET NULL ON UPDATE CASCADE
    -- Note: target_id is polymorphic and must be resolved at application level
);

CREATE TABLE AdminUser (
                           admin_id SERIAL PRIMARY KEY,
                           name VARCHAR(100) NOT NULL,
                           email VARCHAR(255) UNIQUE NOT NULL,
                           password VARCHAR(255) NOT NULL,
                           phone_number VARCHAR(20),
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           deleted_at TIMESTAMP NULL
);

CREATE TABLE FavoriteRestaurant (
                                    favorite_id SERIAL PRIMARY KEY,
                                    customer_id INT NOT NULL,
                                    restaurant_id INT NOT NULL,
                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
                                    FOREIGN KEY (restaurant_id) REFERENCES Restaurant(restaurant_id)
                                        ON DELETE CASCADE ON UPDATE CASCADE,
                                    UNIQUE (customer_id, restaurant_id) -- prevents duplicates
);


-- ===========================
-- End of Schema
-- ===========================
