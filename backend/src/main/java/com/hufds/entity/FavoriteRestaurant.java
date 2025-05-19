package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "favoriterestaurant", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"customer_id", "restaurant_id"})
})
@JsonIgnoreProperties({"restaurant.menuItems", "restaurant.orders", "restaurant.businessHours", "restaurant.favoritedByCustomers", "customer.orders", "customer.payments", "customer.reviews", "customer.favoriteRestaurants"})
public class FavoriteRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favorite_id")
    private Integer favoriteId;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_favorite_restaurant"))
    @JsonBackReference(value = "favorite-restaurant")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference(value = "favorite-customer")
    private Customer customer;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
