package com.hufds.service;

import com.hufds.dto.RatingDTO;
import com.hufds.dto.RatingResponseDTO;
import com.hufds.entity.Customer;
import com.hufds.entity.Order;
import com.hufds.entity.Restaurant;
import com.hufds.entity.Review;
import com.hufds.exception.CustomException;
import com.hufds.repository.OrderRepository;
import com.hufds.repository.ReviewRepository;
import com.hufds.service.impl.RatingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RatingServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private RatingServiceImpl ratingService;

    private Customer testCustomer;
    private Restaurant testRestaurant;
    private Order testOrder;
    private Review testReview;
    private RatingDTO ratingDTO;

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

        // Setup test order
        testOrder = new Order();
        testOrder.setOrderId(1);
        testOrder.setCustomer(testCustomer);
        testOrder.setRestaurant(testRestaurant);
        testOrder.setStatus(Order.OrderStatus.DELIVERED);

        // Setup test review
        testReview = new Review();
        testReview.setReviewId(1);
        testReview.setCustomer(testCustomer);
        testReview.setTargetId(testRestaurant.getRestaurantId());
        testReview.setRole(Review.ReviewRole.Restaurant);
        testReview.setRating(5);
        testReview.setComment("Great service!");

        // Setup rating DTO
        ratingDTO = new RatingDTO();
        ratingDTO.setOrderId(1);
        ratingDTO.setRating(5);
        ratingDTO.setComment("Great service!");
    }

    @Test
    void createRating_ShouldCreateReview_WhenValidData() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);

        // Act
        RatingResponseDTO result = ratingService.createRating(1, ratingDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testReview.getReviewId(), result.getId());
        assertEquals(testOrder.getOrderId(), result.getOrderId());
        assertEquals(testCustomer.getCustomerId(), result.getCustomerId());
        assertEquals(testRestaurant.getRestaurantId(), result.getRestaurantId());
        assertEquals(testReview.getRating(), result.getRating());
        assertEquals(testReview.getComment(), result.getComment());
        assertEquals(testCustomer.getName(), result.getCustomerName());
        assertEquals(testRestaurant.getName(), result.getRestaurantName());

        verify(orderRepository).findById(1);
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createRating_ShouldThrowException_WhenOrderNotFound() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.empty());

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> ratingService.createRating(1, ratingDTO));
        assertEquals("Order not found", exception.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
    }

    @Test
    void createRating_ShouldThrowException_WhenOrderNotDelivered() {
        // Arrange
        testOrder.setStatus(Order.OrderStatus.PENDING);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> ratingService.createRating(1, ratingDTO));
        assertEquals("You can only rate delivered orders", exception.getMessage());
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void createRating_ShouldThrowException_WhenNotOrderOwner() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act & Assert
        CustomException exception = assertThrows(CustomException.class,
                () -> ratingService.createRating(2, ratingDTO));
        assertEquals("You can only rate your own orders", exception.getMessage());
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void getRestaurantRatings_ShouldReturnAllRatings() {
        // Arrange
        List<Review> reviews = Arrays.asList(testReview);
        when(reviewRepository.findByTargetIdAndRole(1, Review.ReviewRole.Restaurant))
                .thenReturn(reviews);
        when(orderRepository.findByCustomerCustomerIdAndRestaurantRestaurantId(1, 1))
                .thenReturn(Arrays.asList(testOrder));

        // Act
        List<RatingResponseDTO> results = ratingService.getRestaurantRatings(1);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(testReview.getReviewId(), results.get(0).getId());
        assertEquals(testReview.getRating(), results.get(0).getRating());
        assertEquals(testReview.getComment(), results.get(0).getComment());
    }

    @Test
    void getCustomerRatings_ShouldReturnAllRatings() {
        // Arrange
        List<Review> reviews = Arrays.asList(testReview);
        when(reviewRepository.findByCustomerCustomerId(1)).thenReturn(reviews);
        when(orderRepository.findByCustomerCustomerIdAndRestaurantRestaurantId(1, 1))
                .thenReturn(Arrays.asList(testOrder));

        // Act
        List<RatingResponseDTO> results = ratingService.getCustomerRatings(1);

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(testReview.getReviewId(), results.get(0).getId());
        assertEquals(testReview.getRating(), results.get(0).getRating());
        assertEquals(testReview.getComment(), results.get(0).getComment());
    }

    @Test
    void getRestaurantAverageRating_ShouldReturnAverage() {
        // Arrange
        when(reviewRepository.calculateAverageRating(1, Review.ReviewRole.Restaurant))
                .thenReturn(4.5);

        // Act
        Double result = ratingService.getRestaurantAverageRating(1);

        // Assert
        assertNotNull(result);
        assertEquals(4.5, result);
    }

    @Test
    void canCustomerRateOrder_ShouldReturnTrue_WhenEligible() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act
        boolean result = ratingService.canCustomerRateOrder(1, 1);

        // Assert
        assertTrue(result);
    }

    @Test
    void canCustomerRateOrder_ShouldReturnFalse_WhenNotDelivered() {
        // Arrange
        testOrder.setStatus(Order.OrderStatus.PENDING);
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act
        boolean result = ratingService.canCustomerRateOrder(1, 1);

        // Assert
        assertFalse(result);
    }

    @Test
    void canCustomerRateOrder_ShouldReturnFalse_WhenNotOrderOwner() {
        // Arrange
        when(orderRepository.findById(1)).thenReturn(Optional.of(testOrder));

        // Act
        boolean result = ratingService.canCustomerRateOrder(2, 1);

        // Assert
        assertFalse(result);
    }

    @Test
    void createRating_ShouldValidateRatingRange() {
        // Arrange
        ratingDTO.setRating(6); // Invalid rating > 5

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> ratingService.createRating(1, ratingDTO));
    }

    @Test
    void createRating_ShouldValidateMinimumRating() {
        // Arrange
        ratingDTO.setRating(0); // Invalid rating < 1

        // Act & Assert
        assertThrows(IllegalArgumentException.class,
                () -> ratingService.createRating(1, ratingDTO));
    }
} 