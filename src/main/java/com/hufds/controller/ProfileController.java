package com.hufds.controller;

import com.hufds.dto.ProfileUpdateDTO;
import com.hufds.dto.PasswordUpdateDTO;
import com.hufds.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(profileService.getCurrentProfile());
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateDTO profileUpdateDTO) {
        return ResponseEntity.ok(profileService.updateProfile(profileUpdateDTO));
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody PasswordUpdateDTO passwordUpdateDTO) {
        profileService.updatePassword(passwordUpdateDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses() {
        return ResponseEntity.ok(profileService.getCurrentUserAddresses());
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        return ResponseEntity.ok(profileService.getCurrentUserOrders());
    }
} 