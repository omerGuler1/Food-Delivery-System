package com.hufds.service;

import com.hufds.dto.PasswordUpdateDTO;
import com.hufds.entity.Courier;
import com.hufds.entity.Order;
import com.hufds.repository.CourierRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.service.impl.CourierServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourierServiceTest {

    @Mock
    private CourierRepository courierRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private CourierServiceImpl courierService;

    private Courier testCourier;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        testCourier = new Courier();
        testCourier.setCourierId(1);
        testCourier.setName("Test Courier");
        testCourier.setEmail("test@example.com");
        testCourier.setPassword("encodedPassword");
        testCourier.setPhoneNumber("1234567890");
        testCourier.setVehicleType("Bicycle");
        testCourier.setStatus(Courier.CourierStatus.Available);

        testOrder = new Order();
        testOrder.setOrderId(1);
        testOrder.setStatus(Order.OrderStatus.PENDING);
    }

    @Test
    void getCourierProfile_ShouldReturnCourier_WhenExists() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));

        Courier result = courierService.getCourierProfile(1);

        assertNotNull(result);
        assertEquals(testCourier.getCourierId(), result.getCourierId());
        assertEquals(testCourier.getName(), result.getName());
        verify(courierRepository).findById(1);
    }

    @Test
    void getCourierProfile_ShouldThrowException_WhenNotFound() {
        when(courierRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> courierService.getCourierProfile(1));
        verify(courierRepository).findById(1);
    }

    @Test
    void updateCourierProfile_ShouldUpdateProfile_WhenValid() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        when(courierRepository.save(any(Courier.class))).thenReturn(testCourier);

        Courier updateData = new Courier();
        updateData.setName("Updated Name");
        updateData.setPhoneNumber("9876543210");
        updateData.setVehicleType("Motorcycle");

        Courier result = courierService.updateCourierProfile(1, updateData);

        assertNotNull(result);
        assertEquals("Updated Name", result.getName());
        assertEquals("9876543210", result.getPhoneNumber());
        assertEquals("Motorcycle", result.getVehicleType());
        assertEquals(testCourier.getEmail(), result.getEmail()); // Email should not change
        verify(courierRepository).save(any(Courier.class));
    }

    @Test
    void updatePassword_ShouldUpdatePassword_WhenValid() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        when(passwordEncoder.matches("currentPassword", testCourier.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(courierRepository.save(any(Courier.class))).thenReturn(testCourier);

        PasswordUpdateDTO updateDTO = new PasswordUpdateDTO();
        updateDTO.setCurrentPassword("currentPassword");
        updateDTO.setNewPassword("newPassword");
        updateDTO.setConfirmPassword("newPassword");

        assertDoesNotThrow(() -> courierService.updatePassword(1, updateDTO));
        verify(courierRepository).save(any(Courier.class));
    }

    @Test
    void updatePassword_ShouldThrowException_WhenCurrentPasswordIncorrect() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        when(passwordEncoder.matches("wrongPassword", testCourier.getPassword())).thenReturn(false);

        PasswordUpdateDTO updateDTO = new PasswordUpdateDTO();
        updateDTO.setCurrentPassword("wrongPassword");
        updateDTO.setNewPassword("newPassword");
        updateDTO.setConfirmPassword("newPassword");

        assertThrows(RuntimeException.class, () -> courierService.updatePassword(1, updateDTO));
        verify(courierRepository, never()).save(any(Courier.class));
    }

    @Test
    void acceptOrder_ShouldAcceptOrder_WhenValid() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderRepository.findByCourierCourierIdAndStatus(1, Order.OrderStatus.OUT_FOR_DELIVERY))
                .thenReturn(List.of());
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order result = courierService.acceptOrder(1, 1);

        assertNotNull(result);
        assertEquals(Order.OrderStatus.OUT_FOR_DELIVERY, result.getStatus());
        assertEquals(testCourier, result.getCourier());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void acceptOrder_ShouldThrowException_WhenMaxOrdersReached() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderRepository.findByCourierCourierIdAndStatus(1, Order.OrderStatus.OUT_FOR_DELIVERY))
                .thenReturn(Arrays.asList(new Order(), new Order(), new Order()));

        assertThrows(RuntimeException.class, () -> courierService.acceptOrder(1, 1));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void completeDelivery_ShouldCompleteDelivery_WhenValid() {
        testOrder.setCourier(testCourier);
        testOrder.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order result = courierService.completeDelivery(1, 1);

        assertNotNull(result);
        assertEquals(Order.OrderStatus.DELIVERED, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void completeDelivery_ShouldThrowException_WhenOrderNotAssigned() {
        Courier differentCourier = new Courier();
        differentCourier.setCourierId(2);
        testOrder.setCourier(differentCourier);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class, () -> courierService.completeDelivery(1, 1));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void cancelDelivery_ShouldCancelDelivery_WhenValid() {
        testOrder.setCourier(testCourier);
        testOrder.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        Order result = courierService.cancelDelivery(1, 1);

        assertNotNull(result);
        assertEquals(Order.OrderStatus.CANCELLED, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void cancelDelivery_ShouldThrowException_WhenOrderNotAssigned() {
        Courier differentCourier = new Courier();
        differentCourier.setCourierId(2);
        testOrder.setCourier(differentCourier);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        assertThrows(RuntimeException.class, () -> courierService.cancelDelivery(1, 1));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void updateCourierStatus_ShouldUpdateStatus_WhenValid() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        when(courierRepository.save(any(Courier.class))).thenReturn(testCourier);

        courierService.updateCourierStatus(1, Courier.CourierStatus.Unavailable);

        assertEquals(Courier.CourierStatus.Unavailable, testCourier.getStatus());
        verify(courierRepository).save(testCourier);
    }

    @Test
    void isCourierAvailable_ShouldReturnTrue_WhenAvailable() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        testCourier.setStatus(Courier.CourierStatus.Available);

        boolean result = courierService.isCourierAvailable(1);

        assertTrue(result);
    }

    @Test
    void isCourierAvailable_ShouldReturnFalse_WhenUnavailable() {
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));
        testCourier.setStatus(Courier.CourierStatus.Unavailable);

        boolean result = courierService.isCourierAvailable(1);

        assertFalse(result);
    }

    @Test
    void getPastDeliveries_ShouldReturnDeliveredOrders() {
        Order deliveredOrder = new Order();
        deliveredOrder.setOrderId(2);
        deliveredOrder.setStatus(Order.OrderStatus.DELIVERED);
        deliveredOrder.setCourier(testCourier);

        when(orderRepository.findByCourierCourierIdAndStatus(1, Order.OrderStatus.DELIVERED))
                .thenReturn(List.of(deliveredOrder));

        List<Order> result = courierService.getPastDeliveries(1);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(Order.OrderStatus.DELIVERED, result.get(0).getStatus());
        verify(orderRepository).findByCourierCourierIdAndStatus(1, Order.OrderStatus.DELIVERED);
    }

    @Test
    void getActiveDeliveries_ShouldReturnOutForDeliveryOrders() {
        Order activeOrder = new Order();
        activeOrder.setOrderId(2);
        activeOrder.setStatus(Order.OrderStatus.OUT_FOR_DELIVERY);
        activeOrder.setCourier(testCourier);

        when(orderRepository.findByCourierCourierIdAndStatus(1, Order.OrderStatus.OUT_FOR_DELIVERY))
                .thenReturn(List.of(activeOrder));

        List<Order> result = courierService.getActiveDeliveries(1);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(Order.OrderStatus.OUT_FOR_DELIVERY, result.get(0).getStatus());
        verify(orderRepository).findByCourierCourierIdAndStatus(1, Order.OrderStatus.OUT_FOR_DELIVERY);
    }

    @Test
    void getAvailableOrders_ShouldReturnPendingOrders() {
        Order pendingOrder = new Order();
        pendingOrder.setOrderId(2);
        pendingOrder.setStatus(Order.OrderStatus.PENDING);

        when(orderRepository.findByStatus(Order.OrderStatus.PENDING))
                .thenReturn(List.of(pendingOrder));

        List<Order> result = courierService.getAvailableOrders();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(Order.OrderStatus.PENDING, result.get(0).getStatus());
        verify(orderRepository).findByStatus(Order.OrderStatus.PENDING);
    }

    @Test
    void getTotalEarnings_ShouldReturnCorrectAmount() {
        testCourier.setEarnings(new BigDecimal("100.50"));
        when(courierRepository.findById(1)).thenReturn(Optional.of(testCourier));

        Double result = courierService.getTotalEarnings(1);

        assertEquals(100.50, result);
        verify(courierRepository).findById(1);
    }
} 