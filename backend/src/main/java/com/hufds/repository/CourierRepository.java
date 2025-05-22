package com.hufds.repository;

import com.hufds.entity.Courier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourierRepository extends JpaRepository<Courier, Integer> {
    Optional<Courier> findByEmail(String email);
    List<Courier> findByStatus(Courier.CourierStatus status);
    
    // Find all non-deleted couriers
    List<Courier> findAllByDeletedAtIsNull();
    
    // Find active couriers (not deleted and with specific status)
    List<Courier> findByStatusAndDeletedAtIsNull(Courier.CourierStatus status);

    List<Courier> findByApprovalStatus(Courier.ApprovalStatus status);
    
    List<Courier> findByIsBannedTrueAndBanOpenDateLessThan(LocalDateTime date);
}