package com.hufds.repository;

import com.hufds.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface AdminRepository extends JpaRepository<AdminUser, Integer> {
    Optional<AdminUser> findByEmail(String email);
}
