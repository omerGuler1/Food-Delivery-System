package com.hufds.service.impl;

import com.hufds.dto.CustomerLoginDTO;
import com.hufds.dto.CustomerRegisterDTO;
import com.hufds.dto.CustomerResponseDTO;
import com.hufds.entity.Customer;
import com.hufds.exception.CustomException;
import com.hufds.repository.CustomerRepository;
import com.hufds.service.CustomerAuthService;
import com.hufds.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerAuthServiceImpl implements CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public CustomerResponseDTO register(CustomerRegisterDTO registerDTO) {
        // Check if email already exists
        customerRepository.findByEmail(registerDTO.getEmail()).ifPresent(c -> {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT);
        });

        // Create new customer
        Customer customer = new Customer();
        customer.setName(registerDTO.getName());
        customer.setEmail(registerDTO.getEmail());
        customer.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        customer.setPhoneNumber(registerDTO.getPhoneNumber());

        Customer savedCustomer = customerRepository.save(customer);

        // Generate JWT
        String token = jwtService.generateToken(savedCustomer.getEmail(), savedCustomer.getCustomerId(), "customer");

        return CustomerResponseDTO.builder()
                .token(token)
                .customerId(savedCustomer.getCustomerId())
                .name(savedCustomer.getName())
                .email(savedCustomer.getEmail())
                .phoneNumber(savedCustomer.getPhoneNumber())
                .build();
    }

    @Override
    public CustomerResponseDTO login(CustomerLoginDTO loginDTO) {
        Customer customer = customerRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(loginDTO.getPassword(), customer.getPassword())) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(customer.getEmail(), customer.getCustomerId(), "customer");

        return CustomerResponseDTO.builder()
                .token(token)
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())
                .build();
    }
} 