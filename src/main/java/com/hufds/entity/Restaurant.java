package com.hufds.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity
@Table(name = "restaurant")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_id")
    private Long restaurantId;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 255, nullable = false, unique = true)
    private String email;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "cuisine_type", length = 50)
    private String cuisineType;

    @Column(nullable = false)
    private float rating = 0f;

    @Column(name = "delivery_range_km")
    private Integer deliveryRangeKm;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "restaurant")
    private Set<MenuItem> menuItems;

    @OneToMany(mappedBy = "restaurant")
    private Set<BusinessHours> businessHours;

    @OneToMany(mappedBy = "restaurant")
    private Set<Order> orders;
}
