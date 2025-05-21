package com.hufds.service.impl;

import com.hufds.entity.Payment;
import com.hufds.entity.Order;
import com.hufds.entity.Order.OrderStatus;
import com.hufds.exception.CustomException;
import com.hufds.repository.PaymentRepository;
import com.hufds.repository.OrderRepository;
import com.hufds.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PaymentServiceImpl implements PaymentService {
    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    @Transactional
    public Payment createPayment(Integer orderId, Payment.PaymentMethod paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException("Order not found", HttpStatus.NOT_FOUND));

        // Check if payment already exists
        if (order.getPayment() != null) {
            throw new CustomException("Payment already exists for this order", HttpStatus.BAD_REQUEST);
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setCustomer(order.getCustomer());
        payment.setAmount(order.getTotalPrice());
        payment.setMethod(paymentMethod);
        payment.setStatus(Payment.PaymentStatus.PENDING);

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment processPayment(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new CustomException("Payment not found", HttpStatus.NOT_FOUND));

        log.info("Processing payment for payment ID: {}. Current status: {}", paymentId, payment.getStatus());

        if (!isValidStatusTransition(payment.getStatus(), Payment.PaymentStatus.COMPLETED)) {
            throw new CustomException("Invalid payment status transition", HttpStatus.BAD_REQUEST);
        }

        try {
            // TODO: Integrate with actual payment gateway
            // For now, simulate successful payment
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionId("TXN_" + System.currentTimeMillis());

            log.info("Payment processed successfully for payment ID: {}. New status: {}", paymentId, payment.getStatus());
            return paymentRepository.save(payment);
        } catch (Exception e) {
            log.error("Error processing payment for payment ID: {}: {}", paymentId, e.getMessage());
            throw new CustomException("Payment processing failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public Payment handleCashOnDelivery(Payment payment) {
        if (payment.getMethod() != Payment.PaymentMethod.CASH_ON_DELIVERY) {
            throw new CustomException("Payment is not cash on delivery", HttpStatus.BAD_REQUEST);
        }

        if (!isValidStatusTransition(payment.getStatus(), Payment.PaymentStatus.PENDING)) {
            throw new CustomException("Invalid payment status transition", HttpStatus.BAD_REQUEST);
        }

        // For cash on delivery, we just mark it as pending until delivery
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment processRefund(Payment payment) {
        log.info("Attempting to process refund for payment with ID: {} and status: {}", payment.getPaymentId(), payment.getStatus());
        if (!isValidStatusTransition(payment.getStatus(), Payment.PaymentStatus.REFUNDED)) {
            throw new CustomException("Invalid payment status transition", HttpStatus.BAD_REQUEST);
        }

        try {
            // TODO: Integrate with actual payment gateway for refund
            // For now, simulate successful refund
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            payment.setTransactionId("REF_" + System.currentTimeMillis());

            log.info("Refund processed successfully for payment with ID: {}", payment.getPaymentId());
            return paymentRepository.save(payment);
        } catch (Exception e) {
            log.error("Error processing refund for payment with ID: {}: {}", payment.getPaymentId(), e.getMessage());
            throw new CustomException("Refund processing failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public Payment markPaymentAsFailed(Payment payment) {
        if (!isValidStatusTransition(payment.getStatus(), Payment.PaymentStatus.FAILED)) {
            throw new CustomException("Invalid payment status transition", HttpStatus.BAD_REQUEST);
        }

        payment.setStatus(Payment.PaymentStatus.FAILED);
        log.info("Payment marked as failed for order {}", payment.getOrder().getOrderId());
        return paymentRepository.save(payment);
    }

    @Override
    public boolean validatePaymentForOrderStatus(Order order, Order.OrderStatus newStatus) {
        // If order is being cancelled, no payment validation needed
        if (newStatus == Order.OrderStatus.CANCELLED) {
            return true;
        }

        // For cash on delivery, payment is not required until delivery
        Payment payment = order.getPayment();
        if (payment == null) {
            return false; // Payment must exist
        }

        if (payment.getMethod() == Payment.PaymentMethod.CASH_ON_DELIVERY) {
            // For COD, payment status can be PENDING until delivery
            return payment.getStatus() == Payment.PaymentStatus.PENDING;
        } else {
            // For credit card, payment must be COMPLETED before processing
            return payment.getStatus() == Payment.PaymentStatus.COMPLETED;
        }
    }

    private boolean isValidStatusTransition(Payment.PaymentStatus current, Payment.PaymentStatus next) {
        switch (current) {
            case PENDING:
                return next == Payment.PaymentStatus.COMPLETED || next == Payment.PaymentStatus.FAILED;
            case COMPLETED:
                return next == Payment.PaymentStatus.REFUNDED;
            case FAILED:
                return next == Payment.PaymentStatus.PENDING; // Allow retry
            case REFUNDED:
                return false; // No transitions from REFUNDED
            default:
                return false;
        }
    }

    @Override
    @Transactional
    public Payment refundPayment(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new CustomException("Payment not found", HttpStatus.NOT_FOUND));
        return processRefund(payment);
    }
} 