package com.hufds.repository;

import com.hufds.entity.Payment;
import com.hufds.entity.Payment.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByOrderOrderId(Integer orderId);
    List<Payment> findByCustomerCustomerId(Integer customerId);
    List<Payment> findByStatus(PaymentStatus status);
    Payment findByOrderOrderIdAndStatus(Integer orderId, PaymentStatus status);
} 