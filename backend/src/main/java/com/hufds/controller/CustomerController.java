package com.hufds.controller;

import com.hufds.dto.CustomerListDTO;
import com.hufds.entity.Customer;
import com.hufds.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping
    public ResponseEntity<List<CustomerListDTO>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        List<CustomerListDTO> customerDTOs = customers.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(customerDTOs);
    }

    private CustomerListDTO mapToDTO(Customer customer) {
        return CustomerListDTO.builder()
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())
                .createdAt(customer.getCreatedAt() != null ? customer.getCreatedAt().format(formatter) : null)
                .build();
    }
} 