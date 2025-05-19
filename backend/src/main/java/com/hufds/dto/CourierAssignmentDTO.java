package com.hufds.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CourierAssignmentDTO {
    private Integer assignmentId;
    private String status;
    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private OrderSummaryDTO order;

    @Data
    @Builder
    public static class OrderSummaryDTO {
    private Integer orderId;
        private String status;
        private RestaurantSummaryDTO restaurant;
        private AddressSummaryDTO address;
        private CustomerSummaryDTO customer;
        private Double totalPrice;
        private LocalDateTime createdAt;
        private LocalDateTime deliveredAt;
    }

    @Data
    @Builder
    public static class RestaurantSummaryDTO {
        private Integer restaurantId;
        private String name;
        private String phoneNumber;
        private String cuisineType;
    }

    @Data
    @Builder
    public static class AddressSummaryDTO {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Data
    @Builder
    public static class CustomerSummaryDTO {
        private Integer customerId;
        private String name;
        private String phoneNumber;
    }
} 