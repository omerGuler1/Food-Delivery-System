package com.hufds.service.impl;

import com.hufds.dto.*;
import com.hufds.entity.*;
import com.hufds.exception.CustomException;
import com.hufds.repository.CustomerRepository;
import com.hufds.service.IProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProfileServiceImpl implements IProfileService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public CustomerProfileDTO getCurrentProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRepository.findByEmailAndDeletedAtIsNull(email)
            .orElseThrow(() -> new CustomException("User not found or account is deleted", HttpStatus.NOT_FOUND));
        return CustomerProfileDTO.fromEntity(customer);
    }

    private Customer getCurrentCustomer() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return customerRepository.findByEmailAndDeletedAtIsNull(email)
            .orElseThrow(() -> new CustomException("User not found or account is deleted", HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional
    public void softDeleteAccount(AccountDeletionDTO deletionDTO) {
        Customer customer = getCurrentCustomer();
        if (!customer.getCustomerId().equals(deletionDTO.getUserId())) {
            throw new CustomException("Unauthorized account deletion attempt", HttpStatus.FORBIDDEN);
        }
        customer.setDeletedAt(java.time.LocalDateTime.now());
        customerRepository.save(customer);
    }

    @Override
    @Transactional
    public CustomerProfileDTO updateProfile(ProfileUpdateDTO dto) {
        Customer customer = getCurrentCustomer();
        if (dto.getEmail() != null && !dto.getEmail().equals(customer.getEmail())) {
            if (customerRepository.findByEmail(dto.getEmail()).isPresent()) {
                throw new CustomException("Email already in use", HttpStatus.CONFLICT);
            }
            customer.setEmail(dto.getEmail());
        }
        if (dto.getName() != null) {
            customer.setName(dto.getName());
        }
        if (dto.getPhoneNumber() != null) {
            customer.setPhoneNumber(dto.getPhoneNumber());
        }
        return CustomerProfileDTO.fromEntity(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void updatePassword(PasswordUpdateDTO dto) {
        Customer customer = getCurrentCustomer();
        if (!passwordEncoder.matches(dto.getCurrentPassword(), customer.getPassword())) {
            throw new CustomException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }
        customer.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        customerRepository.save(customer);
    }

    @Override
    public List<AddressDTO> getCurrentUserAddresses() {
        Customer customer = getCurrentCustomer();
        return customer.getAddresses().stream()
            .map(AddressDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public List<OrderSummaryDTO> getCurrentUserOrders() {
        Customer customer = getCurrentCustomer();
        return customer.getOrders().stream()
            .map(OrderSummaryDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressDTO addAddress(AddressDTO dto) {
        Customer customer = getCurrentCustomer();
        Address address = new Address();
        address.setCustomer(customer);
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setCountry(dto.getCountry());
        address.setLatitude(dto.getLatitude() != null ? new java.math.BigDecimal(dto.getLatitude().toString()) : null);
        address.setLongitude(dto.getLongitude() != null ? new java.math.BigDecimal(dto.getLongitude().toString()) : null);
        address.setIsDefault(dto.getIsDefault());
        customer.getAddresses().add(address);
        return AddressDTO.fromEntity(customerRepository.save(customer).getAddresses().stream()
            .filter(a -> a.getStreet().equals(dto.getStreet()) && a.getCity().equals(dto.getCity()))
            .findFirst()
            .orElseThrow(() -> new CustomException("Failed to save address", HttpStatus.INTERNAL_SERVER_ERROR)));
    }

    @Override
    @Transactional
    public AddressDTO updateAddress(AddressDTO dto) {
        Customer customer = getCurrentCustomer();
        Address address = customer.getAddresses().stream()
            .filter(a -> a.getAddressId().equals(dto.getAddressId()))
            .findFirst()
            .orElseThrow(() -> new CustomException("Address not found", HttpStatus.NOT_FOUND));
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setCountry(dto.getCountry());
        address.setLatitude(dto.getLatitude() != null ? new java.math.BigDecimal(dto.getLatitude().toString()) : null);
        address.setLongitude(dto.getLongitude() != null ? new java.math.BigDecimal(dto.getLongitude().toString()) : null);
        address.setIsDefault(dto.getIsDefault());
        return AddressDTO.fromEntity(customerRepository.save(customer).getAddresses().stream()
            .filter(a -> a.getAddressId().equals(dto.getAddressId()))
            .findFirst()
            .orElseThrow(() -> new CustomException("Failed to update address", HttpStatus.INTERNAL_SERVER_ERROR)));
    }

    @Override
    @Transactional
    public void deleteAddress(Integer addressId) {
        Customer customer = getCurrentCustomer();
        Address address = customer.getAddresses().stream()
            .filter(a -> a.getAddressId().equals(addressId))
            .findFirst()
            .orElseThrow(() -> new CustomException("Address not found", HttpStatus.NOT_FOUND));
        customer.getAddresses().remove(address);
        customerRepository.save(customer);
    }
} 