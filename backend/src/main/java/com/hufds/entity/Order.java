package com.hufds.entity;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "orders") // Using "orders" since "order" is a reserved word in SQL
@JsonIgnoreProperties({"customer.addresses", "address.customer", "restaurant.businessHours"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference(value = "order-customer")
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonBackReference(value = "restaurant-orders")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "courier_id")
    @JsonBackReference(value = "courier-orders")
    private Courier courier;

    @ManyToOne
    @JoinColumn(name = "address_id", nullable = false)
    @JsonBackReference(value = "order-address")
    private Address address;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(length = 30, nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime deliveredAt;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "order-payment")
    private Payment payment;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference(value = "order-items")
    private Set<OrderItem> orderItems = new HashSet<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference(value = "order-assignments")
    private Set<CourierAssignment> courierAssignments = new HashSet<>();

    public enum OrderStatus {
        PENDING, PROCESSING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = OrderStatus.PENDING;
        }
    }
} 