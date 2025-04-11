package com.hufds.service;

import com.hufds.dto.ProfileUpdateDTO;
import com.hufds.dto.PasswordUpdateDTO;
import com.hufds.entity.Customer;
import com.hufds.entity.Address;
import com.hufds.entity.Order;
import com.hufds.exception.CustomException;
import com.hufds.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public Customer getCurrentProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return customerRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        }
        throw new CustomException("Not authenticated", HttpStatus.UNAUTHORIZED);
    }

    @Transactional
    public Customer updateProfile(ProfileUpdateDTO profileUpdateDTO) {
        Customer customer = getCurrentProfile();
        // Check if email is already taken
        Optional<Customer> existingCustomer = customerRepository.findByEmail(profileUpdateDTO.getEmail());
        if (existingCustomer.isPresent() && !existingCustomer.get().getCustomerId().equals(customer.getCustomerId())) {
            throw new CustomException("Email is already in use", HttpStatus.CONFLICT);
        }
        
        customer.setName(profileUpdateDTO.getName());
        customer.setEmail(profileUpdateDTO.getEmail());
        customer.setPhoneNumber(profileUpdateDTO.getPhoneNumber());
        return customerRepository.save(customer);
    }

    @Transactional
    public void updatePassword(PasswordUpdateDTO passwordUpdateDTO) {
        Customer customer = getCurrentProfile();
        
        // Validate current password
        if (!passwordEncoder.matches(passwordUpdateDTO.getCurrentPassword(), customer.getPassword())) {
            throw new CustomException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }
        
        // Validate new password matches confirmation
        if (!passwordUpdateDTO.getNewPassword().equals(passwordUpdateDTO.getConfirmPassword())) {
            throw new CustomException("New password and confirmation do not match", HttpStatus.BAD_REQUEST);
        }

        // Update password
        customer.setPassword(passwordEncoder.encode(passwordUpdateDTO.getNewPassword()));
        customerRepository.save(customer);
    }

    public Set<Address> getCurrentUserAddresses() {
        return getCurrentProfile().getAddresses();
    }

    public Set<Order> getCurrentUserOrders() {
        return getCurrentProfile().getOrders();
    }
} 