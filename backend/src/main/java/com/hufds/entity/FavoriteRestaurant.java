package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
public class FavoriteRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favorite_id")
    private Integer favoriteId;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_favorite_restaurant"))
    @JsonBackReference
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference
    private Customer customer;


    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
