package com.hufds.service;

import com.hufds.dto.*;
import com.hufds.entity.Address;
import com.hufds.entity.Customer;
import com.hufds.entity.Order;
import com.hufds.exception.CustomException;
import com.hufds.repository.AddressRepository;
import com.hufds.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProfileService profileService;

    private Customer testCustomer;
    private Address testAddress;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setCustomerId(1);
        testCustomer.setEmail("test@example.com");
        testCustomer.setName("Test User");
        testCustomer.setPassword("encodedPassword");
        testCustomer.setPhoneNumber("+1234567890");

        testAddress = new Address();
        testAddress.setAddressId(1);
        testAddress.setStreet("123 Test St");
        testAddress.setCity("Test City");
        testAddress.setState("TS");
        testAddress.setZipCode("12345");
        testAddress.setCountry("Test Country");
        testAddress.setLatitude(BigDecimal.valueOf(40.7128));
        testAddress.setLongitude(BigDecimal.valueOf(-74.0060));
        testAddress.setIsDefault(true);
        testAddress.setCustomer(testCustomer);

        testCustomer.getAddresses().add(testAddress);

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(testCustomer.getEmail());
    }

    @Test
    void getCurrentProfile_ShouldReturnCustomer_WhenAuthenticated() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));

        Customer result = profileService.getCurrentProfile();

        assertNotNull(result);
        assertEquals(testCustomer.getEmail(), result.getEmail());
        assertEquals(testCustomer.getName(), result.getName());
    }

    @Test
    void getCurrentProfile_ShouldThrowException_WhenNotAuthenticated() {
        when(authentication.getPrincipal()).thenReturn(null);

        CustomException exception = assertThrows(CustomException.class,
                () -> profileService.getCurrentProfile());

        assertEquals("Not authenticated", exception.getMessage());
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void updateProfile_ShouldUpdateCustomer_WhenValidData() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setName("Updated Name");
        updateDTO.setPhoneNumber("+9876543210");

        Customer result = profileService.updateProfile(updateDTO);

        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
        assertEquals("+9876543210", result.getPhoneNumber());
    }

    @Test
    void updatePassword_ShouldUpdatePassword_WhenCurrentPasswordIsCorrect() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));
        when(passwordEncoder.matches("currentPassword", testCustomer.getPassword()))
                .thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        PasswordUpdateDTO updateDTO = new PasswordUpdateDTO();
        updateDTO.setCurrentPassword("currentPassword");
        updateDTO.setNewPassword("newPassword");
        updateDTO.setConfirmPassword("newPassword");

        assertDoesNotThrow(() -> profileService.updatePassword(updateDTO));
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void addAddress_ShouldAddNewAddress_WhenValidData() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));
        when(addressRepository.save(any(Address.class))).thenAnswer(invocation -> {
            Address savedAddress = invocation.getArgument(0);
            savedAddress.setAddressId(1);
            return savedAddress;
        });
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        AddressDTO addressDTO = new AddressDTO();
        addressDTO.setStreet("456 New St");
        addressDTO.setCity("New City");
        addressDTO.setState("NS");
        addressDTO.setZipCode("67890");
        addressDTO.setCountry("New Country");
        addressDTO.setLatitude(40.7128);
        addressDTO.setLongitude(-74.0060);
        addressDTO.setIsDefault(true);

        Address result = profileService.addAddress(addressDTO);

        assertNotNull(result);
        assertEquals("456 New St", result.getStreet());
        assertEquals("New City", result.getCity());
        assertTrue(result.getIsDefault());
    }

    @Test
    void updateAddress_ShouldUpdateAddress_WhenValidData() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));

        AddressDTO addressDTO = new AddressDTO();
        addressDTO.setAddressId(1);
        addressDTO.setStreet("Updated St");
        addressDTO.setCity("Updated City");
        addressDTO.setState("US");
        addressDTO.setZipCode("54321");
        addressDTO.setCountry("Updated Country");
        addressDTO.setLatitude(40.7128);
        addressDTO.setLongitude(-74.0060);
        addressDTO.setIsDefault(true);

        Address result = profileService.updateAddress(addressDTO);

        assertNotNull(result);
        assertEquals("Updated St", result.getStreet());
        assertEquals("Updated City", result.getCity());
    }

    @Test
    void deleteAddress_ShouldDeleteAddress_WhenNotOnlyDefault() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));

        Address secondAddress = new Address();
        secondAddress.setAddressId(2);
        secondAddress.setIsDefault(false);
        testCustomer.getAddresses().add(secondAddress);

        assertDoesNotThrow(() -> profileService.deleteAddress(2));
        verify(addressRepository).delete(any(Address.class));
    }

    @Test
    void softDeleteAccount_ShouldMarkAccountAsDeleted_WhenConfirmed() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        AccountDeletionDTO deletionDTO = new AccountDeletionDTO();
        deletionDTO.setUserId(1);
        deletionDTO.setConfirmation(true);

        assertDoesNotThrow(() -> profileService.softDeleteAccount(deletionDTO));
        assertNotNull(testCustomer.getDeletedAt());
    }

    @Test
    void getCurrentUserAddresses_ShouldReturnAddresses_WhenAuthenticated() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));

        Set<Address> result = profileService.getCurrentUserAddresses();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getCurrentUserOrders_ShouldReturnOrders_WhenAuthenticated() {
        when(customerRepository.findByEmailAndDeletedAtIsNull(testCustomer.getEmail()))
                .thenReturn(Optional.of(testCustomer));

        Set<Order> result = profileService.getCurrentUserOrders();

        assertNotNull(result);
        assertTrue(result.isEmpty()); // Assuming no orders initially
    }
} 