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
@Table(name = "courierassignment")
public class CourierAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Integer assignmentId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    @ManyToOne
    @JoinColumn(name = "courier_id")
    @JsonBackReference
    private Courier courier;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private AssignmentStatus status = AssignmentStatus.REQUESTED;

    public enum AssignmentStatus {
        REQUESTED,    // Initial state when restaurant requests a courier
        ACCEPTED,     // Courier has accepted the request
        REJECTED,     // Courier has rejected the request
        ASSIGNED,     // Courier is assigned and ready for pickup
        PICKED_UP,    // Courier has picked up the order
        DELIVERED,    // Order has been delivered
        CANCELLED     // Assignment was cancelled
    }

    @PrePersist
    protected void onAssign() {
        assignedAt = LocalDateTime.now();
    }
}
