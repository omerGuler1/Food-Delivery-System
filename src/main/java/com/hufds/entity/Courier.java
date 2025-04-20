package com.hufds.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "couriers")
public class Courier extends User {

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CourierStatus status = CourierStatus.UNAVAILABLE;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal earnings = BigDecimal.ZERO;

    @OneToMany(mappedBy = "courier")
    @JsonManagedReference
    private Set<Order> orders;

    @OneToMany(mappedBy = "courier")
    @JsonManagedReference
    private Set<CourierAssignment> assignments;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum CourierStatus {
        AVAILABLE, UNAVAILABLE
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        setRole(UserRole.COURIER);
    }
}
