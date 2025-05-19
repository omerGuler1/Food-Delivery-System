package com.hufds.service;

import com.hufds.dto.*;
import com.hufds.entity.*;
import com.hufds.exception.CustomException;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public Customer getCurrentProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;

        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String stringEmail) {
            email = stringEmail;
        } else {
            throw new CustomException("Not authenticated", HttpStatus.UNAUTHORIZED);
        }

        return customerRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new CustomException("User not found or account is deleted", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public void softDeleteAccount(AccountDeletionDTO deletionDTO) {
        Customer currentUser = getCurrentProfile();

        if (!currentUser.getCustomerId().equals(deletionDTO.getUserId())) {
            throw new CustomException("User ID mismatch", HttpStatus.FORBIDDEN);
        }

        if (!Boolean.TRUE.equals(deletionDTO.getConfirmation())) {
            throw new CustomException("Account deletion must be confirmed", HttpStatus.BAD_REQUEST);
        }

        currentUser.setDeletedAt(LocalDateTime.now());
        customerRepository.save(currentUser);
    }

    @Transactional
    public Customer updateProfile(ProfileUpdateDTO dto) {
        Customer customer = getCurrentProfile();

        if (dto.getEmail() != null && !dto.getEmail().equals(customer.getEmail())) {
            Optional<Customer> existing = customerRepository.findByEmail(dto.getEmail());
            if (existing.isPresent() && !existing.get().getCustomerId().equals(customer.getCustomerId())) {
                throw new CustomException("Email is already in use", HttpStatus.CONFLICT);
            }
            customer.setEmail(dto.getEmail());
        }

        if (dto.getName() != null && !dto.getName().isBlank()) {
            customer.setName(dto.getName());
        }

        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isBlank()) {
            customer.setPhoneNumber(dto.getPhoneNumber());
        }

        return customerRepository.save(customer);
    }

    @Transactional
    public void updatePassword(PasswordUpdateDTO dto) {
        Customer customer = getCurrentProfile();

        if (!passwordEncoder.matches(dto.getCurrentPassword(), customer.getPassword())) {
            throw new CustomException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new CustomException("New password and confirmation do not match", HttpStatus.BAD_REQUEST);
        }

        customer.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        customerRepository.save(customer);
    }

    public Set<Address> getCurrentUserAddresses() {
        return getCurrentProfile().getAddresses();
    }

    public Set<CustomerOrderDTO> getCurrentUserOrders() {
        Customer customer = getCurrentProfile();
        return customer.getOrders().stream()
                .filter(order -> order.getRestaurant() != null && order.getAddress() != null)
                .map(order -> {
                    CustomerOrderDTO.PaymentDTO paymentDTO = null;
                    if (order.getPayment() != null) {
                        Payment payment = order.getPayment();
                        paymentDTO = CustomerOrderDTO.PaymentDTO.builder()
                                .paymentId(payment.getPaymentId())
                                .paymentMethod(payment.getMethod().toString())
                                .paymentStatus(payment.getStatus().toString())
                                .paymentDate(payment.getPaidAt())
                                .build();
                    }

                    // Defensive: skip if restaurant or address is null (should not happen, but for safety)
                    if (order.getRestaurant() == null || order.getAddress() == null) {
                        // Optionally log this situation
                        return null;
                    }

                    return CustomerOrderDTO.builder()
                            .orderId(order.getOrderId())
                            .status(order.getStatus())
                            .totalPrice(order.getTotalPrice())
                            .createdAt(order.getCreatedAt())
                            .deliveredAt(order.getDeliveredAt())
                            .restaurant(RestaurantSummaryDTO.builder()
                                    .restaurantId(order.getRestaurant().getRestaurantId())
                                    .name(order.getRestaurant().getName())
                                    .phoneNumber(order.getRestaurant().getPhoneNumber())
                                    .cuisineType(order.getRestaurant().getCuisineType())
                                    .build())
                            .address(order.getAddress() != null ? AddressSummaryDTO.builder()
                                    .street(order.getAddress().getStreet())
                                    .city(order.getAddress().getCity())
                                    .state(order.getAddress().getState())
                                    .zipCode(order.getAddress().getZipCode())
                                    .country(order.getAddress().getCountry())
                                    .build() : null)
                            .orderItems(order.getOrderItems().stream()
                                    .map(item -> OrderItemDTO.builder()
                                            .itemId(item.getOrderItemId())
                                            .menuItem(item.getMenuItem() != null ? MenuItemSummaryDTO.builder()
                                                      .menuItemId(item.getMenuItem().getMenuItemId())
                                                      .name(item.getMenuItem().getName())
                                                      .price(item.getMenuItem().getPrice() != null ? item.getMenuItem().getPrice().doubleValue() : 0.0)
                                                      .build() : null)
                                            .quantity(item.getQuantity())
                                            .subtotal(item.getSubtotal() != null ? item.getSubtotal().doubleValue() : 0.0)
                                            .build())
                                    .collect(Collectors.toSet()))
                            .payment(paymentDTO)
                            .build();
                })
                .filter(dto -> dto != null) // Remove any nulls from skipped orders
                .collect(Collectors.toSet());
    }

    @Transactional
    public Address addAddress(AddressDTO dto) {
        Customer customer = getCurrentProfile();

        Address address = new Address();
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setCountry(dto.getCountry());
        address.setLatitude(dto.getLatitude() != null ? BigDecimal.valueOf(dto.getLatitude()) : null);
        address.setLongitude(dto.getLongitude() != null ? BigDecimal.valueOf(dto.getLongitude()) : null);
        address.setIsDefault(dto.getIsDefault());
        address.setCustomer(customer);

        if (dto.getIsDefault()) {
            customer.getAddresses().forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(customer.getAddresses());
        }

        address = addressRepository.save(address);
        customer.getAddresses().add(address);
        customerRepository.save(customer);
        return address;
    }

    @Transactional
    public Address updateAddress(AddressDTO dto) {
        Customer customer = getCurrentProfile();

        Address address = customer.getAddresses().stream()
                .filter(a -> a.getAddressId().equals(dto.getAddressId()))
                .findFirst()
                .orElseThrow(() -> new CustomException("Address not found", HttpStatus.NOT_FOUND));

        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setCountry(dto.getCountry());
        address.setLatitude(dto.getLatitude() != null ? BigDecimal.valueOf(dto.getLatitude()) : null);
        address.setLongitude(dto.getLongitude() != null ? BigDecimal.valueOf(dto.getLongitude()) : null);

        if (dto.getIsDefault() && !address.getIsDefault()) {
            customer.getAddresses().forEach(a -> a.setIsDefault(false));
            address.setIsDefault(true);
        } else if (!dto.getIsDefault() && address.getIsDefault()) {
            if (customer.getAddresses().size() == 1) {
                throw new CustomException("Cannot remove default status from the only address", HttpStatus.BAD_REQUEST);
            }
            address.setIsDefault(false);
        }

        customerRepository.save(customer);
        return address;
    }

    @Transactional
    public void deleteAddress(Integer addressId) {
        Customer customer = getCurrentProfile();

        Address address = customer.getAddresses().stream()
                .filter(a -> a.getAddressId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new CustomException("Address not found", HttpStatus.NOT_FOUND));

        if (address.getIsDefault() && customer.getAddresses().size() == 1) {
            throw new CustomException("Cannot delete the only default address", HttpStatus.BAD_REQUEST);
        }

        customer.getAddresses().remove(address);
        addressRepository.delete(address);
        customerRepository.save(customer);
    }
}
