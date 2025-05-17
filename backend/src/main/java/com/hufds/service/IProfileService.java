package com.hufds.service;

import com.hufds.dto.*;
import java.util.List;

public interface IProfileService {
    CustomerProfileDTO getCurrentProfile();
    void softDeleteAccount(AccountDeletionDTO deletionDTO);
    CustomerProfileDTO updateProfile(ProfileUpdateDTO dto);
    void updatePassword(PasswordUpdateDTO dto);
    List<AddressDTO> getCurrentUserAddresses();
    List<OrderSummaryDTO> getCurrentUserOrders();
    AddressDTO addAddress(AddressDTO dto);
    AddressDTO updateAddress(AddressDTO dto);
    void deleteAddress(Integer addressId);
} 