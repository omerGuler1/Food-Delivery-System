package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "review")
@JsonIgnoreProperties({"customer.orders", "customer.payments", "customer.reviews", "customer.favoriteRestaurants"})
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Integer reviewId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference(value = "customer-reviews")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference(value = "order-reviews")
    private Order order;

    // This is a manual reference — application logic will decide what it points to
    @Column(name = "target_id", nullable = false)
    private Integer targetId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ReviewRole role;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column
    private LocalDateTime respondedAt;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum ReviewRole {
        RESTAURANT, COURIER
    }

    @PrePersist
    protected void onCreate() {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        createdAt = LocalDateTime.now();
    }
} 