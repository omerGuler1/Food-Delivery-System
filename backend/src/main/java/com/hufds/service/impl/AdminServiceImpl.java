package com.hufds.service.impl;

import com.hufds.dto.AdminEditCourierDTO;
import com.hufds.dto.AdminEditCustomerDTO;
import com.hufds.dto.AdminEditRestaurantDTO;
import com.hufds.entity.Courier;
import com.hufds.entity.Customer;
import com.hufds.entity.Restaurant;
import com.hufds.exception.CustomException;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.CustomerRepository;
import com.hufds.repository.RestaurantRepository;
import com.hufds.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final CustomerRepository customerRepository;
    private final RestaurantRepository restaurantRepository;
    private final CourierRepository courierRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public boolean deleteCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));
        
        // Soft delete - set deletedAt timestamp
        customer.setDeletedAt(LocalDateTime.now());
        customerRepository.save(customer);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteRestaurant(Integer restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));
        
        // Soft delete - set deletedAt timestamp
        restaurant.setDeletedAt(LocalDateTime.now());
        restaurantRepository.save(restaurant);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteCourier(Integer courierId) {
        Courier courier = courierRepository.findById(courierId)
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));
        
        // Soft delete - set deletedAt timestamp
        courier.setDeletedAt(LocalDateTime.now());
        courierRepository.save(courier);
        return true;
    }

    @Override
    public List<Customer> getAllActiveCustomers() {
        return customerRepository.findAllByDeletedAtIsNull();
    }

    @Override
    public List<Restaurant> getAllActiveRestaurants() {
        return restaurantRepository.findAllByDeletedAtIsNull();
    }

    @Override
    public List<Courier> getAllActiveCouriers() {
        return courierRepository.findAllByDeletedAtIsNull();
    }

    @Override
    @Transactional
    public Customer editCustomer(AdminEditCustomerDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new CustomException("Customer not found", HttpStatus.NOT_FOUND));
        
        // Eğer email değiştirilmek isteniyorsa ve başka bir kullanıcı bu emaili kullanmıyorsa, değişikliğe izin ver
        if (dto.getEmail() != null && !dto.getEmail().equals(customer.getEmail())) {
            Optional<Customer> existingCustomer = customerRepository.findByEmail(dto.getEmail());
            if (existingCustomer.isPresent()) {
                throw new CustomException("Email is already in use by another customer", HttpStatus.CONFLICT);
            }
            customer.setEmail(dto.getEmail());
        }
        
        // Diğer alanları güncelle (null olmayan alanlar)
        if (dto.getName() != null) {
            customer.setName(dto.getName());
        }
        
        if (dto.getPhoneNumber() != null) {
            customer.setPhoneNumber(dto.getPhoneNumber());
        }
        
        // Şifre değiştirme (isteğe bağlı)
        if (dto.getNewPassword() != null && !dto.getNewPassword().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }
        
        return customerRepository.save(customer);
    }

    @Override
    @Transactional
    public Restaurant editRestaurant(AdminEditRestaurantDTO dto) {
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new CustomException("Restaurant not found", HttpStatus.NOT_FOUND));
        
        // Email değiştirme kontrolü
        if (dto.getEmail() != null && !dto.getEmail().equals(restaurant.getEmail())) {
            Optional<Restaurant> existingRestaurant = restaurantRepository.findByEmail(dto.getEmail());
            if (existingRestaurant.isPresent()) {
                throw new CustomException("Email is already in use by another restaurant", HttpStatus.CONFLICT);
            }
            restaurant.setEmail(dto.getEmail());
        }
        
        // Diğer alanları güncelle (null olmayan alanlar)
        if (dto.getName() != null) {
            restaurant.setName(dto.getName());
        }
        
        if (dto.getPhoneNumber() != null) {
            restaurant.setPhoneNumber(dto.getPhoneNumber());
        }
        
        if (dto.getCuisineType() != null) {
            restaurant.setCuisineType(dto.getCuisineType());
        }
        
        // Adres bilgilerini güncelleme
        if (dto.getStreet() != null) {
            restaurant.setStreet(dto.getStreet());
        }
        
        if (dto.getCity() != null) {
            restaurant.setCity(dto.getCity());
        }
        
        if (dto.getState() != null) {
            restaurant.setState(dto.getState());
        }
        
        if (dto.getZipCode() != null) {
            restaurant.setZipCode(dto.getZipCode());
        }
        
        if (dto.getCountry() != null) {
            restaurant.setCountry(dto.getCountry());
        }
        
        // Şifre değiştirme (isteğe bağlı)
        if (dto.getNewPassword() != null && !dto.getNewPassword().isEmpty()) {
            restaurant.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }
        
        return restaurantRepository.save(restaurant);
    }

    @Override
    @Transactional
    public Courier editCourier(AdminEditCourierDTO dto) {
        Courier courier = courierRepository.findById(dto.getCourierId())
                .orElseThrow(() -> new CustomException("Courier not found", HttpStatus.NOT_FOUND));
        
        // Email değiştirme kontrolü
        if (dto.getEmail() != null && !dto.getEmail().equals(courier.getEmail())) {
            Optional<Courier> existingCourier = courierRepository.findByEmail(dto.getEmail());
            if (existingCourier.isPresent()) {
                throw new CustomException("Email is already in use by another courier", HttpStatus.CONFLICT);
            }
            courier.setEmail(dto.getEmail());
        }
        
        // Diğer alanları güncelle (null olmayan alanlar)
        if (dto.getName() != null) {
            courier.setName(dto.getName());
        }
        
        if (dto.getPhoneNumber() != null) {
            courier.setPhoneNumber(dto.getPhoneNumber());
        }
        
        if (dto.getVehicleType() != null) {
            courier.setVehicleType(dto.getVehicleType());
        }
        
        // Şifre değiştirme (isteğe bağlı)
        if (dto.getNewPassword() != null && !dto.getNewPassword().isEmpty()) {
            courier.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }
        
        return courierRepository.save(courier);
    }
} 