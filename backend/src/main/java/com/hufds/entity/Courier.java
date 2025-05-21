package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courier")
@JsonIgnoreProperties({"orders.customer.addresses", "orders.address.customer", "orders.restaurant.businessHours"})
public class Courier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "courier_id")
    private Integer courierId;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 255, nullable = false, unique = true)
    private String email;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CourierStatus status = CourierStatus.UNAVAILABLE;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal earnings = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @OneToMany(mappedBy = "courier")
    @JsonBackReference(value = "courier-orders")
    private Set<Order> orders;

    @OneToMany(mappedBy = "courier")
    @JsonManagedReference(value = "courier-assignments")
    private Set<CourierAssignment> assignments;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum CourierStatus {
        AVAILABLE, UNAVAILABLE
    }

    public enum ApprovalStatus {
        PENDING, ACCEPTED, REJECTED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
