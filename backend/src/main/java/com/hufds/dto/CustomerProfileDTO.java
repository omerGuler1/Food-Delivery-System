package com.hufds.dto;

import com.hufds.entity.Customer;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class CustomerProfileDTO {
    private Integer customerId;
    private String name;
    private String email;
    private String phoneNumber;
    private List<AddressDTO> addresses;
    private List<OrderSummaryDTO> orders;

    public static CustomerProfileDTO fromEntity(Customer customer) {
        return CustomerProfileDTO.builder()
            .customerId(customer.getCustomerId())
            .name(customer.getName())
            .email(customer.getEmail())
            .phoneNumber(customer.getPhoneNumber())
            .addresses(customer.getAddresses().stream()
                .map(AddressDTO::fromEntity)
                .collect(Collectors.toList()))
            .orders(customer.getOrders().stream()
                .map(OrderSummaryDTO::fromEntity)
                .collect(Collectors.toList()))
            .build();
    }
} 