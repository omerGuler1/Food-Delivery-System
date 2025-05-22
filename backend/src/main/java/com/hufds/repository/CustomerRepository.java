package com.hufds.repository;

import com.hufds.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByEmailAndDeletedAtIsNull(String email);
    
    // Find all non-deleted customers
    List<Customer> findAllByDeletedAtIsNull();
    
    // Search customers by name or email
    List<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
} 