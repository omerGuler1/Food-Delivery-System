package com.hufds.service;

import com.hufds.entity.Payment;
import com.hufds.entity.Order;
import com.hufds.entity.Order.OrderStatus;

public interface PaymentService {
    /**
     * Create a new payment record for an order
     * @param orderId The order ID
     * @param paymentMethod The payment method (CREDIT_CARD or CASH_ON_DELIVERY)
     * @return The created payment record
     */
    Payment createPayment(Integer orderId, Payment.PaymentMethod paymentMethod);

    /**
     * Process a payment (for credit card payments)
     * @param paymentId The payment ID to process
     * @return The updated payment record
     */
    Payment processPayment(Integer paymentId);

    /**
     * Handle cash on delivery payment
     * @param payment The payment to handle
     * @return The updated payment record
     */
    Payment handleCashOnDelivery(Payment payment);

    /**
     * Process a refund for a payment
     * @param payment The payment to refund
     * @return The updated payment record
     */
    Payment processRefund(Payment payment);

    /**
     * Mark a payment as failed
     * @param payment The payment to mark as failed
     * @return The updated payment record
     */
    Payment markPaymentAsFailed(Payment payment);

    /**
     * Validate if a payment is in the correct state for an order status transition
     * @param order The order to validate
     * @param newStatus The new order status
     * @return true if the payment is valid for the transition, false otherwise
     */
    boolean validatePaymentForOrderStatus(Order order, Order.OrderStatus newStatus);

    /**
     * Refund a payment by payment ID
     * This would typically integrate with a payment gateway
     */
    Payment refundPayment(Integer paymentId);
} 