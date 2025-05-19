package com.hufds.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressSummaryDTO {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;

    // Computed (or getter) for fullAddress so that the frontend (which expects order.address.fullAddress) continues to work.
    public String getFullAddress() {
        return (street + ", " + city + ", " + state + " " + zipCode + ", " + country).trim();
    }
} 