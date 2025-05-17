package com.hufds.dto;

import com.hufds.entity.Address;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressDTO {
    private Integer addressId;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private Boolean isDefault;
    private String fullAddress;

    public static AddressDTO fromEntity(Address address) {
        return AddressDTO.builder()
            .addressId(address.getAddressId())
            .street(address.getStreet())
            .city(address.getCity())
            .state(address.getState())
            .zipCode(address.getZipCode())
            .country(address.getCountry())
            .latitude(address.getLatitude() != null ? address.getLatitude().doubleValue() : null)
            .longitude(address.getLongitude() != null ? address.getLongitude().doubleValue() : null)
            .isDefault(address.getIsDefault())
            .fullAddress(address.getFullAddress())
            .build();
    }
}