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
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    @Autowired
    private GeocodingService geocodingService;
    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);

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
                    
                    // Build courier information if available
                    CustomerOrderDTO.CourierInfoDTO courierDTO = null;
                    if (order.getCourier() != null) {
                        Courier courier = order.getCourier();
                        courierDTO = CustomerOrderDTO.CourierInfoDTO.builder()
                                .courierId(courier.getCourierId())
                                .name(courier.getName())
                                .phoneNumber(courier.getPhoneNumber())
                                .vehicleType(courier.getVehicleType())
                                .build();
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
                            .courier(courierDTO)
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

        log.info("Adding new address for customer {}: street={}, city={}, state={}, zipCode={}, country={}, providedCoordinates=({},{})",
                customer.getCustomerId(), dto.getStreet(), dto.getCity(), dto.getState(), 
                dto.getZipCode(), dto.getCountry(), dto.getLatitude(), dto.getLongitude());

        Address address = new Address();
        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setCountry(dto.getCountry());
        
        // Use geocoding service if coordinates are not provided
        if (dto.getLatitude() == null || dto.getLongitude() == null || 
            dto.getLatitude() == 0.0 || dto.getLongitude() == 0.0) {
            log.info("Using geocoding service to generate coordinates");
            GeocodingService.Coordinates coordinates = geocodingService.geocodeAddress(
                    dto.getStreet(),
                    dto.getCity(),
                    dto.getState(),
                    dto.getZipCode(),
                    dto.getCountry()
            );
            address.setLatitude(coordinates.getLatitude());
            address.setLongitude(coordinates.getLongitude());
            log.info("Geocoding service generated coordinates: ({}, {})", 
                    coordinates.getLatitude(), coordinates.getLongitude());
        } else {
            log.info("Using provided coordinates: ({}, {})", dto.getLatitude(), dto.getLongitude());
            address.setLatitude(BigDecimal.valueOf(dto.getLatitude()));
            address.setLongitude(BigDecimal.valueOf(dto.getLongitude()));
        }
        
        address.setIsDefault(dto.getIsDefault());
        address.setCustomer(customer);

        if (dto.getIsDefault()) {
            customer.getAddresses().forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(customer.getAddresses());
        }

        address = addressRepository.save(address);
        log.info("Saved address with ID {} and coordinates: ({}, {})", 
                address.getAddressId(), address.getLatitude(), address.getLongitude());
        
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

        log.info("Updating address ID {} for customer {}: street={}, city={}, state={}, zipCode={}, country={}, providedCoordinates=({},{})",
                address.getAddressId(), customer.getCustomerId(), dto.getStreet(), dto.getCity(),
                dto.getState(), dto.getZipCode(), dto.getCountry(), dto.getLatitude(), dto.getLongitude());

        address.setStreet(dto.getStreet());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setZipCode(dto.getZipCode());
        address.setCountry(dto.getCountry());
        
        // Use geocoding service if coordinates are not provided
        if (dto.getLatitude() == null || dto.getLongitude() == null || 
            dto.getLatitude() == 0.0 || dto.getLongitude() == 0.0) {
            log.info("Using geocoding service to generate coordinates");
            GeocodingService.Coordinates coordinates = geocodingService.geocodeAddress(
                    dto.getStreet(),
                    dto.getCity(),
                    dto.getState(),
                    dto.getZipCode(),
                    dto.getCountry()
            );
            address.setLatitude(coordinates.getLatitude());
            address.setLongitude(coordinates.getLongitude());
            log.info("Geocoding service generated coordinates: ({}, {})", 
                    coordinates.getLatitude(), coordinates.getLongitude());
        } else {
            log.info("Using provided coordinates: ({}, {})", dto.getLatitude(), dto.getLongitude());
            address.setLatitude(BigDecimal.valueOf(dto.getLatitude()));
            address.setLongitude(BigDecimal.valueOf(dto.getLongitude()));
        }

        // Handle default address status properly
        if (dto.getIsDefault()) {
            // If this address is being set as default, unset all other addresses as default
            customer.getAddresses().forEach(a -> {
                if (!a.getAddressId().equals(address.getAddressId())) {
                    a.setIsDefault(false);
                }
            });
            address.setIsDefault(true);
            log.info("Setting address ID {} as default, unsetting others", address.getAddressId());
        } else {
            // Prevent removing default status if this is the only address
            if (address.getIsDefault() && customer.getAddresses().size() == 1) {
                throw new CustomException("Cannot remove default status from the only address", HttpStatus.BAD_REQUEST);
            }
            
            // If we're removing default status, make sure at least one address is default
            if (address.getIsDefault()) {
                // We need to find another address to make default
                boolean foundNewDefault = false;
                for (Address otherAddress : customer.getAddresses()) {
                    if (!otherAddress.getAddressId().equals(address.getAddressId())) {
                        otherAddress.setIsDefault(true);
                        foundNewDefault = true;
                        log.info("Setting address ID {} as new default", otherAddress.getAddressId());
                        break;
                    }
                }
                
                if (!foundNewDefault) {
                    throw new CustomException("Cannot remove default status without another address to set as default", HttpStatus.BAD_REQUEST);
                }
                
                address.setIsDefault(false);
            }
        }

        // Save all addresses to ensure default status is properly updated
        addressRepository.saveAll(customer.getAddresses());
        log.info("Updated address with ID {} and coordinates: ({}, {})", 
                address.getAddressId(), address.getLatitude(), address.getLongitude());
        return address;
    }

    @Transactional
    public void deleteAddress(Integer addressId) {
        Customer customer = getCurrentProfile();

        Address address = customer.getAddresses().stream()
                .filter(a -> a.getAddressId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new CustomException("Address not found", HttpStatus.NOT_FOUND));

        log.info("Deleting address ID {} for customer {}", addressId, customer.getCustomerId());

        // Cannot delete the only address
        if (customer.getAddresses().size() == 1) {
            throw new CustomException("Cannot delete the only address", HttpStatus.BAD_REQUEST);
        }

        // If we're deleting a default address, we need to make another one default
        if (address.getIsDefault()) {
            // Find another address to make default
            Address newDefaultAddress = customer.getAddresses().stream()
                    .filter(a -> !a.getAddressId().equals(addressId))
                    .findFirst()
                    .orElseThrow(() -> new CustomException("No other address found to set as default", HttpStatus.BAD_REQUEST));
            
            newDefaultAddress.setIsDefault(true);
            log.info("Setting address ID {} as new default after deleting current default", newDefaultAddress.getAddressId());
            addressRepository.save(newDefaultAddress);
        }

        customer.getAddresses().remove(address);
        addressRepository.delete(address);
        customerRepository.save(customer);
        log.info("Successfully deleted address ID {}", addressId);
    }
}
