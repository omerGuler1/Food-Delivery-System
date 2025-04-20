package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "customers")
public class Customer extends User {

    @OneToMany(mappedBy = "customer")
    @JsonManagedReference
    private Set<Address> addresses = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    @JsonManagedReference
    private Set<Order> orders = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    @JsonBackReference
    private Set<Payment> payments = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    @JsonBackReference
    private Set<Review> reviews = new HashSet<>();

    @OneToMany(mappedBy = "customer")
    @JsonManagedReference
    private Set<FavoriteRestaurant> favoriteRestaurants = new HashSet<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        setRole(UserRole.CUSTOMER);
    }
}
