package com.hufds.repository;

import com.hufds.entity.Courier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourierRepository extends JpaRepository<Courier, Integer> {
    Optional<Courier> findByEmail(String email);
    List<Courier> findByStatus(Courier.CourierStatus status);
}