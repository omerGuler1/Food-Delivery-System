package com.hufds.controller;

import com.hufds.dto.ProfileUpdateDTO;
import com.hufds.dto.PasswordUpdateDTO;
import com.hufds.dto.AddressDTO;
import com.hufds.dto.AccountDeletionDTO;
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

    @DeleteMapping
    public ResponseEntity<?> deleteAccount(@Valid @RequestBody AccountDeletionDTO deletionDTO) {
        profileService.softDeleteAccount(deletionDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses() {
        return ResponseEntity.ok(profileService.getCurrentUserAddresses());
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@Valid @RequestBody AddressDTO addressDTO) {
        return ResponseEntity.ok(profileService.addAddress(addressDTO));
    }

    @PutMapping("/addresses/{addressId}")
    public ResponseEntity<?> updateAddress(
            @PathVariable Integer addressId,
            @Valid @RequestBody AddressDTO addressDTO) {
        addressDTO.setAddressId(addressId);
        return ResponseEntity.ok(profileService.updateAddress(addressDTO));
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable Integer addressId) {
        profileService.deleteAddress(addressId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        return ResponseEntity.ok(profileService.getCurrentUserOrders());
    }
} 