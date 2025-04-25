package com.hufds.service;

import com.hufds.dto.OrderItemRequestDTO;
import com.hufds.dto.PlaceOrderRequestDTO;
import com.hufds.entity.*;
import com.hufds.repository.*;
import com.hufds.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Customer testCustomer;
    private Restaurant testRestaurant;
    private Address testAddress;
    private MenuItem testMenuItem;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        // Setup test customer
        testCustomer = new Customer();
        testCustomer.setCustomerId(1);
        testCustomer.setName("Test Customer");
        testCustomer.setEmail("test@example.com");

        // Setup test restaurant
        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(1);
        testRestaurant.setName("Test Restaurant");

        // Setup test address
        testAddress = new Address();
        testAddress.setAddressId(1);
        testAddress.setStreet("123 Test St");
        testAddress.setCity("Test City");
        testAddress.setCustomer(testCustomer);

        // Setup test menu item
        testMenuItem = new MenuItem();
        testMenuItem.setMenuItemId(1);
        testMenuItem.setName("Test Item");
        testMenuItem.setPrice(BigDecimal.valueOf(10.00));
        testMenuItem.setRestaurant(testRestaurant);

        // Setup test order
        testOrder = new Order();
        testOrder.setOrderId(1);
        testOrder.setCustomer(testCustomer);
        testOrder.setRestaurant(testRestaurant);
        testOrder.setAddress(testAddress);
        testOrder.setStatus(Order.OrderStatus.PENDING);
        testOrder.setTotalPrice(BigDecimal.valueOf(20.00));

        OrderItem orderItem = new OrderItem();
        orderItem.setMenuItem(testMenuItem);
        orderItem.setQuantity(2);
        orderItem.setSubtotal(BigDecimal.valueOf(20.00));
        testOrder.getOrderItems().add(orderItem);
    }

    @Test
    void placeOrder_ShouldCreateOrder_WhenValidData() {
        // Arrange
        PlaceOrderRequestDTO dto = new PlaceOrderRequestDTO();
        dto.setCustomerId(1);
        dto.setRestaurantId(1);
        dto.setAddressId(1);

        List<OrderItemRequestDTO> items = new ArrayList<>();
        OrderItemRequestDTO itemDto = new OrderItemRequestDTO();
        itemDto.setMenuItemId(1);
        itemDto.setQuantity(2);
        items.add(itemDto);
        dto.setItems(items);

        when(customerRepository.findById(1)).thenReturn(Optional.of(testCustomer));
        when(restaurantRepository.findById(1)).thenReturn(Optional.of(testRestaurant));
        when(addressRepository.findById(1)).thenReturn(Optional.of(testAddress));
        when(menuItemRepository.findById(1)).thenReturn(Optional.of(testMenuItem));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // Act
        Order result = orderService.placeOrder(dto);

        // Assert
        assertNotNull(result);
        assertEquals(Order.OrderStatus.PENDING, result.getStatus());
        assertEquals(BigDecimal.valueOf(20.00), result.getTotalPrice());
        assertEquals(1, result.getOrderItems().size());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void getOrderById_ShouldReturnOrder_WhenAuthorized() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act
        Optional<Order> result = orderService.getOrderById(1, 1, "CUSTOMER");

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testOrder.getOrderId(), result.get().getOrderId());
    }

    @Test
    void updateOrderStatus_ShouldUpdateStatus_WhenValidTransition() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // Act
        Order result = orderService.updateOrderStatus(1, Order.OrderStatus.PROCESSING, 1, "RESTAURANT");

        // Assert
        assertNotNull(result);
        assertEquals(Order.OrderStatus.PROCESSING, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void cancelOrder_ShouldCancelOrder_WhenPending() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // Act
        Order result = orderService.cancelOrder(1, 1);

        // Assert
        assertNotNull(result);
        assertEquals(Order.OrderStatus.CANCELLED, result.getStatus());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void cancelOrder_ShouldThrowException_WhenNotPending() {
        // Arrange
        testOrder.setStatus(Order.OrderStatus.PROCESSING);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> orderService.cancelOrder(1, 1));
    }
} 