package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restaurant")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_id")
    private Integer restaurantId;

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

    // Address fields
    @Column(length = 255)
    private String street;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String zipCode;

    @Column(length = 100)
    private String country;

    @Column(precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Relationships
    @OneToMany(mappedBy = "restaurant")
    @JsonManagedReference
    private Set<MenuItem> menuItems;

    @OneToMany(mappedBy = "restaurant")
    @JsonManagedReference
    private Set<BusinessHours> businessHours;

    @OneToMany(mappedBy = "restaurant")
    @JsonBackReference
    private Set<Order> orders;

    @OneToMany(mappedBy = "restaurant")
    @JsonManagedReference
    private Set<FavoriteRestaurant> favoritedByCustomers;

}
